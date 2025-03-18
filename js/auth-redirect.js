/**
 * Auth Redirect Handler
 * This script handles redirects after OAuth authentication (like Google sign-in)
 * It should be included in the root index.html file to catch OAuth redirects
 */

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Auth-Redirect] DOM loaded, checking for auth redirect...');
    
    // IMPORTANT: Skip all auth redirect checks if we're on the homepage
    // This ensures we NEVER redirect away from the main page automatically
    const isHomePage = window.location.pathname === '/index.html' || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/index.html');
                      
    if (isHomePage) {
        console.log('[Auth-Redirect] On homepage - skipping ALL redirect checks to ensure homepage is displayed');
        return;
    }
    
    // Only check for auth redirects on non-homepage pages
    checkForAuthRedirect();
});

/**
 * Check if the current page load is the result of an OAuth redirect
 * and handle the authentication accordingly
 */
async function checkForAuthRedirect() {
    try {
        console.log('[Auth-Redirect] Current URL:', window.location.href);
        console.log('[Auth-Redirect] Current pathname:', window.location.pathname);
        
        // Double-check we're not on homepage (safety check)
        const isHomePage = window.location.pathname === '/index.html' || 
                          window.location.pathname === '/' ||
                          window.location.pathname.endsWith('/index.html');
        
        if (isHomePage) {
            console.log('[Auth-Redirect] Safety check: We are on homepage, no redirects allowed');
            return;
        }
        
        // Only redirect to dashboard if the URL contains auth-related parameters
        const urlParams = new URLSearchParams(window.location.search);
        const isAuthRedirect = urlParams.has('access_token') || 
                              urlParams.has('token') || 
                              urlParams.has('error') ||
                              urlParams.has('type') ||
                              urlParams.has('code');
        
        console.log('[Auth-Redirect] Is OAuth redirect?', isAuthRedirect);
        
        // Make sure supabase is loaded
        if (typeof window.supabase === 'undefined') {
            console.log('[Auth-Redirect] Supabase not loaded yet, waiting for script...');
            // If supabase isn't loaded yet, wait for it (assuming it will be loaded soon)
            setTimeout(checkForAuthRedirect, 500);
            return;
        }

        console.log('[Auth-Redirect] Checking for auth session...');
        
        // Get Supabase client - try different methods
        let supabaseClient;
        
        if (window.SupabaseClient && window.SupabaseClient.supabase) {
            console.log('[Auth-Redirect] Using window.SupabaseClient.supabase');
            supabaseClient = window.SupabaseClient.supabase;
        } else if (window.supabaseClient) {
            console.log('[Auth-Redirect] Using window.supabaseClient');
            supabaseClient = window.supabaseClient;
        } else if (typeof window.supabase !== 'undefined') {
            // Try to use global supabase object or create one
            if (typeof window.supabase.createClient === 'function') {
                console.log('[Auth-Redirect] Creating new supabase client');
                const supabaseUrl = 'https://txggovndoxdybdquopvx.supabase.co';
                const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2dvdm5kb3hkeWJkcXVvcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Nzg3MTMsImV4cCI6MjA1NzE1NDcxM30.p0l-YAdIjq-ICQNRGt5bN6YkrSB4NVDMaBUFYH4fpL4';
                supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
            } else {
                console.log('[Auth-Redirect] Using global supabase object');
                supabaseClient = window.supabase;
            }
        }
        
        if (!supabaseClient) {
            console.error('[Auth-Redirect] Could not get Supabase client for auth redirect check');
            return;
        }
        
        // Check for auth redirect
        console.log('[Auth-Redirect] Calling supabaseClient.auth.getSession()');
        const { data, error } = await supabaseClient.auth.getSession();
        console.log('[Auth-Redirect] Session data:', data ? 'exists' : 'null', 'Error:', error ? error.message : 'none');
        
        // Check if we have a valid session (user is logged in)
        if (data && data.session && isAuthRedirect) {
            console.log('[Auth-Redirect] User is authenticated AND this is an auth redirect.');
            
            // Check if there's a stored redirect path from before OAuth
            const storedRedirect = sessionStorage.getItem('oauth_redirect');
            if (storedRedirect) {
                console.log('[Auth-Redirect] Found stored redirect path:', storedRedirect);
                sessionStorage.removeItem('oauth_redirect'); // Clear it after use
                
                // Make sure redirectPath starts with a slash or http
                if (storedRedirect.startsWith('/') || storedRedirect.startsWith('http')) {
                    window.location.href = storedRedirect;
                } else {
                    window.location.href = '/' + storedRedirect;
                }
            } else {
                // Default redirect to dashboard
                console.log('[Auth-Redirect] No stored redirect path. Redirecting to dashboard...');
                window.location.href = '/pages/dashboard/index.html';
            }
        } else if (data && data.session) {
            console.log('[Auth-Redirect] User is authenticated but this is NOT an auth redirect. Staying on current page.');
        } else if (error) {
            console.error('[Auth-Redirect] Error checking authentication during redirect:', error.message);
        } else {
            console.log('[Auth-Redirect] No authentication session detected');
        }
    } catch (error) {
        console.error('[Auth-Redirect] Error in auth redirect handling:', error);
    }
} 