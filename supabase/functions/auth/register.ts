// Registration Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { SendGridClient } from '../_shared/sendgrid.ts'

interface RegisterRequest {
  username: string
  email: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
}

const sendWelcomeEmail = async (user: any) => {
  // Initialize SendGrid client (same as your Django implementation)
  const sendgrid = new SendGridClient(Deno.env.get('SENDGRID_API_KEY') || '');
  
  // Load welcome email template 
  const emailTemplate = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/email-templates/welcome_email.html`
  ).then(res => res.text());
  
  // Replace template variables
  const emailContent = emailTemplate
    .replace('{{user.first_name}}', user.first_name || user.username)
    .replace('{{site_url}}', Deno.env.get('SITE_URL') || '');
  
  // Send email
  await sendgrid.send({
    to: user.email,
    from: Deno.env.get('DEFAULT_FROM_EMAIL') || 'no-reply@yourdomain.com',
    subject: 'Welcome to NeuralLeap!',
    html: emailContent
  });
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
    const data: RegisterRequest = await req.json();
    
    // Validate input
    if (!data.email || !data.password || !data.username) {
      return new Response(
        JSON.stringify({ 
          email: !data.email ? ['Email is required'] : undefined,
          password: !data.password ? ['Password is required'] : undefined,
          username: !data.username ? ['Username is required'] : undefined
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate password match (like Django's RegisterSerializer)
    if (data.password !== data.password2) {
      return new Response(
        JSON.stringify({ password2: ['Passwords do not match'] }),
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
    
    // Register the user
    const { data: userData, error } = await supabaseClient.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          first_name: data.first_name || '',
          last_name: data.last_name || ''
        }
      }
    });
    
    if (error) {
      return new Response(
        JSON.stringify(error.message === 'User already registered' 
          ? { email: ['User with this email already exists'] }
          : { detail: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Store additional user data in profiles table
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert([
        { 
          id: userData.user?.id,
          username: data.username,
          email: data.email,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        }
      ]);
    
    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
    
    // Send welcome email
    try {
      await sendWelcomeEmail({
        email: data.email,
        username: data.username,
        first_name: data.first_name
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }
    
    // Format response to match Django format
    const response = {
      token: userData.session?.access_token,
      user: {
        id: userData.user?.id,
        username: data.username,
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      },
      message: "Registration successful. Welcome email has been sent."
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error('Error in registration:', err);
    
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}) 