"""
API view classes for the application.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import stripe
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from core.models import Course, CourseEnrollment, CourseModule, Lesson
from core.serializers import (
    CourseSerializer, 
    CourseDetailSerializer,
    CourseEnrollmentSerializer, 
    EnrollCourseSerializer,
    CourseModuleSerializer,
    LessonSerializer
)
from core.direct_supabase import supabase as direct_supabase
from core.email import send_course_enrollment_confirmation, send_payment_receipt
from core.payment import validate_webhook_signature, PaymentError, create_payment_intent
from api.authentication import SupabaseJWTAuthentication

# Create your views here.

class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Course operations.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    authentication_classes = [SupabaseJWTAuthentication]
    lookup_field = 'slug'  # Use slug instead of ID for lookups
    
    def get_serializer_class(self):
        """Return different serializer for detailed view."""
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action:
        - List and retrieve are public
        - Other operations require admin privileges
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Filter queryset based on published status and user permissions."""
        if self.request.user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(is_published=True)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, slug=None):
        """Enroll the current user in a course."""
        course = self.get_object()
        user = request.user
        
        # Check if user is already enrolled
        if CourseEnrollment.objects.filter(user=user, course=course).exists():
            return Response(
                {'detail': 'User is already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = CourseEnrollment.objects.create(
            user=user,
            course=course,
            payment_status='completed'  # For simplicity; in real app would depend on payment
        )
        
        serializer = CourseEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for viewing course enrollments.
    """
    serializer_class = CourseEnrollmentSerializer
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return enrollments for the current user."""
        return CourseEnrollment.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark a course enrollment as completed."""
        enrollment = self.get_object()
        
        # Make sure the user owns this enrollment
        if enrollment.user != request.user:
            return Response(
                {'detail': 'You do not have permission to perform this action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not enrollment.completed:
            enrollment.completed = True
            enrollment.save()
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class SupabaseCourseListView(APIView):
    """
    API view to retrieve courses from Supabase.
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Handle GET requests to retrieve course data from Supabase.
        """
        try:
            # Get query parameters
            limit = request.query_params.get('limit', 10)
            order = request.query_params.get('order', 'created_at.desc')
            
            # Query courses from Supabase using DirectSupabaseClient
            courses = direct_supabase.select(
                'courses',
                limit=int(limit),
                order=order
            )
            
            # Return the data
            return Response(courses or [], status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SupabaseUserProfileView(APIView):
    """
    API view to handle user profile data from Supabase.
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Handle GET requests to retrieve the authenticated user's profile.
        """
        user = request.user
        
        try:
            # Query user profile from Supabase using DirectSupabaseClient
            profiles = direct_supabase.select(
                'profiles',
                filters={'id': user.username}  # The username is the Supabase user ID
            )
            
            # If user profile exists in Supabase
            if profiles and len(profiles) > 0:
                profile_data = profiles[0]
                
                # Combine Django user data with Supabase profile data
                user_data = {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile': profile_data
                }
                
                return Response(user_data, status=status.HTTP_200_OK)
            
            # If user profile doesn't exist in Supabase
            return Response(
                {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile': None
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    View to handle Stripe webhook events.
    """
    permission_classes = [AllowAny]  # No authentication needed for webhook
    
    def post(self, request):
        """
        Handle POST requests from Stripe webhooks.
        """
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        if not sig_header:
            return Response(
                {'error': 'Missing Stripe signature header'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Validate the webhook signature
            event = validate_webhook_signature(payload, sig_header)
            
            # Handle different event types
            if event['type'] == 'payment_intent.succeeded':
                # Get the payment intent
                payment_intent = event['data']['object']
                
                # Extract metadata
                metadata = payment_intent.get('metadata', {})
                course_id = metadata.get('course_id')
                user_id = metadata.get('user_id')
                
                # Handle the successful payment (e.g., update course enrollment)
                if course_id and user_id:
                    # Here you would update the course enrollment status
                    # For example:
                    # enrollment = CourseEnrollment.objects.get(user__id=user_id, course__id=course_id)
                    # enrollment.payment_status = 'completed'
                    # enrollment.save()
                    
                    # Send confirmation email
                    course_name = metadata.get('course_name', 'Our course')
                    customer_email = payment_intent.get('receipt_email')
                    amount = payment_intent.get('amount') / 100  # Convert from cents to dollars
                    
                    if customer_email:
                        # Send email confirmation
                        send_course_enrollment_confirmation(
                            customer_email, 
                            course_name
                        )
                        
                        # Send payment receipt
                        send_payment_receipt(
                            customer_email,
                            amount,
                            course_name
                        )
            
            elif event['type'] == 'charge.refunded':
                # Handle refund logic
                refund = event['data']['object']
                # Update any refund-related records in your database
                
            elif event['type'] == 'checkout.session.completed':
                # Handle completed checkout session
                session = event['data']['object']
                # Update any session-related records in your database
            
            # Return a success response to Stripe
            return HttpResponse(status=200)
            
        except PaymentError as e:
            return HttpResponse(str(e), status=400)
        
        except Exception as e:
            return HttpResponse(f"Unexpected error: {str(e)}", status=500)


class StripePaymentIntentView(APIView):
    """
    View to create a Stripe payment intent.
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle POST requests to create a Stripe payment intent.
        """
        # Get request data
        amount = request.data.get('amount')
        course_id = request.data.get('course_id')
        course_name = request.data.get('course_name')
        
        if not amount or not course_id or not course_name:
            return Response(
                {'error': 'Missing required fields (amount, course_id, course_name)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Convert amount to float
            amount = float(amount)
            
            # Get user info
            user = request.user
            user_id = user.id
            email = user.email
            
            # Create payment intent
            payment_intent_data = create_payment_intent(
                amount=amount,
                course_id=course_id,
                course_name=course_name,
                user_id=user_id,
                email=email
            )
            
            return Response(payment_intent_data, status=status.HTTP_201_CREATED)
            
        except PaymentError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {'error': f'Unexpected error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
