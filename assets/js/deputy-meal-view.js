// deputy RT meal menu report 
let meals = [];
let feedback = [];

// ensure arrays are always arrays
if (!Array.isArray(meals)) meals = [];
if (!Array.isArray(feedback)) feedback = [];

// global safety function to ensure array
function ensureArray(arr, name = 'array') {
    if (!Array.isArray(arr)) {
        console.error(`${name} is not an array:`, arr);
        return [];
    }
    return arr;
}

// load meal menus and feedback on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadMeals();
    await loadFeedback();
});

// load meal menus from API
async function loadMeals() {
    try {
        const response = await fetch('/api/meals/');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw meals data:', data);
            console.log('Data type:', typeof data);
            console.log('Is array:', Array.isArray(data));
            console.log('Has results:', data && data.results);
            console.log('Results type:', typeof data.results);
            console.log('Results is array:', Array.isArray(data.results));
            
            // Handle paginated response - check for results array
            if (data && data.results && Array.isArray(data.results)) {
                meals = data.results;
            } else if (Array.isArray(data)) {
                meals = data;
            } else {
                meals = [];
                console.error('Unexpected meals data structure:', data);
            }
            console.log('Loaded meals:', meals.length);
            renderMealsTable();
        } else {
            console.error('Failed to load meals, status:', response.status);
            showNotification('Failed to load meal menus', 'error');
            meals = [];
        }
    } catch (error) {
        console.error('Error loading meals:', error);
        showNotification('Error loading meal menus', 'error');
        meals = [];
    }
}

// load meal feedback from API
async function loadFeedback() {
    try {
        const response = await fetch('/api/meal-feedback/');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw feedback data:', data);

            // handle paginated response - check for results array
            if (data.results && Array.isArray(data.results)) {
                feedback = data.results;
            } else if (Array.isArray(data)) {
                feedback = data;
            } else {
                feedback = [];
                console.error('Unexpected feedback data structure:', data);
            }
            console.log('Loaded feedback:', feedback.length);
            renderFeedbackTable();
        } else {
            console.error('Failed to load feedback, status:', response.status);
            showNotification('Failed to load meal feedback', 'error');
            feedback = [];
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        showNotification('Error loading meal feedback', 'error');
        feedback = [];
    }
}

// render meal menus table
function renderMealsTable() {
    const tbody = document.getElementById('meal-menu-tbody');
    if (!tbody) {
        console.error('Meal menu tbody not found');
        return;
    }

    tbody.innerHTML = '';

    // ensure meals is an array using the safety function
    meals = ensureArray(meals, 'meals');
    console.log('Rendering meals table with', meals.length, 'meals');

    if (meals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No meal menus found</td></tr>';
        return;
    }

    meals.forEach(meal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meal.week_start_date}</td>
            <td>${meal.breakfast_menu || 'Not specified'}</td>
            <td>${meal.lunch_menu || 'Not specified'}</td>
            <td>${meal.dinner_menu || 'Not specified'}</td>
            <td>${meal.updated_at ? new Date(meal.updated_at).toLocaleDateString() : 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

// render feedback table
function renderFeedbackTable() {
    const tbody = document.getElementById('meal-feedback-tbody');
    if (!tbody) {
        console.error('Meal feedback tbody not found');
        return;
    }

    tbody.innerHTML = '';

    // ensure feedback is an array using the safety function
    feedback = ensureArray(feedback, 'feedback');
    console.log('Rendering feedback table with', feedback.length, 'feedback items');

    if (feedback.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No feedback found</td></tr>';
        return;
    }

    feedback.forEach(feedbackItem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${feedbackItem.student_name || 'Unknown Student'}</td>
            <td>${feedbackItem.meal_type}</td>
            <td>${feedbackItem.rating}/5</td>
            <td>${feedbackItem.comment || 'No comment'}</td>
            <td>${feedbackItem.created_at ? new Date(feedbackItem.created_at).toLocaleDateString() : 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

// get CSRF token for API requests
function getCSRFToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

// show notification
function showNotification(message, type = 'info') {
    // create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // add to page
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(notification, container.firstChild);

    // auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
