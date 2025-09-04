
// admin dashboard functions

// fetch and display dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardCards(data);
        } else {
            console.error('Failed to load dashboard stats');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// update dashboard cards with real data
function updateDashboardCards(data) {
    // update total students
    const totalStudentsElement = document.getElementById('total-students');
    if (totalStudentsElement) {
        totalStudentsElement.textContent = data.total_students || 0;
    }

    // update pending payments
    const pendingPaymentsElement = document.getElementById('total-payments');
    if (pendingPaymentsElement) {
        pendingPaymentsElement.textContent = data.pending_payments || 0;
    }

    // update occupied rooms
    const occupiedRoomsElement = document.getElementById('total-rooms');
    if (occupiedRoomsElement) {
        occupiedRoomsElement.textContent = data.occupied_rooms || 0;
    }

    // update stay extension requests
    const extensionRequestsElement = document.getElementById('current-extension');
    if (extensionRequestsElement) {
        extensionRequestsElement.textContent = data.pending_extension_requests || 0;
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

// make dashboard cards clickable to show details
function makeCardsClickable() {
    // total students card
    const studentsCard = document.querySelector('.stat-card:has(#total-students)');
    if (studentsCard) {
        studentsCard.style.cursor = 'pointer';
        studentsCard.addEventListener('click', () => {
            showStudentsDetails();
        });
    }

    // pending payments card
    const paymentsCard = document.querySelector('.stat-card:has(#total-payments)');
    if (paymentsCard) {
        paymentsCard.style.cursor = 'pointer';
        paymentsCard.addEventListener('click', () => {
            showPaymentsDetails();
        });
    }

    // occupied rooms card
    const roomsCard = document.querySelector('.stat-card:has(#total-rooms)');
    if (roomsCard) {
        roomsCard.style.cursor = 'pointer';
        roomsCard.addEventListener('click', () => {
            showRoomsDetails();
        });
    }

    // stay extension requests card
    const extensionCard = document.querySelector('.stat-card:has(#current-extension)');
    if (extensionCard) {
        extensionCard.style.cursor = 'pointer';
        extensionCard.addEventListener('click', () => {
            showExtensionRequestsDetails();
        });
    }
}

// show students details modal
async function showStudentsDetails() {
    try {
        const response = await fetch('/api/students/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const students = data.results || [];
            
            let content = '<h4>Registered Students</h4>';
            if (students.length > 0) {
                content += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
                content += '<tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd;">Name</th><th style="padding: 8px; border: 1px solid #ddd;">ID</th><th style="padding: 8px; border: 1px solid #ddd;">Department</th><th style="padding: 8px; border: 1px solid #ddd;">Year</th></tr>';
                
                students.forEach(student => {
                    content += `<tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${student.user?.first_name || ''} ${student.user?.last_name || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${student.student_id || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${student.department || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${student.year_of_study || ''}</td>
                    </tr>`;
                });
                content += '</table>';
            } else {
                content += '<p>No students registered yet.</p>';
            }
            
            showDetailsModal('Students Details', content);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// show payments details modal
async function showPaymentsDetails() {
    try {
        const response = await fetch('/api/payments/?status=pending', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const payments = data.results || [];
            
            let content = '<h4>Pending Payments</h4>';
            if (payments.length > 0) {
                content += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
                content += '<tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd;">Student</th><th style="padding: 8px; border: 1px solid #ddd;">Amount</th><th style="padding: 8px; border: 1px solid #ddd;">Method</th><th style="padding: 8px; border: 1px solid #ddd;">Date</th></tr>';
                
                payments.forEach(payment => {
                    content += `<tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${payment.student?.user?.first_name || ''} ${payment.student?.user?.last_name || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">PKR ${payment.amount || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${payment.payment_method || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${payment.payment_date || ''}</td>
                    </tr>`;
                });
                content += '</table>';
            } else {
                content += '<p>No pending payments.</p>';
            }
            
            showDetailsModal('Pending Payments', content);
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// show rooms details modal
async function showRoomsDetails() {
    try {
        const response = await fetch('/api/rooms/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const rooms = data.results || [];
            const occupiedRooms = rooms.filter(room => room.occupied > 0);
            
            let content = '<h4>Occupied Rooms</h4>';
            if (occupiedRooms.length > 0) {
                content += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
                content += '<tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd;">Room</th><th style="padding: 8px; border: 1px solid #ddd;">Type</th><th style="padding: 8px; border: 1px solid #ddd;">Occupied</th><th style="padding: 8px; border: 1px solid #ddd;">Capacity</th></tr>';
                
                occupiedRooms.forEach(room => {
                    content += `<tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${room.room_number || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${room.room_type || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${room.occupied || 0}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${room.capacity || ''}</td>
                    </tr>`;
                });
                content += '</table>';
            } else {
                content += '<p>No rooms are currently occupied.</p>';
            }
            
            showDetailsModal('Occupied Rooms', content);
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// show extension requests details modal
async function showExtensionRequestsDetails() {
    try {
        const response = await fetch('/api/stay-extension-requests/?status=pending', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const requests = data.results || [];
            
            let content = '<h4>Pending Stay Extension Requests</h4>';
            if (requests.length > 0) {
                content += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
                content += '<tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd;">Student</th><th style="padding: 8px; border: 1px solid #ddd;">Current Date</th><th style="padding: 8px; border: 1px solid #ddd;">Requested Date</th><th style="padding: 8px; border: 1px solid #ddd;">Reason</th></tr>';
                
                requests.forEach(request => {
                    content += `<tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${request.student?.user?.first_name || ''} ${request.student?.user?.last_name || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${request.current_checkout_date || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${request.requested_checkout_date || ''}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${request.reason || ''}</td>
                    </tr>`;
                });
                content += '</table>';
            } else {
                content += '<p>No pending stay extension requests.</p>';
            }
            
            showDetailsModal('Stay Extension Requests', content);
        }
    } catch (error) {
        console.error('Error loading extension requests:', error);
    }
}

// show details modal
function showDetailsModal(title, content) {
    const modal = document.getElementById('details-modal');
    const titleElement = document.getElementById('details-title');
    const contentElement = document.getElementById('details-content');
    
    if (modal && titleElement && contentElement) {
        titleElement.textContent = title;
        contentElement.innerHTML = content;
        modal.style.display = 'block';
    }
}

// close modal when clicking close button or outside modal
function setupModalClose() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.closeModal');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // close modal when clicking outside
    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// initialize dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // load dashboard statistics
    loadDashboardStats();
    
    // make cards clickable
    makeCardsClickable();
    
    // setup modal close functionality
    setupModalClose();
    
    // refresh dashboard stats every 30 seconds
    setInterval(loadDashboardStats, 30000);
});
