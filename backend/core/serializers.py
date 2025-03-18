"""
Serializers for core app models.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, CourseEnrollment, CourseModule, Lesson


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username']


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model."""
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'video_url', 'order', 'duration_minutes']


class CourseModuleSerializer(serializers.ModelSerializer):
    """Serializer for CourseModule model with nested lessons."""
    
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'description', 'order', 'lessons']


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model."""
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'price', 'image_url',
            'created_at', 'updated_at', 'is_published', 'category',
            'level', 'duration_hours'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']


class CourseDetailSerializer(CourseSerializer):
    """Detailed Course serializer with modules and lessons."""
    
    modules = CourseModuleSerializer(many=True, read_only=True)
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['modules']


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for CourseEnrollment model."""
    
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'user', 'course', 'enrolled_at', 
            'completed', 'completed_at', 'payment_status'
        ]
        read_only_fields = ['enrolled_at', 'completed_at']


class EnrollCourseSerializer(serializers.Serializer):
    """Serializer for enrolling in a course."""
    
    course_id = serializers.IntegerField()
    
    def validate_course_id(self, value):
        """Validate the course_id exists and is published."""
        try:
            course = Course.objects.get(pk=value, is_published=True)
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found or not available for enrollment.")
        return value 