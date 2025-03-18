/**
 * init-auth-ui.js
 * This script is included at the end of the page to ensure 
 * the authentication UI is initialized after DOM is fully loaded
 */

(function() {
    console.log('init-auth-ui.js executing...');
    
    // Wait for DOM to be fully loaded
    function checkAndInitAuth() {
        // Make sure all required scripts are loaded
        const requiredScripts = [
            '/js/secure-session.js',
            '/js/sign-out.js',
            '/js/adaptive-auth-ui.js'
        ];
        
        // Check if any of the required scripts need to be loaded
        let needsLoading = false;
        requiredScripts.forEach(script => {
            if (!isScriptLoaded(script)) {
                needsLoading = true;
                loadScript(script);
            }
        });
        
        // If scripts needed loading, wait and try again
        if (needsLoading) {
            console.log('Some auth scripts needed loading, waiting 500ms...');
            setTimeout(checkAndInitAuth, 500);
            return;
        }
        
        // Find auth containers
        const authContainers = findAuthContainers();
        
        if (!authContainers.desktop && !authContainers.mobile) {
            console.warn('Auth containers not found, creating fallback containers');
            createFallbackContainers();
        }
        
        // Initialize the UI if the function exists
        if (window.adaptiveAuthUI && typeof window.adaptiveAuthUI.initAdaptiveAuthUI === 'function') {
            console.log('Initializing adaptive auth UI...');
            window.adaptiveAuthUI.initAdaptiveAuthUI();
        } else {
            console.error('adaptiveAuthUI not available or initAdaptiveAuthUI function not found');
        }
    }
    
    /**
     * Find auth containers in the DOM
     * @returns {Object} Object with desktop and mobile containers
     */
    function findAuthContainers() {
        // Try various selectors
        const desktopSelectors = [
            '#auth-ui-container',
            '.hidden.sm\\:ml-6.sm\\:flex.space-x-8.items-center > div:last-child',
            'body > header > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8 > div > div.hidden.sm\\:ml-6.sm\\:flex.space-x-8.items-center > div'
        ];
        
        const mobileSelectors = [
            '#mobile-auth-container',
            '.mobile-menu .border-t.border-gray-700',
            '#mobile-menu > div > div.pt-4.pb-3.border-t.border-gray-700'
        ];
        
        let desktop = null;
        let mobile = null;
        
        // Try each desktop selector
        for (const selector of desktopSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                desktop = element;
                if (!element.id) element.id = 'auth-ui-container';
                break;
            }
        }
        
        // Try each mobile selector
        for (const selector of mobileSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                mobile = element;
                if (!element.id) element.id = 'mobile-auth-container';
                break;
            }
        }
        
        return { desktop, mobile };
    }
    
    /**
     * Create fallback containers if they don't exist
     */
    function createFallbackContainers() {
        // Try to find header
        const header = document.querySelector('header');
        if (!header) {
            console.error('Header not found, cannot create fallback containers');
            return;
        }
        
        // Find/create desktop container
        let desktopContainer = document.querySelector('#auth-ui-container');
        if (!desktopContainer) {
            const desktopNav = header.querySelector('.hidden.sm\\:ml-6.sm\\:flex.space-x-8.items-center');
            if (desktopNav) {
                desktopContainer = document.createElement('div');
                desktopContainer.id = 'auth-ui-container';
                desktopContainer.className = 'flex items-center space-x-3';
                desktopContainer.innerHTML = `
                    <a href="/pages/login.html" class="text-cyan-400 hover:text-white transition-colors">Log In</a>
                    <a href="/pages/register.html" class="neon-button text-sm px-4 py-2 rounded pulse-button">Sign Up</a>
                `;
                desktopNav.appendChild(desktopContainer);
                console.log('Created fallback desktop container');
            }
        }
        
        // Find/create mobile container
        let mobileContainer = document.querySelector('#mobile-auth-container');
        if (!mobileContainer) {
            const mobileMenu = document.querySelector('#mobile-menu > div');
            if (mobileMenu) {
                mobileContainer = document.createElement('div');
                mobileContainer.id = 'mobile-auth-container';
                mobileContainer.className = 'pt-4 pb-3 border-t border-gray-700';
                mobileContainer.innerHTML = `
                    <a href="/pages/login.html" class="block w-full text-center text-cyan-400 py-2 text-base font-medium mb-2">Log In</a>
                    <a href="/pages/register.html" class="block w-full text-center neon-button py-2 text-base font-medium">Sign Up</a>
                `;
                mobileMenu.appendChild(mobileContainer);
                console.log('Created fallback mobile container');
            }
        }
    }
    
    /**
     * Check if a script is already loaded
     * @param {string} src - The script source URL
     * @returns {boolean} - True if already loaded, false otherwise
     */
    function isScriptLoaded(src) {
        // Remove any query parameters to handle versioned scripts
        const cleanSrc = src.split('?')[0];
        
        // Check for exact match
        const scripts = document.querySelectorAll('script[src]');
        for (let i = 0; i < scripts.length; i++) {
            const scriptSrc = scripts[i].getAttribute('src').split('?')[0];
            if (scriptSrc === cleanSrc || scriptSrc.endsWith(cleanSrc)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Dynamically load a script
     * @param {string} src - The script source URL
     */
    function loadScript(src) {
        if (isScriptLoaded(src)) {
            return;
        }
        
        console.log(`Loading script: ${src}`);
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    }
    
    // Initialize when the window is fully loaded
    if (document.readyState === 'complete') {
        console.log('Document already complete, initializing auth UI...');
        checkAndInitAuth();
    } else {
        console.log('Document not yet complete, waiting for window load...');
        window.addEventListener('load', function() {
            console.log('Window loaded, initializing auth UI...');
            // Delay slightly to ensure everything is truly loaded
            setTimeout(checkAndInitAuth, 500);
        });
    }
})(); 