/**
 * adaptive-auth-ui.js
 * Adapts UI elements based on authentication state across all pages
 * Ensures consistent login/logout UI elements regardless of which page the user is on
 */

// Make this available in the global scope for debugging and testing
window.adaptiveAuthUI = {
    initAdaptiveAuthUI: initAdaptiveAuthUI,
    checkUserLoggedIn: checkUserLoggedIn,
    getUserData: getUserData
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the adaptive UI after DOM is loaded
    console.log('adaptive-auth-ui.js: DOM loaded, initializing UI...');
    setTimeout(initAdaptiveAuthUI, 100); // Short delay to ensure header is fully loaded
});

/**
 * Initialize and update the adaptive authentication UI
 */
async function initAdaptiveAuthUI() {
    try {
        console.log('Initializing adaptive auth UI...');
        
        // Get the auth container elements with multiple selector approaches
        let desktopAuthContainer = document.querySelector("#auth-ui-container");
        let mobileAuthContainer = document.querySelector("#mobile-auth-container");
        
        // Fallback to more specific selectors if needed
        if (!desktopAuthContainer) {
            console.log('Primary desktop auth container selector failed, trying fallbacks...');
            desktopAuthContainer = document.querySelector(".hidden.sm\\:ml-6.sm\\:flex.space-x-8.items-center > div:last-child");
            
            if (!desktopAuthContainer) {
                desktopAuthContainer = document.querySelector("body > header > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8 > div > div.hidden.sm\\:ml-6.sm\\:flex.space-x-8.items-center > div");
            }
            
            if (desktopAuthContainer) {
                console.log('Found desktop auth container via fallback selector');
                // Add ID for future reference
                desktopAuthContainer.id = 'auth-ui-container';
            }
        } else {
            console.log('Found desktop auth container via ID selector');
        }
        
        // Fallback for mobile container
        if (!mobileAuthContainer) {
            console.log('Primary mobile auth container selector failed, trying fallbacks...');
            mobileAuthContainer = document.querySelector(".mobile-menu .border-t.border-gray-700");
            
            if (mobileAuthContainer) {
                console.log('Found mobile auth container via fallback selector');
                // Add ID for future reference
                mobileAuthContainer.id = 'mobile-auth-container';
            }
        } else {
            console.log('Found mobile auth container via ID selector');
        }
        
        if (!desktopAuthContainer && !mobileAuthContainer) {
            console.warn('Auth containers not found in header - cannot update UI');
            return;
        }

        // Check if user is logged in using secure session
        const isLoggedIn = await checkUserLoggedIn();
        console.log('User login status:', isLoggedIn ? 'Logged in' : 'Not logged in');
        
        // Update both desktop and mobile containers
        if (desktopAuthContainer) {
            if (isLoggedIn) {
                updateUIForLoggedInUser(desktopAuthContainer, false);
            } else {
                updateUIForLoggedOutUser(desktopAuthContainer, false);
            }
        }
        
        if (mobileAuthContainer) {
            if (isLoggedIn) {
                updateUIForLoggedInUser(mobileAuthContainer, true);
            } else {
                updateUIForLoggedOutUser(mobileAuthContainer, true);
            }
        }
        
        console.log('Auth UI updated successfully. User logged in:', isLoggedIn);
    } catch (error) {
        console.error('Error initializing adaptive auth UI:', error);
    }
}

/**
 * Check if user is logged in using secure session
 * @returns {Promise<boolean>} True if user is logged in
 */
