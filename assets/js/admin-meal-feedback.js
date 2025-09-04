// admin meal menu & feedback management functions

let mealsData = [];
let feedbackData = [];

// load and display meals
async function loadMeals() {
    try {
        const response = await fetch('/api/meals/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            mealsData = data.results || [];
            renderMealsTable(mealsData);
        } else {
            console.error('Failed to load meals');
            showNotification('Failed to load meals', 'error');
        }
    } catch (error) {
        console.error('Error loading meals:', error);
        showNotification('Error loading meals', 'error');
    }
}

// load and display meal feedback
async function loadMealFeedback() {
    try {
        const response = await fetch('/api/meal-feedback/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            feedbackData = data.results || [];
            renderFeedbackTable(feedbackData);
        } else {
            console.error('Failed to load meal feedback');
            showNotification('Failed to load meal feedback', 'error');
        }
    } catch (error) {
        console.error('Error loading meal feedback:', error);
        showNotification('Error loading meal feedback', 'error');
    }
}

// render meals table
function renderMealsTable(meals) {
    const tbody = document.querySelector('#meal-table tbody');
    if (!tbody) return;

    if (meals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No meals available</td></tr>';
        return;
    }

    let html = '';
    meals.forEach(meal => {
        const dayName = new Date(meal.date).toLocaleDateString('en-US', { weekday: 'long' });
        
        html += `
            <tr>
                <td>${dayName}</td>
                <td>${meal.meal_type}</td>
                <td>${meal.menu}</td>
                <td>${meal.prepared_by ? meal.prepared_by.first_name + ' ' + meal.prepared_by.last_name : 'N/A'}</td>
                <td>${new Date(meal.updated_at).toLocaleDateString()}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// render feedback table
function renderFeedbackTable(feedbacks) {
    const tbody = document.querySelector('#meal-feedback tbody');
    if (!tbody) return;

    if (feedbacks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No feedback available</td></tr>';
        return;
    }

    let html = '';
    feedbacks.forEach(feedback => {
        const dayName = new Date(feedback.meal.date).toLocaleDateString('en-US', { weekday: 'long' });
        const ratingStars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
        
        html += `
            <tr>
                <td>${dayName}</td>
                <td>${feedback.meal.meal_type}</td>
                <td>${feedback.student.user.first_name} ${feedback.student.user.last_name}</td>
                <td>
                    <div>Rating: ${ratingStars} (${feedback.rating}/5)</div>
                    <div>${feedback.feedback_text}</div>
                </td>
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

// initialize meal menu and feedback functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial data
    loadMeals();
    loadMealFeedback();
});
