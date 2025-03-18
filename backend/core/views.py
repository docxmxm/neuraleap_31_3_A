"""
Views for the core app.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Course, CourseEnrollment

def home(request):
    """Home page view."""
    courses = Course.objects.filter(is_published=True)[:6]  # Get latest 6 published courses
    return render(request, 'core/home.html', {'courses': courses})

def course_list(request):
    """View all courses."""
    courses = Course.objects.filter(is_published=True)
    return render(request, 'core/course_list.html', {'courses': courses})

def course_detail(request, slug):
    """View a specific course."""
    course = get_object_or_404(Course, slug=slug, is_published=True)
    is_enrolled = False
    
    if request.user.is_authenticated:
        is_enrolled = CourseEnrollment.objects.filter(user=request.user, course=course).exists()
    
    return render(request, 'core/course_detail.html', {
        'course': course,
        'is_enrolled': is_enrolled
    })

@login_required
def my_courses(request):
    """View user's enrolled courses."""
    enrollments = CourseEnrollment.objects.filter(user=request.user)
    return render(request, 'core/my_courses.html', {'enrollments': enrollments})

@login_required
def enroll_course(request, course_id):
    """Enroll in a course."""
    course = get_object_or_404(Course, id=course_id, is_published=True)
    
    # Check if already enrolled
    if CourseEnrollment.objects.filter(user=request.user, course=course).exists():
        return redirect('course_detail', slug=course.slug)
    
    # Create enrollment
    CourseEnrollment.objects.create(user=request.user, course=course)
    
    return redirect('my_courses')
