# User Profile Management with Supabase

This guide explains how to set up and test the connection between your localhost application and Supabase database for user profile management.

## Overview

The NeuraLeap application uses Supabase for:
- User authentication
- Storing and retrieving user profile data

When users log in and visit their profile page, they can update their information, which gets stored in the Supabase database. This guide will help you understand, test, and enhance this functionality.

## Prerequisites

1. A Supabase account
2. Access to the Supabase project
3. The NeuraLeap project running locally

## Connection Flow

1. **Authentication**: User logs in via Supabase Auth
2. **Profile Page**: User navigates to the profile page
3. **Data Retrieval**: User's profile data is fetched from Supabase
4. **Profile Update**: User modifies their profile data
5. **Data Storage**: Updated data is saved to Supabase
6. **Verification**: Changes are visible in Supabase and persist between sessions

## Testing the Connection

We've created a test page to verify each step of the connection process:

1. Start your local server: `python -m http.server 8000`
2. Open your browser and navigate to: `http://localhost:8000/pages/supabase-test.html`
3. Test the functionality in this order:
   - Basic connection test
   - Authentication check
   - Profile data fetch
   - Profile data update

## How Profile Updates Work

When a user updates their profile on the profile page (`/pages/dashboard/profile.html`):

1. The user clicks "Edit Profile" to enter edit mode
2. They make changes to their profile information
3. They click "Save Profile" which triggers the `saveProfile()` function
4. This function:
   - Collects all form data
   - Calls `saveToSupabase(userData)` to send updates to the database
   - Updates the UI to reflect the changes
   - Shows a success notification

The key function that handles the Supabase update is `saveToSupabase()`:

```javascript
async function saveToSupabase(data) {
    try {
        // Get current user
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        
        if (userError || !user) {
            throw new Error('User not authenticated');
        }
        
        // Prepare profile data
        const profileData = {
            first_name: data.firstName,
            last_name: data.lastName,
            username: data.username,
            title: data.title,
            company: data.company,
            phone: data.phone,
            location: data.location,
            bio: data.bio,
            email: user.email,
            interests: data.interests,
            languages: data.languages,
            education_level: data.education?.level,
            education_field: data.education?.field,
            updated_at: new Date()
        };
        
        // Update profile in Supabase
        const { error: updateError } = await window.supabaseClient
            .from('profiles')
            .update(profileData)
            .eq('id', user.id);
        
        if (updateError) {
            throw updateError;
        }
        
        return true;
    } catch (error) {
        console.error('Error saving profile to Supabase:', error);
        throw error;
    }
}
```

## Supabase Profiles Table Structure

The `profiles` table in Supabase has the following structure:

| Column              | Type                   | Description                               |
|---------------------|------------------------|-------------------------------------------|
| id                  | UUID (Primary Key)     | References auth.users(id)                 |
| username            | TEXT                   | User's chosen username                    |
| email               | TEXT                   | User's email address                      |
| first_name          | TEXT                   | User's first name                         |
| last_name           | TEXT                   | User's last name                          |
| created_at          | TIMESTAMP WITH TZ      | When the profile was created              |
| updated_at          | TIMESTAMP WITH TZ      | When the profile was last updated         |
| bio                 | TEXT                   | User's bio/about me                       |
| title               | TEXT                   | User's professional title                 |
| company             | TEXT                   | User's company                            |
| phone               | TEXT                   | User's phone number                       |
| location            | TEXT                   | User's location                           |
| interests           | JSONB                  | User's interests (array of tags)          |
| languages           | JSONB                  | User's programming languages (array)      |
| education_level     | TEXT                   | User's education level                    |
| education_field     | TEXT                   | User's field of study                     |
| university          | TEXT                   | User's university                         |

## Common Issues and Troubleshooting

### 1. Missing Columns Error

If you see an error like `"Could not find the 'bio' column of 'profiles' in the schema cache"`, it means that a column the code is trying to access doesn't exist in your Supabase database.

To fix this issue:

1. **Use the Schema Checker Tool**:
   - Navigate to: `http://localhost:8000/pages/schema-checker.html`
   - Click "Check Schema" to see what columns are missing
   - Use the SQL provided by the tool to add the missing columns

2. **Manually Add Missing Columns**:
   - Log in to your Supabase dashboard
   - Go to the SQL Editor
   - Execute SQL like the following to add missing columns:
   ```sql
   ALTER TABLE profiles
   ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]',
   ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]',
   ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS education_field TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS university TEXT DEFAULT '';
   ```

### 2. Array Type Error

If you encounter an error like `syntax error at or near "ARRAY"` when executing SQL, it's because PostgreSQL doesn't support the standalone `ARRAY` type. Instead, use `JSONB` for array data:

```sql
-- Incorrect:
ADD COLUMN IF NOT EXISTS interests ARRAY DEFAULT '[]'::jsonb

-- Correct:
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'
```

In the profile data, arrays like interests and languages are stored as JSONB arrays, which can be accessed and manipulated in JavaScript as regular arrays.

### 2. Profile Updates Not Saving

Check the following:

- Open browser console to look for errors
- Verify that the user is properly authenticated
- Check if the Supabase client is initialized properly
- Check for any validation errors in the form data

### 3. Authentication Issues

If the user appears logged out:

- Check that your Supabase API key is correct
- Verify that the `supabaseClient` object is available globally
- Try logging out and logging back in
- Check browser storage for expired tokens

### 4. Data Not Showing After Reload

If profile changes don't persist:

- Check that the data was successfully saved to Supabase
- Verify that the data retrieval function is working correctly
- Check if there are any policy issues preventing data access

## Viewing Profile Data in Supabase

To view and verify profile data in Supabase:

1. Log in to your Supabase account
2. Navigate to your project
3. Go to the "Table Editor" section
4. Select the "profiles" table
5. You should see all user profiles with their data
6. You can filter by user ID or email to find specific profiles

## Future Enhancements

Consider these enhancements to improve the profile management functionality:

1. Add profile image upload and storage in Supabase Storage
2. Implement additional validation for form fields
3. Add field-specific error messaging
4. Create a history of profile changes
5. Add real-time syncing using Supabase Realtime

## Using the Schema Checker Tool

We've included a Schema Checker tool that helps diagnose and fix issues with your database schema:

1. Start your local server: `python -m http.server 8000`
2. Navigate to: `http://localhost:8000/pages/schema-checker.html`
3. Log in with your Supabase credentials
4. Click "Check Schema" to analyze your database
5. If any columns are missing, the tool will:
   - Show you which columns are missing
   - Generate the SQL needed to add them
   - Provide a "Copy SQL" button to copy the SQL to your clipboard
6. Execute the SQL in your Supabase dashboard SQL Editor

The Schema Checker verifies all required columns for the profiles table, including:
- Basic fields: id, username, email, first_name, last_name, etc.
- Extended profile fields: bio, title, company, phone, location
- Arrays for interests and programming languages
- Education-related fields

After adding the missing columns, return to the connection test page to verify that everything works correctly.

## Conclusion

The NeuraLeap application is set up to properly connect to Supabase for user profile management. Users can log in, view their profile data, make changes, and have those changes stored in the database.

If you have any issues with this process, please refer to the troubleshooting section or contact the development team for assistance. 