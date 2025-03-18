#!/usr/bin/env python
"""
Django's command-line utility for running tests with local settings.
This is a modified version of manage.py that uses local_settings.py.
"""
import os
import sys


def main():
    """Run administrative tasks."""
    # Set environment variable to use test settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
    os.environ['TEST_MODE'] = 'True'
    
    # Import local settings
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
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main() 