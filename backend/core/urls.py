from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, EnrollmentViewSet, 
    SurveyViewSet, QuestionViewSet, 
    SurveyResponseViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'surveys', SurveyViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'survey-responses', SurveyResponseViewSet, basename='survey-response')

urlpatterns = [
    path('', include(router.urls)),
] 