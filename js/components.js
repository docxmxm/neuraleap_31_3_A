/**
 * NeuraLeap Components Loader
 * Handles loading of reusable components like header and footer
 */

// Used to track component loading events
const componentEvents = {
    'header-loaded': false,
    'footer-loaded': false,
    'header-loading': false,
    'footer-loading': false
};

/**
 * Load a component's HTML into the specified container
 * @param {string} componentName - The name of the component (e.g., 'header', 'footer')
 * @param {string} containerId - The ID of the container to load the component into
 * @param {Function} callback - Optional callback to run after component is loaded
 */
async function loadComponent(componentName, containerId, callback) {
    try {
        // Don't start a new load if already loading or loaded
        if (componentEvents[`${componentName}-loading`] || componentEvents[`${componentName}-loaded`]) {
            if (typeof callback === 'function') {
                callback();
            }
            return;
        }
        
        // Mark as loading
        componentEvents[`${componentName}-loading`] = true;
        
        const container = document.getElementById(containerId);
        if (!container) {
            componentEvents[`${componentName}-loading`] = false;
            return;
        }
        
        // Build URL with proper base path
        const baseUrl = window.location.origin;
        let componentUrl = '';
        
        // Determine the component URL
        if (componentName.includes('/')) {
            // If componentName already contains a path
            componentUrl = componentName;
        } else {
            // Otherwise, assume it's in the components directory
            componentUrl = `/components/${componentName}.html`;
        }
        
        // Ensure the URL starts with a slash if it's not absolute
        if (!componentUrl.startsWith('http') && !componentUrl.startsWith('/')) {
            componentUrl = '/' + componentUrl;
        }
        
        // Use a cache-busting parameter to avoid stale component caching
        const cacheBuster = `?_cb=${new Date().getTime()}`;
        const url = componentUrl + cacheBuster;
        
        console.log(`Loading component: ${url}`);
        
        // First try with fetch API
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load component ${componentName}: ${response.status} ${response.statusText}`);
            }
            
            const html = await response.text();
            
            // Check if we got valid HTML content
            if (!html || html.trim().length === 0) {
                throw new Error(`Empty or invalid HTML for component ${componentName}`);
            }
            
            container.innerHTML = html;
            
            // For header component, add notification count badge
            if (componentName === 'header' || componentUrl.includes('header.html')) {
                // Find all notification bell icons
                const notificationIcons = container.querySelectorAll('.notification-icon');
                
                // Add badge for notification count
                notificationIcons.forEach(icon => {
                    const parentElement = icon.parentElement;
                    
                    // Create badge element if it doesn't exist
                    if (!parentElement.querySelector('.notification-count')) {
                        const badge = document.createElement('span');
                        badge.className = 'notification-count absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center';
                        badge.textContent = '0';
                        badge.style.display = 'none'; // Hide until we have a count
                        parentElement.style.position = 'relative'; // Ensure relative positioning for absolute badge
                        parentElement.appendChild(badge);
                    }
                });
                
                // Initialize mobile menu toggle for header
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                const mobileMenu = document.getElementById('mobile-menu');
                
                if (mobileMenuButton && mobileMenu) {
                    // Remove any existing event listeners first to avoid duplicates
                    mobileMenuButton.removeEventListener('click', toggleMobileMenu);
                    
                    // Improved event handling for mobile devices
                    if ('ontouchstart' in window) {
                        // For touch devices
                        mobileMenuButton.addEventListener('touchstart', function(e) {
                            e.preventDefault(); // Prevent default behavior
                            toggleMobileMenu();
                        }, {passive: false});
                    } else {
                        // For non-touch devices
                        mobileMenuButton.addEventListener('click', toggleMobileMenu);
                    }
                    
                    // Function to toggle mobile menu
                    function toggleMobileMenu() {
                        mobileMenu.classList.toggle('hidden');
                        
                        // Update ARIA attributes for accessibility
                        const expanded = !mobileMenu.classList.contains('hidden');
                        mobileMenuButton.setAttribute('aria-expanded', expanded.toString());
                        
                        // Add visual feedback
                        if (expanded) {
                            mobileMenuButton.classList.add('text-cyan-400');
                        } else {
                            mobileMenuButton.classList.remove('text-cyan-400');
                        }
                    }
                }
                
                // Initialize dropdowns if needed
                const dropdownToggles = container.querySelectorAll('.dropdown-toggle');
                
                dropdownToggles.forEach(toggle => {
                    // Remove any existing click listeners
                    toggle.removeEventListener('click', handleDropdownToggle);
                    
                    // Improved event handling for touch devices
                    if ('ontouchstart' in window) {
                        toggle.addEventListener('touchstart', function(e) {
                            e.preventDefault();
                            handleDropdownToggle.call(this, e);
                        }, {passive: false});
                    } else {
                        toggle.addEventListener('click', handleDropdownToggle);
                    }
                    
                    function handleDropdownToggle(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Toggle dropdown menu
                        const dropdownMenu = this.nextElementSibling;
                        if (dropdownMenu) {
                            // Close other dropdowns first
                            container.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
                                if (menu !== dropdownMenu) {
                                    menu.classList.add('hidden');
                                }
                            });
                            
                            // Toggle this dropdown
                            dropdownMenu.classList.toggle('hidden');
                            
                            // Update ARIA attributes
                            this.setAttribute('aria-expanded', 
                                !dropdownMenu.classList.contains('hidden').toString());
                        }
                    }
                });
            }
            
            // Mark as loaded
            componentEvents[`${componentName}-loaded`] = true;
            componentEvents[`${componentName}-loading`] = false;
            
            // Notify listeners that the component has loaded
            const event = new CustomEvent(`${componentName}-loaded`);
            document.dispatchEvent(event);
            
            console.log(`Component ${componentName} loaded successfully`);
            
            // Run callback if provided
            if (typeof callback === 'function') {
                callback();
            }
        } catch (fetchError) {
            console.error(`Error fetching component ${componentName}:`, fetchError);
            throw fetchError; // Re-throw to be handled by the outer catch
        }
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
        componentEvents[`${componentName}-loading`] = false;
        
        // Fallback: Try one more time with a direct innerHTML approach
        try {
            const container = document.getElementById(containerId);
            if (container && (componentName === 'header' || componentName === 'test-header')) {
                console.log(`Attempting fallback for ${componentName}`);
                
                // First try loading the test-header as a fallback if it's not already what we tried
                if (componentName !== 'test-header') {
                    try {
                        const testResponse = await fetch('/components/test-header.html');
                        if (testResponse.ok) {
                            const testHtml = await testResponse.text();
                            if (testHtml && testHtml.trim().length > 0) {
                                container.innerHTML = testHtml;
                                componentEvents[`${componentName}-loaded`] = true;
                                componentEvents[`${componentName}-loading`] = false;
                                console.log(`Loaded ${componentName} with test-header fallback`);
                                
                                if (typeof callback === 'function') {
                                    callback();
                                }
                                return;
                            }
                        }
                    } catch (testError) {
                        console.error(`Test header fallback failed:`, testError);
                    }
                }
                
                // Use a simple header fallback if the normal one fails
                container.innerHTML = `
                <header class="bg-dark-bg text-white fixed w-full z-50 shadow-lg">
                    <div class="flicker-line"></div>
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex-shrink-0 flex items-center">
                                <a href="/index.html" class="logo-n flex items-center">
                                    <div class="logo-bg w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mr-2 relative overflow-hidden">
                                        <span class="text-2xl font-bold">N</span>
                                    </div>
                                    <span class="logo-text text-xl font-bold text-white tracking-wide">
                                        <span class="neon-text">Neura</span>leap
                                    </span>
                                </a>
                            </div>
                            <div class="hidden sm:ml-6 sm:flex space-x-8 items-center">
                                <nav class="desktop-menu">
                                    <a href="/index.html" class="nav-item px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors">Home</a>
                                    <a href="/pages/coming-soon.html" class="nav-item px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors">Courses</a>
                                    <a href="/pages/activities" class="nav-item px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors">Activities</a>
                                    <a href="/pages/partnerships/index.html" class="nav-item px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors">Partnerships</a>
                                    <a href="/pages/coming-soon.html" class="nav-item px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors">Resources</a>
                                    <a href="/pages/about-us" class="nav-item px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors">About Us</a>
                                </nav>
                                <div class="flex items-center space-x-3">
                                    <a href="/pages/login.html" class="text-cyan-400 hover:text-white transition-colors">Log In</a>
                                    <a href="/pages/register.html" class="neon-button text-sm px-4 py-2 rounded pulse-button">Sign Up</a>
                                </div>
                            </div>
                            <div class="flex items-center sm:hidden">
                                <button type="button" id="mobile-menu-button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span class="sr-only">Open main menu</span>
                                    <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <div class="h-16"></div>`;
                
                // Add mobile menu functionality
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                if (mobileMenuButton) {
                    mobileMenuButton.addEventListener('click', function() {
                        // Create mobile menu if it doesn't exist
                        let mobileMenu = document.getElementById('mobile-menu');
                        if (!mobileMenu) {
                            mobileMenu = document.createElement('div');
                            mobileMenu.id = 'mobile-menu';
                            mobileMenu.className = 'mobile-menu sm:hidden';
                            mobileMenu.innerHTML = `
                            <div class="px-2 pt-2 pb-3 space-y-1 bg-dark-bg shadow-lg">
                                <a href="/index.html" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-900 hover:text-white transition-colors">Home</a>
                                <a href="/pages/coming-soon.html" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-900 hover:text-white transition-colors">Courses</a>
                                <a href="/pages/activities" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-900 hover:text-white transition-colors">Activities</a>
                                <a href="/pages/partnerships/index.html" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-900 hover:text-white transition-colors">Partnerships</a>
                                <a href="/pages/coming-soon.html" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-900 hover:text-white transition-colors">Resources</a>
                                <a href="/pages/about-us" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-900 hover:text-white transition-colors">About Us</a>
                                <div class="pt-4 pb-3 border-t border-gray-700">
                                    <a href="/pages/login.html" class="block w-full text-center text-cyan-400 py-2 text-base font-medium mb-2">Log In</a>
                                    <a href="/pages/register.html" class="block w-full text-center neon-button py-2 text-base font-medium">Sign Up</a>
                                </div>
                            </div>`;
                            
                            // Insert after header
                            const headerElement = document.querySelector('header');
                            if (headerElement && headerElement.parentNode) {
                                headerElement.parentNode.insertBefore(mobileMenu, headerElement.nextSibling);
                            } else {
                                document.body.appendChild(mobileMenu);
                            }
                        }
                        
                        // Toggle visibility
                        mobileMenu.classList.toggle('hidden');
                    });
                }
                
                // Mark as loaded with fallback
                componentEvents[`${componentName}-loaded`] = true;
                componentEvents[`${componentName}-loading`] = false;
                console.log(`Loaded ${componentName} with fallback content`);
                
                if (typeof callback === 'function') {
                    callback();
                }
            }
        } catch (fallbackError) {
            console.error(`Even fallback loading failed for ${componentName}:`, fallbackError);
            
            if (typeof callback === 'function') {
                callback(fallbackError);
            }
        }
    }
}

/**
 * Check if a component is loaded
 * @param {string} componentName - The name of the component
 * @returns {boolean} Whether the component is loaded
 */
function isComponentLoaded(componentName) {
    return componentEvents[`${componentName}-loaded`] || false;
}

/**
 * Wait for a component to load and then run a callback
 * @param {string} componentName - The name of the component
 * @param {Function} callback - The callback to run when the component is loaded
 */
function onComponentLoaded(componentName, callback) {
    if (isComponentLoaded(componentName)) {
        callback();
    } else {
        document.addEventListener(`${componentName}-loaded`, callback, { once: true });
    }
}

// Auto-load components if they exist on the page
document.addEventListener('DOMContentLoaded', function() {
    // Automatically load header and footer if containers exist
    if (document.getElementById('header-container')) {
        loadComponent('header', 'header-container');
    }
    
    if (document.getElementById('footer-container')) {
        loadComponent('footer', 'footer-container');
    }
    
    // If components aren't loaded after 2 seconds, try to load them again
    setTimeout(function() {
        if (!isComponentLoaded('header') && document.getElementById('header-container')) {
            console.log('Header not loaded after timeout, retrying...');
            loadComponent('header', 'header-container');
        }
        
        if (!isComponentLoaded('footer') && document.getElementById('footer-container')) {
            console.log('Footer not loaded after timeout, retrying...');
            loadComponent('footer', 'footer-container');
        }
    }, 2000);
}); 