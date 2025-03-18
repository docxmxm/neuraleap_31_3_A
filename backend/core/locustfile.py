"""
Load testing script using Locust.
Install with: pip install locust
Run with: locust -f locustfile.py
"""
import random
import json
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(3, 10)  # Wait between 3-10 seconds between tasks

    def on_start(self):
        """Setup tasks that are executed when a user starts."""
        # Register and login at the start of a user session
        self.register_and_login()
    
    def register_and_login(self):
        """Register a new user and login."""
        # Generate random user data
        username = f"locust_user_{random.randint(1, 1000000)}"
        email = f"{username}@example.com"
        password = "Password123!"
        
        # Register new user
        self.client.post("/api/accounts/register/", {
            "username": username,
            "email": email,
            "password": password,
            "password2": password,
            "first_name": "Locust",
            "last_name": "Test"
        })
        
        # Login
        response = self.client.post("/api/accounts/token/", {
            "username": username,
            "password": password
        })
        
        # Save token if login successful
        try:
            token = response.json().get("token")
            if token:
                self.client.headers.update({"Authorization": f"Token {token}"})
                self.username = username
                self.password = password
                return True
        except:
            pass
        
        return False
    
    @task(2)
    def view_courses(self):
        """Browse available courses."""
        self.client.get("/api/courses/")
        
        # View a specific course
        course_id = random.randint(1, 10)  # Assuming there are at least 10 courses
        self.client.get(f"/api/courses/{course_id}/")
    
    @task(1)
    def purchase_course(self):
        """Purchase a course."""
        # Random course ID 
        course_id = random.randint(1, 10)
        
        # Initiate checkout
        self.client.post(f"/api/courses/{course_id}/checkout/", {
            "course_id": course_id
        })
    
    @task(1)
    def view_user_profile(self):
        """View and update user profile."""
        # Get profile
        self.client.get("/api/accounts/profile/")
        
        # Update profile
        self.client.patch("/api/accounts/profile/", {
            "bio": f"Updated bio at {random.randint(1, 1000)}"
        })
    
    @task(1)
    def complete_survey(self):
        """Complete a survey."""
        # Get available surveys
        response = self.client.get("/api/surveys/")
        
        try:
            surveys = response.json()
            if surveys and len(surveys) > 0:
                # Select a random survey
                survey_id = random.choice(surveys)["id"]
                
                # Get survey details
                survey_response = self.client.get(f"/api/surveys/{survey_id}/")
                survey_data = survey_response.json()
                
                # Submit survey responses
                answers = []
                if "questions" in survey_data:
                    for question in survey_data["questions"]:
                        if question["question_type"] == "text":
                            answer = f"Test answer {random.randint(1, 1000)}"
                        else:
                            # For multiple choice
                            options = question.get("options", ["Option 1"])
                            answer = random.choice(options)
                        
                        answers.append({
                            "question_id": question["id"],
                            "answer_text": answer
                        })
                
                # Submit the survey
                self.client.post(f"/api/surveys/{survey_id}/submit/", {
                    "answers": json.dumps(answers)
                })
        except:
            pass
    
    @task(0.5)
    def view_enrollments(self):
        """View user enrollments."""
        self.client.get("/api/enrollments/")


class AdminUser(HttpUser):
    wait_time = between(5, 15)
    
    def on_start(self):
        """Login as admin user."""
        # Try to login as admin
        response = self.client.post("/api/accounts/token/", {
            "username": "admin",  # Assuming there's an admin user
            "password": "admin123"  # Assuming this is the admin password
        })
        
        # Save token if login successful
        try:
            token = response.json().get("token")
            if token:
                self.client.headers.update({"Authorization": f"Token {token}"})
        except:
            pass
    
    @task
    def access_admin_panel(self):
        """Access admin panel."""
        self.client.get("/admin/")
        self.client.get("/admin/core/course/")
        self.client.get("/admin/core/enrollment/")
        self.client.get("/admin/core/survey/")
        self.client.get("/admin/auth/user/")
    
    @task
    def check_user_data(self):
        """Check user data in admin panel."""
        # Get a random user ID
        user_id = random.randint(1, 1000)
        self.client.get(f"/admin/auth/user/{user_id}/change/") 