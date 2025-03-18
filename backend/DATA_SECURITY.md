# Data Integrity and Security Guide

This document outlines the best practices for ensuring data integrity and security for the NeuralLeap application.

## Testing Environment Separation

### Use Separate Test Database

Always use a separate test database for simulations and testing to prevent interference with production data:

- Django's test framework automatically creates a test database for running tests
- For manual testing, configure a separate database in settings:

```python
if 'test' in sys.argv or 'TEST_MODE' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'test_db.sqlite3',
        }
    }
```

### Environment Variables for Configuration

Create separate environment files for different environments:

- `.env.development` - Local development settings
- `.env.testing` - Test environment settings
- `.env.production` - Production environment settings

## Securing Sensitive Information

### API Keys and Credentials

**DO NOT** store sensitive information in code or version control. Instead:

1. Use environment variables:
   ```python
   STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
   SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
   ```

2. In AWS production environments, use:
   - AWS Secrets Manager for highly sensitive information
   - Environment variables in Elastic Beanstalk for less sensitive configuration
   - Parameter Store in AWS Systems Manager for configuration values

3. Example AWS Secrets Manager integration:
   ```python
   import boto3
   import json
   
   def get_secret(secret_name):
       client = boto3.client('secretsmanager')
       response = client.get_secret_value(SecretId=secret_name)
       return json.loads(response['SecretString'])
   
   # Retrieve database credentials
   db_credentials = get_secret('neuralleap/database')
   ```

### Database Security

1. Use strong, unique passwords for database accounts
2. Limit database user permissions to only what's necessary
3. Use connection pooling to manage database connections efficiently
4. Enable SSL for database connections in production:
   ```python
   DATABASES = {
       'default': {
           # ... other settings
           'OPTIONS': {
               'sslmode': 'require',
           }
       }
   }
   ```

## GDPR and Data Privacy Compliance

1. Implement proper user data handling:
   - Provide clear privacy policy
   - Allow users to request their data
   - Support data deletion requests

2. Add user data export functionality:
   ```python
   # Example view for exporting user data
   def export_user_data(request):
       user = request.user
       
       # Collect all user data
       user_data = {
           'account': {
               'username': user.username,
               'email': user.email,
               'date_joined': user.date_joined,
           },
           'profile': {
               'bio': user.core_profile.bio if hasattr(user, 'core_profile') else None,
           },
           'enrollments': [
               {
                   'course': enrollment.course.name,
                   'date': enrollment.enrollment_date,
                   'status': enrollment.status,
               } for enrollment in user.enrollment_set.all()
           ],
           'survey_responses': [
               {
                   'survey': response.survey.title,
                   'date': response.timestamp,
                   'answers': [
                       {
                           'question': answer.question.question_text,
                           'answer': answer.answer_text,
                       } for answer in response.answers.all()
                   ]
               } for response in user.surveyresponse_set.all()
           ]
       }
       
       # Return as JSON file
       response = HttpResponse(json.dumps(user_data, default=str), content_type='application/json')
       response['Content-Disposition'] = f'attachment; filename="{user.username}_data_export.json"'
       return response
   ```

## Payment Processing Security

1. Never store credit card information
2. Use Stripe's client-side tokenization for payment processing
3. Implement strong validation for payment webhooks:
   ```python
   # Verify Stripe webhook signature
   def webhook_handler(request):
       payload = request.body
       sig_header = request.META['HTTP_STRIPE_SIGNATURE']
       
       try:
           # Verify webhook signature using your webhook secret
           event = stripe.Webhook.construct_event(
               payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
           )
       except ValueError as e:
           # Invalid payload
           return HttpResponse(status=400)
       except stripe.error.SignatureVerificationError as e:
           # Invalid signature
           return HttpResponse(status=400)
       
       # Handle the event
       if event.type == 'checkout.session.completed':
           handle_payment_success(event.data.object)
       
       return HttpResponse(status=200)
   ```

## Backup Strategies

1. Automated database backups:
   - Use AWS RDS automated backups in production
   - Schedule regular backup jobs

2. Store backups securely:
   - Encrypt backup files
   - Use secure, versioned storage (e.g., S3 with versioning)
   - Test restoration regularly

3. Backup retention policy:
   - Daily backups retained for 7 days
   - Weekly backups retained for 1 month
   - Monthly backups retained for 1 year

## Security Monitoring

1. Enable error logging and monitoring:
   ```python
   LOGGING = {
       'version': 1,
       'disable_existing_loggers': False,
       'handlers': {
           'file': {
               'level': 'WARNING',
               'class': 'logging.FileHandler',
               'filename': BASE_DIR / 'logs/error.log',
           },
       },
       'loggers': {
           'django': {
               'handlers': ['file'],
               'level': 'WARNING',
               'propagate': True,
           },
       },
   }
   ```

2. Set up alerts for:
   - Failed login attempts
   - Payment processing failures
   - Server errors
   - Unusual traffic patterns

3. In AWS environments:
   - Use CloudWatch for log monitoring
   - Configure CloudTrail for API activity monitoring
   - Set up GuardDuty for threat detection

## Regular Security Audits

1. Conduct regular security reviews:
   - Code reviews focused on security
   - Dependency vulnerability scans
   - Security testing of API endpoints

2. Keep all software updated:
   - Django and Python
   - Database systems
   - Web servers and deployment tools
   - Third-party libraries

3. Use tools like:
   - `pip-audit` for Python dependency checks
   - OWASP ZAP for security testing
   - AWS Inspector for infrastructure scans

## Conclusion

By following these data integrity and security practices, you can ensure that the NeuralLeap application maintains high standards of data protection while enabling effective testing and development workflows. 