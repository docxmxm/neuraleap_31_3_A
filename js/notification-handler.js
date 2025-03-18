/**
 * Notification Handler
 * This script provides UI integration for the notification system 
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Try to ensure Supabase client is available
    const supabaseAvailable = await ensureSupabaseClient();
    
    if (!supabaseAvailable) {
        console.error("Could not initialize Supabase client");
        showNotificationError("Could not connect to notification service. Please check your internet connection and try again.");
        return;
    }
    
    // Check if notification system exists
    if (!window.notificationSystem) {
        console.error("Notification system not available. Make sure notification-system.js is loaded first.");
        showNotificationError("Notification system not available. Please refresh the page and make sure all scripts are loaded properly.");
        
        // Try to create a minimal notification system
        createMinimalNotificationSystem();
        return;
    }

    try {
        // Try to initialize with a retry mechanism
        const initialized = await initializeWithRetry();
        
        if (!initialized) {
            console.error("Could not initialize notification system after multiple attempts");
            showNotificationError("Failed to initialize notification system. Please check your connection and try again later.");
            return;
        }
        
        // Add notification counter to header
        updateNotificationCounters();
        
        // Set up listeners for real-time updates
        window.notificationSystem.addListener(function(event, data) {
            console.log(`Notification event: ${event}`, data);
            updateNotificationCounters();
            
            // If we're on the notifications page, update the list
            if (window.location.pathname.includes('/pages/dashboard/notifications.html')) {
                loadNotificationsIntoUI();
            }
        });
        
        // If we're on the notifications page, load notifications
        if (window.location.pathname.includes('/pages/dashboard/notifications.html')) {
            await loadNotificationsIntoUI();
            setupNotificationEventHandlers();
        }
        
        // If we're on the surveys page, set up survey completion handler
        if (window.location.pathname.includes('/pages/dashboard/surveys.html')) {
            setupSurveyCompletionHandler();
        }
    } catch (err) {
        console.error("Error initializing notification handler:", err);
        showNotificationError("An error occurred while setting up notifications. Please try again later.");
    }
});

/**
 * Try to initialize the notification system with retries
 */
async function initializeWithRetry(maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`Attempt ${retryCount + 1} to initialize notification system`);
            const initialized = await window.notificationSystem.initialize();
            
            if (initialized) {
                console.log("Notification system initialized successfully");
                return true;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
        } catch (err) {
            console.error(`Error during initialization attempt ${retryCount + 1}:`, err);
            retryCount++;
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return false;
}

/**
 * Create a minimal notification system as a fallback
 */
function createMinimalNotificationSystem() {
    window.notificationSystem = {
        isInitialized: false,
        initialize: async function() {
            this.isInitialized = true;
            return true;
        },
        getUnreadCount: async function() {
            return { count: 0, error: null };
        },
        getNotifications: async function() {
            return { data: [], error: null };
        },
        markAsRead: async function() {
            return { success: true, error: null };
        },
        markAllAsRead: async function() {
            return { success: true, error: null };
        },
        addListener: function() {},
        createTestNotification: async function() {
            alert("This is a test notification (minimal mode)");
            return { success: true, error: null };
        }
    };
    
    console.log("Created minimal notification system as fallback");
}

/**
 * Ensure Supabase client is available, with retry logic
 */
async function ensureSupabaseClient() {
    // First try to use the improved getSupabaseClient function if available
    if (window.getSupabaseClient && typeof window.getSupabaseClient === 'function') {
        const client = window.getSupabaseClient();
        if (client) {
            console.log("Using existing Supabase client from getSupabaseClient");
            window.supabaseClient = client;
            return true;
        }
    }
    
    // If Supabase client is already available, return
    if (window.supabaseClient) {
        return true;
    }
    
    // Check for required libraries
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        console.error("Supabase JS library not loaded");
        
        // Try to load it dynamically
        try {
            await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
            console.log("Loaded Supabase JS library dynamically");
        } catch (err) {
            console.error("Failed to load Supabase JS library:", err);
            return false;
        }
    }
    
    // Try to initialize from globals if available
    let url = '';
    let key = '';
    
    // First check SupabaseConfig
    if (window.SupabaseConfig) {
        url = window.SupabaseConfig.supabaseUrl;
        key = window.SupabaseConfig.supabaseKey;
    } 
    // Then check hardcoded values in supabase-client.js
    else if (window.defaultConfig) {
        url = window.defaultConfig.supabaseUrl;
        key = window.defaultConfig.supabaseKey;
    } 
    // Fallback to constants if available
    else {
        // Try to find any global variables with Supabase URL/key
        for (const varName in window) {
            const value = window[varName];
            if (typeof value === 'string') {
                if (value.includes('supabase.co')) {
                    url = value;
                } else if (value.startsWith('eyJ') && value.length > 100) {
                    key = value;
                }
            }
        }
        
        // Last resort - hardcoded values
        if (!url || !key) {
            url = 'https://txggovndoxdybdquopvx.supabase.co';
            key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2dvdm5kb3hkeWJkcXVvcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Nzg3MTMsImV4cCI6MjA1NzE1NDcxM30.p0l-YAdIjq-ICQNRGt5bN6YkrSB4NVDMaBUFYH4fpL4';
        }
    }
    
    if (url && key) {
        try {
            if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
                window.supabaseClient = window.supabase.createClient(url, key);
            } else if (typeof window.supabaseJs !== 'undefined' && typeof window.supabaseJs.createClient === 'function') {
                window.supabaseClient = window.supabaseJs.createClient(url, key);
            } else if (typeof window.createClient === 'function') {
                window.supabaseClient = window.createClient(url, key);
            } else {
                console.error("Supabase createClient function not available");
                return false;
            }
            
            console.log("Supabase client initialized manually in notification-handler.js");
            return true;
        } catch (err) {
            console.error("Error initializing Supabase client:", err);
            return false;
        }
    }
    
    console.warn("Could not find Supabase credentials");
    return false;
}

