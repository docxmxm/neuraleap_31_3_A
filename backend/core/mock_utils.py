"""
Mock utility functions for testing.
These functions replace the actual utility functions during tests.
"""
import logging

logger = logging.getLogger(__name__)

def mock_send_welcome_email(user):
    """
    Mock function for send_welcome_email that doesn't make API calls.
    
    Args:
        user: The User instance who just registered
    """
    logger.info(f"MOCK: Would send welcome email to {user.email}")
    return True

def mock_send_enrollment_confirmation(enrollment):
    """
    Mock function for send_enrollment_confirmation that doesn't make API calls.
    
    Args:
        enrollment: The Enrollment instance
    """
    user = enrollment.user
    course = enrollment.course
    logger.info(f"MOCK: Would send enrollment confirmation email to {user.email} for course {course.name}")
    return True

def mock_send_survey_notification(survey, users):
    """
    Mock function for send_survey_notification that doesn't make API calls.
    
    Args:
        survey: The Survey instance
        users: List of User instances to notify
    """
    logger.info(f"MOCK: Would send survey notification '{survey.title}' to {len(users)} users")
    return True 