async function checkUserLoggedIn() {
    console.log('[checkUserLoggedIn] Starting auth check...');
    
    try {
        // First check if our secure session system is available
        const hasSecureSession = window.secureSession && typeof window.secureSession.isSessionValid === 'function';
        console.log(`[checkUserLoggedIn] Secure session available: ${hasSecureSession}`);
        
        if (hasSecureSession) {
            console.log('[checkUserLoggedIn] Using secureSession.isSessionValid() to check login status');
            try {
                const isValid = window.secureSession.isSessionValid();
                console.log(`[checkUserLoggedIn] secureSession.isSessionValid() returned: ${isValid}`);
                return isValid;
            } catch (e) {
                console.error('[checkUserLoggedIn] Error using secure session:', e);
                // Continue to fallback methods
            }
        }
        
        // Fallback to checking localStorage directly
        console.log('[checkUserLoggedIn] Checking localStorage tokens...');
        
        // Check our custom tokens
        const token = localStorage.getItem('nl_access_token');
        const timestamp = localStorage.getItem('nl_token_timestamp');
        
        console.log(`[checkUserLoggedIn] nl_access_token exists: ${!!token}`);
        console.log(`[checkUserLoggedIn] nl_token_timestamp exists: ${!!timestamp}`);
        
        if (token && timestamp) {
            console.log('[checkUserLoggedIn] Found tokens in localStorage, checking validity');
            // Check if token is expired (older than 5 minutes)
            const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
            const now = Date.now();
            const tokenTimestamp = parseInt(timestamp);
            
            if (isNaN(tokenTimestamp)) {
                console.log('[checkUserLoggedIn] Token timestamp is not a valid number');
            } else {
                const timeSinceIssued = now - tokenTimestamp;
                console.log(`[checkUserLoggedIn] Token age: ${timeSinceIssued / 1000 / 60} minutes`);
                
                if (timeSinceIssued < SESSION_DURATION) {
                    console.log('[checkUserLoggedIn] Token is valid (not expired)');
                    return true;
                } else {
                    console.log('[checkUserLoggedIn] Token is expired');
                }
            }
        }
        
        // Last resort: Check Supabase default token
        const supabaseAuthStr = localStorage.getItem('sb-txggovndoxdybdquopvx-auth-token');
        if (supabaseAuthStr) {
            try {
                console.log('[checkUserLoggedIn] Found Supabase auth token, checking if valid');
                const supabaseAuth = JSON.parse(supabaseAuthStr);
                if (supabaseAuth && supabaseAuth.access_token) {
                    // Check if token is expired
                    if (supabaseAuth.expires_at) {
                        const expiresAt = supabaseAuth.expires_at * 1000; // convert to milliseconds
                        if (Date.now() < expiresAt) {
                            console.log('[checkUserLoggedIn] Supabase token is valid (not expired)');
                            return true;
                        } else {
                            console.log('[checkUserLoggedIn] Supabase token is expired');
                        }
                    } else {
                        // If we have Supabase auth and no expiry info, consider it valid
                        console.log('[checkUserLoggedIn] Supabase token exists and appears valid (no expiry info)');
                        return true;
                    }
                }
            } catch (e) {
                console.error('[checkUserLoggedIn] Error parsing Supabase auth token:', e);
            }
        } else {
            console.log('[checkUserLoggedIn] No Supabase auth token in localStorage');
        }
        
        console.log('[checkUserLoggedIn] No valid tokens found, user is not logged in');
        return false;
    } catch (error) {
        console.error('[checkUserLoggedIn] Error checking session validity:', error);
        return false;
    }
}

/**
 * Update UI elements for logged in user
 * @param {HTMLElement} container - The auth container
 * @param {boolean} isMobile - Whether this is the mobile container
 */
