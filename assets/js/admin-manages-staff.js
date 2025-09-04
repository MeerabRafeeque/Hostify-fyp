// admin staff management functions

let staffData = [];

// load and display staff
async function loadStaff() {
    try {
        const response = await fetch('/api/staff/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            staffData = data.results || [];
            renderStaffTable(staffData);
        } else {
            console.error('Failed to load staff');
            showNotification('Failed to load staff', 'error');
        }
    } catch (error) {
        console.error('Error loading staff:', error);
        showNotification('Error loading staff', 'error');
    }
}

// render staff table
function renderStaffTable(staff) {
    const tbody = document.querySelector('#staff-table tbody');
    if (!tbody) return;

    if (staff.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No staff available</td></tr>';
        return;
    }

    let html = '';
    staff.forEach(staffMember => {
        const statusClass = staffMember.is_active ? 'active' : 'inactive';
        const statusText = staffMember.is_active ? 'Active' : 'Inactive';
        
        html += `
            <tr data-staff-id="${staffMember.id}">
                <td>${staffMember.user.first_name} ${staffMember.user.last_name}</td>
                <td>${staffMember.user.email}</td>
                <td>${staffMember.staff_type}</td>
                <td>${staffMember.department || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewStaff(${staffMember.id})" class="btn btn-sm btn-info">View</button>
                        <button onclick="editStaff(${staffMember.id})" class="btn btn-sm btn-warning">Update</button>
                        <button onclick="deleteStaff(${staffMember.id})" class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// view staff details
async function viewStaff(staffId) {
    try {
        const response = await fetch(`/api/staff/${staffId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const staff = await response.json();
            showStaffDetailsModal(staff);
        } else {
            showNotification('Failed to load staff details', 'error');
        }
    } catch (error) {
        console.error('Error loading staff details:', error);
        showNotification('Error loading staff details', 'error');
    }
}

// show staff details modal
function showStaffDetailsModal(staff) {
    const modal = document.getElementById('details-modal');
    const content = document.getElementById('details-content');
    const title = document.getElementById('details-title');
    
    title.textContent = 'Staff Details';
    
    const statusClass = staff.is_active ? 'active' : 'inactive';
    const statusText = staff.is_active ? 'Active' : 'Inactive';
    
    content.innerHTML = `
        <div class="staff-details">
            <div class="detail-row">
                <strong>Name:</strong> ${staff.user.first_name} ${staff.user.last_name}
            </div>
            <div class="detail-row">
                <strong>Email:</strong> ${staff.user.email}
            </div>
            <div class="detail-row">
                <strong>Staff Type:</strong> ${staff.staff_type}
            </div>
            <div class="detail-row">
                <strong>Department:</strong> ${staff.department || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Phone:</strong> ${staff.user.phone || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Hire Date:</strong> ${new Date(staff.hire_date).toLocaleDateString()}
            </div>
            <div class="detail-row">
                <strong>Salary:</strong> PKR ${staff.salary}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="detail-row">
                <strong>Created At:</strong> ${new Date(staff.created_at).toLocaleDateString()}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// edit staff
async function editStaff(staffId) {
    try {
        const response = await fetch(`/api/staff/${staffId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const staff = await response.json();
            populateEditStaffForm(staff);
            document.getElementById('edit-staff-modal').style.display = 'block';
        } else {
            showNotification('Failed to load staff details', 'error');
        }
    } catch (error) {
        console.error('Error loading staff details:', error);
        showNotification('Error loading staff details', 'error');
    }
}

// populate edit staff form
function populateEditStaffForm(staff) {
    document.getElementById('edit-staff-id').value = staff.id;
    document.getElementById('edit-staff-name').value = `${staff.user.first_name} ${staff.user.last_name}`;
    document.getElementById('edit-staff-email').value = staff.user.email;
    document.getElementById('edit-staff-position').value = staff.staff_type;
    document.getElementById('edit-staff-phone').value = staff.user.phone || '';
    document.getElementById('edit-staff-shift').value = staff.department || '';
}

// delete staff
async function deleteStaff(staffId) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        try {
            const response = await fetch(`/api/staff/${staffId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                }
            });

            if (response.ok) {
                showNotification('Staff member deleted successfully', 'success');
                loadStaff();
            } else {
                const error = await response.json();
                showNotification(`Failed to delete staff: ${error.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            showNotification('Error deleting staff', 'error');
        }
    }
}

// Get CSRF Token
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

// initialize staff management functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial data
    loadStaff();

    // add staff button
    const addStaffBtn = document.getElementById('add-staff-btn');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', () => {
            document.getElementById('add-staff-modal').style.display = 'block';
        });
    }

    // add staff form submission
    const addStaffForm = document.getElementById('add-staff-form');
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameParts = document.getElementById('staff-name').value.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
                         const formData = {
                 user: {
                     first_name: firstName,
                     last_name: lastName,
                     email: document.getElementById('staff-email').value,
                     phone: document.getElementById('staff-phone').value,
                     role: getRoleFromPosition(document.getElementById('staff-position').value)
                 },
                 staff_id: `STF${Date.now()}`,
                 staff_type: document.getElementById('staff-position').value,
                 department: document.getElementById('staff-shift').value,
                 hire_date: new Date().toISOString().split('T')[0],
                 salary: 50000.00
             };

            try {
                const response = await fetch('/api/staff/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Staff member added successfully', 'success');
                    document.getElementById('add-staff-modal').style.display = 'none';
                    addStaffForm.reset();
                    loadStaff();
                } else {
                    const error = await response.json();
                    showNotification(`Failed to add staff: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error adding staff:', error);
                showNotification('Error adding staff', 'error');
            }
        });
    }

    // edit staff form submission
    const editStaffForm = document.getElementById('edit-staff-form');
    if (editStaffForm) {
        editStaffForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const staffId = document.getElementById('edit-staff-id').value;
            const nameParts = document.getElementById('edit-staff-name').value.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
                         const formData = {
                 user: {
                     first_name: firstName,
                     last_name: lastName,
                     email: document.getElementById('edit-staff-email').value,
                     phone: document.getElementById('edit-staff-phone').value
                 },
                 staff_type: document.getElementById('edit-staff-position').value,
                 department: document.getElementById('edit-staff-shift').value
             };

            try {
                const response = await fetch(`/api/staff/${staffId}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Staff member updated successfully', 'success');
                    document.getElementById('edit-staff-modal').style.display = 'none';
                    loadStaff();
                } else {
                    const error = await response.json();
                    showNotification(`Failed to update staff: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error updating staff:', error);
                showNotification('Error updating staff', 'error');
            }
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

    // close modal when clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});

// helper function to map position to role
function getRoleFromPosition(position) {
    const roleMap = {
        'warden': 'warden',
        'deputy_rt': 'deputy_rt',
        'mess_staff': 'mess_staff'
    };
    return roleMap[position] || 'mess_staff';
}
