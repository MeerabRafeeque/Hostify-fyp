// admin stay extension requests management functions

let stayExtensionData = [];

// load and display stay extension requests
async function loadStayExtensions() {
    try {
        const response = await fetch('/api/stay-extension-requests/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            stayExtensionData = data.results || [];
            renderStayExtensionsTable(stayExtensionData);
        } else {
            console.error('Failed to load stay extension requests');
            showNotification('Failed to load stay extension requests', 'error');
        }
    } catch (error) {
        console.error('Error loading stay extension requests:', error);
        showNotification('Error loading stay extension requests', 'error');
    }
}

// render stay extension requests table
function renderStayExtensionsTable(requests) {
    const tbody = document.querySelector('#stay-table tbody');
    if (!tbody) return;

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No stay extension requests available</td></tr>';
        return;
    }

    let html = '';
    requests.forEach(request => {
        const statusClass = getStatusClass(request.status);
        const statusText = request.status.replace('_', ' ').toUpperCase();
        const duration = `${request.current_checkout_date} to ${request.requested_checkout_date}`;
        
        html += `
            <tr data-request-id="${request.id}">
                <td>EXT${request.id}</td>
                <td>${request.student.user.first_name} ${request.student.user.last_name}</td>
                <td>${request.student.student_id}</td>
                <td>${request.student.year_of_study}${getYearSuffix(request.student.year_of_study)} Year</td>
                <td>${new Date(request.created_at).toLocaleDateString()}</td>
                <td>${duration}</td>
                <td>${request.reason.substring(0, 50)}${request.reason.length > 50 ? '...' : ''}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewRequestDetails(${request.id})" class="btn btn-sm btn-info">View</button>
                        ${request.status === 'pending' ? `
                            <button onclick="approveRequest(${request.id})" class="btn btn-sm btn-success">Approve</button>
                            <button onclick="showRejectionModal(${request.id})" class="btn btn-sm btn-danger">Reject</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// get year suffix
function getYearSuffix(year) {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
}

// get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'approved':
            return 'success';
        case 'rejected':
            return 'danger';
        default:
            return 'secondary';
    }
}

// view request details
async function viewRequestDetails(requestId) {
    try {
        const response = await fetch(`/api/stay-extension-requests/${requestId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const request = await response.json();
            showRequestDetailsModal(request);
        } else {
            showNotification('Failed to load request details', 'error');
        }
    } catch (error) {
        console.error('Error loading request details:', error);
        showNotification('Error loading request details', 'error');
    }
}

// show request details modal
function showRequestDetailsModal(request) {
    const modal = document.getElementById('details-modal');
    const content = document.getElementById('details-content');
    const title = document.getElementById('details-title');
    
    title.textContent = 'Stay Extension Request Details';
    
    const statusClass = getStatusClass(request.status);
    const statusText = request.status.replace('_', ' ').toUpperCase();
    
    content.innerHTML = `
        <div class="request-details">
            <div class="detail-row">
                <strong>Student Name:</strong> ${request.student.user.first_name} ${request.student.user.last_name}
            </div>
            <div class="detail-row">
                <strong>Student ID:</strong> ${request.student.student_id}
            </div>
            <div class="detail-row">
                <strong>Education Level:</strong> ${request.student.year_of_study}${getYearSuffix(request.student.year_of_study)} Year
            </div>
            <div class="detail-row">
                <strong>Current Checkout Date:</strong> ${request.current_checkout_date}
            </div>
            <div class="detail-row">
                <strong>Requested Checkout Date:</strong> ${request.requested_checkout_date}
            </div>
            <div class="detail-row">
                <strong>Reason for Extension:</strong> ${request.reason}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            ${request.approved_by ? `
                <div class="detail-row">
                    <strong>Approved By:</strong> ${request.approved_by.first_name} ${request.approved_by.last_name}
                </div>
                <div class="detail-row">
                    <strong>Approved At:</strong> ${new Date(request.approved_at).toLocaleString()}
                </div>
            ` : ''}
            ${request.rejection_reason ? `
                <div class="detail-row">
                    <strong>Rejection Reason:</strong> ${request.rejection_reason}
                </div>
            ` : ''}
            <div class="detail-row">
                <strong>Request Date:</strong> ${new Date(request.created_at).toLocaleString()}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// approve request
async function approveRequest(requestId) {
    if (confirm('Are you sure you want to approve this stay extension request?')) {
        try {
            const response = await fetch(`/api/stay-extension-requests/${requestId}/approve/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                }
            });

            if (response.ok) {
                showNotification('Stay extension request approved successfully', 'success');
                loadStayExtensions();
            } else {
                const error = await response.json();
                showNotification(`Failed to approve request: ${error.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            showNotification('Error approving request', 'error');
        }
    }
}

// show rejection modal
async function showRejectionModal(requestId) {
    try {
        const response = await fetch(`/api/stay-extension-requests/${requestId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const request = await response.json();
            document.getElementById('rejection-request-id').value = requestId;
            document.getElementById('rejection-student-name').value = `${request.student.user.first_name} ${request.student.user.last_name}`;
            document.getElementById('rejection-reason').value = '';
            document.getElementById('rejection-modal').style.display = 'block';
        } else {
            showNotification('Failed to load request details', 'error');
        }
    } catch (error) {
        console.error('Error loading request details:', error);
        showNotification('Error loading request details', 'error');
    }
}

// reject request
async function rejectRequest(requestId, reason) {
    try {
        const response = await fetch(`/api/stay-extension-requests/${requestId}/reject/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ rejection_reason: reason })
        });

        if (response.ok) {
            showNotification('Stay extension request rejected successfully', 'success');
            document.getElementById('rejection-modal').style.display = 'none';
            loadStayExtensions();
        } else {
            const error = await response.json();
            showNotification(`Failed to reject request: ${error.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error rejecting request:', error);
        showNotification('Error rejecting request', 'error');
    }
}

// get CSRF Token
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

// initialize stay extension requests functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadStayExtensions();

    // rejection form submission
    const rejectionForm = document.getElementById('rejection-form');
    if (rejectionForm) {
        rejectionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const requestId = document.getElementById('rejection-request-id').value;
            const reason = document.getElementById('rejection-reason').value;
            
            if (!reason.trim()) {
                showNotification('Please provide a rejection reason', 'error');
                return;
            }
            
            await rejectRequest(requestId, reason);
        });
    }

    // close modal functionality
    const closeButtons = document.querySelectorAll('.closeModal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});
