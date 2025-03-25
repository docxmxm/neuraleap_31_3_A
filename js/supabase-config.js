/**
 * Supabase configuration
 * Contains all configuration settings for Supabase services used by NeuraLeap
 */

// Global Supabase config for development environments
const DEV_CONFIG = {
    supabaseUrl: 'https://txggovndoxdybdquopvx.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2dvdm5kb3hkeWJkcXVvcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Nzg3MTMsImV4cCI6MjA1NzE1NDcxM30.p0l-YAdIjq-ICQNRGt5bN6YkrSB4NVDMaBUFYH4fpL4',
    siteUrl: window.location.origin,
    redirectUrl: `${window.location.origin}/pages/login.html`,
    githubAuthRedirectUri: `${window.location.origin}`,
    googleAuthRedirectUri: 'https://txggovndoxdybdquopvx.supabase.co/auth/v1/callback?flowName=GeneralOAuthFlow',
    verifyRedirectUrl: `${window.location.origin}/pages/verify-success.html`
};

// Supabase configuration for production
const PRODUCTION_CONFIG = {
    supabaseUrl: 'https://txggovndoxdybdquopvx.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2dvdm5kb3hkeWJkcXVvcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Nzg3MTMsImV4cCI6MjA1NzE1NDcxM30.p0l-YAdIjq-ICQNRGt5bN6YkrSB4NVDMaBUFYH4fpL4',
    siteUrl: 'https://neuraleap.com.au',
    redirectUrl: 'https://neuraleap.com.au/pages/login.html',
    githubAuthRedirectUri: 'https://neuraleap.com.au',
    googleAuthRedirectUri: 'https://txggovndoxdybdquopvx.supabase.co/auth/v1/callback?flowName=GeneralOAuthFlow',
    verifyRedirectUrl: 'https://neuraleap.com.au/pages/verify-success.html'
};

// Determine environment based on hostname
const isProduction = window.location.hostname === 'neuraleap.com.au' || 
                    window.location.hostname === 'www.neuraleap.com.au';

// Select the appropriate config based on environment
const config = isProduction ? PRODUCTION_CONFIG : DEV_CONFIG;

// Set as a global variable for use throughout the application
window.SupabaseConfig = config;

// Only try to export for environments that support CommonJS modules
if (typeof window !== 'undefined' && typeof window.module === 'object' && window.module.exports) {
    try {
        window.module.exports = config;
    } catch (e) {
        // Silently fail if export isn't available
    }
} 