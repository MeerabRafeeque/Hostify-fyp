// student post-dashboard functions
document.addEventListener('DOMContentLoaded', function() {
    let studentData = null;
    
    // initialize dashboard
    initializeDashboard();
    
    async function initializeDashboard() {
        try {
            await loadStudentData();
            updateStatusDisplay();
            loadRecentNotifications();
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            showNotification('Failed to load dashboard data', 'error');
        }
    }
    
    // load student data from API
    async function loadStudentData() {
        try {
            const response = await fetch('/api/student-post-dashboard/', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 400) {

                    // student has no room assigned, redirect to pre-dashboard
                    window.location.href = '/student-dashboard-pre/dashboard-pre.html';
                    return;
                }
                throw new Error('Failed to load student data');
            }
            
            studentData = await response.json();
        } catch (error) {
            console.error('Error loading student data:', error);
            throw error;
        }
    }
    
    // update status display
    function updateStatusDisplay() {
        if (!studentData) return;
        
        // update room status
        const roomStatus = document.querySelector('.chip.ok:first-child');
        if (roomStatus && studentData.student.room) {
            roomStatus.innerHTML = `<i class="fa-solid fa-bed"></i> Room: Assigned (${studentData.student.room.room_number})`;
        }
        
        // update payment status
        const paymentStatus = document.querySelector('.chip.ok:last-child');
        if (paymentStatus && studentData.payment) {
            const statusClass = getPaymentStatusClass(studentData.payment.status);
            paymentStatus.className = `chip ${statusClass}`;
            paymentStatus.innerHTML = `<i class="fa-solid fa-credit-card"></i> Payment: ${studentData.payment.status.charAt(0).toUpperCase() + studentData.payment.status.slice(1)}`;
        }
        
        // update student name in welcome message
        const welcomeHeader = document.querySelector('.post-topbar h1');
        if (welcomeHeader && studentData.user) {
            welcomeHeader.textContent = `Welcome, ${studentData.user.first_name}`;
        }
    }
    
    // get payment status class for styling
    function getPaymentStatusClass(status) {
        switch (status) {
            case 'verified': return 'ok';
            case 'pending': return 'warn';
            case 'rejected': return 'bad';
            default: return 'ok';
        }
    }
    
    // load recent notifications
    async function loadRecentNotifications() {
        if (!studentData || !studentData.recent_notifications) return;
        
        const notificationsContainer = document.querySelector('.post-note');
        if (!notificationsContainer) return;
        
        // clear existing static notifications
        const notificationsSection = document.querySelector('.post-card:has(.post-note)');
        if (notificationsSection) {
            const notesContainer = notificationsSection.querySelector('.post-note').parentNode;
            notesContainer.innerHTML = '<h3>Recent Notifications</h3>';
            
            if (studentData.recent_notifications.length === 0) {
                notesContainer.innerHTML += '<div class="post-note"><span class="post-badge info"><i class="fa-solid fa-info-circle"></i> Info</span><span>No new notifications</span></div>';
            } else {
                studentData.recent_notifications.forEach(notification => {
                    const notificationElement = createNotificationElement(notification);
                    notesContainer.appendChild(notificationElement);
                });
            }
        }
    }
    
    // create notification element
    function createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = 'post-note';
        
        const badgeClass = getNotificationBadgeClass(notification.notification_type);
        const icon = getNotificationIcon(notification.notification_type);
        
        div.innerHTML = `
            <span class="post-badge ${badgeClass}">
                <i class="fa-solid ${icon}"></i> ${getNotificationTypeLabel(notification.notification_type)}
            </span>
            <span>${notification.message}</span>
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
            default: return 'Info';
        }
    }
    
    // setup event listeners
    function setupEventListeners() {

        // logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
        
        // quick links
        const quickLinks = document.querySelectorAll('.locked');
        quickLinks.forEach(link => {
            link.addEventListener('click', function(e) {

                // remove disabled styling since student has full access
                this.classList.remove('locked');
                this.classList.add('enabled');
            });
        });
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
