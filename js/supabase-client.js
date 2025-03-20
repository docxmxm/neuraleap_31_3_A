/**
 * Supabase client configuration for the NeuraLeap frontend
 * This file initializes and exports the Supabase client for use throughout the frontend
 */

// Import Supabase client (will be used in production with proper bundling)
// In the browser without a bundler, the createClient function is available from the CDN as supabase.createClient

// Define default configuration
const defaultConfig = {
    supabaseUrl: 'https://txggovndoxdybdquopvx.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2dvdm5kb3hkeWJkcXVvcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Nzg3MTMsImV4cCI6MjA1NzE1NDcxM30.p0l-YAdIjq-ICQNRGt5bN6YkrSB4NVDMaBUFYH4fpL4',
    siteUrl: window.location.origin,
    redirectUrl: `${window.location.origin}/pages/dashboard/index.html`,
    verifyRedirectUrl: `${window.location.origin}/pages/verify-success.html`,
    autoLoginTimeout: 5 // 5 minutes for auto-login timeout
};

// Try to load the configuration from window.SupabaseConfig if available
const supabaseConfig = window.SupabaseConfig || defaultConfig;

// Initialize the Supabase client
let supabase;

/**
 * Initialize the Supabase client using the modern approach
 */
function initializeSupabaseClient() {
    console.log('Initializing Supabase client...');
    
    try {
        // Define our approach for various environments
        
        // Method 1: Using the globally available createClient from CDN
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            console.log('Using global supabase.createClient');
            supabase = window.supabase.createClient(
                supabaseConfig.supabaseUrl, 
                supabaseConfig.supabaseKey,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                        flowType: 'pkce'
                    }
                }
            );
            window.supabaseClient = supabase; // Store for other scripts to use
            
            // Verify that the client was properly initialized
            if (!supabase) {
                console.error('Failed to initialize Supabase client with global supabase.createClient');
                return false;
            }
            
            console.log('Supabase client initialized successfully with global supabase.createClient');
            // Dispatch an event to notify that Supabase is ready
            const event = new CustomEvent('supabase:ready', { detail: { client: supabase } });
            window.dispatchEvent(event);
            
            // Attempt automatic login if tokens exist in localStorage
            attemptAutoLogin();
            
            return true;
        } 
        // Method 2: Some CDN versions use a different global variable
        else if (typeof window.createClient === 'function') {
            console.log('Using standalone createClient function');
            supabase = window.createClient(
                supabaseConfig.supabaseUrl, 
                supabaseConfig.supabaseKey,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                        flowType: 'pkce'
                    }
                }
            );
            window.supabaseClient = supabase;
            
            // Verify that the client was properly initialized
            if (!supabase) {
                console.error('Failed to initialize Supabase client with standalone createClient');
                return false;
            }
            
            console.log('Supabase client initialized successfully with standalone createClient');
            // Dispatch an event to notify that Supabase is ready
            const event = new CustomEvent('supabase:ready', { detail: { client: supabase } });
            window.dispatchEvent(event);
            
            // Attempt automatic login if tokens exist in localStorage
            attemptAutoLogin();
            
            return true;
        }
        // Method 3: If a client is already initialized, use that
        else if (window.supabaseClient) {
            console.log('Using existing supabaseClient');
            supabase = window.supabaseClient;
            
            // Verify that the client was properly initialized
            if (!supabase) {
                console.error('Failed to initialize Supabase client from existing supabaseClient');
                return false;
            }
            
            console.log('Supabase client retrieved successfully from existing window.supabaseClient');
            
            // Attempt automatic login if tokens exist in localStorage
            attemptAutoLogin();
            
            return true;
        }
        // If all else fails, load Supabase dynamically
        else {
            console.warn('Supabase JS library not loaded. Attempting to load dynamically...');
            
            // Try to load Supabase dynamically
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.async = true;
            
            return new Promise((resolve) => {
                script.onload = () => {
                    console.log('Supabase JS library loaded dynamically');
                    // Try again after loading
                    setTimeout(() => {
                        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
                            supabase = window.supabase.createClient(
                                supabaseConfig.supabaseUrl, 
                                supabaseConfig.supabaseKey,
                                {
                                    auth: {
                                        autoRefreshToken: true,
                                        persistSession: true,
                                        detectSessionInUrl: true,
                                        flowType: 'pkce'
                                    }
                                }
                            );
                            window.supabaseClient = supabase;
                            console.log('Supabase client initialized after dynamic loading');
                            
                            // Attempt automatic login if tokens exist in localStorage
                            attemptAutoLogin();
                            
                            // Notify that Supabase is ready
                            const event = new CustomEvent('supabase:ready', { detail: { client: supabase } });
                            window.dispatchEvent(event);
                            
                            resolve(true);
                        } else {
                            console.error('Failed to initialize Supabase client after dynamic loading');
                            resolve(false);
                        }
                    }, 500);
                };
                
                script.onerror = () => {
                    console.error('Failed to load Supabase JS library dynamically');
                    resolve(false);
                };
                
                document.head.appendChild(script);
            });
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return false;
    }
}

