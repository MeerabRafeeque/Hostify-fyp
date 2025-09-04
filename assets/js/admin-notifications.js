// admin notification functions

// load and display notifications
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications/admin/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            renderNotifications(data);
        } else {
            console.error('Failed to load notifications');
            showNotification('Failed to load notifications', 'error');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Error loading notifications', 'error');
    }
}

// render notifications in the container
function renderNotifications(notifications) {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<div class="no-notifications">No notifications at this time.</div>';
        return;
    }

    let html = '';
    notifications.forEach(notification => {
        html += createNotificationHTML(notification);
    });
    
    container.innerHTML = html;
    
    // add event listeners for payment detail buttons
    const paymentButtons = document.querySelectorAll('.view-payment-details');
    console.log('Found payment detail buttons:', paymentButtons.length);
    
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Payment detail button clicked');
            const studentName = this.getAttribute('data-student-name');
            const studentId = this.getAttribute('data-student-id');
            const amount = this.getAttribute('data-amount');
            const paymentMethod = this.getAttribute('data-payment-method');
            const description = this.getAttribute('data-description');
            
            console.log('Button data:', { studentName, studentId, amount, paymentMethod, description });
            viewPaymentDetails(studentName, studentId, `PKR ${amount}`, paymentMethod, description);
        });
    });
}

// create HTML for individual notification
function createNotificationHTML(notification) {
    const date = new Date(notification.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const isUnread = !notification.is_read;
    const notificationClass = isUnread ? 'notification unread' : 'notification read';

    switch (notification.notification_type) {
        case 'payment':
            return `
                <div class="${notificationClass}" data-type="payment" data-id="${notification.id}">
                    <div class="notifyHeader">
                        <span><i class="fa-solid fa-money-bill-wave"></i> New Payment Receipt</span>
                        <small>${date}</small>
                    </div>
                    <div class="notification-content">
                        <p><strong>Student:</strong> ${notification.student_name || 'N/A'} (ID: ${notification.student_id || 'N/A'})</p>
                        <p><strong>Amount:</strong> PKR ${notification.amount || 'N/A'}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${notification.status?.toLowerCase()}">${notification.status || 'Pending'}</span></p>
                    </div>
                    <div class="notification-actions">
                        <button class="btn btn-primary view-payment-details" 
                                data-student-name="${notification.student_name || ''}" 
                                data-student-id="${notification.student_id || ''}" 
                                data-amount="${notification.amount || ''}" 
                                data-payment-method="${notification.payment_method || ''}" 
                                data-description="${notification.description || ''}">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                        <button onclick="markAsRead(${notification.id})" class="btn btn-secondary">
                            <i class="fa-solid fa-check"></i> Mark as Read
                        </button>
                    </div>
                </div>
            `;
        
        case 'food_shortage':
            return `
                <div class="${notificationClass}" data-type="food_shortage" data-id="${notification.id}">
                    <div class="notifyHeader">
                        <span><i class="fa-solid fa-utensils"></i> Food Shortage Alert</span>
                        <small>${date}</small>
                    </div>
                    <div class="notification-content">
                        <p>${notification.message || 'Food shortage reported by mess staff.'}</p>
                    </div>
                    <div class="notification-actions">
                        <button onclick="acknowledgeFoodShortage(${notification.id})" class="btn btn-primary">
                            <i class="fa-solid fa-check-circle"></i> Acknowledge
                        </button>
                        <button onclick="markAsRead(${notification.id})" class="btn btn-secondary">
                            <i class="fa-solid fa-check"></i> Mark as Read
                        </button>
                    </div>
                </div>
            `;
        
        case 'inactive_student':
            return `
                <div class="${notificationClass}" data-type="inactive_student" data-id="${notification.id}">
                    <div class="notifyHeader">
                        <span><i class="fa-solid fa-user-slash"></i> Inactive Student</span>
                        <small>${date}</small>
                    </div>
                    <div class="notification-content">
                        <p><strong>Student:</strong> ${notification.student_name || 'N/A'} (ID: ${notification.student_id || 'N/A'})</p>
                        <p>This student has not applied for a room after 7 days of login.</p>
                    </div>
                    <div class="notification-actions">
                        <button onclick="removeStudent('${notification.student_name || ''}', '${notification.student_id || ''}')" class="btn btn-danger">
                            <i class="fa-solid fa-user-times"></i> Remove Student
                        </button>
                        <button onclick="markAsRead(${notification.id})" class="btn btn-secondary">
                            <i class="fa-solid fa-check"></i> Mark as Read
                        </button>
                    </div>
                </div>
            `;
        
        default:
            return `
                <div class="${notificationClass}" data-type="general" data-id="${notification.id}">
                    <div class="notifyHeader">
                        <span><i class="fa-solid fa-bell"></i> ${notification.title || 'Notification'}</span>
                        <small>${date}</small>
                    </div>
                    <div class="notification-content">
                        <p>${notification.message || 'No message available.'}</p>
                    </div>
                    <div class="notification-actions">
                        <button onclick="markAsRead(${notification.id})" class="btn btn-secondary">
                            <i class="fa-solid fa-check"></i> Mark as Read
                        </button>
                    </div>
                </div>
            `;
    }
}

// view payment details
function viewPaymentDetails(studentName, studentId, amount, method, description) {
    console.log('viewPaymentDetails called with:', { studentName, studentId, amount, method, description });
    
    // create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modalOverlay';
    
    // create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modalHeader">
            <h3>Payment Details</h3>
            <button class="closeModal" onclick="closePaymentModal()">&times;</button>
        </div>
        
        <div class="modalBody">
            <div style="margin-bottom: 15px;">
                <strong>Student Name:</strong> ${studentName}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Student ID:</strong> ${studentId}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Amount:</strong> ${amount}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Payment Method:</strong> ${method}
            </div>
            <div style="margin-bottom: 20px;">
                <strong>Description:</strong> ${description}
            </div>
        </div>
        
        <div class="modalFooter">
            <button onclick="closePaymentModal()" style="
                padding: 10px 20px;
                border: 1px solid #ddd;
                background: #f8f9fa;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
            ">Close</button>
            <button onclick="verifyPayment('${studentId}')" style="
                padding: 10px 20px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Verify Payment</button>
        </div>
    `;

    // add modal overlay and modal to body
    document.body.appendChild(modalOverlay);
    document.body.appendChild(modal);
    
    // show modal
    setTimeout(() => {
        modalOverlay.classList.add('show');
        modal.classList.add('show');
    }, 10);
}

// close payment modal
function closePaymentModal() {
    const modalOverlay = document.querySelector('.modalOverlay');
    const modal = document.querySelector('.modal');
    
    if (modalOverlay) {
        modalOverlay.classList.remove('show');
        setTimeout(() => modalOverlay.remove(), 300);
    }
    
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// verify payment
function verifyPayment(studentId) {
    // here you would typically make an API call to verify the payment
    fetch(`/api/payments/verify_payment_by_student_id/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            student_id: studentId,
            status: 'verified'
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Payment verified successfully!', 'success');
        // close the modal
        closePaymentModal();
        // reload notifications to update the list
        loadNotifications();
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error verifying payment. Please try again.', 'error');
    });
}

