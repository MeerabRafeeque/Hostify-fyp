// student room fetching and pplication scenario
document.addEventListener('DOMContentLoaded', function() {
    const roomContainer = document.getElementById('room-container');
    const roomTypeFilter = document.getElementById('room-type-filter');
    const floorFilter = document.getElementById('floor-filter');
    const applyRoomBtn = document.getElementById('apply-room-btn');
    const applicationModal = document.getElementById('application-modal');
    const applicationForm = document.getElementById('application-form');

    let currentRooms = [];
    let currentUser = null;

    // initialize the page
    async function initializePage() {
        try {
            // get current user info
            const response = await fetch('/api/auth/user/', {
                credentials: 'include'
            });
            if (response.ok) {
                currentUser = await response.json();
                loadRooms();
            } else {
                window.location.href = '/student-public.html/login-all.html';
            }
        } catch (error) {
            console.error('Error initializing page:', error);
        }
    }

    // load available rooms
    async function loadRooms() {
        try {
            const response = await fetch('/api/rooms/?available=true', {
                credentials: 'include'
            });
            
            if (response.ok) {
                currentRooms = await response.json();
                renderRooms(currentRooms);
            } else {
                console.error('Failed to load rooms');
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }

    // render rooms in the container
    function renderRooms(rooms) {
        if (!roomContainer) return;

        roomContainer.innerHTML = '';

        if (rooms.length === 0) {
            roomContainer.innerHTML = '<p class="no-rooms">No rooms available at the moment.</p>';
            return;
        }

        rooms.forEach(room => {
            const roomCard = createRoomCard(room);
            roomContainer.appendChild(roomCard);
        });
    }

    // create room card element
    function createRoomCard(room) {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-header">
                <h3>Room ${room.room_number}</h3>
                <span class="room-type ${room.room_type}">${room.room_type}</span>
            </div>
            <div class="room-details">
                <p><strong>Floor:</strong> ${room.floor}</p>
                <p><strong>Capacity:</strong> ${room.capacity} person(s)</p>
                <p><strong>Occupied:</strong> ${room.occupied}/${room.capacity}</p>
                <p><strong>Price:</strong> $${room.price_per_month}/month</p>
                <p><strong>Status:</strong> 
                    <span class="status ${room.is_available ? 'available' : 'unavailable'}">
                        ${room.is_available ? 'Available' : 'Unavailable'}
                    </span>
                </p>
            </div>
            <div class="room-description">
                <p>${room.description || 'No description available.'}</p>
            </div>
            <div class="room-actions">
                <button class="btn btn-primary apply-btn" data-room-id="${room.id}" 
                        ${!room.is_available ? 'disabled' : ''}>
                    ${room.is_available ? 'Apply for Room' : 'Not Available'}
                </button>
                <button class="btn btn-secondary view-details-btn" data-room-id="${room.id}">
                    View Details
                </button>
            </div>
        `;

        // add event listeners
        const applyBtn = card.querySelector('.apply-btn');
        const viewDetailsBtn = card.querySelector('.view-details-btn');

        applyBtn.addEventListener('click', () => openApplicationModal(room));
        viewDetailsBtn.addEventListener('click', () => viewRoomDetails(room));

        return card;
    }

    // filter rooms based on selected criteria
    function filterRooms() {
        const roomType = roomTypeFilter ? roomTypeFilter.value : '';
        const floor = floorFilter ? floorFilter.value : '';

        let filteredRooms = currentRooms;

        if (roomType) {
            filteredRooms = filteredRooms.filter(room => room.room_type === roomType);
        }

        if (floor) {
            filteredRooms = filteredRooms.filter(room => room.floor.toString() === floor);
        }

        renderRooms(filteredRooms);
    }

    // open room application modal
    function openApplicationModal(room) {
        if (!applicationModal) return;

        // populate modal with room information
        const roomInfo = applicationModal.querySelector('.room-info');
        if (roomInfo) {
            roomInfo.innerHTML = `
                <h4>Room ${room.room_number}</h4>
                <p><strong>Type:</strong> ${room.room_type}</p>
                <p><strong>Floor:</strong> ${room.floor}</p>
                <p><strong>Price:</strong> $${room.price_per_month}/month</p>
            `;
        }

        // set room ID in form
        const roomIdInput = applicationForm.querySelector('input[name="room_id"]');
        if (roomIdInput) {
            roomIdInput.value = room.id;
        }

        applicationModal.style.display = 'block';
    }

    // close application modal
    function closeApplicationModal() {
        if (applicationModal) {
            applicationModal.style.display = 'none';
            applicationForm.reset();
        }
    }

    // view room details
    function viewRoomDetails(room) {

        // create detailed view modal
        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal';
        detailsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Room ${room.room_number} Details</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="room-details-grid">
                        <div class="detail-item">
                            <label>Room Number:</label>
                            <span>${room.room_number}</span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span>${room.room_type}</span>
                        </div>
                        <div class="detail-item">
                            <label>Floor:</label>
                            <span>${room.floor}</span>
                        </div>
                        <div class="detail-item">
                            <label>Capacity:</label>
                            <span>${room.capacity} person(s)</span>
                        </div>
                        <div class="detail-item">
                            <label>Currently Occupied:</label>
                            <span>${room.occupied}/${room.capacity}</span>
                        </div>
                        <div class="detail-item">
                            <label>Price per Month:</label>
                            <span>$${room.price_per_month}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status ${room.is_available ? 'available' : 'unavailable'}">
                                ${room.is_available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>
                    <div class="room-description">
                        <h4>Description:</h4>
                        <p>${room.description || 'No description available.'}</p>
                    </div>
                    <div class="room-amenities">
                        <h4>Amenities:</h4>
                        <ul>
                            <li>Furnished room</li>
                            <li>Wi-Fi access</li>
                            <li>24/7 security</li>
                            <li>Laundry facilities</li>
                            <li>Common kitchen</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary apply-btn" ${!room.is_available ? 'disabled' : ''}>
                        ${room.is_available ? 'Apply for Room' : 'Not Available'}
                    </button>
                    <button class="btn btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(detailsModal);

        // add event listeners
        const closeBtn = detailsModal.querySelector('.close');
        const closeModalBtn = detailsModal.querySelector('.close-btn');
        const applyBtn = detailsModal.querySelector('.apply-btn');

        closeBtn.addEventListener('click', () => document.body.removeChild(detailsModal));
        closeModalBtn.addEventListener('click', () => document.body.removeChild(detailsModal));
        applyBtn.addEventListener('click', () => {
            document.body.removeChild(detailsModal);
            openApplicationModal(room);
        });

        // close modal when clicking outside
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                document.body.removeChild(detailsModal);
            }
        });
    }

    // handle room application submission
    async function submitRoomApplication(formData) {
        try {
            const response = await fetch('/api/rooms/apply_for_room/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                showNotification('Room application submitted successfully!', 'success');
                closeApplicationModal();

                // refresh room list
                loadRooms(); 
            } else {
                const error = await response.json();
                showNotification(error.message || 'Failed to submit application', 'error');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            showNotification('An error occurred while submitting your application', 'error');
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
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    // event listeners
    if (roomTypeFilter) {
        roomTypeFilter.addEventListener('change', filterRooms);
    }

    if (floorFilter) {
        floorFilter.addEventListener('change', filterRooms);
    }

    if (applicationForm) {
        applicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(applicationForm);
            const applicationData = {
                room_id: formData.get('room_id'),
                preferred_floor: formData.get('preferred_floor'),
                special_requirements: formData.get('special_requirements')
            };

            await submitRoomApplication(applicationData);
        });
    }

    // close modal when clicking outside
    if (applicationModal) {
        applicationModal.addEventListener('click', (e) => {
            if (e.target === applicationModal) {
                closeApplicationModal();
            }
        });

        // close modal with close button
        const closeBtn = applicationModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeApplicationModal);
        }
    }

    // initialize the page
    initializePage();
});
