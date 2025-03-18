/**
 * secure-session.js
 * Handles secure session management with token storage, validation, and refresh
 */

// Session duration in milliseconds (5 minutes)
const SESSION_DURATION = 5 * 60 * 1000;

// Keys for localStorage
const TOKEN_KEY = 'nl_access_token';
const REFRESH_TOKEN_KEY = 'nl_refresh_token';
const TOKEN_TIMESTAMP_KEY = 'nl_token_timestamp';
const USER_KEY = 'nl_user_data';

/**
 * Store authentication data securely in localStorage
 * @param {Object} session - The session object from Supabase
 */
function storeAuthData(session) {
    if (!session || !session.access_token) {
        console.error('Invalid session data');
        return false;
    }

    try {
        // Store tokens and timestamp
        localStorage.setItem(TOKEN_KEY, session.access_token);
        localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
        
        // Store refresh token if available for longer sessions
        if (session.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
        }
        
        // Store user data for quick access
        if (session.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(session.user));
        }
        
        return true;
    } catch (error) {
        console.error('Failed to store auth data:', error);
        return false;
    }
}

/**
 * Check if the current session is valid
 * @returns {Boolean} True if the session is valid, false otherwise
 */
function isSessionValid() {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const timestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
        
        if (!token || !timestamp) {
            return false;
        }
        
        // Check if token is expired (older than SESSION_DURATION)
        const timeSinceIssued = Date.now() - parseInt(timestamp);
        return timeSinceIssued < SESSION_DURATION;
    } catch (error) {
        console.error('Error checking session validity:', error);
        return false;
    }
}

/**
 * Get the stored access token
 * @returns {String|null} The access token or null if not found
 */
function getAccessToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

/**
 * Get the stored refresh token
 * @returns {String|null} The refresh token or null if not found
 */
function getRefreshToken() {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
}

/**
 * Get the stored user data
 * @returns {Object|null} The user data or null if not found
 */
function getUserData() {
    try {
        const userData = localStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

/**
 * Clear all authentication data from localStorage
 */
function clearAuthData() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
}

/**
 * Handle session expiration
 * @param {Function} callback Optional callback to run after clearing auth data
 */
function handleSessionExpiration(callback) {
    clearAuthData();
    
    // Redirect to login page
    if (typeof callback === 'function') {
        callback();
    } else {
        window.location.href = '/pages/login.html';
    }
}

/**
 * Initialize the secure session system
 * @param {Object} supabaseClient The Supabase client instance
 * @returns {Promise<Object>} Session status object
 */
async function initSession(supabaseClient) {
    if (!supabaseClient) {
        console.error('Supabase client is required for session initialization');
        return { valid: false, error: 'No Supabase client provided' };
    }
    
    try {
        // Check if we have a valid session in localStorage
        if (isSessionValid()) {
            const token = getAccessToken();
            
            // Set the session in Supabase client
            if (token) {
                const { data: sessionData, error } = await supabaseClient.auth.getSession();
                
                if (error) {
                    console.error('Error getting session:', error);
                    handleSessionExpiration();
                    return { valid: false, error: error.message };
                }
                
                if (sessionData && sessionData.session) {
                    // Update the session timestamp to extend it
                    localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
                    return { valid: true, session: sessionData.session };
                }
            }
        }
        
        // If session is invalid or not present, try to refresh it
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            const { data, error } = await supabaseClient.auth.refreshSession({
                refresh_token: refreshToken
            });
            
            if (error) {
                console.error('Error refreshing session:', error);
                handleSessionExpiration();
                return { valid: false, error: error.message };
            }
            
            if (data && data.session) {
                storeAuthData(data.session);
                return { valid: true, session: data.session };
            }
        }
        
        // If no valid session or refresh token, user needs to log in
        return { valid: false, message: 'Session expired or not found' };
    } catch (error) {
        console.error('Error initializing session:', error);
        return { valid: false, error: error.message };
    }
}

// Export the functions for use in other files
window.secureSession = {
    storeAuthData,
    isSessionValid,
    getAccessToken,
    getRefreshToken,
    getUserData,
    clearAuthData,
    handleSessionExpiration,
    initSession
}; 