function updateUIForLoggedInUser(container, isMobile) {
    // Clear existing content
    container.innerHTML = '';
    
    // Get user data from secure session
    const userData = getUserData();
    const displayName = userData ? (userData.user_metadata?.name || userData.email || 'User') : 'User';
    const userInitial = displayName.charAt(0).toUpperCase();
    
    // Add global styles if not already added
    ensureAvatarStyles();
    
    if (isMobile) {
        // Mobile layout
        const profileLink = document.createElement('a');
        profileLink.href = '/pages/dashboard/profile.html';
        profileLink.className = 'flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors';
        
        const avatar = document.createElement('div');
        avatar.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium user-avatar';
        avatar.textContent = userInitial;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-sm font-medium';
        nameSpan.textContent = displayName;
        
        profileLink.appendChild(avatar);
        profileLink.appendChild(nameSpan);
        
        const menuContainer = document.createElement('div');
        menuContainer.className = 'grid grid-cols-1 gap-2 mt-3';
        
        // Menu items for mobile
        menuContainer.innerHTML = `
            <a href="/pages/dashboard/index.html" class="block w-full text-center text-gray-300 py-2 text-base font-medium hover:text-cyan-400 transition-colors">Dashboard</a>
            <a href="/pages/dashboard/settings.html" class="block w-full text-center text-gray-300 py-2 text-base font-medium hover:text-cyan-400 transition-colors">Settings</a>
            <a href="#" class="block w-full text-center text-gray-300 py-2 text-base font-medium hover:text-cyan-400 transition-colors sign-out-btn">Sign out</a>
        `;
        
        container.appendChild(profileLink);
        container.appendChild(menuContainer);
        
        // Add event listener to sign out button
        const signOutBtn = menuContainer.querySelector('.sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', handleSignOut);
        }
    } else {
        // Desktop layout
        const userMenu = document.createElement('div');
        userMenu.className = 'relative ml-3';
        
        // Create the user menu button
        const userButton = document.createElement('button');
        userButton.type = 'button';
        userButton.className = 'flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500';
        userButton.id = 'user-menu-button';
        userButton.setAttribute('aria-expanded', 'false');
        userButton.setAttribute('aria-haspopup', 'true');
        
        // Create the avatar
        const avatar = document.createElement('div');
        avatar.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium user-avatar';
        avatar.textContent = userInitial;
        
        // Add dropdown functionality
        userButton.appendChild(avatar);
        
        // Add dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-card ring-1 ring-black ring-opacity-5 focus:outline-none hidden';
        dropdownMenu.setAttribute('role', 'menu');
        dropdownMenu.setAttribute('aria-orientation', 'vertical');
        dropdownMenu.setAttribute('aria-labelledby', 'user-menu-button');
        dropdownMenu.id = 'user-dropdown-menu';
        
        // Add menu items
        dropdownMenu.innerHTML = `
            <div class="py-1" role="none">
                <div class="px-4 py-2 text-sm text-white border-b border-gray-700">
                    Signed in as <span class="font-medium">${displayName}</span>
                </div>
                <a href="/pages/dashboard/index.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem">Dashboard</a>
                <a href="/pages/dashboard/profile.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem">Profile</a>
                <a href="/pages/dashboard/settings.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem">Settings</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white sign-out-btn" role="menuitem">Sign out</a>
            </div>
        `;
        
        // Add event listener to toggle dropdown
        userButton.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            dropdownMenu.classList.toggle('hidden');
        });
        
        // Add event listener to close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!userButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                userButton.setAttribute('aria-expanded', 'false');
                dropdownMenu.classList.add('hidden');
            }
        });
        
        // Append to container
        userMenu.appendChild(userButton);
        userMenu.appendChild(dropdownMenu);
        container.appendChild(userMenu);
        
        // Add event listener to sign out button
        const signOutBtn = dropdownMenu.querySelector('.sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', handleSignOut);
        }
    }
}

/**
 * Ensure avatar styles are added to the document
 */
