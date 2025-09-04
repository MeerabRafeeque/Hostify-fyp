// warden notifications functions
document.addEventListener("DOMContentLoaded", () => {
    initializeNotifications();
});

async function initializeNotifications() {
    try {
        await loadNotifications();
    } catch (error) {
        console.error('Error initializing notifications:', error);
        // error is already handled in loadNotifications
    }
}

async function loadNotifications() {
    try {
        console.log('Loading notifications...');
        const response = await fetch('/api/notifications/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load notifications: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Notifications response:', data);
        
        // handle response
        const notifications = data.results || data;
        console.log('Notifications loaded:', notifications.length);
        
        renderNotifications(notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Error loading notifications', 'error');
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="warden-notification">
                <div class="warden-notifyHeader">
                    <span><i class="fa-solid fa-info-circle"></i> No Notifications</span>
                    <small>No notifications found</small>
                </div>
                <p>You have no notifications at this time.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        container.appendChild(notificationElement);
    });
}

function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = 'warden-notification';
    div.setAttribute('data-tab', notification.notification_type);
    
    const icon = getNotificationIcon(notification.notification_type);
    const timeAgo = getTimeAgo(notification.created_at);
    
    div.innerHTML = `
        <div class="warden-notifyHeader">
            <span>${icon} ${notification.title}</span>
            <small>${timeAgo}</small>
        </div>
        <p>${notification.message}</p>
        <button onclick="markNotificationAsRead(${notification.id})" class="btn btn-primary">
            Mark as Read
        </button>
    `;
    
    return div;
}

function getNotificationIcon(type) {
    const icons = {
        'payment': '<i class="fa-solid fa-credit-card"></i>',
        'attendance': '<i class="fa-solid fa-clock"></i>',
        'complaint': '<i class="fa-solid fa-circle-exclamation"></i>',
        'meal': '<i class="fa-solid fa-bowl-food"></i>',
        'general': '<i class="fa-solid fa-bell"></i>'
    };
    return icons[type] || '<i class="fa-solid fa-bell"></i>';
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

async function markNotificationAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/${notificationId}/mark_read/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.ok) {
            showNotification('Notification marked as read', 'success');

            // reload notifications to update the display
            await loadNotifications();
        } else {
            throw new Error('Failed to mark notification as read');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        showNotification('Error marking notification as read', 'error');
    }
}

function getCSRFToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

function showNotification(message, type = 'info') {

    // create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // add to page
    document.body.appendChild(notification);
    
    // auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
