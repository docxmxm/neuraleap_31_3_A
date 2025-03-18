"""
Utility functions for email sending and payment processing.
"""
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Personalization, Email, To
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(user):
    """
    Send a welcome email to a newly registered user.
    
    Args:
        user: The User instance who just registered
    """
    try:
        subject = "Welcome to NeuralLeap!"
        html_message = render_to_string('emails/welcome_email.html', {
            'user': user,
        })
        plain_message = strip_tags(html_message)
        
        message = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_emails=user.email,
            subject=subject,
            html_content=html_message,
            plain_text_content=plain_message
        )
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        logger.info(f"Welcome email sent to {user.email}. Status: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
        return False

def send_enrollment_confirmation(enrollment):
    """
    Send a confirmation email when a user enrolls in a course.
    
    Args:
        enrollment: The Enrollment instance
    """
    try:
        user = enrollment.user
        course = enrollment.course
        
        subject = f"Enrollment Confirmation: {course.name}"
        html_message = render_to_string('emails/enrollment_confirmation.html', {
            'user': user,
            'course': course,
            'enrollment': enrollment,
        })
        plain_message = strip_tags(html_message)
        
        message = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_emails=user.email,
            subject=subject,
            html_content=html_message,
            plain_text_content=plain_message
        )
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        logger.info(f"Enrollment confirmation email sent to {user.email} for course {course.name}. Status: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"Failed to send enrollment confirmation email: {str(e)}")
        return False

def send_survey_notification(survey, users):
    """
    Send a notification email when a new survey is created or when users need to complete a survey.
    
    Args:
        survey: The Survey instance
        users: List of User instances to notify
    """
    try:
        subject = f"New Survey Available: {survey.title}"
        html_message = render_to_string('emails/survey_notification.html', {
            'survey': survey,
        })
        plain_message = strip_tags(html_message)
        
        # Use SendGrid for bulk sending
        message = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            subject=subject,
        )
        
        # Add personalization for each recipient
        for user in users:
            personalization = Personalization()
            personalization.add_to(To(user.email))
            personalization.dynamic_template_data = {
                'first_name': user.first_name or user.username,
                'survey_title': survey.title,
                'survey_description': survey.description,
            }
            message.add_personalization(personalization)
            
        message.template_id = settings.SENDGRID_SURVEY_TEMPLATE_ID
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        logger.info(f"Survey notification emails sent to {len(users)} users. Status: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"Failed to send survey notification emails: {str(e)}")
        return False 