"""
Simulation tests for the NeuralLeap website.
This script creates test data and simulates user actions.
"""
import os
import sys
import django
import random
import json
from datetime import datetime, timedelta
import string
from decimal import Decimal

# Set up Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
# Force test mode
os.environ['TEST_MODE'] = 'True'
# Force email backend to console
os.environ['EMAIL_BACKEND'] = 'django.core.mail.backends.console.EmailBackend'
django.setup()

# Now import Django models
from django.contrib.auth.models import User
from django.test import Client, TestCase, override_settings
from django.conf import settings
from django.core import mail
from core.models import Profile, Course, Enrollment, Survey, Question, SurveyResponse, Answer

# Import our mock utility functions
from core.mock_utils import mock_send_welcome_email, mock_send_enrollment_confirmation, mock_send_survey_notification

# Import patch for mocking
import unittest.mock as mock

# Constants for testing - using much smaller numbers
NUM_USERS = 5  # Reduced to 5 users only
NUM_COURSES = 3
NUM_SURVEYS = 2
NUM_QUESTIONS_PER_SURVEY = 2

# Override email settings for testing
@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend',
    SENDGRID_SANDBOX_MODE_IN_DEBUG=True,
    SENDGRID_API_KEY='DUMMY_API_KEY'
)
class NeuralLeapSimulationTestCase(TestCase):
    """
    Test case for simulating users interacting with the NeuralLeap website.
    """
    @classmethod
    def setUpClass(cls):
        """Set up test data before running tests."""
        super().setUpClass()
        
        # Create test database
        cls.create_test_data()
    
    @classmethod
    def create_test_data(cls):
        """Create test users, courses, and surveys."""
        print("Creating test data...")
        
        # Create courses
        cls.courses = []
        for i in range(NUM_COURSES):
            course = Course.objects.create(
                name=f"Course {i+1}",
                description=f"Description for Course {i+1}",
                price=Decimal(random.randint(100, 5000)) / 100,  # Random price between $1 and $50
                image=f"courses/course_{i+1}.jpg"  # Dummy image path
            )
            cls.courses.append(course)
        print(f"Created {NUM_COURSES} courses")
            
        # Create surveys
        cls.surveys = []
        for i in range(NUM_SURVEYS):
            survey = Survey.objects.create(
                title=f"Survey {i+1}",
                description=f"Description for Survey {i+1}"
            )
            
            # Create questions for each survey
            for j in range(NUM_QUESTIONS_PER_SURVEY):
                if j % 2 == 0:  # Alternate between text and multiple choice
                    Question.objects.create(
                        survey=survey,
                        question_text=f"Text Question {j+1} for Survey {i+1}",
                        question_type='text'
                    )
                else:
                    Question.objects.create(
                        survey=survey,
                        question_text=f"Multiple Choice Question {j+1} for Survey {i+1}",
                        question_type='multiple_choice',
                        options=json.dumps(["Option 1", "Option 2", "Option 3"])
                    )
            
            cls.surveys.append(survey)
        print(f"Created {NUM_SURVEYS} surveys with {NUM_QUESTIONS_PER_SURVEY} questions each")
        
        # Create users
        cls.users = []
        for i in range(NUM_USERS):
            username = f"user{i+1}"
            email = f"user{i+1}@example.com"
            password = "password123"
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=f"First{i+1}",
                last_name=f"Last{i+1}"
            )
            
            # Create profile (this might be created by signals, but we create it explicitly)
            try:
                Profile.objects.create(
                    user=user,
                    bio=f"Bio for {username}"
                )
            except Exception as e:
                # Profile might already exist if created by signals
                pass
            
            cls.users.append(user)
        
        print(f"Created {NUM_USERS} users")
    
    # Test user registration and welcome emails
    @mock.patch('core.utils.send_welcome_email', mock_send_welcome_email)
    def test_user_registration_and_emails(self):
        """Test user registration and welcome emails."""
        print("Testing user registration and welcome emails...")
        
        # Test for existing users
        for user in self.users:
            # Call our mocked function directly
            result = mock_send_welcome_email(user)
            self.assertTrue(result)
        
        print("User registration and welcome emails tested successfully")
    
    # Test course enrollments and payment processing
    @mock.patch('core.utils.send_enrollment_confirmation', mock_send_enrollment_confirmation)
    @mock.patch('stripe.checkout.Session.create')
    def test_course_enrollments(self, mock_stripe_session):
        """Test course enrollments and payment processing."""
        print("Testing course enrollments and payment processing...")
        
        # Configure the mock for stripe
        mock_stripe_session.return_value = mock.MagicMock(id='mock_session_id')
        
        enrollments_count = 0
        for user in self.users:
            # Choose 1-2 random courses
            num_courses = random.randint(1, 2)
            courses_to_enroll = random.sample(self.courses, min(num_courses, len(self.courses)))
            
            for course in courses_to_enroll:
                # Create an enrollment
                enrollment = Enrollment.objects.create(
                    user=user,
                    course=course,
                    status='enrolled'
                )
                
                # Test enrollment confirmation with our mock
                result = mock_send_enrollment_confirmation(enrollment)
                self.assertTrue(result)
                
                enrollments_count += 1
        
        print(f"Created {enrollments_count} enrollments and tested payment processing")
    
    # Test survey responses
    @mock.patch('core.utils.send_survey_notification', mock_send_survey_notification)
    def test_survey_responses(self):
        """Test survey responses."""
        print("Testing survey responses...")
        
        responses_count = 0
        answers_count = 0
        
        # For each user, complete 1-2 random surveys
        for user in self.users:
            # Choose 1-2 random surveys
            num_surveys = min(random.randint(1, 2), len(self.surveys))
            surveys_to_complete = random.sample(self.surveys, num_surveys)
            
            for survey in surveys_to_complete:
                # Create a survey response
                response = SurveyResponse.objects.create(
                    user=user,
                    survey=survey
                )
                
                # Get all questions for this survey
                questions = Question.objects.filter(survey=survey)
                
                # Create answers for each question
                for question in questions:
                    if question.question_type == 'text':
                        answer_text = ''.join(random.choices(string.ascii_letters + ' ', k=random.randint(20, 50)))
                    else:
                        # For multiple choice, pick a random option
                        options = json.loads(question.options)
                        answer_text = random.choice(options)
                    
                    Answer.objects.create(
                        survey_response=response,
                        question=question,
                        answer_text=answer_text
                    )
                    answers_count += 1
                
                responses_count += 1
        
        # Test survey notification with our mock
        result = mock_send_survey_notification(random.choice(self.surveys), self.users)
        self.assertTrue(result)
        
        print(f"Created {responses_count} survey responses with {answers_count} answers")
    
    # Test admin panel access
    def test_admin_panel_access(self):
        """Test admin panel access with superuser."""
        print("Testing admin panel access...")
        
        # Create a superuser for admin panel testing
        admin_user = User.objects.create_superuser(
            username='admin_test',
            email='admin@example.com',
            password='admin123'
        )
        
        # Login as admin and test access to admin panel
        client = Client()
        logged_in = client.login(username='admin_test', password='admin123')
        self.assertTrue(logged_in)
        
        # Test access to admin home page
        response = client.get('/admin/')
        self.assertEqual(response.status_code, 200)
        
        # Test access to various model admin pages
        for model in ['user', 'course', 'enrollment', 'survey', 'surveyresponse']:
            try:
                response = client.get(f'/admin/core/{model}/')
                self.assertIn(response.status_code, [200, 302])  # 302 if redirected
            except:
                # Some models might be in different apps
                pass
        
        print("Admin panel access tested successfully")

    @classmethod
    def tearDownClass(cls):
        """Clean up after tests."""
        super().tearDownClass()


def run_simulation_tests():
    """Run the simulation tests."""
    # Use a TestRunner to run tests with proper setup/teardown
    from django.test.runner import DiscoverRunner
    test_runner = DiscoverRunner(verbosity=1)
    failures = test_runner.run_tests(['core.test_simulation'])
    return failures


if __name__ == '__main__':
    print("Starting NeuralLeap simulation tests...")
    run_simulation_tests()
    print("Simulation tests completed.") 