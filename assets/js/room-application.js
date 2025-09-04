// room application functions
let studentData = {};

// load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStudentData();
    setupEventListeners();
});

// load student data
async function loadStudentData() {
    try {
        const response = await fetch('/api/students/me/', {
            credentials: 'include'
        });
        if (response.ok) {
            studentData = await response.json();
        } else {
            showNotification('Failed to load student data', 'error');
        }
    } catch (error) {
        console.error('Error loading student data:', error);
        showNotification('Error loading student data', 'error');
    }
}

// setup event listeners
function setupEventListeners() {
    const form = document.getElementById('roomApplicationForm');
    const paymentMethod = document.getElementById('paymentMethod');
    const paymentInfo = document.getElementById('paymentInfo');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            showPaymentInfo(this.value);
        });
    }
}

// show payment information when method is selected
function showPaymentInfo(method) {
    const paymentInfo = document.getElementById('paymentInfo');
    
    const paymentNumbers = {
        easypaisa: '0300-1234567',
        jazzcash: '0311-7654321',
        ubl: 'UBL Account: 0123456789'
    };

    if (method && paymentNumbers[method]) {
        paymentInfo.style.display = 'block';
        paymentInfo.innerHTML = `
            <div class="payment-info">
                <i class="fa-solid fa-info-circle"></i>
                Send your payment to: <strong>${paymentNumbers[method]}</strong>
                <br>
                <small>Please keep your payment receipt for verification.</small>
            </div>
        `;
    } else {
        paymentInfo.style.display = 'none';
        paymentInfo.innerHTML = '';
    }
}

// handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    const roomType = document.getElementById('roomType').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const transactionId = document.getElementById('transactionId').value;
    const screenshot = document.getElementById('screenshot').files[0];

    if (!roomType || !paymentMethod || !transactionId || !screenshot) {
        showNotification('Please fill in all fields', 'error');
      return;
    }

    // validate file size (max 5MB)
    if (screenshot.size > 5 * 1024 * 1024) {
        showNotification('Screenshot file size must be less than 5MB', 'error');
      return;
    }

    // validate file type
    if (!screenshot.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
      return;
    }

    try {

        // create FormData for file upload
        const formData = new FormData();
        formData.append('room_type', roomType);
        formData.append('payment_method', paymentMethod);
        formData.append('transaction_id', transactionId);
        formData.append('payment_screenshot', screenshot);

        const response = await fetch('/api/room-applications/', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Room application submitted successfully! Payment will be verified by admin.', 'success');
            
            // reset form
            event.target.reset();
            document.getElementById('paymentInfo').style.display = 'none';
            
            // show confirmation message
            const confirmationMsg = document.getElementById('confirmationMsg');
            if (confirmationMsg) {
                confirmationMsg.textContent = 'Your application has been submitted. Payment will be verified by admin.';
                confirmationMsg.style.display = 'block';
                
                // hide confirmation after 5 seconds
                setTimeout(() => {
                    confirmationMsg.style.display = 'none';
                }, 5000);
            }
        } else {
            const error = await response.json();
            showNotification('Failed to submit application: ' + JSON.stringify(error), 'error');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('Error submitting application', 'error');
    }
}

// get CSRF token
function getCSRFToken() {

    // first try to get from hidden input
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    if (token) {
        return token.value;
    }
    
    // if not found, try to get from cookie
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.apply-room') || document.body;
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
