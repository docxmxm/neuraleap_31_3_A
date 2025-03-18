# Testing NeuralLeap with Simulated Data

This document provides instructions for testing the NeuralLeap system with simulated data.

## Prerequisites

Ensure that you have all the required packages installed:

```bash
pip install -r requirements.txt
pip install locust  # For load testing
```

## Option 1: Django Test Framework (Simulating 1000 Users)

The `test_simulation.py` file provides a comprehensive test suite that simulates 1000 users interacting with the system. It tests:

1. User registration and login
2. Course purchases and payment processing
3. Survey submissions
4. Admin panel functionality

### Running the Django Tests

To run the simulation tests with a separate test database:

```bash
cd /path/to/NerualLeap-Website-master/backend
python -m core.test_simulation
```

This will:
- Create 1000 test users
- Create 10 test courses
- Create 5 test surveys with 3 questions each
- Simulate user registrations and welcome emails
- Simulate course enrollments and payment processing
- Simulate survey responses
- Test admin panel access

All tests use mocked email and payment services to avoid actual external API calls.

## Option 2: Load Testing with Locust

For more realistic load testing with concurrent users, use the Locust script.

### Running Locust Tests

1. Start your Django server in a separate terminal:

```bash
cd /path/to/NerualLeap-Website-master/backend
python manage.py runserver
```

2. Start Locust in another terminal:

```bash
cd /path/to/NerualLeap-Website-master/backend
locust -f core/locustfile.py
```

3. Open your browser at http://localhost:8089/
4. Enter the number of users to simulate (e.g., 100), spawn rate (e.g., 10 per second), and host (e.g., http://localhost:8000)
5. Start the test

This will simulate multiple concurrent users performing actions like:
- Registering and logging in
- Browsing courses
- Purchasing courses
- Completing surveys
- Accessing admin panel (for admin users)

## Simulating Email and Payment Services

Both testing methods use mocking to simulate external services:

- SendGrid API for emails
- Stripe API for payments

This ensures no actual emails are sent and no actual payments are processed during testing.

## Test Database Configuration

The tests use Django's built-in test database handling, which:
- Creates a temporary test database
- Runs all tests on this database
- Destroys the database after tests complete

No changes will be made to your production database.

## Verifying Results

After running the tests, check the output for:

- Success/failure of each test case
- Number of users, courses, and surveys created
- Number of enrollments and survey responses processed
- Admin panel access verification

For Locust, you'll get real-time metrics on:
- Request success/failure rates
- Response times
- Number of users simulated
- Requests per second

These tests ensure your system can handle a large number of users and that all functionalities work correctly. 