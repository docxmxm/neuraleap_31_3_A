"""
Management command to create test data for manual testing.
"""
import random
import json
import string
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Profile, Course, Enrollment, Survey, Question, SurveyResponse, Answer

class Command(BaseCommand):
    help = 'Creates test data for manual testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create (default: 20)'
        )
        parser.add_argument(
            '--courses',
            type=int,
            default=5,
            help='Number of courses to create (default: 5)'
        )
        parser.add_argument(
            '--surveys',
            type=int,
            default=3,
            help='Number of surveys to create (default: 3)'
        )
        parser.add_argument(
            '--admin',
            action='store_true',
            help='Create an admin user'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        num_courses = options['courses']
        num_surveys = options['surveys']
        create_admin = options['admin']
        
        self.stdout.write(self.style.SUCCESS(f'Creating {num_courses} courses...'))
        courses = self.create_courses(num_courses)
        
        self.stdout.write(self.style.SUCCESS(f'Creating {num_surveys} surveys...'))
        surveys = self.create_surveys(num_surveys)
        
        self.stdout.write(self.style.SUCCESS(f'Creating {num_users} users...'))
        users = self.create_users(num_users)
        
        if create_admin:
            self.stdout.write(self.style.SUCCESS('Creating admin user...'))
            self.create_admin_user()
        
        self.stdout.write(self.style.SUCCESS('Creating enrollments...'))
        self.create_enrollments(users, courses)
        
        self.stdout.write(self.style.SUCCESS('Creating survey responses...'))
        self.create_survey_responses(users, surveys)
        
        self.stdout.write(self.style.SUCCESS('Test data created successfully!'))
    
    def create_courses(self, num_courses):
        courses = []
        for i in range(num_courses):
            course = Course.objects.create(
                name=f"Test Course {i+1}",
                description=f"Description for Test Course {i+1}. This is a detailed description of what this course covers and what students will learn.",
                price=Decimal(random.randint(1000, 20000)) / 100,  # Random price between $10 and $200
                image=f"courses/test_course_{i+1}.jpg"  # Dummy image path
            )
            courses.append(course)
            self.stdout.write(f'  - Created course: {course.name} (${course.price})')
        return courses
    
    def create_surveys(self, num_surveys):
        surveys = []
        for i in range(num_surveys):
            survey = Survey.objects.create(
                title=f"Test Survey {i+1}",
                description=f"Description for Test Survey {i+1}. Please complete this survey to help us improve our courses."
            )
            
            # Create text questions
            Question.objects.create(
                survey=survey,
                question_text="What did you like most about the course?",
                question_type='text'
            )
            
            Question.objects.create(
                survey=survey,
                question_text="What improvements would you suggest?",
                question_type='text'
            )
            
            # Create multiple choice questions
            Question.objects.create(
                survey=survey,
                question_text="How would you rate the course materials?",
                question_type='multiple_choice',
                options=json.dumps(["Excellent", "Good", "Average", "Below Average", "Poor"])
            )
            
            Question.objects.create(
                survey=survey,
                question_text="How likely are you to recommend this course to others?",
                question_type='multiple_choice',
                options=json.dumps(["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"])
            )
            
            surveys.append(survey)
            self.stdout.write(f'  - Created survey: {survey.title} with 4 questions')
        return surveys
    
    def create_users(self, num_users):
        users = []
        for i in range(num_users):
            username = f"testuser{i+1}"
            email = f"testuser{i+1}@example.com"
            password = "password123"
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                user = User.objects.get(username=username)
                self.stdout.write(f'  - User {username} already exists')
            else:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=f"Test{i+1}",
                    last_name=f"User{i+1}"
                )
                self.stdout.write(f'  - Created user: {username} ({email})')
            
            # Create profile if it doesn't exist
            if not hasattr(user, 'core_profile'):
                try:
                    Profile.objects.create(
                        user=user,
                        bio=f"Bio for {username}. This is a test user account created for testing purposes."
                    )
                    self.stdout.write(f'  - Created profile for {username}')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'  - Could not create profile for {username}: {str(e)}'))
            
            users.append(user)
        return users
    
    def create_admin_user(self):
        # Create admin user if it doesn't exist
        if User.objects.filter(username='admin').exists():
            self.stdout.write('  - Admin user already exists')
        else:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='adminpassword'
            )
            self.stdout.write('  - Created admin user: admin (admin@example.com) with password: adminpassword')
    
    def create_enrollments(self, users, courses):
        enrollments_count = 0
        for user in users:
            # Enroll in 1-3 random courses
            num_courses = random.randint(1, min(3, len(courses)))
            selected_courses = random.sample(courses, num_courses)
            
            for course in selected_courses:
                # Check if enrollment already exists
                if Enrollment.objects.filter(user=user, course=course).exists():
                    self.stdout.write(f'  - Enrollment for {user.username} in {course.name} already exists')
                    continue
                
                enrollment = Enrollment.objects.create(
                    user=user,
                    course=course,
                    status='enrolled'
                )
                enrollments_count += 1
        
        self.stdout.write(f'  - Created {enrollments_count} new enrollments')
    
    def create_survey_responses(self, users, surveys):
        responses_count = 0
        answers_count = 0
        
        # Have about half of the users complete surveys
        survey_users = random.sample(users, len(users) // 2)
        
        for user in survey_users:
            # Complete 1-2 random surveys
            num_surveys = random.randint(1, min(2, len(surveys)))
            selected_surveys = random.sample(surveys, num_surveys)
            
            for survey in selected_surveys:
                # Check if response already exists
                if SurveyResponse.objects.filter(user=user, survey=survey).exists():
                    self.stdout.write(f'  - Survey response for {user.username} to {survey.title} already exists')
                    continue
                
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
                        # Generate a random sentence for text answers
                        words = random.randint(5, 15)
                        answer_text = ' '.join(''.join(random.choices(string.ascii_lowercase, k=random.randint(3, 8))) for _ in range(words))
                        answer_text = answer_text.capitalize() + '.'
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
        
        self.stdout.write(f'  - Created {responses_count} survey responses with {answers_count} answers') 