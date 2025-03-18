/**
 * Shared Navigation System for NeuraLeap
 * This script provides a consistent navigation bar for all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set up consistent navigation structure
    initializeNavigation();
    
    // Set up dropdown behavior
    setupDropdownMenus();
    
    // Set up mobile navigation
    setupMobileNavigation();
});

/**
 * Initialize the main navigation structure
 */
function initializeNavigation() {
    // Get the user's authentication status
    const isAuthenticated = checkAuthStatus();
    
    // Determine if we're on a dashboard page
    const isDashboard = window.location.pathname.includes('/pages/dashboard/');
    
    // Set active link based on current page
    setActiveNavLink();
}

/**
 * Check if the user is authenticated
 */
function checkAuthStatus() {
    // Try to get authentication status from localStorage
    const hasAuthToken = localStorage.getItem('sb-txggovndoxdybdquopvx-auth-token') !== null;
    return hasAuthToken;
}

/**
 * Set the active navigation link based on the current page
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-item, .dropdown-toggle');
    
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active-nav-item');
    });
    
    // Add active class to current section link
    navLinks.forEach(link => {
        // Get the href attribute or parent section identifier
        const linkPath = link.getAttribute('href') || '';
        const linkSection = linkPath.split('/')[2]; // e.g. "courses" from "/pages/courses/index.html"
        
        if (currentPath.includes(linkSection)) {
            link.classList.add('active-nav-item');
            
            // If this is a dropdown item, also highlight the parent dropdown
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const dropdownToggle = parentDropdown.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    dropdownToggle.classList.add('active-nav-item');
                }
            }
        }
    });
}

/**
 * Set up dropdown menu behavior
 */
function setupDropdownMenus() {
    // Toggle dropdown menus
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            const menu = parent.querySelector('.dropdown-menu');
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('active');
                    m.classList.add('hidden');
                }
            });
            
            // Toggle this dropdown
            menu.classList.toggle('hidden');
            menu.classList.toggle('active');
        });
    });
    
    // Handle clicks outside dropdowns to close them
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
                menu.classList.add('hidden');
            });
        }
    });
    
    // Initialize all dropdowns as hidden initially
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
        menu.classList.remove('active');
    });
}

/**
 * Set up mobile navigation
 */
function setupMobileNavigation() {
    // Toggle mobile main menu
    const mainMobileMenuButton = document.querySelector('#main-mobile-menu-button');
    const mobileMainMenu = document.querySelector('#mobile-main-menu');
    
    if (mainMobileMenuButton && mobileMainMenu) {
        mainMobileMenuButton.addEventListener('click', function() {
            mobileMainMenu.classList.toggle('hidden');
            mobileMainMenu.classList.toggle('active');
        });
    }
    
    // Toggle mobile dropdown menus
    const mobileDropdownButtons = document.querySelectorAll('.mobile-dropdown button');
    mobileDropdownButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menu = this.nextElementSibling;
            
            // Close other mobile dropdowns first
            document.querySelectorAll('.mobile-dropdown-menu').forEach(m => {
                if (m !== menu && !m.classList.contains('hidden')) {
                    m.classList.add('hidden');
                }
            });
            
            // Toggle this dropdown
            menu.classList.toggle('hidden');
        });
    });
}

// Make these functions available globally
window.navigationUtils = {
    initializeNavigation,
    checkAuthStatus,
    setActiveNavLink,
    setupDropdownMenus,
    setupMobileNavigation
}; 