/**
 * Helper function to dynamically load a script
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Show a notification error message in the UI
 */
function showNotificationError(message) {
    // If we're on the notifications page, show the error in the list
    const notificationsList = document.getElementById('notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = `
            <div class="p-6 text-center">
                <div class="text-red-400 mb-4">
                    <svg class="h-12 w-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-lg font-semibold">${message}</p>
                </div>
                <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                    Refresh Page
                </button>
            </div>
        `;
    }
}

/**
 * Update notification counters in the header
 */
async function updateNotificationCounters() {
    try {
        if (!window.notificationSystem.isInitialized) {
            // Don't try to update counters if the system isn't initialized
            return;
        }
        
        const { count, error } = await window.notificationSystem.getUnreadCount();
        
        if (error) {
            console.error("Error getting unread count:", error);
            return;
        }
        
        // Update all notification dots and counters
        const notificationDots = document.querySelectorAll('.notification-dot');
        const notificationCounts = document.querySelectorAll('.notification-count');
        
        notificationDots.forEach(dot => {
            if (count > 0) {
                dot.style.display = 'block';
            } else {
                dot.style.display = 'none';
            }
        });
        
        notificationCounts.forEach(counter => {
            if (count > 0) {
                counter.textContent = count;
                counter.style.display = 'flex';
            } else {
                counter.style.display = 'none';
            }
        });
        
        // Update dashboard recent notifications if present
        updateDashboardNotifications();
    } catch (err) {
        console.error("Error updating notification counters:", err);
    }
}

/**
 * Update the dashboard recent notifications section
 */
async function updateDashboardNotifications() {
    const recentNotificationsContainer = document.getElementById('recent-notifications');
    if (!recentNotificationsContainer) return;
    
    try {
        // Get most recent 3 notifications
        const { data, error } = await window.notificationSystem.getNotifications({ limit: 3 });
        
        if (error) {
            console.error("Error fetching recent notifications:", error);
            return;
        }
        
        // Clear current notifications
        recentNotificationsContainer.innerHTML = '';
        
        // If no notifications, show empty state
        if (!data || data.length === 0) {
            const emptyNotification = document.createElement('div');
            emptyNotification.className = 'flex items-start p-3 rounded-lg hover:bg-gray-800 notification-item';
            emptyNotification.innerHTML = `
                <div class="flex-shrink-0 mr-3">
                    <div class="h-9 w-9 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-white font-medium">No New Notifications</p>
                    <p class="text-gray-400 text-sm truncate">You don't have any notifications at this time.</p>
                </div>
            `;
            recentNotificationsContainer.appendChild(emptyNotification);
            return;
        }
        
        // Add recent notifications
        data.forEach(notification => {
            const notificationElement = createDashboardNotificationElement(notification);
            recentNotificationsContainer.appendChild(notificationElement);
        });
    } catch (err) {
        console.error("Error updating dashboard notifications:", err);
    }
}

/**
 * Create a simplified notification element for the dashboard
 */
function createDashboardNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = 'flex items-start p-3 rounded-lg hover:bg-gray-800 notification-item';
    
    if (!notification.read) {
        element.classList.add('unread');
        element.innerHTML = `<div class="notification-indicator bg-cyan-400"></div>`;
    }
    
    let iconClass = 'bg-blue-900 bg-opacity-30';
    let iconColor = 'text-blue-400';
    let icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
    
    if (notification.type === 'system') {
        iconClass = 'bg-gray-800';
        iconColor = 'text-gray-400';
    } else if (notification.type === 'course') {
        iconClass = 'bg-blue-900 bg-opacity-30';
        iconColor = 'text-blue-400';
    } else if (notification.type === 'achievement') {
        iconClass = 'bg-green-900 bg-opacity-30';
        iconColor = 'text-green-400';
        icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
    } else if (notification.type === 'reminder') {
        iconClass = 'bg-yellow-900 bg-opacity-30';
        iconColor = 'text-yellow-400';
        icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
    }
    
    const innerHtml = `
        <div class="flex-shrink-0 mr-3">
            <div class="h-9 w-9 rounded-full ${iconClass} flex items-center justify-center">
                <svg class="h-5 w-5 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    ${icon}
                </svg>
            </div>
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-white font-medium">${escapeHtml(notification.title)}</p>
            <p class="text-gray-400 text-sm truncate">${escapeHtml(notification.content)}</p>
            <p class="text-gray-500 text-xs mt-1">${getRelativeTimeString(new Date(notification.created_at))}</p>
        </div>
    `;
    
    element.innerHTML += innerHtml;
    return element;
}

/**
 * Load notifications into the UI on the notifications page
 */
async function loadNotificationsIntoUI() {
    try {
        const notificationsContainer = document.getElementById('notifications-list');
        
        if (!notificationsContainer) {
            console.error("Notifications container not found in the page");
            return;
        }
        
        // Clear current notifications
        notificationsContainer.innerHTML = '';
        
        // Get notifications
        const { data, error } = await window.notificationSystem.getNotifications();
        
        if (error) {
            console.error("Error fetching notifications:", error);
            return;
        }
        
        // Check if there are no notifications
        if (!data || data.length === 0) {
            // Create a "no notifications" element
            const emptyNotification = document.createElement('li');
            emptyNotification.className = 'notification-item';
            emptyNotification.innerHTML = `
                <div class="px-6 py-8 flex items-center relative">
                    <div class="flex-shrink-0 ml-2">
                        <span class="h-10 w-10 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </span>
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="flex justify-between">
                            <p class="text-sm font-medium text-white">No New Notifications</p>
                            <p class="text-sm text-gray-500">Just now</p>
                        </div>
                        <p class="text-sm text-gray-400">You don't have any notifications at this time. Check back later for updates.</p>
                    </div>
                </div>
            `;
            notificationsContainer.appendChild(emptyNotification);
            
            // Update the load more button
            const loadMoreButton = document.querySelector('.notifications-load-more') || 
                                 document.querySelector('.card-bg .px-6.py-3 button');
            if (loadMoreButton) {
                loadMoreButton.textContent = 'No more notifications';
                loadMoreButton.classList.remove('text-cyan-400', 'hover:text-cyan-300');
                loadMoreButton.classList.add('text-gray-400', 'cursor-not-allowed');
            }
            
            return;
        }
        
        // Add notifications to the container
        data.forEach(notification => {
            const notificationElement = createNotificationElement(notification);
            notificationsContainer.appendChild(notificationElement);
        });
    } catch (error) {
        console.error("Error loading notifications into UI:", error);
    }
}

/**
 * Create a notification element
 */
function createNotificationElement(notification) {
    const listItem = document.createElement('li');
    listItem.className = `notification-item${notification.read ? '' : ' unread'}`;
    listItem.dataset.id = notification.id;
    
    // Determine the icon and color based on notification type
    let iconSvg, bgColorClass, textColorClass;
    
    switch(notification.type) {
        case 'survey':
            iconSvg = '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>';
            bgColorClass = 'bg-purple-500';
            textColorClass = 'text-purple-400';
            break;
        case 'course':
            iconSvg = '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
            bgColorClass = 'bg-blue-500';
            textColorClass = 'text-blue-400';
            break;
        case 'achievement':
            iconSvg = '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
            bgColorClass = 'bg-green-500';
            textColorClass = 'text-green-400';
            break;
        default:
            iconSvg = '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
            bgColorClass = 'bg-cyan-500';
            textColorClass = 'text-cyan-400';
    }
    
    // Create a relative time string
    const relativeTime = getRelativeTimeString(new Date(notification.created_at));
    
    // Construct the inner HTML
    listItem.innerHTML = `
        <div class="px-6 py-4 flex items-center relative">
            ${notification.read ? '' : '<div class="absolute left-0 top-0 h-full w-1 bg-cyan-400 notification-indicator"></div>'}
            <div class="flex-shrink-0 ml-2">
                <span class="h-10 w-10 rounded-full ${bgColorClass} bg-opacity-20 flex items-center justify-center">
                    ${iconSvg.replace('class="h-5 w-5"', `class="h-5 w-5 ${textColorClass}"`)}
                </span>
            </div>
            <div class="ml-4 flex-1">
                <div class="flex justify-between">
                    <p class="text-sm font-medium text-white">${escapeHtml(notification.title)}</p>
                    <p class="text-sm text-gray-500">${relativeTime}</p>
                </div>
                <p class="text-sm text-gray-400">${escapeHtml(notification.content)}</p>
                <div class="mt-2 flex space-x-3">
                    ${notification.link ? `
                        <a href="${notification.link}" class="text-sm text-cyan-400 hover:text-cyan-300 flex items-center">
                            ${notification.type === 'survey' ? 'Take Survey' : 'View Details'}
                            <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </a>
                    ` : ''}
                    ${!notification.read ? `
                        <button class="mark-read-btn text-sm text-gray-400 hover:text-gray-300 flex items-center" data-id="${notification.id}">
                            Mark as Read
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    return listItem;
}

/**
 * Set up event handlers for the notifications page
 */
function setupNotificationEventHandlers() {
    // Mark all as read button
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async function() {
            try {
                const { success, error } = await window.notificationSystem.markAllAsRead();
                
                if (error) {
                    console.error("Error marking all as read:", error);
                    return;
                }
                
                if (success) {
                    // Update UI
                    const unreadItems = document.querySelectorAll('.notification-item.unread');
                    unreadItems.forEach(item => {
                        item.classList.remove('unread');
                        const indicator = item.querySelector('.notification-indicator');
                        if (indicator) {
                            indicator.style.display = 'none';
                        }
                    });
                    
                    // Update notification counters
                    updateNotificationCounters();
                }
            } catch (err) {
                console.error("Error in mark all as read handler:", err);
            }
        });
    }
    
    // Set up delegation for mark as read buttons
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.mark-read-btn')) {
            const btn = e.target.closest('.mark-read-btn');
            const notificationId = btn.dataset.id;
            const notificationItem = btn.closest('.notification-item');
            
            if (notificationId && notificationItem) {
                try {
                    const { success, error } = await window.notificationSystem.markAsRead(notificationId);
                    
                    if (error) {
                        console.error("Error marking notification as read:", error);
                        return;
                    }
                    
                    if (success) {
                        // Update UI
                        notificationItem.classList.remove('unread');
                        const indicator = notificationItem.querySelector('.notification-indicator');
                        if (indicator) {
                            indicator.style.display = 'none';
                        }
                        
                        // Remove the mark as read button
                        btn.remove();
                        
                        // Update notification counters
                        updateNotificationCounters();
                    }
                } catch (err) {
                    console.error("Error in mark as read handler:", err);
                }
            }
        }
    });
    
    // Set up filter buttons
    const filterButtons = document.querySelectorAll('.notification-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => {
                b.classList.remove('bg-cyan-500', 'bg-opacity-20', 'text-cyan-400');
                b.classList.add('text-gray-400', 'hover:bg-gray-700');
            });
            
            // Add active class to clicked button
            btn.classList.remove('text-gray-400', 'hover:bg-gray-700');
            btn.classList.add('bg-cyan-500', 'bg-opacity-20', 'text-cyan-400');
            
            // Get filter type
            const filterType = btn.dataset.filter;
            
            // Apply filter
            try {
                const filter = {};
                
                if (filterType === 'unread') {
                    filter.unreadOnly = true;
                } else if (filterType !== 'all') {
                    filter.type = filterType;
                }
                
                // Show loading state
                const notificationsList = document.getElementById('notifications-list');
                if (notificationsList) {
                    notificationsList.innerHTML = '<div class="p-6 text-center text-gray-500">Loading notifications...</div>';
                }
                
                // Get filtered notifications
                const { data: notifications, error } = await window.notificationSystem.getNotifications(filter);
                
                if (error) {
                    console.error("Error loading filtered notifications:", error);
                    if (notificationsList) {
                        notificationsList.innerHTML = `<div class="p-6 text-center text-red-500">Error loading notifications: ${error}</div>`;
                    }
                    return;
                }
                
                if (notifications.length === 0) {
                    if (notificationsList) {
                        notificationsList.innerHTML = '<div class="p-6 text-center text-gray-500">No notifications to display</div>';
                    }
                    return;
                }
                
                // Clear the list
                if (notificationsList) {
                    notificationsList.innerHTML = '';
                    
                    // Add each notification to the list
                    notifications.forEach(notification => {
                        const notificationElement = createNotificationElement(notification);
                        notificationsList.appendChild(notificationElement);
                    });
                }
            } catch (err) {
                console.error("Error applying notification filter:", err);
            }
        });
    });
}

/**
 * Set up handlers for survey completion
 */
function setupSurveyCompletionHandler() {
    // Find survey forms or submission buttons
    const surveyForms = document.querySelectorAll('.survey-form');
    const surveySubmitBtns = document.querySelectorAll('.survey-submit-btn');
    
    // Handle survey form submissions
    surveyForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get survey ID from the form
            const surveyId = form.dataset.surveyId;
            if (!surveyId) {
                console.error("No survey ID found on form");
                return;
            }
            
            // Process the form submission
            // This would typically send the survey data to your backend
            
            // Then update the related notification
            try {
                const { success, error } = await window.notificationSystem.updateSurveyNotification(surveyId);
                
                if (error) {
                    console.error("Error updating survey notification:", error);
                    // Continue with the survey completion anyway
                }
                
                // Show completion message and redirect if needed
                alert("Thank you for completing the survey!");
                
                // Redirect to a thank you page or reload to show updated UI
                window.location.reload();
            } catch (err) {
                console.error("Error in survey completion handler:", err);
            }
        });
    });
    
    // Handle survey button clicks (for survey cards that don't have forms)
    surveySubmitBtns.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            // Get survey ID from the button
            const surveyId = btn.dataset.surveyId;
            if (!surveyId) {
                console.error("No survey ID found on button");
                return;
            }
            
            // Show a confirmation dialog if needed
            if (confirm("Are you sure you want to mark this survey as completed?")) {
                try {
                    const { success, error } = await window.notificationSystem.updateSurveyNotification(surveyId);
                    
                    if (error) {
                        console.error("Error updating survey notification:", error);
                        alert("There was an error updating your completion status.");
                        return;
                    }
                    
                    // Show completion message and redirect if needed
                    alert("Thank you for completing the survey!");
                    
                    // Redirect to a thank you page or reload to show updated UI
                    window.location.reload();
                } catch (err) {
                    console.error("Error in survey completion handler:", err);
                }
            }
        });
    });
}

/**
 * Helper function to create relative time strings
 */
function getRelativeTimeString(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
        const diffWeek = Math.round(diffDay / 7);
        return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    } else if (diffDay < 365) {
        const diffMonth = Math.round(diffDay / 30);
        return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    } else {
        const diffYear = Math.round(diffDay / 365);
        return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    }
}

/**
 * Helper function to escape HTML in notification content
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Create a test notification (for demo purposes)
 */
async function createTestNotification() {
    try {
        // Check if notification system is initialized
        if (!window.notificationSystem || !window.notificationSystem.isInitialized) {
            // Try to initialize it
            if (!window.notificationSystem) {
                alert("Notification system is not available. Please refresh the page and try again.");
                return;
            }
            
            const initialized = await window.notificationSystem.initialize();
            if (!initialized) {
                alert("Could not initialize notification system. Please check your connection and try again.");
                return;
            }
        }
        
        // Show loading state
        const btn = document.querySelector('button[onclick="createTestNotification()"]');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "Creating...";
            btn.disabled = true;
            
            // Reset button after 3 seconds regardless of outcome
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 3000);
        }
        
        // Random notification types
        const types = ['system', 'course', 'survey', 'achievement'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Generate title and content based on type
        let title, content, link;
        
        switch(type) {
            case 'survey':
                title = 'New Survey Available';
                content = 'Please complete our latest feedback survey to help us improve.';
                link = '/pages/dashboard/surveys.html';
                break;
            case 'course':
                title = 'Course Update Available';
                content = 'One of your enrolled courses has new content available.';
                link = '/pages/courses/index.html';
                break;
            case 'achievement':
                title = 'New Achievement Unlocked';
                content = 'Congratulations! You\'ve earned a new achievement.';
                link = '/pages/dashboard/profile.html';
                break;
            default:
                title = 'System Notification';
                content = 'This is a system notification for testing purposes.';
                link = null;
        }
        
        const { success, error } = await window.notificationSystem.createTestNotification(
            type, title, content, link
        );
        
        if (error) {
            console.error("Error creating test notification:", error);
            alert("Error creating test notification: " + error);
            return;
        }
        
        if (success) {
            console.log("Test notification created successfully");
            alert("Test notification created successfully!");
        }
    } catch (err) {
        console.error("Error in createTestNotification:", err);
        alert("Error creating test notification: " + err.message);
    }
}

// Expose test function for development
window.createTestNotification = createTestNotification; 