/**
 * Attempt automatic login using stored tokens
 * This function checks if we have valid tokens in localStorage and tries to restore the session
 */
async function attemptAutoLogin() {
    console.log('Checking for stored authentication tokens...');
    
    try {
        // Check for tokens in localStorage
        const accessToken = localStorage.getItem('auth_access_token');
        const refreshToken = localStorage.getItem('auth_refresh_token');
        const issuedAtStr = localStorage.getItem('auth_issued_at');
        
        if (!accessToken || !refreshToken || !issuedAtStr) {
            console.log('No stored tokens found for auto-login');
            return false;
        }
        
        // Check if token is still valid for auto-login
        const issuedAt = parseInt(issuedAtStr);
        const now = Date.now();
        const elapsedMinutes = (now - issuedAt) / 60000;
        
        console.log(`Token age: ${elapsedMinutes.toFixed(2)} minutes`);
        
        if (elapsedMinutes > supabaseConfig.autoLoginTimeout) {
            console.log(`Token too old for auto-login (older than ${supabaseConfig.autoLoginTimeout} minutes)`);
            return false;
        }
        
        // Attempt to restore the session
        console.log('Attempting to restore session with stored tokens');
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        
        if (error) {
            console.error('Auto-login error:', error);
            return false;
        }
        
        if (data && data.user) {
            console.log('Auto-login successful!', data.user.email);
            
            // Dispatch a custom event to notify the app that auto-login was successful
            const event = new CustomEvent('auth:auto-login', { 
                detail: { user: data.user } 
            });
            window.dispatchEvent(event);
            
            return true;
        }
        
        return false;
    } catch (err) {
        console.error('Error during auto-login attempt:', err);
        return false;
    }
}

// Initialize on load
const initialized = initializeSupabaseClient();

/**
 * Get or initialize the Supabase client
 * @returns {Object} Supabase client or null if initialization failed
 */
function getSupabaseClient() {
    if (supabase) {
        return supabase;
    }
    
    // Try to initialize again if it failed the first time
    console.log('Supabase client not found, attempting to initialize...');
    
    // Create a promise-based approach for initialization
    return new Promise(async (resolve) => {
        try {
            const result = await initializeSupabaseClient();
            if (result && supabase) {
                console.log('Successfully initialized Supabase client on retry');
                resolve(supabase);
            } else {
                console.error('Failed to initialize Supabase client after retry');
                // Attempt one more time with a forced reload of the library
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                script.async = false; // Use synchronous loading as a final attempt
                
                script.onload = () => {
                    setTimeout(() => {
                        // Final attempt to initialize
                        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
                            supabase = window.supabase.createClient(
                                supabaseConfig.supabaseUrl, 
                                supabaseConfig.supabaseKey,
                                {
                                    auth: {
                                        autoRefreshToken: true,
                                        persistSession: true,
                                        detectSessionInUrl: true,
                                        flowType: 'pkce'
                                    }
                                }
                            );
                            window.supabaseClient = supabase;
                            resolve(supabase);
                        } else {
                            resolve(null);
                        }
                    }, 500);
                };
                
                script.onerror = () => {
                    resolve(null);
                };
                
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error('Error in getSupabaseClient:', error);
            resolve(null);
        }
    });
}

// Expose to window for debugging and global access
window.getSupabaseClient = getSupabaseClient;

