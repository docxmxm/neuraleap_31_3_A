from django.core.mail import send_mail
from django.conf import settings
import logging
import datetime

logger = logging.getLogger(__name__)

def send_welcome_email(user_email, first_name=None):
    """
    Send a welcome email to a newly registered user.
    
    Args:
        user_email (str): The recipient's email address
        first_name (str, optional): The recipient's first name
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    try:
        subject = "Welcome to NeuralLeap!"
        greeting = f"Hi {first_name}" if first_name else "Hi there"
        message = f"""{greeting},
        
Welcome to NeuralLeap! We're excited to have you join our community of learners.

Get started by exploring our available courses and enhance your skills today.

If you have any questions, feel free to reply to this email.

Best regards,
The NeuralLeap Team
        """
        
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user_email]
        
        # Send the email using the configured EMAIL_BACKEND
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        logger.info(f"Welcome email sent to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
        return False

def send_course_enrollment_confirmation(user_email, course_name, first_name=None):
    """
    Send a confirmation email for course enrollment.
    
    Args:
        user_email (str): The recipient's email address
        course_name (str): The name of the course
        first_name (str, optional): The recipient's first name
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    try:
        subject = f"Course Enrollment Confirmation: {course_name}"
        greeting = f"Hi {first_name}" if first_name else "Hi there"
        message = f"""{greeting},
        
Thank you for enrolling in {course_name}!

You now have full access to the course materials. We hope you enjoy the learning journey.

To get started, log in to your account and navigate to "My Courses" section.

Best regards,
The NeuralLeap Team
        """
        
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user_email]
        
        # Send the email using the configured EMAIL_BACKEND
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        logger.info(f"Enrollment confirmation email sent to {user_email} for course: {course_name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send enrollment confirmation email to {user_email}: {str(e)}")
        return False

def send_payment_receipt(user_email, amount, course_name=None, first_name=None):
    """
    Send a payment receipt email.
    
    Args:
        user_email (str): The recipient's email address
        amount (float): The payment amount
        course_name (str, optional): The name of the purchased course
        first_name (str, optional): The recipient's first name
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    try:
        subject = "Payment Receipt - NeuralLeap"
        greeting = f"Hi {first_name}" if first_name else "Hi there"
        purchase_details = f"for {course_name}" if course_name else "for your purchase"
        
        message = f"""{greeting},
        
Thank you for your payment {purchase_details}!

Payment Details:
- Amount: ${amount:.2f}
- Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}
- Status: Complete

A detailed receipt has been attached to this email.

If you have any questions about your payment, please contact our support team.

Best regards,
The NeuralLeap Team
        """
        
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user_email]
        
        # Send the email using the configured EMAIL_BACKEND
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        logger.info(f"Payment receipt email sent to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send payment receipt email to {user_email}: {str(e)}")
        return False 