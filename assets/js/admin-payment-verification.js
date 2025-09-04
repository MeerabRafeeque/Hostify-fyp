// admin payment verification functions

let paymentsData = [];
let studentsData = [];

// load and display payments
async function loadPayments() {
    try {
        const response = await fetch('/api/payments/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            paymentsData = data.results || [];
            renderPaymentsTable(paymentsData);
        } else {
            console.error('Failed to load payments');
            showNotification('Failed to load payments', 'error');
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        showNotification('Error loading payments', 'error');
    }
}

// load students for payment form
async function loadStudents() {
    try {
        const response = await fetch('/api/students/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            studentsData = data.results || [];
            populateStudentSelect();
        } else {
            console.error('Failed to load students');
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// populate student select dropdown
function populateStudentSelect() {
    const studentSelect = document.getElementById('payment-student');
    if (!studentSelect) return;

    studentSelect.innerHTML = '<option value="">Select Student</option>';
    studentsData.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.user?.first_name} ${student.user?.last_name} (${student.student_id})`;
        studentSelect.appendChild(option);
    });
}

// render payments table
function renderPaymentsTable(payments) {
    const tbody = document.querySelector('#payment-table tbody');
    if (!tbody) return;

    let html = '';
    payments.forEach(payment => {
        const statusClass = getStatusClass(payment.status);
        const statusText = payment.status.charAt(0).toUpperCase() + payment.status.slice(1);
        
        html += `
            <tr data-payment-id="${payment.id}">
                <td>${payment.id}</td>
                <td>${payment.student?.user?.first_name || ''} ${payment.student?.user?.last_name || ''}</td>
                <td>${payment.student?.student_id || 'N/A'}</td>
                <td>PKR ${payment.amount}</td>
                <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                <td>${payment.payment_method}</td>
                <td>${payment.description || 'N/A'}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${payment.status === 'pending' ? `
                            <button onclick="viewPaymentDetails(${payment.id})" class="btn btn-sm btn-info">View</button>
                            <button onclick="verifyPayment(${payment.id})" class="btn btn-sm btn-success">Verify</button>
                            <button onclick="showRejectionModal(${payment.id})" class="btn btn-sm btn-danger">Reject</button>
                        ` : `
                            <button onclick="viewPaymentDetails(${payment.id})" class="btn btn-sm btn-info">View</button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'verified':
            return 'verified';
        case 'rejected':
            return 'rejected';
        case 'pending':
            return 'pending';
        default:
            return 'unknown';
    }
}

// view payment details
async function viewPaymentDetails(paymentId) {
    try {
        const response = await fetch(`/api/payments/${paymentId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const payment = await response.json();
            showPaymentDetailsModal(payment);
        } else {
            showNotification('Failed to load payment details', 'error');
        }
    } catch (error) {
        console.error('Error loading payment details:', error);
        showNotification('Error loading payment details', 'error');
    }
}

// show payment details modal
function showPaymentDetailsModal(payment) {
    const modal = document.getElementById('payment-details-modal');
    const content = document.getElementById('payment-details-content');
    
    const statusClass = getStatusClass(payment.status);
    const statusText = payment.status.charAt(0).toUpperCase() + payment.status.slice(1);
    
    content.innerHTML = `
        <div class="payment-details">
            <div class="detail-row">
                <strong>Payment ID:</strong> ${payment.id}
            </div>
            <div class="detail-row">
                <strong>Student:</strong> ${payment.student?.user?.first_name || ''} ${payment.student?.user?.last_name || ''}
            </div>
            <div class="detail-row">
                <strong>Student ID:</strong> ${payment.student?.student_id || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Amount:</strong> PKR ${payment.amount}
            </div>
            <div class="detail-row">
                <strong>Payment Date:</strong> ${new Date(payment.payment_date).toLocaleDateString()}
            </div>
            <div class="detail-row">
                <strong>Payment Method:</strong> ${payment.payment_method}
            </div>
            <div class="detail-row">
                <strong>Transaction ID:</strong> ${payment.transaction_id || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Description:</strong> ${payment.description || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            ${payment.verified_by ? `
                <div class="detail-row">
                    <strong>Verified By:</strong> ${payment.verified_by?.first_name || ''} ${payment.verified_by?.last_name || ''}
                </div>
                <div class="detail-row">
                    <strong>Verified At:</strong> ${new Date(payment.verified_at).toLocaleString()}
                </div>
            ` : ''}
            ${payment.reject_reason ? `
                <div class="detail-row">
                    <strong>Rejection Reason:</strong> ${payment.reject_reason}
                </div>
            ` : ''}
            ${payment.screenshot ? `
                <div class="detail-row">
                    <strong>Screenshot:</strong>
                    <img src="${payment.screenshot}" alt="Payment Screenshot" style="max-width: 200px; margin-top: 10px;">
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// verify payment
async function verifyPayment(paymentId) {
    if (confirm('Are you sure you want to verify this payment?')) {
        try {
            const response = await fetch(`/api/payments/${paymentId}/verify_payment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({
                    status: 'verified'
                })
            });

            if (response.ok) {
                showNotification('Payment verified successfully', 'success');
                loadPayments();
            } else {
                const error = await response.json();
                showNotification(`Failed to verify payment: ${error.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            showNotification('Error verifying payment', 'error');
        }
    }
}

// show rejection modal
async function showRejectionModal(paymentId) {
    try {
        const response = await fetch(`/api/payments/${paymentId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const payment = await response.json();
            
            document.getElementById('rejection-payment-id').value = paymentId;
            document.getElementById('rejection-student-name').value = `${payment.student?.user?.first_name || ''} ${payment.student?.user?.last_name || ''}`;
            document.getElementById('rejection-amount').value = `PKR ${payment.amount}`;
            document.getElementById('rejection-reason').value = '';
            
            document.getElementById('rejection-modal').style.display = 'block';
        } else {
            showNotification('Failed to load payment details', 'error');
        }
    } catch (error) {
        console.error('Error loading payment details:', error);
        showNotification('Error loading payment details', 'error');
    }
}

// reject payment
async function rejectPayment(paymentId, reason) {
    try {
        const response = await fetch(`/api/payments/${paymentId}/verify_payment/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                status: 'rejected',
                reject_reason: reason
            })
        });

        if (response.ok) {
            showNotification('Payment rejected successfully', 'success');
            document.getElementById('rejection-modal').style.display = 'none';
            loadPayments();
        } else {
            const error = await response.json();
            showNotification(`Failed to reject payment: ${error.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error rejecting payment:', error);
        showNotification('Error rejecting payment', 'error');
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

// initialize payment verification functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial data
    loadPayments();
    loadStudents();

    // add payment button
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', () => {
            document.getElementById('add-payment-modal').style.display = 'block';
        });
    }

    // add payment form submission
    const addPaymentForm = document.getElementById('add-payment-form');
    if (addPaymentForm) {
        addPaymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                student: document.getElementById('payment-student').value,
                amount: document.getElementById('payment-amount').value,
                payment_date: document.getElementById('payment-date').value,
                payment_method: document.getElementById('payment-method').value,
                transaction_id: document.getElementById('payment-transaction').value,
                description: document.getElementById('payment-description').value,
                status: 'pending'
            };

            try {
                const response = await fetch('/api/payments/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Payment recorded successfully', 'success');
                    document.getElementById('add-payment-modal').style.display = 'none';
                    addPaymentForm.reset();
                    loadPayments();
                } else {
                    const error = await response.json();
                    showNotification(`Failed to record payment: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error recording payment:', error);
                showNotification('Error recording payment', 'error');
            }
        });
    }

    // rejection form submission
    const rejectionForm = document.getElementById('rejection-form');
    if (rejectionForm) {
        rejectionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const paymentId = document.getElementById('rejection-payment-id').value;
            const reason = document.getElementById('rejection-reason').value;

            if (!reason.trim()) {
                showNotification('Please provide a rejection reason', 'warning');
                return;
            }

            await rejectPayment(paymentId, reason);
        });
    }

    // filter functionality
    const statusFilter = document.getElementById('payment-status-filter');
    const methodFilter = document.getElementById('payment-method-filter');
    const dateFromFilter = document.getElementById('payment-date-from');
    const dateToFilter = document.getElementById('payment-date-to');

    [statusFilter, methodFilter, dateFromFilter, dateToFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });

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

// apply filters to payments table
function applyFilters() {
    const statusFilter = document.getElementById('payment-status-filter').value;
    const methodFilter = document.getElementById('payment-method-filter').value;
    const dateFromFilter = document.getElementById('payment-date-from').value;
    const dateToFilter = document.getElementById('payment-date-to').value;

    let filteredPayments = paymentsData;

    if (statusFilter) {
        filteredPayments = filteredPayments.filter(payment => payment.status === statusFilter);
    }

    if (methodFilter) {
        filteredPayments = filteredPayments.filter(payment => payment.payment_method === methodFilter);
    }

    if (dateFromFilter) {
        filteredPayments = filteredPayments.filter(payment => payment.payment_date >= dateFromFilter);
    }

    if (dateToFilter) {
        filteredPayments = filteredPayments.filter(payment => payment.payment_date <= dateToFilter);
    }

    renderPaymentsTable(filteredPayments);
}
