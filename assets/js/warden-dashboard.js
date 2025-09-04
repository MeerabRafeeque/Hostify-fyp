// warden dashboard functions
document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        await loadDashboardData();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

async function loadDashboardData() {
    try {
        const response = await fetch('/api/warden-dashboard/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        updateDashboardDisplay(data);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
    }
}

function updateDashboardDisplay(data) {

    // update complaint count
    const totalComplaintsEl = document.getElementById("total-current-complaints");
    if (totalComplaintsEl) {
        totalComplaintsEl.textContent = data.current_complaints || 0;
    }
    
    // update room allocation count
    const totalRoomsEl = document.getElementById("total-room-allocations");
    if (totalRoomsEl) {
        totalRoomsEl.textContent = data.current_room_allocations || 0;
    }
}

function setupEventListeners() {
    const complaintCard = document.querySelector(".warden-stat-card:nth-child(1)");
    const roomCard = document.querySelector(".warden-stat-card:nth-child(2)");

    if (complaintCard) {
        complaintCard.addEventListener("click", () => {
            window.location.href = "studentComplaintsFeedback.html";
        });
    }

    if (roomCard) {
        roomCard.addEventListener("click", () => {
            window.location.href = "roomAllocation.html";
        });
    }
}

function showNotification(message, type = 'info') {

    // create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // add to page
    document.body.appendChild(notification);
    
    // auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
