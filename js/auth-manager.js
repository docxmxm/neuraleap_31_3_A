/**
 * NeuraLeap Authentication Manager
 * 
 * This script provides consistent authentication functionality across the entire website,
 * including automatic login, session management, and token handling.
 */

// Default configuration
const AUTH_CONFIG = {
    autoLoginTimeout: 5, // Auto-login timeout in minutes
    tokenNames: {
        accessToken: 'auth_access_token',
        refreshToken: 'auth_refresh_token',
        issuedAt: 'auth_issued_at'
    },
    redirects: {
        afterLogin: '/pages/dashboard/index.html',
        afterLogout: '/pages/login.html',
        unauthenticated: '/pages/login.html'
    }
};

/**
 * The Auth Manager class that handles all authentication-related functionality
 */
class AuthManager {
    constructor(config = {}) {
        // Merge default config with provided config
        this.config = { ...AUTH_CONFIG, ...config };
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize the Auth Manager
     */
    initialize() {
        console.log('Initializing AuthManager...');
        
        // Check if we need to clean URL query parameters (security)
        this.cleanUrlParameters();
        
        // Check if we're on a dashboard page
        const isDashboardPage = window.location.pathname.includes('/pages/dashboard/');
        
        // Check if we need to protect this page
        if (isDashboardPage) {
            this.protectPage();
        }
        
        // Add event listeners
        this.setupEventListeners();
        
        // Check for auth tokens and update UI if needed
        this.checkAuthStatus();
    }
    
    /**
     * Clean URL parameters that may contain sensitive information
     */
    cleanUrlParameters() {
        // Check if URL contains email or password parameters (security risk)
        if (window.location.search && 
            (window.location.search.includes('email=') || 
             window.location.search.includes('password='))) {
            
            console.warn('Found sensitive data in URL parameters. Cleaning URL...');
            
            // Replace URL without query string to remove sensitive data from browser history
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
    
    /**
     * Protect the current page by requiring authentication
     * Redirects to login page if user is not authenticated
     */
    async protectPage() {
        console.log('Protecting page...');
        
        try {
            // First check if Supabase client is available
            if (!window.supabaseClient) {
                console.error('Supabase client not available, cannot protect page');
                return;
            }
            
            // Check if user is already authenticated
            const { data: { user }, error } = await window.supabaseClient.auth.getUser();
            
            if (error || !user) {
                console.log('No authenticated user found, attempting auto-login...');
                
                // Try auto-login
                const autoLoginSuccessful = await this.attemptAutoLogin();
                
                if (!autoLoginSuccessful) {
                    console.log('Auto-login failed, redirecting to login page...');
                    window.location.href = this.config.redirects.unauthenticated;
                }
            }
        } catch (error) {
            console.error('Error protecting page:', error);
            window.location.href = this.config.redirects.unauthenticated;
        }
    }
    
    /**
     * Set up event listeners for authentication events
     */
    setupEventListeners() {
        // Authentication state change listener
        if (window.supabaseClient) {
            window.supabaseClient.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                
                if (event === 'SIGNED_IN' && session) {
                    // Store tokens in localStorage
                    this.storeAuthTokens(session);
                    
                    // Dispatch custom event
                    this.dispatchAuthEvent('auth:signed-in', { user: session.user });
                } else if (event === 'SIGNED_OUT') {
                    // Clear tokens from localStorage
                    this.clearAuthTokens();
                    
                    // Dispatch custom event
                    this.dispatchAuthEvent('auth:signed-out');
                }
            });
        }
        
        // Listen for sign-out links
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-auth="sign-out"]');
            if (target) {
                event.preventDefault();
                this.signOut();
            }
        });
    }
    
    /**
     * Store authentication tokens in localStorage
     * @param {Object} session - The Supabase session object
     */
    storeAuthTokens(session) {
        if (session && session.access_token && session.refresh_token) {
            localStorage.setItem(this.config.tokenNames.accessToken, session.access_token);
            localStorage.setItem(this.config.tokenNames.refreshToken, session.refresh_token);
            localStorage.setItem(this.config.tokenNames.issuedAt, Date.now().toString());
            console.log('Authentication tokens stored in localStorage');
        }
    }
    
    /**
     * Clear authentication tokens from localStorage
     */
    clearAuthTokens() {
        localStorage.removeItem(this.config.tokenNames.accessToken);
        localStorage.removeItem(this.config.tokenNames.refreshToken);
        localStorage.removeItem(this.config.tokenNames.issuedAt);
        console.log('Authentication tokens cleared from localStorage');
    }
    
    /**
     * Dispatch a custom authentication event
     * @param {string} eventName - The name of the event to dispatch
     * @param {Object} detail - The event details
     */
    dispatchAuthEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
    
    /**
     * Check the current authentication status
     */
    async checkAuthStatus() {
        try {
            // First check if Supabase client is available
            if (!window.supabaseClient) {
                console.error('Supabase client not available, cannot check auth status');
                return;
            }
            
            // Check if user is already authenticated
            const { data: { user }, error } = await window.supabaseClient.auth.getUser();
            
            if (error || !user) {
                console.log('No authenticated user found');
                
                // Check for auto-login possibility
                const canAutoLogin = this.canAutoLogin();
                
                if (canAutoLogin) {
                    console.log('Auto-login is available');
                    this.dispatchAuthEvent('auth:can-auto-login');
                }
            } else {
                console.log('User is authenticated:', user.email);
                this.dispatchAuthEvent('auth:authenticated', { user });
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }
    
    /**
     * Check if auto-login is possible
     * @returns {boolean} Whether auto-login is possible
     */
    canAutoLogin() {
        // Check if we have tokens in localStorage
        const accessToken = localStorage.getItem(this.config.tokenNames.accessToken);
        const refreshToken = localStorage.getItem(this.config.tokenNames.refreshToken);
        const issuedAtStr = localStorage.getItem(this.config.tokenNames.issuedAt);
        
        if (!accessToken || !refreshToken || !issuedAtStr) {
            console.log('No tokens found for auto-login');
            return false;
        }
        
        // Check if token is still valid for auto-login
        const issuedAt = parseInt(issuedAtStr);
        const now = Date.now();
        const elapsedMinutes = (now - issuedAt) / 60000;
        
        console.log(`Token age: ${elapsedMinutes.toFixed(2)} minutes`);
        
        if (elapsedMinutes > this.config.autoLoginTimeout) {
            console.log(`Token too old for auto-login (older than ${this.config.autoLoginTimeout} minutes)`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Attempt automatic login using stored tokens
     * @returns {Promise<boolean>} Whether auto-login was successful
     */
    async attemptAutoLogin() {
        console.log('Attempting auto-login...');
        
        try {
            // Check if auto-login is possible
            if (!this.canAutoLogin()) {
                return false;
            }
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                console.error('Supabase client not available for auto-login');
                return false;
            }
            
            // Get tokens from localStorage
            const accessToken = localStorage.getItem(this.config.tokenNames.accessToken);
            const refreshToken = localStorage.getItem(this.config.tokenNames.refreshToken);
            
            // Attempt to restore the session
            const { data, error } = await window.supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (error) {
                console.error('Auto-login error:', error);
                return false;
            }
            
            if (data && data.user) {
                console.log('Auto-login successful!', data.user.email);
                
                // Dispatch custom event
                this.dispatchAuthEvent('auth:auto-login', { user: data.user });
                
                return true;
            }
            
            return false;
        } catch (err) {
            console.error('Error during auto-login attempt:', err);
            return false;
        }
    }
    
    /**
     * Perform login with email and password
     * @param {string} email - The user's email
     * @param {string} password - The user's password
     * @returns {Promise<Object>} The result of the login attempt
     */
    async login(email, password) {
        try {
            console.log('Attempting login...');
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                throw new Error('Authentication system not available');
            }
            
            // Attempt login
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                throw error;
            }
            
            // Store tokens in localStorage
            if (data && data.session) {
                this.storeAuthTokens(data.session);
                
                // Dispatch custom event for successful login
                this.dispatchAuthEvent('auth:signed-in', { user: data.user });
                
                console.log('Login successful, will redirect to dashboard');
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Sign out the current user
     */
    async signOut() {
        try {
            console.log('Signing out...');
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                throw new Error('Authentication system not available');
            }
            
            // Sign out
            const { error } = await window.supabaseClient.auth.signOut();
            
            // Always clear tokens from localStorage, even if there's an error
            this.clearAuthTokens();
            
            if (error) {
                throw error;
            }
            
            // Redirect to login page
            window.location.href = this.config.redirects.afterLogout;
        } catch (error) {
            console.error('Sign out error:', error);
            
            // Still redirect to login page
            window.location.href = this.config.redirects.afterLogout;
        }
    }
    
    /**
     * Get the current session timer information
     * @returns {Object} Session timer information
     */
    getSessionTimerInfo() {
        const issuedAtStr = localStorage.getItem(this.config.tokenNames.issuedAt);
        
        if (!issuedAtStr) {
            return null;
        }
        
        const issuedAt = parseInt(issuedAtStr);
        const now = Date.now();
        const elapsedMs = now - issuedAt;
        const elapsedMinutes = Math.floor(elapsedMs / 60000);
        const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);
        
        const autoLoginTimeoutMs = this.config.autoLoginTimeout * 60 * 1000;
        const remainingMs = autoLoginTimeoutMs - elapsedMs;
        
        if (remainingMs <= 0) {
            return {
                isActive: true,
                canAutoLogin: false,
                elapsedMinutes,
                elapsedSeconds,
                remainingMinutes: 0,
                remainingSeconds: 0,
                message: 'Session active (auto-login expired)'
            };
        }
        
        const remainingMinutes = Math.floor(remainingMs / 60000);
        const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
        
        return {
            isActive: true,
            canAutoLogin: true,
            elapsedMinutes,
            elapsedSeconds,
            remainingMinutes,
            remainingSeconds,
            message: `Session active for ${elapsedMinutes}m ${elapsedSeconds}s | Auto-login valid for ${remainingMinutes}m ${remainingSeconds}s`
        };
    }
}

// Create global instance
window.authManager = new AuthManager();

// Initialize auth manager when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth Manager initialized');
}); 