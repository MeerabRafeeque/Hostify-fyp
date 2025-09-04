// student notifications functions
let notifications = [];

// load notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
});

// load notifications from API
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications/');
        if (response.ok) {
            notifications = await response.json();
            renderNotifications();
        } else {
            showNotification('Failed to load notifications', 'error');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Error loading notifications', 'error');
    }
}

// render notifications in the UI
function renderNotifications() {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<li class="no-notifications">No notifications found</li>';
        return;
    }

    let html = '';
    notifications.forEach(notification => {
        const icon = getNotificationIcon(notification.notification_type);
        const timeAgo = getTimeAgo(notification.created_at);
        
        html += `
            <li class="${notification.is_read ? 'read' : 'unread'}">
                <i class="${icon}"></i>
                ${notification.message}
                <span class="notif-date">${timeAgo}</span>
            </li>
        `;
    });

    container.innerHTML = html;
}

// get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'registration_success':
            return 'fa-solid fa-circle-info';
        case 'room_reminder':
            return 'fa-solid fa-clock';
        case 'payment_verified':
            return 'fa-solid fa-check-circle';
        case 'payment_rejected':
            return 'fa-solid fa-times-circle';
        case 'room_assigned':
            return 'fa-solid fa-door-open';
        case 'room_deallocated':
            return 'fa-solid fa-door-closed';
        default:
            return 'fa-solid fa-bell';
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

// show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.tab-content') || document.body;
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
