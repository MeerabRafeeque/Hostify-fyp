// admin complaints & feedback management functions

let complaintsData = [];

// load and display complaints
async function loadComplaints() {
    try {
        const response = await fetch('/api/complaints/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            complaintsData = data.results || [];
            renderComplaintsTable(complaintsData);
        } else {
            console.error('Failed to load complaints');
            showNotification('Failed to load complaints', 'error');
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
        showNotification('Error loading complaints', 'error');
    }
}

// render complaints table
function renderComplaintsTable(complaints) {
    const tbody = document.querySelector('#complaint-table tbody');
    if (!tbody) return;

    if (complaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No complaints available</td></tr>';
        return;
    }

    let html = '';
    complaints.forEach(complaint => {
        const statusClass = getStatusClass(complaint.status);
        const statusText = complaint.status.replace('_', ' ').toUpperCase();
        
        html += `
            <tr data-complaint-id="${complaint.id}">
                <td>CMP${complaint.id}</td>
                <td>${complaint.student.user.first_name} ${complaint.student.user.last_name}</td>
                <td>
                    <strong>${complaint.title}</strong><br>
                    <small>${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}</small>
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${complaint.assigned_to ? complaint.assigned_to.first_name + ' ' + complaint.assigned_to.last_name : 'Unassigned'}</td>
                <td>${complaint.resolution || 'No feedback yet'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'in_progress':
            return 'info';
        case 'resolved':
            return 'success';
        case 'rejected':
            return 'danger';
        default:
            return 'secondary';
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

// initialize complaints and feedback functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial data
    loadComplaints();
});
