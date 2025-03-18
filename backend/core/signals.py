"""
Signal handlers for the core app.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import CourseEnrollment

# Signal to send welcome email to new users
@receiver(post_save, sender=User)
def user_created_handler(sender, instance, created, **kwargs):
    """
    Handle new user creation.
    """
    if created:
        print(f"New user created: {instance.username}")

# Signal to handle course enrollment
@receiver(post_save, sender=CourseEnrollment)
def enrollment_handler(sender, instance, created, **kwargs):
    """
    Handle course enrollment.
    """
    if created:
        print(f"User {instance.user.username} enrolled in {instance.course.title}") 