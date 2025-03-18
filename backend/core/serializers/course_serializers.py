from rest_framework import serializers
from core.models import Course, Enrollment
from django.contrib.auth.models import User

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'price', 'image']
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields  # These fields should be read-only

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'enrollment_date', 'status', 'course_details', 'user_details']
        read_only_fields = ['enrollment_date']
        extra_kwargs = {
            'user': {'write_only': True},
            'course': {'write_only': True}
        } 