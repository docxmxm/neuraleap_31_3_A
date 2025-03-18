/**
 * Notification System
 * Handles fetching, creating, managing and updating notifications using Supabase
 */

// Check if NotificationSystem already exists to avoid duplicate declarations
if (typeof window.NotificationSystem === 'undefined') {
    class NotificationSystem {
        constructor() {
            this.supabase = null;
            this.userId = null;
            this.isInitialized = false;
            this.notificationListeners = [];
        }

        /**
         * Initialize the notification system with Supabase client
         */
        async initialize() {
            if (this.isInitialized) return true;

            try {
                // Check if Supabase client is available
                if (!window.supabaseClient) {
                    console.error("Supabase client is not available");
                    return false;
                }

                this.supabase = window.supabaseClient;
                
                // Get current user
                const { data: { user }, error } = await this.supabase.auth.getUser();
                
                if (error) {
                    console.error("Error getting user:", error.message);
                    return false;
                }
                
                if (!user) {
                    console.log("No authenticated user found");
                    return false;
                }
                
                this.userId = user.id;
                this.isInitialized = true;
                
                // Set up real-time subscription for new notifications
                this.setupRealtimeNotifications();
                
                return true;
            } catch (err) {
                console.error("Error initializing notification system:", err);
                return false;
            }
        }

        /**
         * Setup real-time notifications using Supabase subscriptions
         */
        setupRealtimeNotifications() {
            if (!this.isInitialized) return;
            
            try {
                // Subscribe to new notifications for this user
                const channel = this.supabase
                    .channel('notifications-channel')
                    .on('postgres_changes', { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'notifications',
                        filter: `user_id=eq.${this.userId}`
                    }, (payload) => {
                        console.log('New notification received:', payload);
                        // Notify all listeners
                        this.notifyListeners('new', payload.new);
                    })
                    .on('postgres_changes', { 
                        event: 'UPDATE', 
                        schema: 'public', 
                        table: 'notifications',
                        filter: `user_id=eq.${this.userId}`
                    }, (payload) => {
                        console.log('Notification updated:', payload);
                        // Notify all listeners
                        this.notifyListeners('update', payload.new);
                    })
                    .subscribe();
                    
                console.log('Real-time notification subscription set up');
            } catch (err) {
                console.error('Error setting up real-time notifications:', err);
            }
        }

        /**
         * Notify all registered listeners about notification changes
         */
        notifyListeners(event, data) {
            this.notificationListeners.forEach(listener => {
                try {
                    listener(event, data);
                } catch (err) {
                    console.error('Error in notification listener:', err);
                }
            });
        }

        /**
         * Add a listener for notification events
         */
        addListener(callback) {
            if (typeof callback === 'function') {
                this.notificationListeners.push(callback);
                return true;
            }
            return false;
        }

        /**
         * Remove a listener
         */
        removeListener(callback) {
            const index = this.notificationListeners.indexOf(callback);
            if (index !== -1) {
                this.notificationListeners.splice(index, 1);
                return true;
            }
            return false;
        }

        /**
         * Get all notifications for the current user
         */
        async getNotifications(filter = {}) {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) return { data: [], error: "Failed to initialize notification system" };
            }

            try {
                let query = this.supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', this.userId)
                    .order('created_at', { ascending: false });
                
                // Apply filters if provided
                if (filter.unreadOnly) {
                    query = query.eq('read', false);
                }
                
                if (filter.type) {
                    query = query.eq('type', filter.type);
                }
                
                if (filter.limit) {
                    query = query.limit(filter.limit);
                }
                
                const { data, error } = await query;
                
                if (error) {
                    console.error("Error fetching notifications:", error);
                    return { data: [], error: error.message };
                }
                
                return { data: data || [], error: null };
            } catch (err) {
                console.error("Error in getNotifications:", err);
                return { data: [], error: err.message };
            }
        }

        /**
         * Get count of unread notifications
         */
        async getUnreadCount() {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) return { count: 0, error: "Failed to initialize notification system" };
            }

            try {
                const { count, error } = await this.supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', this.userId)
                    .eq('read', false);
                
                if (error) {
                    console.error("Error counting unread notifications:", error);
                    return { count: 0, error: error.message };
                }
                
                return { count: count || 0, error: null };
            } catch (err) {
                console.error("Error in getUnreadCount:", err);
                return { count: 0, error: err.message };
            }
        }

        /**
         * Mark a notification as read
         */
        async markAsRead(notificationId) {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) return { success: false, error: "Failed to initialize notification system" };
            }

            try {
                const { data, error } = await this.supabase
                    .from('notifications')
                    .update({ read: true, read_at: new Date().toISOString() })
                    .eq('id', notificationId)
                    .eq('user_id', this.userId);
                
                if (error) {
                    console.error("Error marking notification as read:", error);
                    return { success: false, error: error.message };
                }
                
                return { success: true, data, error: null };
            } catch (err) {
                console.error("Error in markAsRead:", err);
                return { success: false, error: err.message };
            }
        }

        /**
         * Mark all notifications as read
         */
        async markAllAsRead() {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) return { success: false, error: "Failed to initialize notification system" };
            }

            try {
                const { data, error } = await this.supabase
                    .from('notifications')
                    .update({ read: true, read_at: new Date().toISOString() })
                    .eq('user_id', this.userId)
                    .eq('read', false);
                
                if (error) {
                    console.error("Error marking all notifications as read:", error);
                    return { success: false, error: error.message };
                }
                
                return { success: true, data, error: null };
            } catch (err) {
                console.error("Error in markAllAsRead:", err);
                return { success: false, error: err.message };
            }
        }

        /**
         * Create a new notification for testing purposes
         * In a real system, notifications would be created on the server
         */
        async createTestNotification(type, title, content, link = null) {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) return { success: false, error: "Failed to initialize notification system" };
            }

            try {
                const notification = {
                    user_id: this.userId,
                    type: type, // 'system', 'course', 'survey', etc.
                    title: title,
                    content: content,
                    link: link,
                    read: false,
                    created_at: new Date().toISOString()
                };
                
                const { data, error } = await this.supabase
                    .from('notifications')
                    .insert([notification]);
                
                if (error) {
                    console.error("Error creating test notification:", error);
                    return { success: false, error: error.message };
                }
                
                return { success: true, data, error: null };
            } catch (err) {
                console.error("Error in createTestNotification:", err);
                return { success: false, error: err.message };
            }
        }

        /**
         * Create a survey notification for all users (admin function)
         * In a real system this would be done through a secure admin API
         */
        async createSurveyNotification(surveyId, surveyTitle) {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) return { success: false, error: "Failed to initialize notification system" };
            }

            try {
                // This is just a simulation - in a real system you would use a server function
                // to create notifications for all users
                const notification = {
                    user_id: this.userId, // This would normally target multiple users
                    type: 'survey',
                    title: 'New Survey Available',
                    content: `Please complete the survey: ${surveyTitle}`,
                    link: `/pages/dashboard/surveys.html?id=${surveyId}`,
                    read: false,
                    created_at: new Date().toISOString(),
                    metadata: { survey_id: surveyId }
                };
                
                const { data, error } = await this.supabase
                    .from('notifications')
                    .insert([notification]);
                
                if (error) {
                    console.error("Error creating survey notification:", error);
                    return { success: false, error: error.message };
                }
                
                return { success: true, data, error: null };
            } catch (err) {
                console.error("Error in createSurveyNotification:", err);
                return { success: false, error: err.message };
            }
        }

        /**
         * Update notification when a survey is completed
         */
        async updateSurveyNotification(surveyId) {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) return { success: false, error: "Failed to initialize notification system" };
            }

            try {
                // Find the notification for this survey
                const { data: notifications, error: findError } = await this.supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', this.userId)
                    .eq('type', 'survey')
                    .filter('metadata->survey_id', 'eq', surveyId);
                
                if (findError) {
                    console.error("Error finding survey notification:", findError);
                    return { success: false, error: findError.message };
                }
                
                if (!notifications || notifications.length === 0) {
                    console.log("No notification found for this survey");
                    return { success: false, error: "No notification found" };
                }
                
                // Update the notification
                const notification = notifications[0];
                const { data, error } = await this.supabase
                    .from('notifications')
                    .update({ 
                        title: 'Survey Completed', 
                        content: 'Thank you for completing the survey!',
                        read: true,
                        read_at: new Date().toISOString(),
                        metadata: { ...notification.metadata, completed: true }
                    })
                    .eq('id', notification.id);
                
                if (error) {
                    console.error("Error updating survey notification:", error);
                    return { success: false, error: error.message };
                }
                
                return { success: true, data, error: null };
            } catch (err) {
                console.error("Error in updateSurveyNotification:", err);
                return { success: false, error: err.message };
            }
        }
    }

    // Store the class definition globally
    window.NotificationSystem = NotificationSystem;
    
    // Create a singleton instance if it doesn't exist
    if (!window.notificationSystem) {
        window.notificationSystem = new NotificationSystem();
    }
} 