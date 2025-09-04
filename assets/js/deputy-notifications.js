// deputy RT notifications functions

let notificationsData = [];

// load and display notifications
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            notificationsData = data.results || [];
            renderNotificationsTable(notificationsData);
        } else {
            console.error('Failed to load notifications');
            showNotification('Failed to load notifications', 'error');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Error loading notifications', 'error');
    }
}

// render notifications table
function renderNotificationsTable(notifications) {
    const tbody = document.getElementById('notifications-table-body');
    if (!tbody) return;

    if (notifications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">No notifications available</td></tr>';
        return;
    }

    let html = '';
    notifications.forEach(notification => {
        const notificationDate = new Date(notification.created_at).toLocaleDateString();
        const isRead = notification.is_read ? 'read' : 'unread';
        
        html += `
            <tr class="notification-row ${isRead}" data-notification-id="${notification.id}">
                <td>${notificationDate}</td>
                <td>
                    <div class="notification-content">
                        <strong>${notification.title}</strong>
                        <p>${notification.message}</p>
                    </div>
                </td>
                <td>
                    ${!notification.is_read ? `
                        <button onclick="markAsRead(${notification.id})" class="btn btn-sm btn-primary">
                            Mark as Read
                        </button>
                    ` : '<span class="text-muted">Read</span>'}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
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
            showNotification('Notification marked as read', 'success');
            // reload notifications to update the UI
            loadNotifications();
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
            showNotification('All notifications marked as read', 'success');
            loadNotifications();
        } else {
            showNotification('Failed to mark all notifications as read', 'error');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showNotification('Error marking all notifications as read', 'error');
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

// show notification message
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// initialize notifications functionality
document.addEventListener('DOMContentLoaded', function() {

    // load initial notifications
    loadNotifications();

    // add "Mark All as Read" button if there are unread notifications
    const header = document.querySelector('.deputy-notifications h2');
    if (header) {
        const markAllButton = document.createElement('button');
        markAllButton.className = 'btn btn-secondary';
        markAllButton.textContent = 'Mark All as Read';
        markAllButton.onclick = markAllAsRead;
        markAllButton.style.marginLeft = '10px';
        header.appendChild(markAllButton);
    }
});
