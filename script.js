document.addEventListener("DOMContentLoaded", function () {
  // initialize empty data structure
  let appData = {
    students: [],
    rooms: [],
    payments: [],
    stay: [],
    staff: [],
    activities: [],
    settings: {
      hostelName: "Hostify",
      hostelAddress: "",
      hostelContact: "",
      roomTypes: ["Single", "Double", "Dormitory"],
    },
  };

  //  temporary placeholders
  let attendanceData = [];
  let penaltyData = [];
  let complaintsData = [];
  let menuData = [];
  let feedbackData = [];

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
    loadAttendance();
    loadPenaltyList();
    loadComplaints();
    loadMenu();
    loadFeedback();
    loadSettings();
    openModal();
    closeModal();
    openAddStudentModal();
    addNewStudent();

    setupeventListeners();
  }

  function loadDashboard() {
    document.getElementById("total-students").textContent =
      appData.students.length;

    const totalRooms = appData.rooms.length;
    const occupiedRooms = appData.rooms.filter(
      (room) => room.occupied > 0
    ).length;
    document.getElementById(
      "occupied-rooms"
    ).textContent = `${occupiedRooms}/${totalRooms}`;

    const pendingPayments = appData.payments.filter(
      (payment) => payment.status === "pending"
    ).length;
    document.getElementById("pending-payments").textContent = pendingPayments;

    const activeRequests = appData.stay.filter(
      (stay) =>
        stay.educationLevel === "BS" &&
        (stay.semester === 7 || stay.semester === 8)
    ).length;
    document.getElementById("current-extension").textContent = activeRequests;

    // load recent activity

    const activityList = document.getElementById("activity-list");
    activityList.innerHTML = "";
    appData.activities.forEach((activity) => {
      const activityItem = document.createElement("div");

      activityItem.className = "activity-item";

      let iconClass = "";
      switch (activity.type) {
        case "payment":
          iconClass = "fa-solid fa-money-bill-1-wave";
          break;
        case "stay":
          iconClass = "fa-solid fa-bed";
          break;
        case "staff":
          iconClass = "fa-solid fa-user-tie";
          break;
        case "student":
          iconClass = "fa-solid fa-users";
          break;
        default:
          iconClass = "fa-solid fa-info-circle";
      }

      activityItem.innerHTML = `
            <div class="activity-icon">
            <i class="${iconClass}"></i>
            </div>
            <div class="activity-details">
                <p>${activity.description}</p>
                <span class="activity-item">${activity.time}</span>
            </div>`;

      activityList.appendChild(activityItem);
    });
  }

  // load student table

  function loadStudentTable() {
    const tableBody = document.querySelector("#students-table tbody");
    tableBody.innerHTML = "";

    appData.students.forEach((student) => {
      const row = document.createElement("tr");

      row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.room}</td>
            <td>${student.phone}</td>
            <td><span class="status status-available">${student.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm view-student" data-id="${student.id}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm edit-student" data-id="${student.id}">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-student" data-id="${student.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
      tableBody.appendChild(row);
    });
  }

  // load room table

  function loadRoomTable() {
    const tableBody = document.querySelector("#room-table tbody");
    tableBody.innerHTML = "";

    appData.rooms.forEach((room) => {
      const row = document.createElement("tr");

      const statusClass =
        room.status === "Available"
          ? "status-available"
          : room.status === "Under Maintenance"
          ? "status-pending"
          : "status-occupied";

      row.innerHTML = `
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>${room.capacity}</td>
                <td>${room.occupied}/${room.capacity}</td>
                <td><span  class="status ${statusClass}">${room.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm view-room" data-id="${room.number}">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm edit-room" data-id="${room.number}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-room" data-id="${room.number}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
      tableBody.appendChild(row);
    });
  }

  // load payment table

  function loadPaymentsTable() {
    const tableBody = document.querySelector("#payments-table tbody");
    tableBody.innerHTML = "";

    appData.payments.forEach((payment) => {
      const row = document.createElement("tr");

      const statusClass =
        payment.status === "Completed" ? "status-available" : "status-pending";

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
  function loadStayTable() {
    const tableBody = document.querySelector("#stay-table tbody");
    tableBody.innerHTML = "";

    appData.stay.forEach((stay) => {
      let statusClass = "";
      let eligibilityStatus = "";

      if (
        stay.educationLevel === "BS" &&
        (stay.semester === 7 || stay.semester === 8)
      ) {
        eligibilityStatus = "Eligible";
        statusClass = "status-approved";
      } else {
        eligibilityStatus = "Not Eligible";
        statusClass = "status-rejected";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${stay.requestNo}</td>
            <td>${stay.studentName}</td>
            <td>${stay.studentID}</td>
            <td>${stay.educationLevel}</td>
            <td>${stay.requestDate}</td>
            <td>${stay.extensionDuration}</td>
            <td>${stay.reasonForExtension}</td>
            <td><span class="status ${statusClass}">${eligibilityStatus}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm view-stay" data-id="${stay.requestNo}"> 
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm edit-stay" data-id="${stay.requestNo}"> 
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-stay" data-id="${stay.requestNo}"> 
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>    
            </td>
            `;
      tableBody.appendChild(row);
    });
  }
  // load staff table

  function loadStaffTable() {
    const tableBody = document.querySelector("#staff-table tbody");
    tableBody.innerHTML = "";

    appData.staff.forEach((staff) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${staff.id}</td>
                <td>${staff.name}</td>
                <td>${staff.position}</td>
                <td>${staff.phone}</td>
                <td>${staff.shift}</td>
                <td><span class="status status-available">${staff.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm view-staff" data-id="${staff.id}">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm edit-staff" data-id="${staff.id}"> 
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-staff" data-id="${staff.id}"> 
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
      tableBody.appendChild(row);
    });
  }

  // load attendance table

  function loadAttendance() {
    const tableBody = document.getElementById("attendance-table");
    attendanceData.forEach((attendance) => {
      let row = `
                <tr>
                    <td>${attendance.id}</td>
                    <td>${attendance.name}</td>
                    <td>${attendance.shift}</td>
                    <td>${attendance.markedBy}</td>
                    <td>${attendance.date}</td>
                    <td>${attendance.status}</td>
                </tr>    
            `;
      tableBody.innerHTML = row;
    });
  }

  // load penalty table

  function loadPenaltyList() {
    const tableBody = document.getElementById("penalty-table");
    penaltyData.forEach((penalty) => {
      let row = `
                <tr>
                    <td>${penalty.id}</td>
                    <td>${penalty.name}</td>
                    <td>${penalty.dateLate}</td>
                    <td>${penalty.penalty}</td>
                    <td>${penalty.reason}</td>
                </tr>  
            `;
      tableBody.innerHTML = row;
    });
  }

  // load complaints & feedback table
  function loadComplaints() {
    const tableBody = document.getElementById("complaints-table");
    complaintsData.forEach((complaint) => {
      let row = `
                <tr>
                    <td>${complaint.id}</td>
                    <td>${complaint.student}</td>
                    <td>${complaint.complaint}</td>
                    <td>${complaint.status}</td>
                    <td>${complaint.handledBy}</td>
                    <td>${complaint.feedback}</td>
                </tr>
            `;
      tableBody.innerHTML = row;
    });
  }

  // load meal menu & feedback table

  function loadMenu() {
    const tableBody = document.getElementById("meal-table");
    menuData.forEach((menu) => {
      let row = `
                <tr>
                    <td>${menu.day}</td>
                    <td>${menu.meal}</td>
                    <td>${menu.description}</td>
                    <td>${menu.updatedBy}</td>
                    <td>${menu.updatedDate}</td>
                </tr>
            `;
      tableBody.innerHTML = row;
    });
  }

  // load feedback

  function loadFeedback() {
    const tableBody = document.getElementById("meal-feedback");
    feedbackData.forEach((feedback) => {
      let row = `
                <tr>
                    <td>${feedback.day}</td>
                    <td>${feedback.meal}</td>
                    <td>${feedback.student}</td>
                    <td>${feedback.feedback}</td>
                </tr>
            `;
      tableBody.innerHTML = row;
    });
  }

  // load settings section

  function loadSettings() {
    document.getElementById("hostel-name").value = appData.settings.hostelName;
    document.getElementById("hostel-address").value =
      appData.settings.hostelAddress;
    document.getElementById("hostel-contact").value =
      appData.settings.hostelContact;

    const roomTypeList = document.getElementById("room-types-list");
    roomTypeList.innerHTML = "";

    appData.settings.roomTypes.forEach((type) => {
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.innerHTML = `
                ${type}
                <span class="tag-remove" data-type="${type}">&times;</span>
            `;
      roomTypeList.appendChild(tag);
    });
  }
//   student actions
    if(e.target.closest('.view-student')) {
        const studentId = e.target.closest('.view-student').getAttribute('data-id');
        viewStudentDetails(studentId);
    }

    if (e.target.closest('.edit-student')) {
        const studentId = e.target.closest('.edit-student').getAttribute('data-id');
        editStudentDetail(studentId);
    }

    if(e.target.closest('.delete-student')) {
        const studentId = e.target.closest('.delete-staff').getAttribute('data-id');
        showConfirmationModal('Delete Student', 'Are you sure you want to delete this student?', 'delete-student', studentId);
    }
//  room actions
    if(e.target.closest('.view-room')) {
        const roomId = e.target.closest('.view-room').getAttribute('data-id');
        viewRoomDetails(roomId);
    }

    if (e.target.closest('.edit-room')) {
        const roomId = e.target.closest('.edit-room').getAttribute('data-id');
        editRoomDetails(roomId);
    }

    if(e.target.closest('.delete-room')) {
        const roomId = e.target.closest('.delete-room').getAttribute('data-id');
        showConfirmationModal('Delete Room', 'Are you sure you want to delete this room?', 'delete-room', roomId);
    }

//   staff actions
    if(e.target.closest('.view-staff')) {
        const staffId = e.target.closest('.view-staff').getAttribute('data-id');
        viewStaffDetails(staffId);
    }

    if (e.target.closest('.edit-staff')) {
        const staffId = e.target.closest('.edit-staff').getAttribute('data-id');
        editStaffDetail(staffId);
    }

    if(e.target.closest('.delete-staff')) {
        const staffId = e.target.closest('.delete-staff').getAttribute('data-id');
        showConfirmationModal('Delete Staff', 'Are you sure you want to delete this staff member?', 'delete-staff', staffId);
    }
    function setupeventListeners() {
        // Tab navigation
        const navItems = document.querySelector('.sideBar nav ul li');
        navItems.forEach(items =>{
            items.addEventListener('click', function() {
                // remove active class from all items
                navItems.forEach(navItem => navItem.classList.remove('active'));

                // hide all tab contents
                const tabContents = document.querySelector('.tab-content');
                tabContents.forEach(content => content.classList.remove('active'));

                // show the selected tab content
                const tabId = this.getAttribute('datat-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    function openModal(modalId) {
        document.getElementById('modal-overlay').style.display = 'block';
        document.getElementById(modalId).style.display = 'block';

        setTimeout(() => {
            document.getElementById('modal-overlay').style.opacity = '1';
            document.getElementById(modalId).style.opacity = '1';

        }, 10);
    }
    function closeModal() {
        document.getElementById('modal-overlay').style.opacity = '0';
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modals.forEach(modal => {
                modal.style.display = 'none';
            })
        }, 300);
    }
    function showConfirmationModal(title, message, action, id) {
        document.getElementById('confirmation-title').textContent = title ;
        document.getElementById('confirmation-message').textContent = message ;
        document.getElementById('confirmation-action').setAttribute('data-action', action);
        document.getElementById('confirmation-action').setAttribute('data-id', id);

        openModal('confirmation-modal');

    }

    function openAddStudentModal() {

        // clear form 
        document.getElementById('add-student-form').reset();

        // populate room dropdown
        const roomSelect = document.getElementById('student-room');
        roomSelect.innerHTML = '<option value =" ">Select Room</option>';

        appData.rooms.forEach(room => {
            if(room.status === 'Available' && room.occupied < room.capacity) {
                const option = document.createElement('option');
                option.value = room.number;
                option.textContent = `Room${room.number} (${room.type})`;
            }
        });
        openModal('add-student-modal');

    }

    function addNewStudent() {
        const name = document.getElementById('std-name').value;
        const email = document.getElementById('std-email').value;
        const phone = document.getElementById('std-phn').value;
        const room = document.getElementById('std-room').value;
        const dob = document.getElementById('std-dub').value;
        const address = document.getElementById('student-address').value;
        const educationLevel = document.getElementById('std-edu').value;

        // generate new id
        const newId = appData.students.length > 0 ?
            Math.max(...appData.students.map(s => s.id)) + 1 : 1;

        // add new student
        const addNewStudent = {
            id: newId,
            name,
            email,
            phone,
            room,
            dob,
            address,
            educationLevel,
            status: 'Active'
        };

        appData.students.push(newStudent);

        // update room occupancy
        const roomObj = appData.rooms.find(r => r.number === room);
        if(roomObj) {
            roomObj.occupied++;

            // if room is now full, update status
            
        }
    }
    
});
