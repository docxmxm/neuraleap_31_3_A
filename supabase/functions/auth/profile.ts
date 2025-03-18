// Profile Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ProfileRequest {
  first_name?: string
  last_name?: string
  email?: string
  username?: string
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Authorization header is required for this endpoint
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey, { 
      global: { headers: { Authorization: authHeader } } 
    });
    
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
    
    // Handle GET request - retrieve profile
    if (req.method === 'GET') {
      // Get user profile data from profiles table
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        return new Response(
          JSON.stringify({ detail: 'Profile not found.' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          id: user.id,
          username: profileData.username || user.email,
          email: user.email,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Handle PUT request - update profile
    if (req.method === 'PUT') {
      const data: ProfileRequest = await req.json();
      
      // Validate data
      if (data.email && !data.email.includes('@')) {
        return new Response(
          JSON.stringify({ email: ['Enter a valid email address.'] }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Update auth email if needed
      if (data.email && data.email !== user.email) {
        // In a real implementation, this would require email verification
        // For now, we'll just update it
        const { error: updateAuthError } = await supabaseClient.auth.updateUser({
          email: data.email
        });
        
        if (updateAuthError) {
          return new Response(
            JSON.stringify({ email: [updateAuthError.message] }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }
      
      // Update profile data
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || user.email, // Keep email in sync
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (profileError) {
        return new Response(
          JSON.stringify({ detail: profileError.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          id: user.id,
          username: profileData.username,
          email: data.email || user.email,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // If not GET or PUT, return method not allowed
    return new Response(
      JSON.stringify({ detail: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (err) {
    console.error('Error in profile endpoint:', err);
    
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}) 