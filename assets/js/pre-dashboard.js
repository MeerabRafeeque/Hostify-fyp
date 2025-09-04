// student Pre-Dashboard Functions
let studentData = {};
let notifications = [];

// load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStudentData();
    loadNotifications();
    setupCountdown();
});

// load student data from API
async function loadStudentData() {
    try {
        console.log('Loading student data...');
        const response = await fetch('/api/students/me/', {
            credentials: 'include'
        });
        console.log('Student data response status:', response.status);
        
        if (response.ok) {
            studentData = await response.json();
            console.log('Student data loaded:', studentData);
            updateStatusDisplay();
        } else {
            console.error('Failed to load student data:', response.status, response.statusText);
            showNotification('Failed to load student data', 'error');
        }
    } catch (error) {
        console.error('Error loading student data:', error);
        showNotification('Error loading student data', 'error');
    }
}

// load notifications from API
async function loadNotifications() {
    try {
        console.log('Loading notifications...');
        const response = await fetch('/api/notifications/', {
            credentials: 'include'
        });
        console.log('Notifications response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Notifications response:', data);
            
            // handle response
            notifications = data.results || data;
            console.log('Notifications loaded:', notifications.length);
            renderNotifications();
        } else {
            console.error('Failed to load notifications:', response.status, response.statusText);
            showNotification('Failed to load notifications', 'error');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Error loading notifications', 'error');
    }
}

// update status display
function updateStatusDisplay() {

    // update room status
    const roomStatus = studentData.room ? 'Assigned' : 'Not Assigned';
    const roomChip = document.querySelector('.chip.bad');
    if (roomChip) {
        roomChip.innerHTML = `<i class="fa-solid fa-bed"></i> Room: ${roomStatus}`;
        roomChip.className = studentData.room ? 'chip good' : 'chip bad';
    }

    // update payment status
    const paymentStatus = getPaymentStatus();
    const paymentChip = document.querySelector('.chip.warn');
    if (paymentChip) {
        paymentChip.innerHTML = `<i class="fa-solid fa-credit-card"></i> Payment: ${paymentStatus}`;
        paymentChip.className = getPaymentStatusClass(paymentStatus);
    }
}

// get payment status
function getPaymentStatus() {
    if (!studentData.payments || studentData.payments.length === 0) {
        return 'Pending';
    }
    
    const latestPayment = studentData.payments[studentData.payments.length - 1];
    return latestPayment.status;
}

// get payment status class
function getPaymentStatusClass(status) {
    switch (status) {
        case 'verified':
            return 'chip good';
        case 'rejected':
            return 'chip bad';
        case 'pending':
        default:
            return 'chip warn';
    }
}

// setup countdown timer
function setupCountdown() {
    const registrationDate = new Date(studentData.user?.date_joined || Date.now());
    const deadline = new Date(registrationDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    const now = new Date();
    
    const timeLeft = deadline.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
    
    // update days left display
    const daysLeftElement = document.getElementById('daysLeft');
    if (daysLeftElement) {
        daysLeftElement.textContent = daysLeft;
    }
    
    // update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = Math.max(0, Math.min(100, ((7 - daysLeft) / 7) * 100));
        progressBar.style.width = `${progress}%`;
        
        // change color based on days left
        if (daysLeft <= 1) {
            progressBar.style.backgroundColor = '#dc3545'; // Red
        } else if (daysLeft <= 3) {
            progressBar.style.backgroundColor = '#ffc107'; // Yellow
        } else {
            progressBar.style.backgroundColor = '#28a745'; // Green
        }
    }
    
    // update deadline text
    const deadlineElement = document.getElementById('deadlineDays');
    if (deadlineElement) {
        deadlineElement.textContent = `${daysLeft} days`;
    }
    
    // auto-refresh countdown every minute
    setTimeout(setupCountdown, 60000);
}

// render notifications
function renderNotifications() {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<p class="muted">No notifications found</p>';
        return;
    }

    let html = '';
    notifications.slice(0, 5).forEach(notification => { // Show only first 5 notifications
        const badgeClass = getNotificationBadgeClass(notification.notification_type);
        const icon = getNotificationIcon(notification.notification_type);
        
        html += `
            <div class="note">
                <span class="badge ${badgeClass}">
                    <i class="${icon}"></i> ${notification.notification_type.replace('_', ' ').toUpperCase()}
                </span>
                <span>${notification.message}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

// get notification badge class
function getNotificationBadgeClass(type) {
    switch (type) {
        case 'registration_success':
            return 'info';
        case 'room_reminder':
            return 'alert';
        case 'payment_verified':
            return 'success';
        case 'payment_rejected':
            return 'error';
        default:
            return 'info';
    }
}

// get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'registration_success':
            return 'fa-solid fa-check-circle';
        case 'room_reminder':
            return 'fa-solid fa-triangle-exclamation';
        case 'payment_verified':
            return 'fa-solid fa-check';
        case 'payment_rejected':
            return 'fa-solid fa-times-circle';
        default:
            return 'fa-solid fa-info-circle';
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

    const container = document.querySelector('.content') || document.body;
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
