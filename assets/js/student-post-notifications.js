// student post-dashboard notifications
document.addEventListener('DOMContentLoaded', function() {
    let notifications = [];
    
    // initialize notifications page
    initializeNotifications();
    
    async function initializeNotifications() {
        try {
            await loadNotifications();
            renderNotifications();
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing notifications:', error);
            showNotification('Failed to load notifications', 'error');
        }
    }
    
    // load notifications from API
    async function loadNotifications() {
        try {
            const response = await fetch('/api/notifications/', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load notifications');
            }
            
            notifications = await response.json();
        } catch (error) {
            console.error('Error loading notifications:', error);
            throw error;
        }
    }
    
    // render notifications in the UI
    function renderNotifications() {
        const container = document.querySelector('.post-card');
        if (!container) return;
        
        // clear existing content
        container.innerHTML = '<h3>All Notifications</h3>';
        
        if (notifications.length === 0) {
            container.innerHTML += `
                <div class="post-note">
                    <span class="post-badge info">
                        <i class="fa-solid fa-info-circle"></i> Info
                    </span>
                    <p>No notifications found.</p>
                </div>
            `;
            return;
        }
        
        // group notifications by type for better organization
        const groupedNotifications = groupNotificationsByType(notifications);
        
        Object.keys(groupgedNotifications).forEach(type => {
            const typeNotifications = groupedNotifications[type];
            
            typeNotifications.forEach(notification => {
                const notificationElement = createNotificationElement(notification);
                container.appendChild(notificationElement);
            });
        });
    }
    
    // group notifications by type
    function groupNotificationsByType(notifications) {
        const grouped = {};
        
        notifications.forEach(notification => {
            const type = notification.notification_type || 'general';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(notification);
        });
        
        return grouped;
    }
    
    // create notification element
    function createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = 'post-note';
        
        const badgeClass = getNotificationBadgeClass(notification.notification_type);
        const icon = getNotificationIcon(notification.notification_type);
        const timeAgo = getTimeAgo(notification.created_at);
        
        div.innerHTML = `
            <span class="post-badge ${badgeClass}">
                <i class="fa-solid ${icon}"></i> ${getNotificationTypeLabel(notification.notification_type)}
            </span>
            <div class="notification-content">
                <p>${notification.message}</p>
                <small class="notification-time">${timeAgo}</small>
            </div>
            <button class="mark-read-btn" data-notification-id="${notification.id}" 
                    ${notification.is_read ? 'disabled' : ''}>
                ${notification.is_read ? 'Read' : 'Mark as Read'}
            </button>
        `;
        
        return div;
    }
    
    // get notification badge class
    function getNotificationBadgeClass(type) {
        switch (type) {
            case 'room_assigned': return 'success';
            case 'payment': return 'info';
            case 'penalty': return 'warn';
            case 'meal_update': return 'info';
            case 'complaint_status': return 'warn';
            case 'extension_update': return 'info';
            case 'food_shortage': return 'warn';
            case 'student_action': return 'info';
            default: return 'info';
        }
    }
    
    // get notification icon
    function getNotificationIcon(type) {
        switch (type) {
            case 'room_assigned': return 'fa-bed';
            case 'payment': return 'fa-credit-card';
            case 'penalty': return 'fa-clock';
            case 'meal_update': return 'fa-utensils';
            case 'complaint_status': return 'fa-comment';
            case 'extension_update': return 'fa-clock-rotate-left';
            case 'food_shortage': return 'fa-exclamation-triangle';
            case 'student_action': return 'fa-user-graduate';
            default: return 'fa-bell';
        }
    }
    
    // get notification type label
    function getNotificationTypeLabel(type) {
        switch (type) {
            case 'room_assigned': return 'Room';
            case 'payment': return 'Payment';
            case 'penalty': return 'Penalty';
            case 'meal_update': return 'Meal';
            case 'complaint_status': return 'Complaint';
            case 'extension_update': return 'Extension';
            case 'food_shortage': return 'Food';
            case 'student_action': return 'Student';
            default: return 'Info';
        }
    }
    
    // get time ago string
    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }
    
    // setup event listeners
    function setupEventListeners() {

        // mark as read buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('mark-read-btn')) {
                const notificationId = e.target.dataset.notificationId;
                markNotificationAsRead(notificationId, e.target);
            }
        });
        
        // logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    }
    
    // mark notification as read
    async function markNotificationAsRead(notificationId, buttonElement) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/mark_read/`, {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                buttonElement.textContent = 'Read';
                buttonElement.disabled = true;
                buttonElement.classList.add('read');
                
                // update local notification data
                const notification = notifications.find(n => n.id == notificationId);
                if (notification) {
                    notification.is_read = true;
                }
                
                showNotification('Notification marked as read', 'success');
            } else {
                throw new Error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showNotification('Failed to mark notification as read', 'error');
        }
    }
    
    // handle logout
    async function handleLogout() {
        try {
            const response = await fetch('/api/auth/logout/', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                showNotification('You have been logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/student-public.html/login-all.html';
                }, 1500);
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            showNotification('Logout failed. Please try again.', 'error');
        }
    }
    
    // show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warn':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(notification);
        
        // auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }
});
