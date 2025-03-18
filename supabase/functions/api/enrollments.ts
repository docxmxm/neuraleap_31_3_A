// Enrollments API Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Authorization header is required for all enrollment operations
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ detail: 'Authentication credentials were not provided.' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ detail: 'Invalid token.' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // LIST enrollments - GET /api/enrollments/
    if (req.method === 'GET' && pathParts.length === 2) {
      // Get all enrollments for the current user
      const { data: enrollments, error } = await supabaseClient
        .from('course_enrollments')
        .select(`
          id,
          enrolled_at,
          completed_at,
          is_paid,
          courses (*)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      
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
        JSON.stringify(enrollments),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // GET a single enrollment - GET /api/enrollments/{id}/
    if (req.method === 'GET' && pathParts.length === 3 && !isNaN(Number(pathParts[2]))) {
      const enrollmentId = Number(pathParts[2]);
      
      const { data: enrollment, error } = await supabaseClient
        .from('course_enrollments')
        .select(`
          id,
          enrolled_at,
          completed_at,
          is_paid,
          courses (*)
        `)
        .eq('id', enrollmentId)
        .eq('user_id', user.id) // Ensure user only access their own enrollments
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ detail: 'Enrollment not found or access denied' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify(enrollment),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // UPDATE enrollment (mark as completed) - PUT /api/enrollments/{id}/complete/
    if (req.method === 'PUT' && pathParts.length === 4 && pathParts[3] === 'complete') {
      const enrollmentId = Number(pathParts[2]);
      
      // Check if enrollment exists and belongs to user
      const { data: existingEnrollment, error: checkError } = await supabaseClient
        .from('course_enrollments')
        .select('id')
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .single();
      
      if (checkError) {
        return new Response(
          JSON.stringify({ detail: 'Enrollment not found or access denied' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Update enrollment
      const { data: updatedEnrollment, error: updateError } = await supabaseClient
        .from('course_enrollments')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (updateError) {
        return new Response(
          JSON.stringify({ detail: updateError.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify(updatedEnrollment),
        { 
          status: 200,
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
    console.error('Error in enrollments API:', err);
    
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}) 