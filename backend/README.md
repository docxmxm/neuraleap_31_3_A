# NeuralLeap Email and Payment Integration

This document provides instructions for setting up SendGrid for email services and Stripe for payment processing in the NeuralLeap application.

## Prerequisites

- Python 3.9+
- Django 4.2+
- NeuralLeap backend API running

## Installation

Install the required packages:

```bash
pip install sendgrid stripe django-sendgrid-v5
```

## SendGrid Setup

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com/).
2. Create an API key in the SendGrid dashboard:
   - Navigate to Settings > API Keys
   - Click "Create API Key"
   - Name your API key (e.g., "NeuralLeap API")
   - Choose "Full Access" or restricted access as needed
   - Save the API key securely

3. Set up domain authentication in SendGrid:
   - Go to Settings > Sender Authentication
   - Click "Authenticate a Domain"
   - Follow the steps to authenticate your domain

4. Create Dynamic Templates in SendGrid (optional):
   - Navigate to Email API > Dynamic Templates
   - Create templates for welcome emails, enrollment confirmations, and survey notifications
   - Note the template IDs for each

5. Update settings in `backend/myproject/settings.py`:
   - Replace `'your-sendgrid-api-key'` with your actual API key
   - Set `SENDGRID_SANDBOX_MODE_IN_DEBUG = False` when ready to send real emails
   - Update `DEFAULT_FROM_EMAIL` with your authenticated sender email
   - Update `SITE_URL` with your actual frontend URL
   - Add your SendGrid template IDs if using dynamic templates

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com/).
2. Get your API keys from the Stripe dashboard:
   - Navigate to Developers > API keys
   - Note your publishable key and secret key

3. Set up a webhook endpoint:
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - Use the URL `https://your-domain.com/api/webhooks/stripe/` (replace with your actual domain)
   - Select events to listen for (at minimum: `checkout.session.completed`)
   - Note the signing secret for webhook verification

4. Update settings in `backend/myproject/settings.py`:
   - Replace `'your-stripe-secret-key'` with your actual secret key
   - Replace `'your-stripe-publishable-key'` with your actual publishable key
   - Replace `'your-stripe-webhook-secret'` with your actual webhook signing secret

## Testing

### Test Email Functionality

1. Register a new user to test the welcome email
2. Enroll in a course to test the enrollment confirmation email
3. Create a new survey to test the survey notification email

### Test Payment Functionality

1. Create a test product in your Stripe dashboard
2. Attempt to purchase a course using Stripe's test cards:
   - Success: `4242 4242 4242 4242`
   - Require authentication: `4000 0025 0000 3155`
   - Decline: `4000 0000 0000 0002`
3. Check that webhooks are properly processed
4. Verify the enrollment is created after a successful payment

## Troubleshooting

### Email Issues

- Check the logs at `backend/logs/debug.log` for error messages
- Ensure your SendGrid API key has sufficient permissions
- Verify your sender authentication is properly set up
- Check if emails are being filtered as spam

### Payment Issues

- Check the logs at `backend/logs/debug.log` for error messages
- Verify your Stripe API keys are correct
- Ensure your webhook endpoint is properly configured
- Check that your webhook signing secret is correctly set in settings
- Use Stripe's webhook testing tools to simulate events

## Production Considerations

- Store API keys in environment variables, not in settings files
- Set `DEBUG = False` in production
- Use a secure HTTPS connection for all communication
- Consider implementing rate limiting for API endpoints
- Set up monitoring for payment failures and email delivery issues 