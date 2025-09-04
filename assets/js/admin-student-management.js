// admin student management functions

let studentsData = [];
let roomsData = [];

// load and display students
async function loadStudents() {
    try {
        const response = await fetch('/api/students/', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            studentsData = data.results || [];
            renderStudentsTable(studentsData);
        } else {
            console.error('Failed to load students');
            showNotification('Failed to load students', 'error');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Error loading students', 'error');
    }
}

// load available rooms
async function loadRooms() {
    try {
        const response = await fetch('/api/rooms/?available=true', {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            roomsData = data.results || [];
        } else {
            console.error('Failed to load rooms');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// render students table
function renderStudentsTable(students) {
    const tbody = document.querySelector('#students-table tbody');
    if (!tbody) return;

    let html = '';
    students.forEach(student => {
        const paymentStatus = getPaymentStatus(student);
        const roomInfo = student.room ? `${student.room.room_number} (${student.room.room_type})` : 'Not Assigned';
        
        html += `
            <tr data-student-id="${student.id}">
                <td>${student.student_id || 'N/A'}</td>
                <td>${student.user?.first_name || ''} ${student.user?.last_name || ''}</td>
                <td>${student.user?.email || 'N/A'}</td>
                <td>${student.department || 'N/A'}</td>
                <td>${student.year_of_study || 'N/A'}</td>
                <td>
                    <span class="status-badge ${paymentStatus.class}">${paymentStatus.text}</span>
                </td>
                <td>${roomInfo}</td>
                <td>${student.room?.room_type || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        ${!student.room ? `<button onclick="assignRoom(${student.id})" class="btn btn-sm btn-primary" ${paymentStatus.verified ? '' : 'disabled'}>Assign Room</button>` : ''}
                        <button onclick="editStudent(${student.id})" class="btn btn-sm btn-secondary">Edit</button>
                        ${student.room ? `<button onclick="deallocateRoom(${student.id})" class="btn btn-sm btn-warning">Deallocate</button>` : ''}
                        <button onclick="deleteStudent(${student.id})" class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// get payment status for student
function getPaymentStatus(student) {
    // this would need to be implemented based on payment verification logic
    // for now, we'll assume all students have verified payments
    return {
        text: 'Verified',
        class: 'verified',
        verified: true
    };
}

// assign room to student
async function assignRoom(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    // check if student has verified payment
    const paymentStatus = getPaymentStatus(student);
    if (!paymentStatus.verified) {
        showNotification('Student must have verified payment before room assignment', 'warning');
        return;
    }

    // populate room assignment modal
    document.getElementById('assignment-student-id').value = studentId;
    document.getElementById('assignment-student-name').value = `${student.user?.first_name || ''} ${student.user?.last_name || ''}`;
    document.getElementById('assignment-payment-status').value = paymentStatus.text;

    // load available rooms
    await loadAvailableRooms();

    // show modal
    document.getElementById('room-assignment-modal').style.display = 'block';
}

// load available rooms for assignment
async function loadAvailableRooms() {
    const roomTypeSelect = document.getElementById('assignment-room-type');
    const roomSelect = document.getElementById('assignment-room');
    
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    
    roomTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        
        if (selectedType) {
            const availableRooms = roomsData.filter(room => 
                room.room_type === selectedType && 
                room.is_available && 
                room.occupied < room.capacity
            );
            
            availableRooms.forEach(room => {
                roomSelect.innerHTML += `<option value="${room.id}">${room.room_number} (${room.room_type}) - ${room.occupied}/${room.capacity}</option>`;
            });
        }
    });
}

// edit student
async function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    // populate edit form
    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-student-first-name').value = student.user?.first_name || '';
    document.getElementById('edit-student-last-name').value = student.user?.last_name || '';
    document.getElementById('edit-student-email').value = student.user?.email || '';
    document.getElementById('edit-student-phone').value = student.user?.phone || '';
    document.getElementById('edit-student-department').value = student.department || '';
    document.getElementById('edit-student-year').value = student.year_of_study || '';
    document.getElementById('edit-student-parent').value = student.parent_name || '';
    document.getElementById('edit-student-address').value = student.user?.address || '';

    // show modal
    document.getElementById('edit-student-modal').style.display = 'block';
}

// deallocate room from student
async function deallocateRoom(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student || !student.room) return;

    if (confirm(`Are you sure you want to deallocate room ${student.room.room_number} from ${student.user?.first_name} ${student.user?.last_name}?`)) {
        try {
            const response = await fetch(`/api/students/${studentId}/deallocate_room/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                }
            });

            if (response.ok) {
                showNotification('Room deallocated successfully', 'success');
                loadStudents();
            } else {
                showNotification('Failed to deallocate room', 'error');
            }
        } catch (error) {
            console.error('Error deallocating room:', error);
            showNotification('Error deallocating room', 'error');
        }
    }
}

// delete student
async function deleteStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    if (confirm(`Are you sure you want to delete ${student.user?.first_name} ${student.user?.last_name}? This action cannot be undone.`)) {
        try {
            const response = await fetch(`/api/students/${studentId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                }
            });

            if (response.ok) {
                showNotification('Student deleted successfully', 'success');
                // notify deputy RT
                await notifyDeputyRT(student);
                loadStudents();
            } else {
                showNotification('Failed to delete student', 'error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            showNotification('Error deleting student', 'error');
        }
    }
}

// notify deputy RT about student removal
async function notifyDeputyRT(student) {
    try {
        const response = await fetch('/api/notifications/notify_deputy_rt/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                student_id: student.id,
                student_name: `${student.user?.first_name} ${student.user?.last_name}`,
                action: 'removed'
            })
        });

        if (response.ok) {
            console.log('Deputy RT notified successfully');
        }
    } catch (error) {
        console.error('Error notifying deputy RT:', error);
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

// initialize student management functionality
document.addEventListener('DOMContentLoaded', function() {
    // load initial data
    loadStudents();
    loadRooms();

    // add student button
    const addStudentBtn = document.getElementById('reg-student-btn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            document.getElementById('add-student-modal').style.display = 'block';
        });
    }

    // add student form submission
    const addStudentForm = document.getElementById('add-student-form');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                first_name: document.getElementById('student-first-name').value,
                last_name: document.getElementById('student-last-name').value,
                email: document.getElementById('student-email').value,
                phone: document.getElementById('student-phone').value,
                department: document.getElementById('student-department').value,
                year_of_study: document.getElementById('student-year').value,
                parent_name: document.getElementById('student-parent').value,
                address: document.getElementById('student-address').value,
                role: 'student'
            };

            try {
                const response = await fetch('/api/students/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Student added successfully', 'success');
                    document.getElementById('add-student-modal').style.display = 'none';
                    addStudentForm.reset();
                    loadStudents();
                } else {
                    const error = await response.json();
                    showNotification(`Failed to add student: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error adding student:', error);
                showNotification('Error adding student', 'error');
            }
        });
    }

    // edit student form submission
    const editStudentForm = document.getElementById('edit-student-form');
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const studentId = document.getElementById('edit-student-id').value;
            const formData = {
                first_name: document.getElementById('edit-student-first-name').value,
                last_name: document.getElementById('edit-student-last-name').value,
                email: document.getElementById('edit-student-email').value,
                phone: document.getElementById('edit-student-phone').value,
                department: document.getElementById('edit-student-department').value,
                year_of_study: document.getElementById('edit-student-year').value,
                parent_name: document.getElementById('edit-student-parent').value,
                address: document.getElementById('edit-student-address').value
            };

            try {
                const response = await fetch(`/api/students/${studentId}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Student updated successfully', 'success');
                    document.getElementById('edit-student-modal').style.display = 'none';
                    loadStudents();
                } else {
                    const error = await response.json();
                    showNotification(`Failed to update student: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error updating student:', error);
                showNotification('Error updating student', 'error');
            }
        });
    }

    // room assignment form submission
    const roomAssignmentForm = document.getElementById('room-assignment-form');
    if (roomAssignmentForm) {
        roomAssignmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const studentId = document.getElementById('assignment-student-id').value;
            const roomId = document.getElementById('assignment-room').value;

            try {
                const response = await fetch(`/api/students/${studentId}/allocate_room/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify({ room_id: roomId })
                });

                if (response.ok) {
                    showNotification('Room assigned successfully', 'success');
                    document.getElementById('room-assignment-modal').style.display = 'none';
                    loadStudents();
                    // force student logout (this would be handled by the backend)
                } else {
                    const error = await response.json();
                    showNotification(`Failed to assign room: ${error.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Error assigning room:', error);
                showNotification('Error assigning room', 'error');
            }
        });
    }

    // filter functionality
    const paymentFilter = document.getElementById('payment-filter');
    const roomFilter = document.getElementById('room-filter');
    const roomTypeFilter = document.getElementById('room-type-filter');

    [paymentFilter, roomFilter, roomTypeFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });

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

// apply filters to students table
function applyFilters() {
    const paymentFilter = document.getElementById('payment-filter').value;
    const roomFilter = document.getElementById('room-filter').value;
    const roomTypeFilter = document.getElementById('room-type-filter').value;

    let filteredStudents = studentsData;

    if (paymentFilter) {
        // filter by payment status (this would need to be implemented based on payment logic)
    }

    if (roomFilter) {
        if (roomFilter === 'assigned') {
            filteredStudents = filteredStudents.filter(student => student.room);
        } else if (roomFilter === 'unassigned') {
            filteredStudents = filteredStudents.filter(student => !student.room);
        }
    }

    if (roomTypeFilter) {
        filteredStudents = filteredStudents.filter(student => 
            student.room && student.room.room_type === roomTypeFilter
        );
    }

    renderStudentsTable(filteredStudents);
}
