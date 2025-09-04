// mess dashboard functions
let dashboardStats = {};

// ensure dashboardStats is always an object
if (typeof dashboardStats !== 'object' || dashboardStats === null) {
    dashboardStats = {};
}

// global safety function to ensure object
function ensureObject(obj, name = 'object') {
    if (typeof obj !== 'object' || obj === null) {
        console.error(`${name} is not an object:`, obj);
        return {};
    }
    return obj;
}

// load dashboard data on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadDashboardStats();
});

// load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/mess-dashboard/');
        if (response.ok) {
            const data = await response.json();
            console.log('Raw dashboard data:', data);
            console.log('Data type:', typeof data);
            console.log('Is object:', typeof data === 'object' && data !== null);
            
            // handle paginated response - check for results array
            if (data && data.results && Array.isArray(data.results)) {

                // take first result if it's an array
                dashboardStats = data.results[0] || {}; 
                console.log('Using data.results[0]');
            } else if (typeof data === 'object' && data !== null) {
                dashboardStats = data;
                console.log('Using data directly');
            } else {
                dashboardStats = {};
                console.error('Unexpected dashboard data structure:', data);
            }
            
            console.log('Final dashboard stats:', dashboardStats);
            console.log('Dashboard stats type:', typeof dashboardStats);
            updateDashboardCards();
        } else {
            console.error('Failed to load dashboard stats, status:', response.status);
            showNotification('Failed to load dashboard statistics', 'error');
            dashboardStats = {};
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error loading dashboard statistics', 'error');
        dashboardStats = {};
    }
}

// update dashboard cards with real-time data
function updateDashboardCards() {

    // ensure dashboardStats is an object
    dashboardStats = ensureObject(dashboardStats, 'dashboardStats');
    
    console.log('Updating dashboard cards with:', dashboardStats);
    
    // update total feedback count
    const totalFeedbackElement = document.getElementById('total-feedback');
    if (totalFeedbackElement) {
        totalFeedbackElement.textContent = dashboardStats.total_feedback || 0;
    }

    // update food shortage reports count
    const totalShortageElement = document.getElementById('total-shortage');
    if (totalShortageElement) {
        totalShortageElement.textContent = dashboardStats.food_shortage_reports || 0;
    }

    // update meal plan status
    const mealPlanStatusElement = document.getElementById('meal-plan-status');
    if (mealPlanStatusElement) {
        const status = dashboardStats.meal_plan_updated ? 'Updated' : 'Not Updated';
        mealPlanStatusElement.textContent = status;
        mealPlanStatusElement.className = dashboardStats.meal_plan_updated ? 'status-updated' : 'status-not-updated';
    }
}

// open student feedback tab
function openStudentFeedbackTab() {
    const feedbackTab = document.querySelector('[data-tab="student-feedback"]');
    if (feedbackTab) {
        feedbackTab.click();
    } else {

        // fallback: navigate to feedback page
        window.location.href = '/mess-dashboard/meal-feedback.html';
    }
}

// open food shortage tab
function openFoodShortageTab() {
    const shortageTab = document.querySelector('[data-tab="food-shortage"]');
    if (shortageTab) {
        shortageTab.click();
    } else {

        // fallback: navigate to food shortage page
        window.location.href = '/mess-dashboard/food-shortage.html';
    }
}

// open meal plan tab
function openMealPlanTab() {
    const mealPlanTab = document.querySelector('[data-tab="meal-plan"]');
    if (mealPlanTab) {
        mealPlanTab.click();
    } else {

        // fallback: navigate to meal plan page
        window.location.href = '/mess-dashboard/meal-plan.html';
    }
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
