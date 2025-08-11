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
                    <button class="btn btn-primary btn-sm view-student" data-id="${student.id}>
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm edit-student" data-id="${student.id}>
                        <i class="fa-solid fa-edit"></i>
                    <button class="btn btn-danger btn-sm delete-student" data-id="${student.id}>
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
        });
    }

    function loadRoomTable() {
        const tableBody = document.querySelector('#room-table tbody');
        tableBody.innerHTML = '';

        appData.rooms.forEach(room => {
            const row = document.createElement('tr');

            const statusClass = room.status === 'Available' ? 'status-available' :
                room.status === 'Under Maintenance' ? 'status-pending' : 'status-occupied'  ;

            row.innerHTML = `
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>${room.capacity}</td>
                <td>${room.occupied}/${room.capacity}</td>
                <td><span  class="status ${statusClass}">${room.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm view-room" data-id="${room.number}>
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm edit-room" data-id="${room.number}>
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-room" data-id="${room.number}>
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function loadPaymentsTable() {
        const tableBody = document.querySelector('#payments-table tbody');
        tableBody.innerHTML = '';

        appData.payments.forEach(payment => {
            const row = document.createElement('tr');

            const statusClass = payment.status === 'Completed' ? 'status-available' : 'status-pending';

            row.innerHTML = `
            <td>${payment.receiptNo}</td>
            <td>${payment.studentName}</td>
            <td>${payment.amount}</td>
            <td>${payment.date}</td>
            <td>${payment.method}</td>
            <td><span class="status ${statusClass}">${payment.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm view-payments" data-id="${payment.receiptNo}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-payments" data-id="${payment.receiptNo}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
            `;
            tableBody.appendChild(row);
        });
    }
    function loadStayTable(){
        const tableBody = document.querySelector('#stay-table tbody');
        tableBody.innerHTML = '';

        appData.stay.forEach(stay => {
            const row = document.createElement('tr');

            const statusClass = stay.status === 'Eligible' ? 'status-approved' : 'status-pending' ;
                // stay.status === 'Not Eligible' ? status-rejected ;

            row.innerHTML = `
            <td>${stay.requestNo}</td>
            <td>${stay.studentName}</td>
            <td>${stay.studentID}</td>
            <td>${stay.educationLevel}</td>
            <td>${stay.requestDate}</td>
            <td>${stay.extensionDuration}</td>
            <td>${stay.reasonForExtension}</td>
            <td><span class="status ${statusClass}">${stay.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm view-stay" data-id="${stay.requestNo}> 
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm edit-stay" data-id="${stay.requestNo}> 
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-stay" data-id="${stay.requestNo}> 
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>    
            </td>
            `;
            tableBody.appendChild(row);
        })
    }
})