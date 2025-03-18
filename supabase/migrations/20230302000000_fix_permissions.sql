-- Fix permissions for anonymous access
-- 1. Grant permission to the auth schema and users table for anonymous access
GRANT USAGE ON SCHEMA auth TO anon;
GRANT SELECT ON auth.users TO anon;

-- 2. Enable RLS on auth.users and create permissive policy
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "anon_select" ON auth.users;

-- 4. Create a policy allowing anon to read users
CREATE POLICY "anon_select" ON auth.users
    FOR SELECT TO anon
    USING (true);

-- 5. Make sure courses table has proper RLS policies
-- First check and enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 6. Drop any existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;

-- 7. Create policy for anonymous access to active courses
CREATE POLICY "Anyone can view active courses" 
ON public.courses 
FOR SELECT 
TO anon
USING (is_active = true);

-- 8. Update courses with sample data if needed
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS enrolled_count INT DEFAULT 0;

-- 9. Update sample data if columns are empty
UPDATE public.courses 
SET 
  category = 'llm',
  level = 'beginner',
  rating = 4.5,
  enrolled_count = 0
WHERE
  category IS NULL; 