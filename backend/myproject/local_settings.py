"""
Local settings for development and testing.
This file overrides settings from settings.py for local development.
"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# Using SQLite for testing (no additional installation required)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'test_db.sqlite3',
    }
}

# If you want to use PostgreSQL instead (requires proper installation), uncomment:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'neuralleap_test',
#         'USER': 'postgres',  # Replace with your PostgreSQL username
#         'PASSWORD': '',      # Replace with your PostgreSQL password
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }

# Set this to True to use the test database
USE_TEST_DATABASE = True

# Mock external services in development/testing
SENDGRID_SANDBOX_MODE_IN_DEBUG = True
STRIPE_TEST_MODE = True

# Create logs directory if it doesn't exist
LOGS_DIR = BASE_DIR / 'logs'
os.makedirs(LOGS_DIR, exist_ok=True)

# Email backend for development - sends to console instead of actual emails
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' 