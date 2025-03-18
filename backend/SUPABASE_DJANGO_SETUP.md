# Connecting Django to Supabase Production Environment

This guide explains how to connect your Django backend to Supabase for both authentication and database access.

## Prerequisites

Before you begin, make sure you have:

1. A Supabase project set up at [Supabase.com](https://supabase.com)
2. Your Django project up and running
3. Access to your Supabase project settings

## Step 1: Install Dependencies

Install the required Python packages:

```bash
pip install supabase-py psycopg2-binary python-dotenv pyjwt cryptography
```

Or update your requirements.txt and run:

```bash
pip install -r requirements.txt
```

## Step 2: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```
# Django settings
DEBUG=False
SECRET_KEY=your-django-secret-key

# Supabase Production Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Database Configuration
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_HOST=your-project-id.supabase.co
DB_PORT=5432
```

## Step 3: Configure Django Settings

Update your Django settings to use the Supabase PostgreSQL database:

```python
# settings.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'postgres'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', ''),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',  # Supabase requires SSL
        }
    }
}

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Default backend
    'accounts.auth.SupabaseAuthBackend',  # Supabase JWT backend
]
```

## Step 4: Set Up JWT Authentication

1. Create a custom authentication backend in `accounts/auth.py`:

```python
# This file handles Supabase JWT token verification
import jwt
import requests
from django.contrib.auth.models import User
from django.contrib.auth.backends import BaseBackend
from django.conf import settings

class SupabaseAuthBackend(BaseBackend):
    # Authenticate users based on Supabase JWT tokens
    # (see the full implementation in accounts/auth.py)
```

2. Create a DRF authentication class in `api/authentication.py`:

```python
# This file handles token authentication for DRF
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate

class SupabaseTokenAuthentication(BaseAuthentication):
    # Authenticate requests using Supabase JWT tokens
    # (see the full implementation in api/authentication.py)
```

## Step 5: Create Supabase Utility Functions

Create a utility module to handle Supabase operations:

```python
# core/supabase_utils.py
from supabase import create_client

class SupabaseClient:
    # Singleton class to manage Supabase connection
    # (see the full implementation in core/supabase_utils.py)
```

## Step 6: Test the Connection

1. Run the standalone verification script:

```bash
python backend/verify_supabase_connection.py
```

2. Run the Django management command:

```bash
python manage.py verify_supabase
```

## Step 7: Use Supabase in Views

Example of using Supabase in a Django view:

```python
from core.supabase_utils import SupabaseClient

def my_view(request):
    # Get the Supabase client
    supabase_client = SupabaseClient()
    
    # Query data from Supabase
    response = supabase_client.get_table_data('table_name')
    
    # Process and return the data
    return JsonResponse(response.data)
```

## Common Issues and Troubleshooting

1. **Connection Issues**:
   - Check your Supabase URL and keys
   - Ensure network connectivity from your server to Supabase
   - Verify SSL certificate configuration

2. **Authentication Problems**:
   - Check JWT token handling
   - Verify the Supabase JWT secret
   - Ensure token format is correct

3. **Database Access**:
   - Check Supabase RLS (Row Level Security) policies
   - Verify database credentials
   - Check table permissions

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Django Documentation](https://docs.djangoproject.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 