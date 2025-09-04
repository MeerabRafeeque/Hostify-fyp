// admin attendance & penalty management functions

let attendanceData = [];
let penaltyData = [];

// load and display attendance
async function loadAttendance() {
    try {
        const response = await fetch('/api/attendance/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            attendanceData = data.results || [];
            renderAttendanceTable(attendanceData);
        } else {
            console.error('Failed to load attendance');
            showNotification('Failed to load attendance', 'error');
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        showNotification('Error loading attendance', 'error');
    }
}

// load and display penalties
async function loadPenalties() {
    try {
        const response = await fetch('/api/penalties/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            penaltyData = data.results || [];
            renderPenaltyTable(penaltyData);
        } else {
            console.error('Failed to load penalties');
            showNotification('Failed to load penalties', 'error');
        }
    } catch (error) {
        console.error('Error loading penalties:', error);
        showNotification('Error loading penalties', 'error');
    }
}

// render attendance table
function renderAttendanceTable(attendance) {
    const tbody = document.querySelector('#attendanceTable');
    if (!tbody) return;

    if (attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No attendance records available</td></tr>';
        return;
    }

    let html = '';
    attendance.forEach(record => {
        const statusClass = record.is_present ? 'present' : 'absent';
        const statusText = record.is_present ? 'Present' : 'Absent';
        
        html += `
            <tr>
                <td>${record.student.student_id}</td>
                <td>${record.student.user.first_name} ${record.student.user.last_name}</td>
                <td>${record.student.department}</td>
                <td>${record.marked_by ? record.marked_by.first_name + ' ' + record.marked_by.last_name : 'N/A'}</td>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// render penalty table
function renderPenaltyTable(penalties) {
    const tbody = document.querySelector('#penalty-table tbody');
    if (!tbody) return;

    if (penalties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No penalty records available</td></tr>';
        return;
    }

    let html = '';
    penalties.forEach(penalty => {
        const paidClass = penalty.is_paid ? 'paid' : 'unpaid';
        const paidText = penalty.is_paid ? 'Paid' : 'Unpaid';
        
        html += `
            <tr>
                <td>${penalty.student.student_id}</td>
                <td>${penalty.student.user.first_name} ${penalty.student.user.last_name}</td>
                <td>${new Date(penalty.issued_date).toLocaleDateString()}</td>
                <td>PKR ${penalty.amount}</td>
                <td>${penalty.reason}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
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

// initialize attendance and penalty management functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial data
    loadAttendance();
    loadPenalties();
});
