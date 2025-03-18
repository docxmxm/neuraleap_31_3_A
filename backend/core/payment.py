"""
Utility functions for payment processing using Stripe.
"""
import stripe
from django.conf import settings
import logging
from decimal import Decimal

# Initialize Stripe with the API key from settings
stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)

class PaymentError(Exception):
    """
    Custom exception for payment-related errors.
    """
    pass

def create_stripe_checkout_session(user, course):
    """
    Create a Stripe Checkout Session for a course purchase.
    
    Args:
        user: The User instance
        course: The Course instance to purchase
        
    Returns:
        Stripe session ID if successful, None otherwise
    """
    try:
        # Set the base URL for success and cancel
        success_url = f"{settings.SITE_URL}/courses/{course.id}/confirmation?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{settings.SITE_URL}/courses/{course.id}/"
        
        # Create a new checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=user.email,
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': course.name,
                            'description': course.description,
                            'images': [course.image.url] if course.image else [],
                        },
                        'unit_amount': int(course.price * 100),  # Convert to cents
                    },
                    'quantity': 1,
                }
            ],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': user.id,
                'course_id': course.id,
            }
        )
        
        logger.info(f"Created Stripe checkout session for {user.email} for course {course.name}")
        return checkout_session.id
    except Exception as e:
        logger.error(f"Failed to create Stripe checkout session: {str(e)}")
        return None

def handle_payment_success(session):
    """
    Handle successful payment webhook from Stripe.
    
    Args:
        session: The Stripe checkout.session.completed event data
        
    Returns:
        True if enrollment was created successfully, False otherwise
    """
    try:
        # Extract metadata from the session
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')
        course_id = metadata.get('course_id')
        
        if not user_id or not course_id:
            logger.error("Missing user_id or course_id in Stripe session metadata")
            return False
        
        from django.contrib.auth.models import User
        
        try:
            user = User.objects.get(id=user_id)
            course = Course.objects.get(id=course_id)
        except (User.DoesNotExist, Course.DoesNotExist) as e:
            logger.error(f"User or Course not found: {str(e)}")
            return False
        
        # Check if enrollment already exists
        enrollment, created = Enrollment.objects.get_or_create(
            user=user,
            course=course,
            defaults={'status': 'enrolled'}
        )
        
        if not created:
            # Update existing enrollment if necessary
            if enrollment.status != 'enrolled':
                enrollment.status = 'enrolled'
                enrollment.save()
        
        # Send confirmation email
        from .utils import send_enrollment_confirmation
        send_enrollment_confirmation(enrollment)
        
        logger.info(f"Successfully processed payment for {user.email} for course {course.name}")
        return True
    except Exception as e:
        logger.error(f"Failed to handle payment success: {str(e)}")
        return False

def create_payment_intent(amount, course_id=None, course_name=None, user_id=None, email=None):
    """
    Create a Stripe payment intent for a course purchase.
    
    Args:
        amount (float or Decimal): The amount to charge in USD
        course_id (str, optional): The ID of the course being purchased
        course_name (str, optional): The name of the course being purchased
        user_id (str, optional): The ID of the user making the purchase
        email (str, optional): The email of the user making the purchase
    
    Returns:
        dict: The created payment intent object with client_secret
    
    Raises:
        PaymentError: If there's an error creating the payment intent
    """
    try:
        # Convert amount to cents for Stripe (Stripe uses the smallest currency unit)
        amount_cents = int(Decimal(amount) * 100)
        
        # Prepare metadata for the payment
        metadata = {
            'course_id': course_id,
            'course_name': course_name,
            'user_id': user_id
        }
        
        # Filter out None values
        metadata = {k: v for k, v in metadata.items() if v is not None}
        
        # Create a payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            metadata=metadata,
            receipt_email=email,
            payment_method_types=['card'],
        )
        
        logger.info(f"Created payment intent {payment_intent.id} for ${amount}")
        
        return {
            'payment_intent_id': payment_intent.id,
            'client_secret': payment_intent.client_secret,
            'amount': amount,
            'currency': 'usd'
        }
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise PaymentError(f"Payment processing error: {str(e)}")
    
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise PaymentError(f"Failed to create payment: {str(e)}")

def retrieve_payment_intent(payment_intent_id):
    """
    Retrieve a payment intent from Stripe.
    
    Args:
        payment_intent_id (str): The ID of the payment intent to retrieve
    
    Returns:
        dict: The payment intent object
    
    Raises:
        PaymentError: If there's an error retrieving the payment intent
    """
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return payment_intent
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error retrieving payment intent {payment_intent_id}: {str(e)}")
        raise PaymentError(f"Error retrieving payment details: {str(e)}")

def create_refund(payment_intent_id, amount=None, reason=None):
    """
    Create a refund for a payment intent.
    
    Args:
        payment_intent_id (str): The ID of the payment intent to refund
        amount (float or Decimal, optional): The amount to refund, defaults to full amount
        reason (str, optional): The reason for the refund, one of: 'duplicate', 
                                'fraudulent', 'requested_by_customer'
    
    Returns:
        dict: The refund object
    
    Raises:
        PaymentError: If there's an error creating the refund
    """
    try:
        refund_params = {
            'payment_intent': payment_intent_id,
        }
        
        # Add optional parameters if provided
        if amount is not None:
            refund_params['amount'] = int(Decimal(amount) * 100)
        
        if reason is not None and reason in ['duplicate', 'fraudulent', 'requested_by_customer']:
            refund_params['reason'] = reason
        
        refund = stripe.Refund.create(**refund_params)
        
        logger.info(f"Created refund {refund.id} for payment intent {payment_intent_id}")
        
        return refund
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating refund for {payment_intent_id}: {str(e)}")
        raise PaymentError(f"Error processing refund: {str(e)}")

def validate_webhook_signature(payload, sig_header, webhook_secret=None):
    """
    Validate a webhook signature from Stripe.
    
    Args:
        payload (bytes): The raw request body
        sig_header (str): The Stripe signature header
        webhook_secret (str, optional): The webhook secret, defaults to settings.STRIPE_WEBHOOK_SECRET
    
    Returns:
        dict: The validated Stripe event
    
    Raises:
        PaymentError: If there's an error validating the signature
    """
    try:
        # Use the provided webhook secret or the default from settings
        webhook_secret = webhook_secret or settings.STRIPE_WEBHOOK_SECRET
        
        # Verify the webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        
        logger.info(f"Validated webhook event {event.id} of type {event.type}")
        
        return event
    
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Signature verification failed: {str(e)}")
        raise PaymentError("Invalid signature")
    
    except Exception as e:
        logger.error(f"Error validating webhook: {str(e)}")
        raise PaymentError(f"Webhook validation error: {str(e)}") 