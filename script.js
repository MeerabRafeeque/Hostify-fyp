document.addEventListener('DOMContentLoaded', function(){
    // initialize empty data structure
    let appData = {
        students: [],
        rooms: [],
        payment: [],
        stay: [],
        activities: [],
        settings: {
            hostelName: 'Hostify',
            hostelAddress: '',
            contactNumber: '',
            roomTypes: ['Single', 'Double', 'Dormitory']
        }

    };

    // initialize application

    initApp();

    function initApp() {
        // load all tables

        loadDashboard();
        loadStudentTable();
        loadRoomTable();
        loadPaymentsTable();
        loadStayTable();
        loadStaffTable();
        loadSettings();

        setupeventListeners();
    }

    function loadDashboard() {
        document.getElementById('total-students').textContent = appData.students.length;

        const totalRooms = appData.rooms.length;
        const occupiedRooms = appData.rooms.filter(room => room.occupied > 0).length;
        document.getElementById('occupied-rooms').textContent = `${occupiedRooms}/${totalRooms}`;

        const pendingPayments = appData.payments.filter(payment => payment.status === 'pending').length;
        document.getElementById('pending-payments').textContent = pendingPayments;

        const activeRequests = appData.stay.filter(stay => edu.level === 'BS' ).length;
        document.getElementById('current-extension').textContent = activeRequests;

        // load recent activity

        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';
        appData.activities.forEach(activity => {
            const activityItem = document.createElement('div');

            activityItem.className = 'activity-item';

            let iconClass = '';
            switch(activity.type) {
                case 'payment' : iconClass = 'fa-solid fa-money-bill-1-wave'; break;
                case 'stay' : iconClass = 'fa-solid fa-bed'; break;
                case 'staff' : iconClass = 'fa-solid fa-user-tie'; break;
                case 'student' : iconClass = 'fa-solid fa-users'; break;
                default : iconClass = 'fa-solid fa-info-circle';
            }

            activityItem.innerHTML = `
            <div class="activity-icon">
            <i class="${iconClass}"></i>
            </div>
            <div class="activity-details">
                <p>${activity.description}</p>
                <span class="activity-item">${activity.time}</span>
            </div>`
            ;

            activityList.appendChild(activityItem);
        })
    }

    function loadStudentTable() {
        const tableBody = document.querySelector('#students-table tbody');
        tableBody.innerHTML = '';


        appData.students.forEach(student => {
            const row = document.createElement('tr');

            row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.room}</td>
            <td>${student.phone}</td>
            <td><span class="status status-available">${student.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm view-student" data-id="${student.id}
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm edit-student" data-id="${student.id}
                        <i class="fa-solid fa-edit"></i>
                    <button class="btn btn-danger btn-sm delete-student" data-id="${student.id}
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
        })

    }
})