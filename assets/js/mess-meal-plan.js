// mess meal plan functions
let meals = [];

// ensure arrays are always arrays
if (!Array.isArray(meals)) meals = [];

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
    await loadMeals();
    setupEventListeners();
    
    // set today's date as default
    document.getElementById('mess-updated-date').value = new Date().toISOString().split('T')[0];
});

// setup event listeners
function setupEventListeners() {

    // form submission
    const form = document.querySelector('.mess-meal-form');
    if (form) {
        form.addEventListener('submit', handleMealSubmit);
    }
}

// handle meal form submission
async function handleMealSubmit(event) {
    event.preventDefault();

    const day = document.getElementById('mess-day').value;
    const mealType = document.getElementById('mess-meal').value;
    const menu = document.getElementById('mess-description').value;
    const updatedDate = document.getElementById('mess-updated-date').value;

    if (!day || !mealType || !menu || !updatedDate) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch('/api/meals/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                meal_type: mealType.toLowerCase(),
                date: updatedDate,
                menu: menu
            })
        });

        if (response.ok) {
            showNotification('Meal plan updated successfully', 'success');
            event.target.reset();
            document.getElementById('mess-updated-date').value = new Date().toISOString().split('T')[0];
            loadMeals();
        } else {
            const error = await response.json();
            showNotification('Failed to update meal plan: ' + JSON.stringify(error), 'error');
        }
    } catch (error) {
        console.error('Error updating meal plan:', error);
        showNotification('Error updating meal plan', 'error');
    }
}

// load meals from API
async function loadMeals() {
    try {
        const response = await fetch('/api/meals/');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw meals data:', data);

            // handle response - check for results array
            if (data.results && Array.isArray(data.results)) {
                meals = data.results;
            } else if (Array.isArray(data)) {
                meals = data;
            } else {
                meals = [];
                console.error('Unexpected meals data structure:', data);
            }
            console.log('Loaded meals:', meals.length);
            renderMeals();
        } else {
            console.error('Failed to load meals, status:', response.status);
            showNotification('Failed to load meals', 'error');
            meals = [];
        }
    } catch (error) {
        console.error('Error loading meals:', error);
        showNotification('Error loading meals', 'error');
        meals = [];
    }
}

// render meals in the table
function renderMeals() {
    const tbody = document.getElementById('meals-tbody');
    if (!tbody) {
        console.error('Meals tbody not found');
        return;
    }

    // ensure meals is an array using the safety function
    meals = ensureArray(meals, 'meals');
    console.log('Rendering meals with', meals.length, 'meals');

    if (meals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No meals found</td></tr>';
        return;
    }

    let html = '';
    meals.forEach(meal => {
        const dayName = getDayName(meal.date);
        const updatedBy = meal.prepared_by ? 
            `${meal.prepared_by.first_name} ${meal.prepared_by.last_name}` : 'Mess Staff';
        
        html += `
            <tr>
                <td>${dayName}</td>
                <td>${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}</td>
                <td>${meal.menu}</td>
                <td>${new Date(meal.date).toLocaleDateString()}</td>
                <td>${updatedBy}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editMeal(${meal.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMeal(${meal.id})">Delete</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// get day name from date
function getDayName(dateString) {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

// Edit meal
async function editMeal(mealId) {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    // populate form with meal data
    document.getElementById('mess-day').value = getDayName(meal.date);
    document.getElementById('mess-meal').value = meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1);
    document.getElementById('mess-description').value = meal.menu;
    document.getElementById('mess-updated-date').value = meal.date;

    // change form submission to update instead of create
    const form = document.querySelector('.mess-meal-form');
    form.dataset.editId = mealId;
    
    // change button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Meal';
    
    showNotification('Meal loaded for editing. Update and submit to save changes.', 'info');
}

// delete meal
async function deleteMeal(mealId) {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
        const response = await fetch(`/api/meals/${mealId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            showNotification('Meal deleted successfully', 'success');
            loadMeals();
        } else {
            showNotification('Failed to delete meal', 'error');
        }
    } catch (error) {
        console.error('Error deleting meal:', error);
        showNotification('Error deleting meal', 'error');
    }
}

// det CSRF token
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
