// admin settings management functions

let settingsData = {};

// load and display current settings
async function loadSettings() {
    try {
        const response = await fetch('/api/system-settings/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            settingsData = data;
            populateSettingsForm(data);
        } else {
            console.error('Failed to load settings');
            showNotification('Failed to load settings', 'error');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Error loading settings', 'error');
    }
}

// populate settings form with current values
function populateSettingsForm(settings) {
    document.getElementById('hostel-name').value = settings.hostel_name || '';
    document.getElementById('hostel-address').value = settings.hostel_address || '';
    document.getElementById('hostel-contact').value = settings.contact_number || '';
}

// save settings
async function saveSettings() {
    const formData = {
        hostel_name: document.getElementById('hostel-name').value,
        hostel_address: document.getElementById('hostel-address').value,
        contact_number: document.getElementById('hostel-contact').value
    };

    // validate required fields
    if (!formData.hostel_name.trim()) {
        showNotification('Hostel name is required', 'error');
        return;
    }

    if (!formData.hostel_address.trim()) {
        showNotification('Hostel address is required', 'error');
        return;
    }

    if (!formData.contact_number.trim()) {
        showNotification('Contact number is required', 'error');
        return;
    }

    try {
        const response = await fetch('/api/system-settings/1/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Settings saved successfully', 'success');
            settingsData = result.settings;
            
            // update the logo text if it exists
            const logoElement = document.querySelector('.logo span');
            if (logoElement) {
                logoElement.textContent = formData.hostel_name;
            }
        } else {
            const error = await response.json();
            showNotification(`Failed to save settings: ${error.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
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

// initialize settings functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial settings
    loadSettings();

    // save settings button
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    }
});
