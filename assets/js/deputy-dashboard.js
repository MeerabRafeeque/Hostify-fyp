// deputy RT dashboard functions

let dashboardData = {};

// load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/deputy-dashboard/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            dashboardData = data;
            updateDashboardCards(data);
        } else {
            console.error('Failed to load dashboard stats');
            showNotification('Failed to load dashboard statistics', 'error');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error loading dashboard statistics', 'error');
    }
}

// update dashboard cards with real data
function updateDashboardCards(data) {

    // total students count
    const totalStudentsElement = document.getElementById('total-students-count');
    if (totalStudentsElement) {
        totalStudentsElement.textContent = data.total_students || 0;
    }

    // meal menu last updated
    const mealMenuElement = document.getElementById('meal-menu-last-updated');
    if (mealMenuElement) {
        if (data.meal_menu_last_updated) {
            const lastUpdated = new Date(data.meal_menu_last_updated);
            const daysAgo = Math.floor((new Date() - lastUpdated) / (1000 * 60 * 60 * 24));
            mealMenuElement.textContent = daysAgo === 0 ? 'Updated today' : `Updated ${daysAgo} days ago`;
        } else {
            mealMenuElement.textContent = 'Not updated';
        }
    }

    // meal feedback count
    const feedbackElement = document.getElementById('meal-feedback-count');
    if (feedbackElement) {
        feedbackElement.textContent = data.meal_feedback_count || 0;
    }

    // notifications count
    const notificationsElement = document.getElementById('notifications-count');
    if (notificationsElement) {
        notificationsElement.textContent = data.notifications_count || 0;
    }

    // new students count
    const newStudentsElement = document.getElementById('new-students-count');
    if (newStudentsElement) {
        newStudentsElement.textContent = data.new_students_count || 0;
    }
}

// open attendance tab
function openAttendanceTab() {
    const attendanceTab = document.querySelector('[data-tab="mark-attendance"]');
    if (attendanceTab) {

        // remove active class from current tab
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

        // add active class to attendance tab
        attendanceTab.classList.add('active');

        // navigate to attendance page
        window.location.href = '/deputy-dashboard/mark-std-att.html';
    }
}

// open meal menu tab
function openMealMenuTab() {
    const mealTab = document.querySelector('[data-tab="weekly-meal"]');
    if (mealTab) {

        // remove active class from current tab
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

        // add active class to meal tab
        mealTab.classList.add('active');

        // navigate to meal menu page
        window.location.href = '/deputy-dashboard/weekly-meal.html';
    }
}

// open notifications tab
function openNotificationsTab() {
    const notificationTab = document.querySelector('[data-tab="deputy-notification"]');
    if (notificationTab) {

        // remove active class from current tab
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

        // add active class to notification tab
        notificationTab.classList.add('active');

        // navigate to notification page
        window.location.href = '/deputy-dashboard/deputy-notification.html';
    }
}

// show new students modal
async function showNewStudentsModal() {
    try {
        const response = await fetch('/api/deputy-dashboard/new-students/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            populateNewStudentsModal(data.new_students);
            document.getElementById('new-students-modal').style.display = 'block';
        } else {
            showNotification('Failed to load new students', 'error');
        }
    } catch (error) {
        console.error('Error loading new students:', error);
        showNotification('Error loading new students', 'error');
    }
}

// populate new students modal
function populateNewStudentsModal(students) {
    const container = document.getElementById('new-students-list');
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = '<p>No new students added recently.</p>';
        return;
    }

    let html = '<div class="new-students-table">';
    html += '<table><thead><tr><th>Student ID</th><th>Name</th><th>Department</th><th>Added Date</th></tr></thead><tbody>';
    
    students.forEach(student => {
        const addedDate = new Date(student.created_at).toLocaleDateString();
        html += `
            <tr>
                <td>${student.student_id}</td>
                <td>${student.user.first_name} ${student.user.last_name}</td>
                <td>${student.department}</td>
                <td>${addedDate}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
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

// initialize deputy dashboard functionality
document.addEventListener('DOMContentLoaded', function() {

    // load initial dashboard data
    loadDashboardStats();

    // close modal functionality
    const closeButtons = document.querySelectorAll('.closeModal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // close modal when clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
  });
});