function ensureAvatarStyles() {
    // Check if we already added styles
    if (document.getElementById('adaptive-auth-ui-styles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'adaptive-auth-ui-styles';
    
    // Add necessary styles
    style.textContent = `
        .user-avatar {
            font-size: 1rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 2rem;
            width: 2rem;
            border-radius: 9999px;
            background: linear-gradient(135deg, #0891b2, #0369a1);
            color: white;
        }
        
        #user-dropdown-menu {
            transition: opacity 0.2s, transform 0.2s;
            transform-origin: top right;
            background-color: #1f2937;
            color: #f9fafb;
        }
        
        #user-dropdown-menu.hidden {
            opacity: 0;
            transform: scale(0.95);
            pointer-events: none;
        }
        
        #user-dropdown-menu:not(.hidden) {
            opacity: 1;
            transform: scale(1);
        }
    `;
    
    // Add to document head
    document.head.appendChild(style);
    console.log('Added adaptive auth UI styles to document');
}

/**
 * Update UI elements for logged out user
 * @param {HTMLElement} container - The auth container
 * @param {boolean} isMobile - Whether this is the mobile container
 */
function updateUIForLoggedOutUser(container, isMobile) {
    // Clear existing content
    container.innerHTML = '';
    
    if (isMobile) {
        // Mobile layout
        container.innerHTML = `
            <a href="/pages/login.html" class="block w-full text-center text-cyan-400 py-2 text-base font-medium mb-2">Log In</a>
            <a href="/pages/register.html" class="block w-full text-center neon-button py-2 text-base font-medium">Sign Up</a>
        `;
    } else {
        // Desktop layout
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex items-center space-x-4';
        
        // Login button
        const loginButton = document.createElement('a');
        loginButton.href = '/pages/login.html';
        loginButton.className = 'text-sm font-medium text-cyan-400 hover:text-cyan-300 transition';
        loginButton.textContent = 'Log in';
        
        // Register button
        const registerButton = document.createElement('a');
        registerButton.href = '/pages/register.html';
        registerButton.className = 'px-3 py-2 rounded-md text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition';
        registerButton.textContent = 'Sign up';
        
        // Append to container
        buttonContainer.appendChild(loginButton);
        buttonContainer.appendChild(registerButton);
        container.appendChild(buttonContainer);
    }
}

/**
 * Get user data from secure session or localStorage
 * @returns {Object|null} User data or null if not available
 */
function getUserData() {
    console.log('Getting user data from available sources...');
    
    // Try to get user data from secure session
    if (window.secureSession && typeof window.secureSession.getUserData === 'function') {
        console.log('Secure session manager available, getting user data...');
        try {
            const userData = window.secureSession.getUserData();
            if (userData) {
                console.log('User data found in secure session');
                return userData;
            }
        } catch (e) {
            console.error('Error getting user data from secure session:', e);
        }
    }
    
    // Fallback to localStorage
    try {
        console.log('Checking localStorage for user data...');
        
        // First check our custom storage
        const userDataStr = localStorage.getItem('nl_user_data');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                console.log('User data found in nl_user_data');
                return userData;
            } catch (e) {
                console.error('Error parsing user data from nl_user_data:', e);
            }
        }
        
        // Then try Supabase's default storage location
        const supabaseAuthStr = localStorage.getItem('sb-txggovndoxdybdquopvx-auth-token');
        if (supabaseAuthStr) {
            try {
                const supabaseAuth = JSON.parse(supabaseAuthStr);
                if (supabaseAuth && supabaseAuth.user) {
                    console.log('User data found in Supabase auth token');
                    return supabaseAuth.user;
                }
            } catch (e) {
                console.error('Error parsing Supabase auth token:', e);
            }
        }
        
        // Last resort: just check if any token exists
        const token = localStorage.getItem('nl_access_token');
        if (token) {
            console.log('Token found but no user data, creating minimal user data');
            return { email: 'User', user_metadata: { name: 'User' } };
        }
        
        console.log('No user data found in any storage location');
        return null;
    } catch (error) {
        console.error('Error getting user data from localStorage:', error);
        return null;
    }
}

/**
 * Handle sign out action
 * @param {Event} event - The click event
 */
async function handleSignOut(event) {
    if (event) event.preventDefault();
    
    // Check if we have a global sign out function
    if (window.handleSignOut && typeof window.handleSignOut === 'function') {
        await window.handleSignOut(event);
        return;
    }
    
    // Fallback sign out logic
    try {
        // Clear secure session data if available
        if (window.secureSession && typeof window.secureSession.clearAuthData === 'function') {
            window.secureSession.clearAuthData();
        }
        
        // Also sign out from Supabase if available
        if (window.supabaseClient && typeof window.supabaseClient.auth.signOut === 'function') {
            await window.supabaseClient.auth.signOut();
        }
        
        // For compatibility with older code, also clear the original token
        if (localStorage.getItem('sb-txggovndoxdybdquopvx-auth-token')) {
            localStorage.removeItem('sb-txggovndoxdybdquopvx-auth-token');
            console.log("Legacy token removed");
        }
        
        // Redirect to login page
        window.location.href = '/pages/login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        window.location.href = '/pages/login.html';
    }
} 