// Always set the client to window.supabaseClient for consistency
if (typeof window !== 'undefined') {
    window.supabaseClient = supabase;
}

/**
 * Check Supabase configuration and session
 * This function tests the connection and logs information to help troubleshoot issues
 */
async function verifySupabaseConfig() {
    console.log('=== Supabase Configuration Verification ===');
    
    const isProduction = window.location.hostname === 'neuraleap.com.au' || window.location.hostname === 'www.neuraleap.com.au';
    
    console.log('Environment:', isProduction ? 'Production' : 'Development');
    console.log('Supabase URL:', supabaseConfig.supabaseUrl);
    console.log('Auth Redirect URL:', supabaseConfig.redirectUrl);
    
    let isConnected = false;
    
    // Verify settings by attempting a basic operation
    try {
        console.log('Testing connection to Supabase...');
        
        // Test a simple auth operation with timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        
        const fetchPromise = supabase.auth.getSession();
        
        const { data } = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (data && data.session) {
            console.log('Supabase connection successful with active session');
            isConnected = true;
        } else {
            console.log('Supabase connection successful, no active session');
            isConnected = true;
        }
    } catch (err) {
        console.error('Error verifying Supabase config:', err);
        isConnected = false;
    }
    
    console.log('Connection status:', isConnected ? 'Connected' : 'Failed');
    console.log('=====================================');
    
    return {
        config: supabaseConfig,
        isConnected: isConnected,
        environment: isProduction ? 'Production' : 'Development'
    };
}

// Expose verification function
window.verifySupabaseConfig = verifySupabaseConfig;

/**
 * Authentication functions
 */

// Sign up a new user with email and password
async function signUp(email, password, userData = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData,
                emailRedirectTo: supabaseConfig.verifyRedirectUrl
            }
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error signing up:', error.message);
        return { data: null, error };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        // Manually store session info for better persistence
        if (data && data.session) {
            localStorage.setItem('auth_access_token', data.session.access_token);
            localStorage.setItem('auth_refresh_token', data.session.refresh_token);
            localStorage.setItem('auth_issued_at', Date.now().toString());
        }
        
        return { data, error: null };
    } catch (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
    }
}

// Sign in with magic link via email
async function signInWithMagicLink(email) {
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email.trim()
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error sending magic link:', error.message);
        return { data: null, error };
    }
}

// Sign in with OAuth provider
async function signInWithOAuth(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error(`Error signing in with ${provider}:`, error.message);
        return { data: null, error };
    }
}

// Sign out the current user
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        
        // Always clear auth data from localStorage, even if there's an error
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_issued_at');
        console.log('Auth tokens cleared from localStorage');
        
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error signing out:', error.message);
        return { error };
    }
}

// Get the current session
async function getSession() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { session: data.session, error: null };
    } catch (error) {
        console.error('Error getting session:', error.message);
        return { session: null, error };
    }
}

// Get the current user
async function getUser() {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Error getting user:', error.message);
        return { user: null, error };
    }
}

// Update user data
async function updateUser(updates) {
    try {
        const { data, error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating user:', error.message);
        return { data: null, error };
    }
}

// Reset password
async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: supabaseConfig.redirectUrl
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error resetting password:', error.message);
        return { data: null, error };
    }
}

/**
 * Profile management functions
 */

// Fetch user profile data
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) throw error;
        return { profile: data, error: null };
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        return { profile: null, error };
    }
}

// Update user profile data
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select();
            
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating profile:', error.message);
        return { data: null, error };
    }
}

// Create a new profile
async function createUserProfile(profileData) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert([profileData])
            .select();
            
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating profile:', error.message);
        return { data: null, error };
    }
}

// Export all functions
const SupabaseAuth = {
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,
    getSession,
    getUser,
    updateUser,
    resetPassword
};

const SupabaseProfile = {
    getUserProfile,
    updateUserProfile,
    createUserProfile
};

// Expose auth and profile functions to window
window.SupabaseAuth = SupabaseAuth;
window.SupabaseProfile = SupabaseProfile;

// Also expose individual functions directly for easier access
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;

// Listen for DOMContentLoaded to verify connection
document.addEventListener('DOMContentLoaded', () => {
    // Verify connection on page load
    setTimeout(verifySupabaseConfig, 1000);
}); 