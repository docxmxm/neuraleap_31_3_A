/**
 * check-auth-ui.js
 * Helper script to test auth UI state from the browser console
 */

console.log('===== AUTH UI STATUS CHECKER =====');

// Check if our scripts are loaded
console.log('1. Script Loading:');
const authScriptsLoaded = !!window.authScriptsLoader;
const adaptiveUILoaded = !!window.adaptiveAuthUI;
const secureSessionLoaded = !!window.secureSession;

console.log('- Auth Scripts Loader loaded:', authScriptsLoaded);
console.log('- Adaptive Auth UI loaded:', adaptiveUILoaded);
console.log('- Secure Session loaded:', secureSessionLoaded);

// Check authentication status
console.log('\n2. Authentication Status:');
let isLoggedIn = false;
let userInfo = null;

if (secureSessionLoaded && typeof window.secureSession.isSessionValid === 'function') {
    isLoggedIn = window.secureSession.isSessionValid();
    userInfo = window.secureSession.getUserData();
} else {
    // Fallback checks
    const token = localStorage.getItem('nl_access_token');
    const timestamp = localStorage.getItem('nl_token_timestamp');
    
    if (token && timestamp) {
        const SESSION_DURATION = 5 * 60 * 1000;
        const timeSinceIssued = Date.now() - parseInt(timestamp);
        isLoggedIn = timeSinceIssued < SESSION_DURATION;
    }
    
    // Try to get user data
    try {
        const userDataStr = localStorage.getItem('nl_user_data');
        if (userDataStr) {
            userInfo = JSON.parse(userDataStr);
        } else {
            const supabaseAuthStr = localStorage.getItem('sb-txggovndoxdybdquopvx-auth-token');
            if (supabaseAuthStr) {
                const supabaseAuth = JSON.parse(supabaseAuthStr);
                userInfo = supabaseAuth.user;
            }
        }
    } catch (e) {
        console.error('Error getting user data:', e);
    }
}

console.log('- User is logged in:', isLoggedIn);
console.log('- User info:', userInfo);

// Check UI containers
console.log('\n3. UI Container Status:');
const desktopContainer = document.querySelector('#auth-ui-container');
const mobileContainer = document.querySelector('#mobile-auth-container');

console.log('- Desktop container found:', !!desktopContainer);
console.log('- Mobile container found:', !!mobileContainer);

if (desktopContainer) {
    console.log('- Desktop container content:', desktopContainer.innerHTML.slice(0, 100) + '...');
}

if (mobileContainer) {
    console.log('- Mobile container content:', mobileContainer.innerHTML.slice(0, 100) + '...');
}

// Provide helpful actions
console.log('\n4. Troubleshooting Actions:');
console.log('- To manually update UI: window.adaptiveAuthUI.initAdaptiveAuthUI()');
console.log('- To check login status: window.adaptiveAuthUI.checkUserLoggedIn()');
console.log('- To force reload scripts: window.authScriptsLoader.initAuthSystem()');

console.log('\n===== END OF STATUS CHECK ====='); 