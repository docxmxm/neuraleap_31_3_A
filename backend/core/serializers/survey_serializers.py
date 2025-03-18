from rest_framework import serializers
from core.models import Survey, Question, SurveyResponse, Answer
from django.contrib.auth.models import User

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'survey', 'question_text', 'question_type', 'options']
        extra_kwargs = {
            'survey': {'write_only': True}
        }

class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'questions']

class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = Answer
        fields = ['id', 'survey_response', 'question', 'answer_text', 'question_text']
        extra_kwargs = {
            'survey_response': {'write_only': True}
        }

class SurveyResponseSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SurveyResponse
        fields = ['id', 'user', 'survey', 'timestamp', 'answers', 'survey_title', 'username']
        read_only_fields = ['timestamp'] 