// admin room management functions

let roomsData = [];

// load and display rooms
async function loadRooms() {
    try {
        const response = await fetch('/api/rooms/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            roomsData = data.results || [];
            renderRoomsTable(roomsData);
        } else {
            console.error('Failed to load rooms');
            showNotification('Failed to load rooms', 'error');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        showNotification('Error loading rooms', 'error');
    }
}

// render rooms table
function renderRoomsTable(rooms) {
    const tbody = document.querySelector('#room-table tbody');
    if (!tbody) return;

    let html = '';
    rooms.forEach(room => {
        const statusClass = getRoomStatusClass(room.is_available);
        const statusText = room.is_available ? 'Available' : 'Occupied';
        
        html += `
            <tr data-room-id="${room.id}">
                <td>${room.room_number}</td>
                <td>${room.room_type}</td>
                <td>${room.capacity}</td>
                <td>${room.occupied}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewRoom(${room.id})" class="btn btn-sm btn-info">View</button>
                        <button onclick="editRoom(${room.id})" class="btn btn-sm btn-warning">Update</button>
                        <button onclick="deleteRoom(${room.id})" class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// get room status class for styling
function getRoomStatusClass(isAvailable) {
    return isAvailable ? 'available' : 'occupied';
}

// view room details
async function viewRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const room = await response.json();
            showRoomDetailsModal(room);
        } else {
            showNotification('Failed to load room details', 'error');
        }
    } catch (error) {
        console.error('Error loading room details:', error);
        showNotification('Error loading room details', 'error');
    }
}

// show room details modal
function showRoomDetailsModal(room) {
    const modal = document.getElementById('details-modal');
    const content = document.getElementById('details-content');
    const title = document.getElementById('details-title');
    
    title.textContent = 'Room Details';
    
    const statusClass = getRoomStatusClass(room.is_available);
    const statusText = room.is_available ? 'Available' : 'Occupied';
    
    content.innerHTML = `
        <div class="room-details">
            <div class="detail-row">
                <strong>Room Number:</strong> ${room.room_number}
            </div>
            <div class="detail-row">
                <strong>Floor:</strong> ${room.floor || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Room Type:</strong> ${room.room_type}
            </div>
            <div class="detail-row">
                <strong>Capacity:</strong> ${room.capacity}
            </div>
            <div class="detail-row">
                <strong>Occupied:</strong> ${room.occupied}
            </div>
            <div class="detail-row">
                <strong>Price per Month:</strong> PKR ${room.price_per_month || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="detail-row">
                <strong>Created At:</strong> ${new Date(room.created_at).toLocaleDateString()}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// edit room
async function editRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const room = await response.json();
            populateEditRoomForm(room);
            document.getElementById('edit-room-modal').style.display = 'block';
        } else {
            showNotification('Failed to load room details', 'error');
        }
    } catch (error) {
        console.error('Error loading room details:', error);
        showNotification('Error loading room details', 'error');
    }
}

// populate edit room form
function populateEditRoomForm(room) {
    document.getElementById('edit-room-id').value = room.id;
    document.getElementById('edit-room-number').value = room.room_number;
    document.getElementById('edit-floor-number').value = room.floor || '';
    document.getElementById('edit-room-type').value = room.room_type;
    document.getElementById('edit-room-capacity').value = room.capacity;
    document.getElementById('edit-room-price').value = room.price_per_month || '';
    document.getElementById('edit-room-status').value = room.is_available ? 'Available' : 'Under Maintenance';
}

// delete room
async function deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room?')) {
        try {
            const response = await fetch(`/api/rooms/${roomId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                }
            });

            if (response.ok) {
                showNotification('Room deleted successfully', 'success');
                loadRooms();
            } else {
                const error = await response.json();
                showNotification(`Failed to delete room: ${error.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            showNotification('Error deleting room', 'error');
        }
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

// initialize room management functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial data
    loadRooms();

    // add room button
    const addRoomBtn = document.getElementById('add-room-btn');
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', () => {
            document.getElementById('add-room-modal').style.display = 'block';
        });
    }

    // add room form submission
    const addRoomForm = document.getElementById('add-room-form');
    if (addRoomForm) {
        addRoomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                room_number: document.getElementById('room-number').value,
                floor: document.getElementById('floor-number').value,
                room_type: document.getElementById('room-type').value,
                capacity: parseInt(document.getElementById('room-capacity').value),
                price_per_month: parseFloat(document.getElementById('room-price').value),
                is_available: document.getElementById('room-status').value === 'Available'
            };

            try {
                const response = await fetch('/api/rooms/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Room added successfully', 'success');
                    document.getElementById('add-room-modal').style.display = 'none';
                    addRoomForm.reset();
                    loadRooms();
                } else {
                    const error = await response.json();
                    showNotification(`Failed to add room: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error adding room:', error);
                showNotification('Error adding room', 'error');
            }
        });
    }

    // edit room form submission
    const editRoomForm = document.getElementById('edit-room-form');
    if (editRoomForm) {
        editRoomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const roomId = document.getElementById('edit-room-id').value;
            const formData = {
                room_number: document.getElementById('edit-room-number').value,
                floor: document.getElementById('edit-floor-number').value,
                room_type: document.getElementById('edit-room-type').value,
                capacity: parseInt(document.getElementById('edit-room-capacity').value),
                price_per_month: parseFloat(document.getElementById('edit-room-price').value),
                is_available: document.getElementById('edit-room-status').value === 'Available'
            };

            try {
                const response = await fetch(`/api/rooms/${roomId}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Room updated successfully', 'success');
                    document.getElementById('edit-room-modal').style.display = 'none';
                    loadRooms();
                } else {
                    const error = await response.json();
                    showNotification(`Failed to update room: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error updating room:', error);
                showNotification('Error updating room', 'error');
            }
        });
    }

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
