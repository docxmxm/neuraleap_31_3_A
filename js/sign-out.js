/**
 * sign-out.js
 * Shared functionality for handling user sign out across all pages
 */

/**
 * Handle sign out consistently across all pages
 * @param {Event} event - The click event
 */
async function handleSignOut(event) {
    if (event) event.preventDefault();
    console.log("Signing out...");
    
    try {
        // Clear session data using our secure session manager if available
        if (window.secureSession && typeof window.secureSession.clearAuthData === 'function') {
            window.secureSession.clearAuthData();
            console.log("Session data cleared with secure session manager");
        }
        
        // Also sign out from Supabase for server-side session clearing
        if (window.supabaseClient && typeof window.supabaseClient.auth.signOut === 'function') {
            await window.supabaseClient.auth.signOut();
            console.log("Successfully signed out from Supabase");
        } else {
            console.warn("Supabase signOut function not available, using local session cleanup only");
        }
        
        // For compatibility with older code, also clear the original token
        if (localStorage.getItem('sb-txggovndoxdybdquopvx-auth-token')) {
            localStorage.removeItem('sb-txggovndoxdybdquopvx-auth-token');
            console.log("Legacy token removed");
        }
        
        // Redirect to login page
        window.location.href = '/pages/login.html';
    } catch (error) {
        console.error("Error signing out:", error);
        
        // Fallback: Force clear all auth data and redirect
        try {
            if (window.secureSession && typeof window.secureSession.clearAuthData === 'function') {
                window.secureSession.clearAuthData();
            }
            localStorage.clear(); // Aggressive fallback to clear everything
        } catch (e) {
            console.error("Error during fallback cleanup:", e);
        }
        
        window.location.href = '/pages/login.html';
    }
}

// Expose the signOut function for global use
window.handleSignOut = handleSignOut;

// Set up sign out buttons when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Find all sign out buttons and attach the handler if not already attached
    const signOutLinks = document.querySelectorAll('a[href="#"][onclick*="handleSignOut"]');
    
    signOutLinks.forEach(link => {
        // Skip if already has a handler
        if (link.getAttribute('data-signout-initialized') === 'true') return;
        
        // Remove the inline handler and attach a proper one
        link.removeAttribute('onclick');
        link.addEventListener('click', handleSignOut);
        link.setAttribute('data-signout-initialized', 'true');
    });
    
    console.log(`Initialized ${signOutLinks.length} sign out buttons`);
}); 