-- Create courses table
-- This maps to Django's Course model
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies for course access
-- Anyone can view active courses
CREATE POLICY "Anyone can view active courses" ON courses
  FOR SELECT
  USING (is_active = TRUE);

-- Only admins can create, update, or delete courses
CREATE POLICY "Admins can manage courses" ON courses
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create course_enrollments table
-- This maps to Django's CourseEnrollment model
CREATE TABLE course_enrollments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_paid BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for enrollment access
-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can enroll themselves in courses
CREATE POLICY "Users can enroll themselves" ON course_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments
CREATE POLICY "Users can update their own enrollments" ON course_enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Set up automatic timestamps for updated_at for courses
CREATE TRIGGER courses_updated_at_trigger
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 