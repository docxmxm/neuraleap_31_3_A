# Local Testing Guide for NeuralLeap

This guide provides detailed instructions for setting up and testing your Django-based NeuralLeap website locally.

## 1. Setting Up a Local Testing Environment

### Prerequisites

- Python 3.9 or higher
- Virtual environment (venv or virtualenv)
- SQLite for local testing (no need for PostgreSQL setup)

### Create and Activate Virtual Environment

```bash
# If you haven't already created a virtual environment
python -m venv .venv

# Activate the virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate
```

### Install Dependencies

```bash
# Install the required packages
pip install -r requirements.txt

# Install additional packages for testing
pip install locust  # For load testing
```

### Setup the Testing Environment

We've prepared special scripts and configuration files to make testing easier:

1. **Use the special testing script**: `run_tests.py` sets up the correct environment for testing
2. **Mock external services**: We've created mock versions of external services to avoid actual API calls

## 2. Running Tests

### Run the Basic Django Tests

```bash
# Run all the Django tests
python run_tests.py

# Run just the simulation tests
python run_tests.py simulation
```

### What the Simulation Tests Do

Our simulation tests (`core/test_simulation.py`) test:

1. User registration and login
2. Course purchases (with mocked Stripe payments)
3. Survey submissions
4. Admin panel access and functionality

The tests use a small number of users (5) to keep execution time reasonable while still providing good coverage.

### Important Note About Signals

If you encounter unauthorized errors related to SendGrid when running tests, it's because Django's signal system is still trying to send actual emails. The errors occur in the signals but shouldn't affect the test results.

## 3. Manual Testing

For manual testing, start the local development server:

```bash
# Create logs directory first if it doesn't exist
mkdir -p logs
touch logs/debug.log

# Run the server with test settings
python run_server_test.py
```

### Creating Test Data for Manual Testing

We've provided a management command to easily generate test data for manual testing:

```bash
# Create test data with default settings (20 users, 5 courses, 3 surveys)
python run_server_test.py create_test_data

# Create custom amount of test data
python run_server_test.py create_test_data --users 10 --courses 3 --surveys 2

# Also create an admin user
python run_server_test.py create_test_data --admin
```

This will create:
- Test users with usernames like `testuser1`, `testuser2`, etc. (password: `password123`)
- Test courses with realistic prices
- Test surveys with both text and multiple-choice questions
- Enrollments for users in random courses
- Survey responses for about half of the users
- An admin user if requested (username: `admin`, password: `adminpassword`)

### Testing Different Functionalities

#### User Registration and Login

1. Navigate to http://localhost:8000/api/accounts/register/
2. Fill in user registration details and submit
3. Check console output for welcome email (in test mode)
4. Login with the created credentials at http://localhost:8000/api/accounts/token/

#### Course Purchases

1. Navigate to a course page
2. Click "Enroll" or "Purchase"
3. In test mode, you'll see mocked Stripe checkout
4. Check console output for enrollment confirmation email

#### Survey Submissions

1. Navigate to a survey page
2. Fill in answers to survey questions
3. Submit the survey
4. Verify the submission was recorded in the database

#### Admin Panel

1. Create a superuser if you haven't already: `python run_server_test.py createsuperuser` or use the admin user created with the test data command
2. Navigate to http://localhost:8000/admin/
3. Login with admin credentials
4. Test various admin panel functionalities:
   - View/edit users
   - View/edit courses
   - View/edit enrollments
   - View/edit survey responses

## 4. Load Testing with Locust

For performance testing with concurrent users:

```bash
# Start the Django server in one terminal
python run_server_test.py

# Run Locust in another terminal
locust -f core/locustfile.py
```

Then open http://localhost:8089/ and configure:
- Number of users: 50 (adjust based on your machine capabilities)
- Spawn rate: 10 users per second
- Host: http://localhost:8000

## 5. Troubleshooting

### Missing Logs Directory

If you see errors about missing log files:

```bash
mkdir -p logs
touch logs/debug.log
```

### SendGrid or Stripe API Errors

These errors occur when actual API calls are attempted:

1. Use the provided mock functions for email sending
2. Set `SENDGRID_SANDBOX_MODE_IN_DEBUG=True` in settings
3. Set dummy API keys in environment variables

### Database Migration Issues

If you encounter database issues:

```bash
# Reset the test database if needed
python run_server_test.py migrate --run-syncdb
```

## 6. Testing Database Safety

The tests use Django's built-in testing framework, which:
- Creates a temporary test database
- Runs all tests on this temporary database
- Destroys the database when tests complete

This ensures your production database remains untouched during testing.

For manual testing, we're using a SQLite database located at `test_db.sqlite3` which is completely separate from your production database.

## Conclusion

By following this guide, you can effectively test your NeuralLeap website locally without affecting production data or making actual API calls to external services like SendGrid and Stripe. 