#!/usr/bin/env python
"""
Script to run the Django development server with test settings.
This uses console email backends and dummy API keys.
"""
import os
import sys
import subprocess

def main():
    """Set up the environment and run the development server."""
    # Set environment variables for testing
    os.environ['DJANGO_SETTINGS_MODULE'] = 'myproject.settings'
    os.environ['TEST_MODE'] = 'True'
    os.environ['EMAIL_BACKEND'] = 'django.core.mail.backends.console.EmailBackend'
    os.environ['SENDGRID_SANDBOX_MODE_IN_DEBUG'] = 'True'
    os.environ['SENDGRID_API_KEY'] = 'DUMMY_API_KEY'
    os.environ['STRIPE_TEST_MODE'] = 'True'
    os.environ['STRIPE_SECRET_KEY'] = 'sk_test_DUMMY'
    os.environ['STRIPE_PUBLISHABLE_KEY'] = 'pk_test_DUMMY'
    os.environ['STRIPE_WEBHOOK_SECRET'] = 'whsec_DUMMY'
    
    # Make sure logs directory exists
    if not os.path.exists('logs'):
        os.makedirs('logs')
        with open('logs/debug.log', 'w') as f:
            f.write('# Test log file\n')
    
    # Import local settings if available
    try:
        from myproject import local_settings
        print("Using local test settings")
        
        # Update settings with values from local_settings
        from django.conf import settings
        for setting in dir(local_settings):
            if setting.isupper():
                setattr(settings, setting, getattr(local_settings, setting))
    except ImportError:
        print("Local settings not found, using default settings")
    
    # Run the development server
    print("Starting Django development server with test settings...")
    cmd = [sys.executable, 'manage.py', 'runserver']
    
    # Add any command line arguments
    if len(sys.argv) > 1:
        cmd.extend(sys.argv[1:])
    
    subprocess.run(cmd)

if __name__ == '__main__':
    main() 