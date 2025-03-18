// Courses API Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });
    
    // Authorization is required for some operations
    let user = null;
    try {
      const { data } = await supabaseClient.auth.getUser();
      user = data.user;
    } catch (e) {
      // User may not be authenticated for GET operations on courses
    }
    
    // LIST courses - GET /api/courses
    if (req.method === 'GET' && pathParts.length === 2) {
      const { data: courses, error } = await supabaseClient
        .from('courses')
        .select('*')
        .order('id');
      
      if (error) {
        return new Response(
          JSON.stringify({ detail: error.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify(courses),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // GET a single course - GET /api/courses/{id}/
    if (req.method === 'GET' && pathParts.length === 3 && !isNaN(Number(pathParts[2]))) {
      const courseId = Number(pathParts[2]);
      
      const { data: course, error } = await supabaseClient
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ detail: 'Course not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify(course),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // ENROLL in a course - POST /api/courses/{id}/enroll
    if (req.method === 'POST' && pathParts.length === 4 && pathParts[3] === 'enroll') {
      // Check authentication
      if (!user) {
        return new Response(
          JSON.stringify({ detail: 'Authentication required' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const courseId = Number(pathParts[2]);
      
      // Check if course exists
      const { data: course, error: courseError } = await supabaseClient
        .from('courses')
        .select('id')
        .eq('id', courseId)
        .single();
      
      if (courseError) {
        return new Response(
          JSON.stringify({ detail: 'Course not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentError } = await supabaseClient
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (existingEnrollment) {
        return new Response(
          JSON.stringify({ detail: 'Already enrolled in this course.' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Create enrollment
      const { data: enrollment, error: createError } = await supabaseClient
        .from('course_enrollments')
        .insert([
          { user_id: user.id, course_id: courseId }
        ])
        .select()
        .single();
      
      if (createError) {
        return new Response(
          JSON.stringify({ detail: createError.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify(enrollment),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // If we reach here, the endpoint or method is not supported
    return new Response(
      JSON.stringify({ detail: 'Not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (err) {
    console.error('Error in courses API:', err);
    
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}) 