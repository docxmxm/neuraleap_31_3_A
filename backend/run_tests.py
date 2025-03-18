#!/usr/bin/env python
"""
Script to run tests with the right settings and environment variables.
This ensures proper mocking of external services and prevents actual API calls.
"""
import os
import sys
import subprocess

def main():
    """Set up the environment and run tests."""
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
    
    # Run a specific test
    if len(sys.argv) > 1 and sys.argv[1] == 'simulation':
        print("Running simulation tests...")
        from core.test_simulation import run_simulation_tests
        run_simulation_tests()
    # Run all tests
    else:
        print("Running all tests...")
        subprocess.run([sys.executable, 'manage.py', 'test', '--keepdb'])

if __name__ == '__main__':
    main() 