"""
URL patterns for the API app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    CourseEnrollmentViewSet,
    SupabaseCourseListView,
    SupabaseUserProfileView,
    StripeWebhookView,
    StripePaymentIntentView
)

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', CourseEnrollmentViewSet, basename='enrollment')

# URL patterns for the API app
urlpatterns = [
    # Include router URLs for DRF ViewSets
    path('', include(router.urls)),
    
    # Add Supabase-based endpoints
    path('supabase/courses/', SupabaseCourseListView.as_view(), name='supabase-courses'),
    path('supabase/profile/', SupabaseUserProfileView.as_view(), name='supabase-profile'),
    
    # Add Stripe payment endpoints
    path('webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('payment/create-intent/', StripePaymentIntentView.as_view(), name='create-payment-intent'),
    
    # Authentication URLs for DRF browsable API
    path('auth/', include('rest_framework.urls')),
] 