// warden room allocation functions
document.addEventListener("DOMContentLoaded", () => {
    initializeRoomAllocation();
});

async function initializeRoomAllocation() {
    try {
        await loadRoomAllocations();
    } catch (error) {
        console.error('Error initializing room allocation:', error);
        // error is already handled in loadRoomAllocations
    }
}

async function loadRoomAllocations() {
    try {
        console.log('Loading room allocations...');
        const response = await fetch('/api/students/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load room allocations: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Students response:', data);
        
        // handle response
        const students = data.results || data;
        console.log('Students loaded:', students.length);
        
        const allocatedStudents = students.filter(student => student.room !== null);
        console.log('Allocated students:', allocatedStudents.length);
        
        renderRoomAllocations(allocatedStudents);
    } catch (error) {
        console.error('Error loading room allocations:', error);
        showNotification('Error loading room allocation data', 'error');
    }
}

function renderRoomAllocations(students) {
    const tableBody = document.getElementById('roomAllocationTableBody');
    if (!tableBody) return;
    
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-records">No room allocation records found</td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const row = createRoomAllocationRow(student);
        tableBody.appendChild(row);
    });
}

function createRoomAllocationRow(student) {
    const tr = document.createElement('tr');
    
    const room = student.room;
    const roomType = room ? getRoomTypeLabel(room.room_type) : 'N/A';
    const status = room ? getRoomStatus(room) : 'Unallocated';
    const statusClass = getStatusClass(status);
    
    // get user name from the nested user object
    const userName = student.user ? `${student.user.first_name} ${student.user.last_name}` : 'Unknown';
    
    tr.innerHTML = `
        <td>${userName}</td>
        <td>${student.student_id || 'N/A'}</td>
        <td>${room ? room.room_number : 'N/A'}</td>
        <td>${roomType}</td>
        <td>${room ? room.floor : 'N/A'}</td>
        <td>${room ? room.capacity : 'N/A'}</td>
        <td>${room ? room.occupied : 'N/A'}</td>
        <td><span class="status ${statusClass}">${status}</span></td>
    `;
    
    return tr;
}

function getRoomTypeLabel(roomType) {
    const types = {
        'single': 'Single Room',
        'double': 'Double Room',
        'triple': 'Triple Room'
    };
    return types[roomType] || roomType;
}

function getRoomStatus(room) {
    if (room.occupied >= room.capacity) {
        return 'Full';
    } else if (room.occupied > 0) {
        return 'Partially Occupied';
    } else {
        return 'Available';
    }
}

function getStatusClass(status) {
    const classes = {
        'Full': 'full',
        'Partially Occupied': 'partial',
        'Available': 'available',
        'Unallocated': 'unallocated'
    };
    return classes[status] || 'unknown';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
