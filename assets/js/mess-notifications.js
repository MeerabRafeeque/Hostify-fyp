// mess notifications functions
let notifications = [];

// ensure arrays are always arrays
if (!Array.isArray(notifications)) notifications = [];

// global safety function to ensure array
function ensureArray(arr, name = 'array') {
    if (!Array.isArray(arr)) {
        console.error(`${name} is not an array:`, arr);
        return [];
    }
    return arr;
}

// global check to ensure notifications is always an array
function ensureNotificationsArray() {
    if (!Array.isArray(notifications)) {
        console.error('Notifications is not an array, resetting to empty array:', notifications);
        notifications = [];
    }
    return notifications;
}

// load notifications on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadNotifications();
});

// load notifications from API
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications/');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw notifications data:', data);
            console.log('Data type:', typeof data);
            console.log('Is array:', Array.isArray(data));
            console.log('Has results:', data && data.results);
            console.log('Results type:', typeof data.results);
            console.log('Results is array:', Array.isArray(data.results));
            
            // handle response - check for results array
            if (data && data.results && Array.isArray(data.results)) {
                notifications = data.results;
                console.log('Using data.results');
            } else if (Array.isArray(data)) {
                notifications = data;
                console.log('Using data directly');
            } else {
                notifications = [];
                console.error('Unexpected notifications data structure:', data);
            }
            console.log('Final notifications array:', notifications);
            console.log('Notifications type:', typeof notifications);
            console.log('Notifications is array:', Array.isArray(notifications));
            console.log('Loaded notifications:', notifications.length);
            
            // ensure notifications is an array before rendering
            ensureNotificationsArray();
            renderNotifications();
        } else {
            console.error('Failed to load notifications, status:', response.status);
            showNotification('Failed to load notifications', 'error');
            notifications = [];
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Error loading notifications', 'error');
        notifications = [];
    }
}

// render notifications in the UI
function renderNotifications() {
    const container = document.getElementById('notifications-container');
    if (!container) {
        console.error('Notifications container not found');
        return;
    }

    // ensure notifications is an array using the safety function
    notifications = ensureArray(notifications, 'notifications');
    console.log('Rendering notifications with', notifications.length, 'notifications');

    if (notifications.length === 0) {
        container.innerHTML = '<p class="no-notifications">No notifications found</p>';
        return;
    }

    let html = '';
    notifications.forEach(notification => {
        const notificationClass = notification.is_read ? 'read' : 'unread';
        const timeAgo = getTimeAgo(notification.created_at);
        
        html += `
            <div class="mess-notification ${notificationClass}" data-id="${notification.id}">
                <p>
                    <strong>${notification.title}:</strong> ${notification.message}
                </p>
                <span class="mess-notification-time">${timeAgo}</span>
                ${!notification.is_read ? '<button class="mark-read-btn" onclick="markAsRead(${notification.id})">Mark as Read</button>' : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

// mark notification as read
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/${notificationId}/mark_as_read/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {

            // update local notification
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
                renderNotifications();
            }
            showNotification('Notification marked as read', 'success');
        } else {
            showNotification('Failed to mark notification as read', 'error');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        showNotification('Error marking notification as read', 'error');
    }
}

// mark all notifications as read
async function markAllAsRead() {
    try {
        const response = await fetch('/api/notifications/mark_all_as_read/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {

            // update all local notifications
            notifications.forEach(notification => {
                notification.is_read = true;
            });
            renderNotifications();
            showNotification('All notifications marked as read', 'success');
        } else {
            showNotification('Failed to mark all notifications as read', 'error');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showNotification('Error marking all notifications as read', 'error');
    }
}

// get time ago from timestamp
function getTimeAgo(timestamp) {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// get CSRF token
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return '';
}

// show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.mess-container') || document.body;
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
