-- Enable Row Level Security on courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to view active courses
CREATE POLICY "Anyone can view active courses" 
  ON courses 
  FOR SELECT 
  USING (is_active = true);

-- Allow authenticated users to view all courses (even inactive ones)
CREATE POLICY "Authenticated users can view all courses" 
  ON courses 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only authenticated users can create courses
CREATE POLICY "Authenticated users can create courses" 
  ON courses 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own courses (assuming we'll add a user_id column later)
-- For now, all authenticated users can update any course
CREATE POLICY "Authenticated users can update courses" 
  ON courses 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Verify the policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'courses'; 