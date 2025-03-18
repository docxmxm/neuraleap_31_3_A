// Payments API Edge Function for Stripe
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@12.1.1?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // COURSE PAYMENT ENDPOINT - POST /api/courses/{course_id}/purchase/
    if (req.method === 'POST' && 
        pathParts.length === 4 && 
        pathParts[1] === 'courses' && 
        pathParts[3] === 'purchase' && 
        !isNaN(Number(pathParts[2]))) {
      
      // Authorization header is required for purchases
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
      
      const courseId = Number(pathParts[2]);
      
      // Get course details
      const { data: course, error: courseError } = await supabaseClient
        .from('courses')
        .select('*')
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
      
      // Get request data if any
      const requestData = await req.json().catch(() => ({}));
      
      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(course.price) * 100), // Convert to cents
        currency: 'aud', // Australian dollars
        description: `Course: ${course.title}`,
        metadata: {
          course_id: course.id.toString(),
          user_id: user.id,
        },
      });
      
      // Record purchase intent in database
      const { data: purchaseRecord, error: purchaseError } = await supabaseClient
        .from('course_payments')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          amount: course.price,
          payment_intent_id: paymentIntent.id,
          status: 'pending',
        }])
        .select()
        .single();
      
      if (purchaseError) {
        console.error('Error recording purchase intent:', purchaseError);
      }
      
      return new Response(
        JSON.stringify({
          client_secret: paymentIntent.client_secret,
          course_title: course.title,
          amount: course.price,
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // STRIPE WEBHOOK ENDPOINT - POST /api/webhooks/stripe/
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'webhooks' && pathParts[2] === 'stripe') {
      const signature = req.headers.get('stripe-signature');
      
      if (!signature) {
        return new Response(
          JSON.stringify({ detail: 'Stripe signature missing' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const body = await req.text();
      let event;
      
      try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ detail: `Webhook signature verification failed: ${err.message}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Create Supabase client (no auth header for webhooks)
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '' // Use service role for webhooks
      );
      
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`Payment succeeded for ${paymentIntent.id}`);
          
          // Update payment record
          await supabaseClient
            .from('course_payments')
            .update({ status: 'completed' })
            .eq('payment_intent_id', paymentIntent.id);
          
          // Update enrollment record if it exists
          if (paymentIntent.metadata.course_id && paymentIntent.metadata.user_id) {
            // Check if enrollment exists
            const { data: enrollment } = await supabaseClient
              .from('course_enrollments')
              .select('id')
              .eq('course_id', paymentIntent.metadata.course_id)
              .eq('user_id', paymentIntent.metadata.user_id)
              .single();
            
            if (enrollment) {
              // Update existing enrollment
              await supabaseClient
                .from('course_enrollments')
                .update({ is_paid: true })
                .eq('id', enrollment.id);
            } else {
              // Create new enrollment
              await supabaseClient
                .from('course_enrollments')
                .insert([{
                  course_id: paymentIntent.metadata.course_id,
                  user_id: paymentIntent.metadata.user_id,
                  is_paid: true
                }]);
            }
          }
          break;
        
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log(`Payment failed for ${failedPayment.id}`);
          
          // Update payment record
          await supabaseClient
            .from('course_payments')
            .update({ 
              status: 'failed',
              error_message: failedPayment.last_payment_error?.message || 'Payment failed'
            })
            .eq('payment_intent_id', failedPayment.id);
          break;
      }
      
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
    console.error('Error in payments API:', err);
    
    return new Response(
      JSON.stringify({ detail: 'Internal server error', error: err.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}) 