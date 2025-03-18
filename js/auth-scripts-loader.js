/**
 * auth-scripts-loader.js
 * Loads all necessary authentication scripts on all pages
 * This ensures consistent authentication behavior across the entire site
 */

// List of scripts needed for authentication across all pages
const authScripts = [
    '/js/secure-session.js',
    '/js/sign-out.js',
    '/js/adaptive-auth-ui.js'
];

/**
 * Check if a script is already loaded
 * @param {string} src - The script source URL
 * @returns {boolean} - True if already loaded, false otherwise
 */
function isScriptLoaded(src) {
    // Remove any query parameters to handle versioned scripts
    const cleanSrc = src.split('?')[0];
    
    // Check for exact match
    const exactMatch = document.querySelector(`script[src="${src}"]`);
    if (exactMatch) return true;
    
    // Check for match without query parameters
    const scripts = document.querySelectorAll('script[src]');
    for (let i = 0; i < scripts.length; i++) {
        const scriptSrc = scripts[i].getAttribute('src').split('?')[0];
        if (scriptSrc === cleanSrc) return true;
    }
    
    // Check for absolute paths vs relative paths
    const pathname = new URL(src, window.location.origin).pathname;
    for (let i = 0; i < scripts.length; i++) {
        try {
            const scriptPath = new URL(scripts[i].getAttribute('src'), window.location.origin).pathname;
            if (scriptPath === pathname) return true;
        } catch (e) {
            // Skip invalid URLs
            continue;
        }
    }
    
    return false;
}

/**
 * Dynamically load a script
 * @param {string} src - The script source URL
 * @returns {Promise} - Resolves when script is loaded, rejects on error
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (isScriptLoaded(src)) {
            console.log(`Script already loaded: ${src}`);
            resolve();
            return;
        }
        
        console.log(`Loading script: ${src}`);
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = () => {
            console.log(`Script loaded successfully: ${src}`);
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        
        document.head.appendChild(script);
    });
}

/**
 * Initialize authentication system by loading all required scripts
 */
async function initAuthSystem() {
    try {
        console.log('Initializing authentication system...');
        
        // Load scripts sequentially to respect dependencies
        for (const scriptSrc of authScripts) {
            await loadScript(scriptSrc);
        }
        
        console.log('Authentication system initialized successfully');
        
        // Once all scripts are loaded, force an update of the auth UI
        if (window.adaptiveAuthUI && typeof window.adaptiveAuthUI.initAdaptiveAuthUI === 'function') {
            // Add a longer delay to ensure DOM elements are ready
            console.log('Scheduling UI update in 500ms...');
            setTimeout(() => {
                console.log('Executing scheduled UI update...');
                window.adaptiveAuthUI.initAdaptiveAuthUI();
            }, 500); // Increased from 100ms to 500ms
        } else {
            console.warn('adaptiveAuthUI not available yet, will rely on its own initialization');
        }
    } catch (error) {
        console.error('Error initializing authentication system:', error);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    // DOM already loaded
    initAuthSystem();
}

// Expose functions globally
window.authScriptsLoader = {
    isScriptLoaded,
    loadScript,
    initAuthSystem
}; 