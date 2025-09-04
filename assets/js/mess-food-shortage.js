// mess Food Shortage Functions
let foodShortages = [];

// ensure arrays are always arrays
if (!Array.isArray(foodShortages)) foodShortages = [];

// global safety function to ensure array
function ensureArray(arr, name = 'array') {
    if (!Array.isArray(arr)) {
        console.error(`${name} is not an array:`, arr);
        return [];
    }
    return arr;
}

// load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadFoodShortages();
    setupEventListeners();
    
    // set today's date as default
    document.getElementById('mess-shortage-date').value = new Date().toISOString().split('T')[0];
});

// setup event listeners
function setupEventListeners() {
    
    // form submission
    const form = document.getElementById('mess-shortage-form');
    if (form) {
        form.addEventListener('submit', handleShortageSubmit);
    }
}

// handle food shortage form submission
async function handleShortageSubmit(event) {
    event.preventDefault();

    const mealType = document.getElementById('mess-meal-type').value;
    const date = document.getElementById('mess-shortage-date').value;
    const description = document.getElementById('mess-shortage-description').value;

    if (!mealType || !date || !description) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch('/api/food-shortages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                meal_type: mealType,
                date: date,
                description: description
            })
        });

        if (response.ok) {
            showNotification('Food shortage report submitted successfully', 'success');
            event.target.reset();
            document.getElementById('mess-shortage-date').value = new Date().toISOString().split('T')[0];
            loadFoodShortages();
        } else {
            const error = await response.json();
            showNotification('Failed to submit report: ' + JSON.stringify(error), 'error');
        }
    } catch (error) {
        console.error('Error submitting food shortage report:', error);
        showNotification('Error submitting food shortage report', 'error');
    }
}

// load food shortages from API
async function loadFoodShortages() {
    try {
        const response = await fetch('/api/food-shortages/');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw food shortages data:', data);

            // handle response - check for results array
            if (data.results && Array.isArray(data.results)) {
                foodShortages = data.results;
            } else if (Array.isArray(data)) {
                foodShortages = data;
            } else {
                foodShortages = [];
                console.error('Unexpected food shortages data structure:', data);
            }
            console.log('Loaded food shortages:', foodShortages.length);
            renderFoodShortages();
        } else {
            console.error('Failed to load food shortages, status:', response.status);
            showNotification('Failed to load food shortage reports', 'error');
            foodShortages = [];
        }
    } catch (error) {
        console.error('Error loading food shortages:', error);
        showNotification('Error loading food shortage reports', 'error');
        foodShortages = [];
    }
}

// render food shortages in the table
function renderFoodShortages() {
    const tbody = document.getElementById('shortage-reports-tbody');
    if (!tbody) {
        console.error('Shortage reports tbody not found');
        return;
    }

    // ensure foodShortages is an array using the safety function
    foodShortages = ensureArray(foodShortages, 'foodShortages');
    console.log('Rendering food shortages with', foodShortages.length, 'reports');

    if (foodShortages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No food shortage reports found</td></tr>';
        return;
    }

    let html = '';
    foodShortages.forEach(shortage => {
        const statusClass = getStatusClass(shortage.status);
        const reportedBy = shortage.reported_by ? 
            `${shortage.reported_by.first_name} ${shortage.reported_by.last_name}` : 'Mess Staff';
        const resolvedBy = shortage.resolved_by ? 
            `${shortage.resolved_by.first_name} ${shortage.resolved_by.last_name}` : 'N/A';
        
        html += `
            <tr>
                <td>${new Date(shortage.date).toLocaleDateString()}</td>
                <td>${shortage.meal_type}</td>
                <td>${shortage.description}</td>
                <td><span class="status ${statusClass}">${shortage.status}</span></td>
                <td>${reportedBy}</td>
                <td>${resolvedBy}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'pending';
        case 'acknowledged':
            return 'acknowledged';
        case 'resolved':
            return 'resolved';
        default:
            return 'pending';
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

// show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.mess-container') || document.body;
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
