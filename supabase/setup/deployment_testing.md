# Deployment and Testing Guide

This guide covers how to deploy your Supabase backend and test the migration from Django.

## 1. Supabase Project Setup

### 1.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.io/)
2. Click "New Project"
3. Enter project details:
   - Name: NeuralLeap
   - Database Password: Create a strong password
   - Region: Choose a region close to your users
4. Click "Create New Project"

### 1.2 Configure Environment Variables

In your Supabase project dashboard:

1. Go to Settings > API
2. Note your API URL and API Keys
3. Go to Settings > Functions
4. Add the following environment variables:
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `DEFAULT_FROM_EMAIL`: Your default sender email
   - `SITE_URL`: Your frontend application URL
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

## 2. Database Migration

### 2.1 Run Migration Scripts

1. Go to SQL Editor in your Supabase dashboard
2. Run the migration scripts in order:
   - `20230301000000_create_profiles_table.sql`
   - `20230301000001_create_courses_table.sql`
   - Add any additional tables your application needs

### 2.2 Import Data from Django

1. Export data from your Django database:

```bash
python manage.py dumpdata auth.user accounts.userprofile api.course api.courseenrollment --indent 2 > data_export.json
```

2. Transform the data to match Supabase schema (you may need a custom script)
3. Import the transformed data using Supabase's SQL Editor or API

## 3. Deploy Edge Functions

### 3.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login to Supabase

```bash
supabase login
```

### 3.3 Initialize Supabase in Your Project

```bash
supabase init
```

### 3.4 Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

### 3.5 Deploy Functions

```bash
supabase functions deploy auth/register
supabase functions deploy auth/login
supabase functions deploy auth/profile
supabase functions deploy api/courses
supabase functions deploy api/enrollments
supabase functions deploy api/payments
```

### 3.6 Set Function Permissions

In the Supabase dashboard:

1. Go to Functions
2. For each function, set the appropriate permissions:
   - Public functions: `register`, `login`, `courses` (GET)
   - JWT required: `profile`, `enrollments`, `courses` (POST), `payments`

## 4. Email Templates Setup

### 4.1 Upload Email Templates

1. Create a storage bucket for email templates:

```bash
supabase storage create email-templates
```

2. Set bucket to public:

```bash
supabase storage update email-templates --public
```

3. Upload your email templates:

```bash
supabase storage upload email-templates welcome_email.html
```

## 5. Stripe Webhook Configuration

### 5.1 Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add Endpoint"
3. Enter your Supabase function URL: `https://your-project.functions.supabase.co/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Get the webhook signing secret and add it to your Supabase environment variables

## 6. Testing the Migration

### 6.1 Authentication Testing

Test the following authentication flows:

1. User registration
   ```bash
   curl -X POST https://your-project.functions.supabase.co/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"securepassword","password2":"securepassword"}'
   ```

2. User login
   ```bash
   curl -X POST https://your-project.functions.supabase.co/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"securepassword"}'
   ```

3. Profile access
   ```bash
   curl -X GET https://your-project.functions.supabase.co/auth/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### 6.2 API Testing

Test the following API endpoints:

1. List courses
   ```bash
   curl -X GET https://your-project.functions.supabase.co/api/courses
   ```

2. Get a specific course
   ```bash
   curl -X GET https://your-project.functions.supabase.co/api/courses/1
   ```

3. Enroll in a course
   ```bash
   curl -X POST https://your-project.functions.supabase.co/api/courses/1/enroll \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. List enrollments
   ```bash
   curl -X GET https://your-project.functions.supabase.co/api/enrollments \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### 6.3 Payment Testing

Test the payment flow:

1. Create a payment intent
   ```bash
   curl -X POST https://your-project.functions.supabase.co/api/courses/1/purchase \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. Test Stripe webhook (using Stripe CLI)
   ```bash
   stripe listen --forward-to https://your-project.functions.supabase.co/api/webhooks/stripe
   ```

## 7. Frontend Integration Testing

1. Update your frontend code as per the Frontend Integration Guide
2. Test all user flows:
   - Registration and login
   - Browsing courses
   - Enrolling in courses
   - Viewing enrollments
   - Making payments

## 8. Monitoring and Troubleshooting

### 8.1 Monitoring

1. Set up monitoring in Supabase:
   - Go to Database > Monitoring
   - Review database performance

2. Monitor Edge Functions:
   - Go to Functions > Logs
   - Review function execution logs

### 8.2 Troubleshooting

Common issues and solutions:

1. CORS errors:
   - Ensure CORS headers are properly set in Edge Functions
   - Check Supabase project settings for allowed origins

2. Authentication issues:
   - Verify token format (Bearer vs Token)
   - Check token expiration

3. Database access issues:
   - Review Row Level Security policies
   - Check database permissions

4. Function execution errors:
   - Review function logs
   - Test functions individually with curl

## 9. Going Live

1. Final checklist before going live:
   - All tests pass
   - Email sending works
   - Payments process correctly
   - CORS is configured properly
   - Error handling is robust

2. Switch DNS to point to your new Supabase backend
3. Monitor the system closely during the first few hours after migration 