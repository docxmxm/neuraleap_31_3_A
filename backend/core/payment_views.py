"""
Views for payment processing using Stripe.
"""
from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import stripe
from django.conf import settings
import json
import logging

from .models import Course
from .payment import create_stripe_checkout_session, handle_payment_success

logger = logging.getLogger(__name__)

class CoursePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id):
        """
        Creates a Stripe checkout session for course purchase.
        """
        # Get the course
        course = get_object_or_404(Course, id=course_id)
        
        # Create a Stripe checkout session
        session_id = create_stripe_checkout_session(request.user, course)
        
        if not session_id:
            return Response(
                {'error': 'Failed to create checkout session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({'session_id': session_id})

class StripeWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny]  # Webhooks don't have authentication
    
    def post(self, request):
        """
        Handles Stripe webhook events, particularly checkout.session.completed.
        """
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            # Verify the event
            stripe.api_key = settings.STRIPE_SECRET_KEY
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            
            # Handle the event
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                
                # Process the payment
                success = handle_payment_success(session)
                
                if not success:
                    logger.error("Failed to handle payment success")
                    return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                return Response(status=status.HTTP_200_OK)
            
            # Return a response for other events (we're not handling them)
            return Response(status=status.HTTP_200_OK)
            
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            logger.error(f"Invalid Stripe webhook signature: {str(e)}")
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Other errors
            logger.error(f"Error processing Stripe webhook: {str(e)}")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 