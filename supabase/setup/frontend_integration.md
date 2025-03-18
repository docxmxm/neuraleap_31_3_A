# Frontend Integration Guide

This guide explains how to integrate your existing frontend with the new Supabase backend while maintaining compatibility with your current API structure.

## 1. Install Supabase Client

Add the Supabase JavaScript client to your project:

```bash
npm install @supabase/supabase-js
```

## 2. Initialize Supabase Client

Create a Supabase client initialization file:

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 3. Authentication Integration

### Registration

Replace your existing registration code:

```javascript
// Before (Django)
async function registerUser(userData) {
  const response = await fetch('/api/auth/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return await response.json();
}
```

With the new Edge Function endpoint:

```javascript
// After (Supabase)
async function registerUser(userData) {
  const response = await fetch('https://your-project.functions.supabase.co/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return await response.json();
}
```

### Login

Replace your existing login code:

```javascript
// Before (Django)
async function loginUser(credentials) {
  const response = await fetch('/api/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return await response.json();
}
```

With the new Edge Function endpoint:

```javascript
// After (Supabase)
async function loginUser(credentials) {
  const response = await fetch('https://your-project.functions.supabase.co/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return await response.json();
}
```

### User Profile

Replace your existing profile code:

```javascript
// Before (Django)
async function getUserProfile() {
  const response = await fetch('/api/auth/profile/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('token')}`,
    },
  });
  return await response.json();
}
```

With the new Edge Function endpoint:

```javascript
// After (Supabase)
async function getUserProfile() {
  const response = await fetch('https://your-project.functions.supabase.co/auth/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return await response.json();
}
```

## 4. API Endpoints Integration

### Courses

Replace your existing courses API calls:

```javascript
// Before (Django)
async function getCourses() {
  const response = await fetch('/api/courses/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}
```

With the new Edge Function endpoint:

```javascript
// After (Supabase)
async function getCourses() {
  const response = await fetch('https://your-project.functions.supabase.co/api/courses', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}
```

### Enrollments

Replace your existing enrollments API calls:

```javascript
// Before (Django)
async function getEnrollments() {
  const response = await fetch('/api/enrollments/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('token')}`,
    },
  });
  return await response.json();
}
```

With the new Edge Function endpoint:

```javascript
// After (Supabase)
async function getEnrollments() {
  const response = await fetch('https://your-project.functions.supabase.co/api/enrollments', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return await response.json();
}
```

## 5. Token Storage and Usage

Update how you store and use authentication tokens:

```javascript
// Before (Django)
function storeAuthToken(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

```javascript
// After (Supabase)
function storeAuthToken(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

## 6. Payment Integration

Update your Stripe payment integration:

```javascript
// Before (Django)
async function purchaseCourse(courseId) {
  const response = await fetch(`/api/courses/${courseId}/purchase/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('token')}`,
    },
  });
  return await response.json();
}
```

```javascript
// After (Supabase)
async function purchaseCourse(courseId) {
  const response = await fetch(`https://your-project.functions.supabase.co/api/courses/${courseId}/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return await response.json();
}
```

## 7. Important Changes to Note

1. **Token Format**: Django uses `Token` prefix, Supabase uses `Bearer` prefix
2. **URLs**: Update all API URLs to point to Supabase Edge Functions
3. **Response Format**: Our Edge Functions maintain the same response format as Django
4. **Error Handling**: Error responses maintain the same structure as Django

## 8. Testing the Integration

1. Test user registration and login
2. Verify token storage and retrieval
3. Test profile access and updates
4. Test course listing and enrollment
5. Test payment processing with Stripe

## 9. Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify correct API URLs
3. Ensure token format is correct (`Bearer` instead of `Token`)
4. Check Supabase logs for Edge Function errors
5. Verify CORS settings in Supabase 