// remove Student
function removeStudent(studentName, studentId) {
    if (confirm(`Are you sure you want to remove ${studentName} from the system? This action cannot be undone.`)) {
        fetch(`/api/students/${studentId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(response => {
            if (response.ok) {
                showNotification(`${studentName} has been removed from the system.`, 'success');
                // reload notifications to update the list
                loadNotifications();
            } else {
                showNotification('Error removing student. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error removing student. Please try again.', 'error');
        });
    }
}

// acknowledge food shortage
function acknowledgeFoodShortage(notificationId) {
    fetch('/api/food-shortages/acknowledge/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            notification_id: notificationId,
            acknowledged: true
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Food shortage acknowledged. Mess committee will be contacted.', 'success');
        // remove the notification from the UI
        const notification = document.querySelector(`[data-id="${notificationId}"]`);
        if (notification) {
            notification.remove();
        }
        // reload notifications to update the list
        loadNotifications();
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error acknowledging food shortage. Please try again.', 'error');
    });
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
    // create notification element
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
    
    // set background color based on type
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
    
    // remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// mark notification as read
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/${notificationId}/mark_read/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include'
        });

        if (response.ok) {
            const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.classList.remove('unread');
                notificationElement.classList.add('read');
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
        const response = await fetch('/api/notifications/mark_all_read/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include'
        });

        if (response.ok) {
            const unreadNotifications = document.querySelectorAll('.notification.unread');
            unreadNotifications.forEach(notification => {
                notification.classList.remove('unread');
                notification.classList.add('read');
            });
            showNotification('All notifications marked as read', 'success');
        } else {
            showNotification('Failed to mark all notifications as read', 'error');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showNotification('Error marking all notifications as read', 'error');
    }
}

// refresh notifications
function refreshNotifications() {
    loadNotifications();
    showNotification('Notifications refreshed', 'success');
}

// filter notifications
function filterNotifications(filterType) {
    const notifications = document.querySelectorAll('.notification');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.filter-btn').classList.add('active');
    
    notifications.forEach(notification => {
        const notificationType = notification.getAttribute('data-type');
        
        if (filterType === 'all' || notificationType === filterType) {
            notification.style.display = 'block';
        } else {
            notification.style.display = 'none';
        }
    });
}

// initialize notification functionality
document.addEventListener('DOMContentLoaded', function() {
    // load notifications when page loads
    loadNotifications();
    
    // set up filter button event listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            filterNotifications(filterType);
        });
    });
    
    // refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);
});
