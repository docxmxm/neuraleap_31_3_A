// Login Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface LoginRequest {
  username: string;
  password: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ detail: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get request data
    const data: LoginRequest = await req.json();
    
    // Validate input
    if (!data.username || !data.password) {
      return new Response(
        JSON.stringify({ 
          username: !data.username ? ['Username is required'] : undefined,
          password: !data.password ? ['Password is required'] : undefined
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey, { 
      global: { headers: { Authorization: req.headers.get('Authorization')! } } 
    });
    
    // Authenticate user (in Django, username could be either username or email)
    // Here we need to check if the username field is an email or not
    const isEmail = data.username.includes('@');
    
    const { data: userData, error } = await supabaseClient.auth.signInWithPassword({
      email: isEmail ? data.username : `${data.username}@placeholder.com`, // handle case where username is used
      password: data.password
    });
    
    if (error) {
      // If login fails with username, try to find actual email from profiles table
      if (!isEmail) {
        // Find the email for this username
        const { data: profiles } = await supabaseClient
          .from('profiles')
          .select('email')
          .eq('username', data.username)
          .limit(1);
          
        if (profiles && profiles.length > 0) {
          // Try again with the found email
          const { data: retryData, error: retryError } = await supabaseClient.auth.signInWithPassword({
            email: profiles[0].email,
            password: data.password
          });
          
          if (retryError) {
            return new Response(
              JSON.stringify({ 
                non_field_errors: ['Unable to log in with provided credentials.'] 
              }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          
          // Use the retry data if successful
          const userData = retryData;
          
          // Get user profile data to match Django response format
          const { data: profileData } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userData.user?.id)
            .single();
          
          // Format response to match Django format
          const response = {
            token: userData.session?.access_token,
            user: {
              id: userData.user?.id,
              username: profileData?.username || userData.user?.email,
              email: userData.user?.email,
              first_name: profileData?.first_name || '',
              last_name: profileData?.last_name || '',
            }
          };
          
          return new Response(
            JSON.stringify(response),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              non_field_errors: ['Unable to log in with provided credentials.'] 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ 
            non_field_errors: ['Unable to log in with provided credentials.'] 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // Get user profile data to match Django response format
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userData.user?.id)
      .single();
    
    // Format response to match Django format
    const response = {
      token: userData.session?.access_token,
      user: {
        id: userData.user?.id,
        username: profileData?.username || userData.user?.email,
        email: userData.user?.email,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
      }
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error('Error in login:', err);
    
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}) 