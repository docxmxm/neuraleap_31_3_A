/**
 * NeuraLeap Mobile Touch Event Debugger
 * Helps identify and fix mobile touch/click event issues
 */

(function() {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Initialize debug logging
    const debugLog = [];
    
    // Function to log debug messages
    function logDebug(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        debugLog.push(logMessage);
        console.log(logMessage);
    }
    
    // Function to monitor touch/click events on buttons
    function monitorButtonEvents() {
        const buttons = document.querySelectorAll('button, .button, [role="button"], a');
        buttons.forEach(button => {
            ['touchstart', 'touchend', 'click'].forEach(eventType => {
                button.addEventListener(eventType, (event) => {
                    const rect = button.getBoundingClientRect();
                    const zIndex = getComputedStyle(button).zIndex;
                    const position = getComputedStyle(button).position;
                    
                    logDebug(`Button Event - Type: ${eventType}, Text: "${button.textContent.trim()}", ` +
                            `Size: ${rect.width}x${rect.height}, Position: ${position}, Z-Index: ${zIndex}`);
                    
                    // Check for potential issues
                    if (rect.width < 44 || rect.height < 44) {
                        logDebug(`Warning: Button size may be too small for mobile (${rect.width}x${rect.height})`);
                    }
                    if (zIndex === 'auto' || parseInt(zIndex) < 1) {
                        logDebug(`Warning: Button has low z-index (${zIndex})`);
                    }
                    if (position === 'static') {
                        logDebug(`Warning: Button has static positioning`);
                    }
                });
            });
        });
    }
    
    // Function to fix button issues
    function fixButtonIssues(button) {
        const rect = button.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
            button.style.minWidth = '44px';
            button.style.minHeight = '44px';
        }
        
        const zIndex = getComputedStyle(button).zIndex;
        if (zIndex === 'auto' || parseInt(zIndex) < 1) {
            button.style.zIndex = '1';
        }
        
        const position = getComputedStyle(button).position;
        if (position === 'static') {
            button.style.position = 'relative';
        }
        
        // Add transparent overlay for better touch detection
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.background = 'transparent';
        button.appendChild(overlay);
    }
    
    // Initialize monitoring when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        logDebug('Mobile debug initialized');
        monitorButtonEvents();
    });
    
    // Export debugging functions to window object
    window.mobileDebug = {
        getLog: () => debugLog,
        fixButton: fixButtonIssues
    };
})(); 