/**
 * NeuraLeap Mobile Touch Event Debugger
 * Helps identify and fix mobile touch/click event issues
 */

(function() {
    // Only run on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Hide debugger by default, only show when explicitly requested
    if (!window.location.search.includes('show-mobile-debug')) {
        console.log('Mobile debugger hidden by default');
        return;
    }
    
    if (!isMobile && !window.location.search.includes('force-mobile-debug')) {
        console.log('Mobile debugger not initialized: Not a mobile device');
        return;
    }
    
    console.log('Mobile touch event debugger initializing...');
    
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'mobile-debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.85);
        color: #06b6d4;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        padding: 10px;
        max-height: 40vh;
        overflow-y: auto;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        border-top: 2px solid #06b6d4;
    `;
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'mobile-debug-toggle';
    toggleButton.textContent = 'Mobile Debug';
    toggleButton.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #06b6d4;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 8px 12px;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.7);
    `;
    
    // Create content for panel
    const content = document.createElement('div');
    content.innerHTML = `
        <h3 style="margin: 0 0 8px 0; color: white;">Mobile Touch Event Debugger</h3>
        <div id="touch-debug-log"></div>
        <div id="button-analysis" style="margin-top: 10px;"></div>
        <div style="margin-top: 10px;">
            <button id="scan-buttons" style="background: #0891b2; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-right: 5px;">Scan Buttons</button>
            <button id="fix-all-buttons" style="background: #10B981; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-right: 5px;">Fix All Buttons</button>
            <button id="clear-debug-log" style="background: #EF4444; color: white; border: none; padding: 5px 10px; border-radius: 3px;">Clear Log</button>
        </div>
    `;
    
    // Append elements to DOM
    debugPanel.appendChild(content);
    document.body.appendChild(debugPanel);
    document.body.appendChild(toggleButton);
    
    // Toggle debug panel visibility
    let isPanelVisible = false;
    toggleButton.addEventListener('click', function() {
        isPanelVisible = !isPanelVisible;
        debugPanel.style.transform = isPanelVisible ? 'translateY(0)' : 'translateY(100%)';
    });
    
    // Create debug log function
    const logElement = document.getElementById('touch-debug-log');
    function debugLog(message, type = 'info') {
        if (!logElement) return;
        
        const entry = document.createElement('div');
        entry.style.marginBottom = '5px';
        entry.style.borderLeft = `3px solid ${type === 'error' ? '#EF4444' : type === 'warn' ? '#F59E0B' : '#10B981'}`;
        entry.style.paddingLeft = '5px';
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        logElement.appendChild(entry);
        
        // Auto-scroll to bottom
        logElement.scrollTop = logElement.scrollHeight;
    }
    
    // Clear debug log
    document.getElementById('clear-debug-log').addEventListener('click', function() {
        document.getElementById('touch-debug-log').innerHTML = '';
    });
    
    // Monitor touch/click events on buttons
    function monitorButtonEvents() {
        const allButtons = document.querySelectorAll('button, a.button, .neon-button, .primary-button, [role="button"], input[type="button"], input[type="submit"]');
        
        debugLog(`Found ${allButtons.length} clickable elements`);
        
        allButtons.forEach((button, index) => {
            if (button._debug_monitored) return;
            button._debug_monitored = true;
            
            // Track events
            ['touchstart', 'touchend', 'click'].forEach(eventType => {
                button.addEventListener(eventType, function(e) {
                    debugLog(`${eventType} on ${button.tagName}${button.className ? '.' + button.className.replace(/\s+/g, '.') : ''}`);
                });
            });
            
            // Check for potential issues
            const computedStyle = window.getComputedStyle(button);
            if (computedStyle.zIndex === 'auto' || parseInt(computedStyle.zIndex) < 1) {
                debugLog(`Warning: Button ${index + 1} has low/auto z-index: ${computedStyle.zIndex}`, 'warn');
            }
            
            if (computedStyle.position === 'static') {
                debugLog(`Warning: Button ${index + 1} has static positioning`, 'warn');
            }
            
            // Check min-height for touch targets
            if (parseInt(computedStyle.minHeight) < 44 || parseInt(computedStyle.height) < 44) {
                debugLog(`Warning: Button ${index + 1} may be too small for touch (height: ${computedStyle.height})`, 'warn');
            }
        });
    }
    
    // Analyze button issues
    document.getElementById('scan-buttons').addEventListener('click', function() {
        const buttonAnalysisDiv = document.getElementById('button-analysis');
        buttonAnalysisDiv.innerHTML = '<h4 style="margin: 0 0 8px 0; color: white;">Button Analysis</h4>';
        
        const allButtons = document.querySelectorAll('button, a.button, .neon-button, .primary-button, [role="button"], input[type="button"], input[type="submit"]');
        
        let problemButtonsCount = 0;
        
        allButtons.forEach((button, index) => {
            // Check if button might be obscured
            const rect = button.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                debugLog(`Error: Button ${index + 1} has zero size`, 'error');
                problemButtonsCount++;
                return;
            }
            
            const elementsAtPoint = document.elementsFromPoint(
                rect.left + rect.width / 2, 
                rect.top + rect.height / 2
            );
            
            if (elementsAtPoint[0] !== button) {
                debugLog(`Error: Button ${index + 1} is obscured by other elements`, 'error');
                
                const buttonInfo = document.createElement('div');
                buttonInfo.style.marginBottom = '10px';
                buttonInfo.style.padding = '5px';
                buttonInfo.style.border = '1px solid #EF4444';
                buttonInfo.style.borderRadius = '3px';
                
                const buttonText = button.textContent.trim() || button.value || '<empty>';
                buttonInfo.innerHTML = `
                    <div><strong>Problem Button ${++problemButtonsCount}:</strong> "${buttonText.substring(0, 20)}${buttonText.length > 20 ? '...' : ''}"</div>
                    <div>Type: ${button.tagName.toLowerCase()}</div>
                    <div>Classes: ${button.className}</div>
                    <div>Position: ${rect.left.toFixed(0)},${rect.top.toFixed(0)} Size: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}</div>
                    <div>Obscured by: ${elementsAtPoint[0].tagName}${elementsAtPoint[0].className ? '.' + elementsAtPoint[0].className.replace(/\s+/g, '.') : ''}</div>
                    <button class="fix-button" data-index="${index}" style="background: #10B981; color: white; border: none; padding: 3px 8px; border-radius: 3px; margin-top: 5px;">Fix This Button</button>
                `;
                
                buttonAnalysisDiv.appendChild(buttonInfo);
            }
        });
        
        if (problemButtonsCount === 0) {
            buttonAnalysisDiv.innerHTML += '<div>No button issues detected!</div>';
        }
        
        // Add event listeners to fix buttons
        document.querySelectorAll('.fix-button').forEach(fixButton => {
            fixButton.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const buttonToFix = document.querySelectorAll('button, a.button, .neon-button, .primary-button, [role="button"], input[type="button"], input[type="submit"]')[index];
                
                fixButton(buttonToFix);
                this.textContent = 'Fixed!';
                this.style.background = '#6B7280';
                this.disabled = true;
            });
        });
    });
    
    // Fix all buttons
    document.getElementById('fix-all-buttons').addEventListener('click', function() {
        const allButtons = document.querySelectorAll('button, a.button, .neon-button, .primary-button, [role="button"], input[type="button"], input[type="submit"]');
        
        let fixedCount = 0;
        allButtons.forEach(button => {
            if (fixButton(button)) {
                fixedCount++;
            }
        });
        
        debugLog(`Fixed ${fixedCount} buttons`);
    });
    
    // Function to fix a single button
    function fixButton(button) {
        if (button._fixed) return false;
        
        // Apply necessary fixes
        button.style.position = 'relative';
        button.style.zIndex = '100';
        button.style.minHeight = '44px';
        button.style.minWidth = '44px';
        button.style.touchAction = 'manipulation';
        button.style.cursor = 'pointer';
        button.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
        
        // Fix parent container issues
        let parent = button.parentElement;
        if (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.overflow === 'hidden' || parentStyle.overflow === 'scroll') {
                parent.style.overflow = 'visible';
                debugLog(`Fixed overflow on parent of button`);
            }
        }
        
        // Create a transparent overlay to improve touch detection
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '-10px';
        overlay.style.left = '-10px';
        overlay.style.right = '-10px';
        overlay.style.bottom = '-10px';
        overlay.style.zIndex = '5';
        overlay.style.cursor = 'pointer';
        overlay.setAttribute('aria-hidden', 'true');
        
        // Add click forwarder
        overlay.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Visually indicate the touch
            button.style.transform = 'scale(0.95)';
            
            // Trigger the button click
            setTimeout(() => {
                button.click();
                
                // Reset transform
                setTimeout(() => {
                    button.style.transform = 'none';
                }, 100);
            }, 10);
        }, {passive: false});
        
        // Insert overlay
        button.parentNode.insertBefore(overlay, button);
        button.parentNode.style.position = 'relative';
        button.style.zIndex = '10';
        
        button._fixed = true;
        return true;
    }
    
    // Initialize monitoring
    monitorButtonEvents();
    
    // Log initialization complete
    debugLog('Mobile touch event debugger initialized');
    
    // Export debug functions to window for console usage
    window.mobileDebug = {
        scanButtons: function() {
            document.getElementById('scan-buttons').click();
        },
        fixAllButtons: function() {
            document.getElementById('fix-all-buttons').click();
        },
        togglePanel: function() {
            toggleButton.click();
        },
        log: debugLog
    };
})();