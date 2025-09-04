// mess student feedback functions
let mealFeedback = [];

// ensure arrays are always arrays
if (!Array.isArray(mealFeedback)) mealFeedback = [];

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
    await loadMealFeedback();
});

// load meal feedback from API
async function loadMealFeedback() {
    try {
        const response = await fetch('/api/meal-feedback/');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw meal feedback data:', data);

            // handle response - check for results array
            if (data.results && Array.isArray(data.results)) {
                mealFeedback = data.results;
            } else if (Array.isArray(data)) {
                mealFeedback = data;
            } else {
                mealFeedback = [];
                console.error('Unexpected meal feedback data structure:', data);
            }
            console.log('Loaded meal feedback:', mealFeedback.length);
            renderMealFeedback();
        } else {
            console.error('Failed to load meal feedback, status:', response.status);
            showNotification('Failed to load meal feedback', 'error');
            mealFeedback = [];
        }
    } catch (error) {
        console.error('Error loading meal feedback:', error);
        showNotification('Error loading meal feedback', 'error');
        mealFeedback = [];
    }
}

// render meal feedback in the table
function renderMealFeedback() {
    const tbody = document.getElementById('feedback-tbody');
    if (!tbody) {
        console.error('Feedback tbody not found');
        return;
    }

    // ensure mealFeedback is an array using the safety function
    mealFeedback = ensureArray(mealFeedback, 'mealFeedback');
    console.log('Rendering meal feedback with', mealFeedback.length, 'items');

    if (mealFeedback.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No meal feedback found</td></tr>';
        return;
    }

    let html = '';
    mealFeedback.forEach(feedback => {
        const studentName = feedback.student && feedback.student.user ? 
            `${feedback.student.user.first_name} ${feedback.student.user.last_name}` : 'Unknown Student';
        const studentId = feedback.student && feedback.student.student_id ? 
            feedback.student.student_id : 'Unknown ID';
        const mealDate = feedback.meal && feedback.meal.date ? 
            new Date(feedback.meal.date).toLocaleDateString() : 'Unknown Date';
        const mealType = feedback.meal && feedback.meal.meal_type ? 
            feedback.meal.meal_type.charAt(0).toUpperCase() + feedback.meal.meal_type.slice(1) : 'Unknown';
        const rating = getRatingStars(feedback.rating || 0);
        const submittedOn = feedback.created_at ? 
            new Date(feedback.created_at).toLocaleDateString() : 'Unknown';
        
        html += `
            <tr>
                <td>${studentName}</td>
                <td>${studentId}</td>
                <td>${mealDate}</td>
                <td>${mealType}</td>
                <td>${rating}</td>
                <td>${feedback.feedback_text || 'No feedback text'}</td>
                <td>${submittedOn}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// get rating stars
function getRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fa-solid fa-star" style="color: #ffc107;"></i>';
        } else {
            stars += '<i class="fa-regular fa-star" style="color: #ccc;"></i>';
        }
    }
    return stars;
}

// get CSRF token
function getCSRFToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
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
