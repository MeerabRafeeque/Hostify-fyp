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
  addNewStudent();
  editStudent();
  updateStudent();
  deleteStudent();
  openAddRoomModal();
  addNewRoom();
  editRoom();
  updateRoom();
  deleteRoom();
  openAddPaymentModal();
  addNewPayment();
  viewPaymentDetails();
  deletePayment();
  openAddStaffModal();
  addNewStaff();
  editStaff();
  updateStaff();
  saveSettings();

  function initApp() {
    // load all tables

    loadDashboard();
    loadStudentTable();
    loadRoomTable();
    loadPaymentsTable();
    loadStayTable();
    loadStaffTable();
    // loadAttendance();
    // loadPenaltyList();
    // viewComplaintDetails();
    // viewFeedbackDetails();
    // viewAttendanceDetails();
    // viewPenaltyDetails();
    // viewStayDetails();
    // approveStay();
    // rejectStay();
    loadSettings();
    loadFeedback();
    openModal();
    closeModal();
    openAddStudentModal();
    

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

  // function loadAttendance() {
  //   const tableBody = document.getElementById("attendance-table");
  //   attendanceData.forEach((attendance) => {
  //     let row = `
  //               <tr>
  //                   <td>${attendance.id}</td>
  //                   <td>${attendance.name}</td>
  //                   <td>${attendance.shift}</td>
  //                   <td>${attendance.markedBy}</td>
  //                   <td>${attendance.date}</td>
  //                   <td>${attendance.status}</td>
  //               </tr>    
  //           `;
  //     tableBody.innerHTML = row;
  //   });
  // }

  // load penalty table

  // function loadPenaltyList() {
  //   const tableBody = document.getElementById("penalty-table");
  //   penaltyData.forEach((penalty) => {
  //     let row = `
  //               <tr>
  //                   <td>${penalty.id}</td>
  //                   <td>${penalty.name}</td>
  //                   <td>${penalty.dateLate}</td>
  //                   <td>${penalty.penalty}</td>
  //                   <td>${penalty.reason}</td>
  //               </tr>  
  //           `;
  //     tableBody.innerHTML = row;
  //   });
  // }

  // load complaints & feedback table
  // function loadComplaints() {
  //   const tableBody = document.getElementById("complaints-table");
  //   complaintsData.forEach((complaint) => {
  //     let row = `
  //               <tr>
  //                   <td>${complaint.id}</td>
  //                   <td>${complaint.student}</td>
  //                   <td>${complaint.complaint}</td>
  //                   <td>${complaint.status}</td>
  //                   <td>${complaint.handledBy}</td>
  //                   <td>${complaint.feedback}</td>
  //               </tr>
  //           `;
  //     tableBody.innerHTML = row;
  //   });
  // }

  // load meal menu & feedback table

  // function loadMenu() {
  //   const tableBody = document.getElementById("meal-table");
  //   menuData.forEach((menu) => {
  //     let row = `
  //               <tr>
  //                   <td>${menu.day}</td>
  //                   <td>${menu.meal}</td>
  //                   <td>${menu.description}</td>
  //                   <td>${menu.updatedBy}</td>
  //                   <td>${menu.updatedDate}</td>
  //               </tr>
  //           `;
  //     tableBody.innerHTML = row;
  //   });
  // }

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

  document.addEventListener("click", function (e) {
    // student actions
    if (e.target.closest(".view-student")) {
      const studentId = e.target
        .closest(".view-student")
        .getAttribute("data-id");
      viewStudentDetails(studentId);
    }

    if (e.target.closest(".edit-student")) {
      const studentId = e.target
        .closest(".edit-student")
        .getAttribute("data-id");
      editStudentDetail(studentId);
    }

    if (e.target.closest(".delete-student")) {
      const studentId = e.target
        .closest(".delete-staff")
        .getAttribute("data-id");
      showConfirmationModal(
        "Delete Student",
        "Are you sure you want to delete this student?",
        "delete-student",
        studentId
      );
    }
    //  room actions
    if (e.target.closest(".view-room")) {
      const roomId = e.target.closest(".view-room").getAttribute("data-id");
      viewRoomDetails(roomId);
    }

    if (e.target.closest(".edit-room")) {
      const roomId = e.target.closest(".edit-room").getAttribute("data-id");
      editRoomDetails(roomId);
    }

    if (e.target.closest(".delete-room")) {
      const roomId = e.target.closest(".delete-room").getAttribute("data-id");
      showConfirmationModal(
        "Delete Room",
        "Are you sure you want to delete this room?",
        "delete-room",
        roomId
      );
    }

    //   staff actions
    if (e.target.closest(".view-staff")) {
      const staffId = e.target.closest(".view-staff").getAttribute("data-id");
      viewStaffDetails(staffId);
    }

    if (e.target.closest(".edit-staff")) {
      const staffId = e.target.closest(".edit-staff").getAttribute("data-id");
      editStaffDetail(staffId);
    }

    if (e.target.closest(".delete-staff")) {
      const staffId = e.target.closest(".delete-staff").getAttribute("data-id");
      showConfirmationModal(
        "Delete Staff",
        "Are you sure you want to delete this staff member?",
        "delete-staff",
        staffId
      );
    }

    // stay request
    if (e.target.closest(".view-stay")) {
      const id = e.target.closest(".view-stay").getAttribute("data-id");
      viewStayDetails(id);
    }

    // complaint & feedback viewing
    if (e.target.classList.contains("view-complaint")) {
      const id = e.target.getAttribute("data-id");
      viewComplaintDetails(id);
    }
    if (e.target.classList.contains("view-feedback")) {
      const id = e.target.getAttribute("data-id");
      viewFeedbackDetails(id);
    }

    // Attendance view
    if (e.target.closest(".view-attendance")) {
      const id = e.target.closest(".view-attendance").getAttribute("data-id");
      viewAttendanceDetails(id);
    }

    // Penalty view
    if (e.target.closest(".view-penalty")) {
      const id = e.target.closest(".view-penalty").getAttribute("data-id");
      viewPenaltyDetails(id);
    }
  });

  function setupeventListeners() {
    // Tab navigation
    const navItems = document.querySelectorAll(".sideBar nav ul li");
    navItems.forEach((items) => {
      items.addEventListener("click", function () {
        // remove active class from all items
        navItems.forEach((navItem) => navItem.classList.remove("active"));

        // hide all tab contents
        const tabContents = document.querySelectorAll(".tab-content");
        tabContents.forEach((content) => content.classList.remove("active"));

        // show the selected tab content
        const tabId = this.getAttribute("datat-tab");
        document.getElementById(tabId).classList.add("active");
      });
    });
  }

  function openModal(modalId) {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById(modalId);
    overlay.style.display = "block";
    modal.style.display = "block";
    overlay.style.opacity = "0";
    modal.style.opacity = "0";
    overlay.style.visibility = "hidden";
    modal.style.visibility = "hidden";
    setTimeout(() => {
      overlay.style.opacity = "1";
      modal.style.opacity = "1";
      overlay.style.visibility = "visible";
      modal.style.visibility = "visible";
    }, 10);
  }
  function closeModal() {
    document.getElementById("modal-overlay").style.opacity = "0";
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      modal.style.display = "none";
    });
  }
  function showConfirmationModal(title, message, action, id) {
    document.getElementById("confirmation-title").textContent = title;
    document.getElementById("confirmation-message").textContent = message;
    document
      .getElementById("confirmation-action")
      .setAttribute("data-action", action);
    document.getElementById("confirmation-action").setAttribute("data-id", id);

    openModal("confirmation-modal");
  }

  function openAddStudentModal() {
    // clear form
    document.getElementById("add-student-form").reset();

    // populate room dropdown
    const roomSelect = document.getElementById("student-room");
    roomSelect.innerHTML = '<option value =" ">Select Room</option>';

    appData.rooms.forEach((room) => {
      if (room.status === "Available" && room.occupied < room.capacity) {
        const option = document.createElement("option");
        option.value = room.number;
        option.textContent = `Room${room.number} (${room.type})`;
      }
      roomSelect.appendChild(option);
    });
    openModal("add-student-modal");
  }

  function addNewStudent() {
    const name = document.getElementById("student-name").value;
    const email = document.getElementById("student-email").value;
    const phone = document.getElementById("student-phone").value;
    const room = document.getElementById("student-room").value;
    const dob = document.getElementById("student-dob").value;
    const address = document.getElementById("student-address").value;
    const educationLevel = document.getElementById("student-edu").value;

    // generate new id
    const newId =
      appData.students.length > 0
        ? Math.max(...appData.students.map((s) => s.id)) + 1
        : 1;

    // add new student
    const newStudent = {
      id: newId,
      name,
      email,
      phone,
      room,
      dob,
      address,
      educationLevel,
      status: "Active",
    };

    appData.students.push(newStudent);

    // update room occupancy
    const roomObj = appData.rooms.find((r) => r.number === room);
    if (roomObj) {
      roomObj.occupied++;

      // if room is now full, update status
      if (roomObj.occupied >= roomObj.capacity) {
        roomObj.status = "Occupied";
      }
    }
    // add activity
    addActivity("student", `${name} checked into room ${room}`);

    // reload tables
    loadDashboard();
    loadStudentTable();
    loadRoomTable();

    // close modal
    closeModal();

    // show success message
    alert("Student added successfully!");
  }
  function viewStudentDetails(studentId) {
    const student = appData.students.find((s) => s.id == studentId);

    if (student) {
      document.getElementById("details-title").textContent = "Student Details";

      const detailsContent = document.getElementById("details-content");
      detailsContent.innerHTML = `
                <div class="detail-row">
                    <strong>ID:</strong> ${student.id}
                </div>
                <div class="detail-row">
                    <strong>Name:</strong> ${student.name}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${student.email}
                </div>
                <div class="detail-row">
                    <strong>Phone:</strong> ${student.phone}
                </div>
                <div class="detail-row">
                    <strong>Room:</strong> ${student.room}
                </div>
                <div class="detail-row">
                    <strong>Date of Birth:</strong> ${student.dob}
                </div>
                <div class="detail-row">
                    <strong>Education Level:</strong> ${student.educationLevel}
                </div>
                <div class="detail-row">
                    <strong>Address:</strong> ${student.address}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong><span class="status status-available">${student.status}</span>
                </div>
            `;
      openModal("details-modal");
    }
  }

  function editStudent(studentId) {
    const student = appData.students.find((s) => s.id === studentId);
    if (student) {
      // edit modal with student data
      document.getElementById("edit-student-id").value = student.id;
      document.getElementById("edit-student-name").value = student.name;
      document.getElementById("edit-student-email").value = student.email;
      document.getElementById("edit-student-phone").value = student.phone;
      document.getElementById("edit-student-dob").value = student.dob;
      document.getElementById("edit-student-address").value = student.address;
      document.getElementById("edit-student-edu").value = student.educationLevel;

      //    populate room dropdown
      const roomSelect = document.getElementById("edit-student-room");
      roomSelect.innerHTML = '<option value="">Select Room</option>';

      appData.rooms.forEach((room) => {
        const option = document.createElement("option");
        option.value = room.number;
        option.textContent = `Room ${room.number} (${room.type})`;
        option.selected = room.number === student.room;
        roomSelect.appendChild(option);
      });
      openModal("edit-student-modal");
    }
  }
  function updateStudent() {
    const studentId = document.getElementById("edit-student-id").value;
    const name = document.getElementById("edit-student-name").value;
    const email = document.getElementById("edit-student-email").value;
    const phone = document.getElementById("edit-student-phone").value;
    const room = document.getElementById("edit-student-room").value;
    const dob = document.getElementById("edit-student-dob").value;
    const educationLevel = document.getElementById("edit-student-edu").value;
    const address = document.getElementById("edit-student-address").value;

    const studentIndex = appData.students.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) return;

    const oldRoom = appData.students[studentIndex].room;

    // update student
    appData.students[studentIndex] = {
      id: studentId,
      name,
      email,
      phone,
      room,
      dob,
      educationLevel,
      address,
      status: "Active",
    };

    // update room occupancy if room changed
    if (oldRoom !== room) {
      // decrement old room occupancy
      const oldRoomObj = appData.rooms.find((r) => r.number === room);
      if (oldRoomObj) {
        oldRoomObj.occupied--;
        if (oldRoomObj.occupied < oldRoomObj.capacity) {
          oldRoomObj.status = "Available";
        }
      }
      // increment new room occupancy
      const newRoomObj = appData.rooms.find((r) => r.number === room);
      if (newRoomObj) {
        newRoomObj.occupied++;
        if (newRoomObj.occupied >= newRoomObj.capacity) {
          newRoomObj.status = "Occupied";
        }
      }
    }
    // add activity
    addActivity("student", `Student ${name} (ID: ${studentId}) was updated`);

    // reload tables
    loadDashboard();
    loadStudentTable();
    loadRoomTable();

    // close modal
    closeModal();

    // show success message
    alert("Student updated successfully!");
  }

  function deleteStudent(studentId) {
    const studentIndex = appData.students.findIndex((s) => s.id === studentId);

    if (studentIndex !== -1) {
      const student = appData.students[studentIndex];

      // update room occupancy
      const roomObj = appData.rooms.find((r) => r.number === student.room);
      if (roomObj) {
        roomObj.occupied--;

        // if room is available, update the status
        if (roomObj.occupied < roomObj.capacity) {
          roomObj.status = "Available";
        }
      }
      // remove student
      appData.students.splice(studentIndex, 1);

      // add activity
      addActivity(
        "Student",
        `Student ${student.name} (ID: ${studentId}) was deleted`
      );
      // reload tables
      loadDashboard();
      loadStudentTable();
      loadRoomTable();

      // show success message

      alert("Student deleted successfully!");
    }
  }

  function openAddRoomModal() {
    // clear form
    document.getElementById("add-room-form").reset();

    // populate room types
    const typeSelect = document.getElementById("room-type");
    typeSelect.innerHTML = '<option value="">Select Type</option>';

    appData.settings.roomTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });
    openModal("add-room-modal");
  }

  // adding new room
  function addNewRoom() {
    const number = document.getElementById("room-number").value;
    const type = document.getElementById("room-type").value;
    const capacity = document.getElementById("room-capacity").value;
    const price = document.getElementById("room-price").value;
    const status = document.getElementById("room-status").value;

    // check if room num already exist
    if (appData.rooms.some((r) => r.numer === room.number)) {
      alert("Room number already exists!");
      return;
    }

    // add new room
    const newRoom = {
      number,
      type,
      capacity,
      occupied: 0,
      price,
      status,
    };
    appData.rooms.push(newRoom);

    // add activity
    addActivity("room", `New room ${number} (${type}) added`);

    // reload tables
    loadDashboard();
    loadRoomTable();

    // close modal
    closeModal();

    // show success message
    alert("Room added successfully!");
  }

  function viewRoomDetails(roomNumber) {
    const room = appData.rooms.find((r) => r.number === roomNumber);

    if (room) {
      document.getElementById("details-title").textContent = "Room Details";
      detailsContent.innerHTML = `
      <div class="detail-row">
        <strong>Room Number:</strong> ${room.number}
      </div>
      <div class="detail-row">
        <strong>Type:</strong> ${room.type}
      </div>
      <div class="detail-row">
        <strong>Capacity:</strong> ${room.capacity}
      </div>
      <div class="detail-row">
        <strong>Occupied:</strong> ${room.occupied}
      </div>
      <div class="detail-row">
        <strong>Price:</strong> ${room.price} per month
      </div>
      <div class="detail-row">
        <strong>Status:</strong><span class="status ${
          room.status === "Available" ? "status-available" : "status-pending"
        }">${room.status}</span>
      </div>
      <div class="detail-row">
        <strong>Students:</strong>
        <ul class="student-list">
          ${
            appData.students
              .filter((s) => s.room === room.number)
              .map(
                (s) => `
              <li>${s.name} (ID: ${s.id})</li>
            `
              )
              .join("") || "<li>No students assigned</li>"
          }
        </ul>
      </div>
    `;
      openModal("details-modal");
    }
  }

  function editRoom() {
    const room = appData.rooms.find((r) => r.number === roomNumber);

    if (room) {
      // edit modal with room data
      document.getElementById("edit-room-number").value = room.number;
      document.getElementById("edit-room-type").value = room.type;
      document.getElementById("edit-room-capacity").value = room.capacity;
      document.getElementById("edit-room-price").value = room.price;
      document.getElementById("edit-room-status").value = room.status;

      // populate room types
      const typeSelect = document.getElementById("edit-room-type");
      typeSelect.innerHTML = '<option value=">Select Type</option>';

      appData.settings.roomTypes.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        option.selected = type === room.type;
        typeSelect.appendChild(option);
      });
      openModal("edit-room-modal");
    }
  }

  function updateRoom() {
    const roomNumber = document.getElementById("edit-room-number").value;
    const type = document.getElementById("edit-room-type").value;
    const capacity = document.getElementById("edit-room-capacity").value;
    const price = document.getElementById("edit-room-price").value;
    const status = document.getElementById("edit-room-status").value;

    const roomIndex = appData.rooms.find((r) => r.number === roomNumber);
    if (roomIndex === -1) return;

    // check if we are reducing capacity below current occupancy
    if (capacity < appData.rooms[roomIndex].occupied) {
      alert("Cannot set capacity below current occupancy!");
      return;
    }

    // update room
    appData.rooms[roomIndex] = {
      number: roomNumber,
      type,
      capacity,
      occupied: appData.rooms[roomIndex].occupied,
      price,
      status,
    };

    // update status based on occupancy
    if (appData.rooms[roomIndex].occupied >= capacity) {
      appData.rooms[roomIndex].status = "Occupied";
    } else if (status !== "Under Maintenance") {
      appData.rooms[roomIndex].status = "Available";
    }
    // add activity
    addActivity("room", `Room ${roomNumber} was updated`);

    // reload tables
    loadDashboard();
    loadRoomTable();
    loadStudentTable();

    // close modal
    closeModal();

    // show success message
    alert("Room updated successfully!");
  }

  function deleteRoom() {
    const roomIndex = appData.rooms.find((r) => r.number === roomNumber);

    if (roomIndex !== -1) {
      const room = appData.rooms[roomIndex];

      // check if room has students
      if (room.occupied > 0) {
        alert("Cannot delete room with students assigned");
        return;
      }

      // remove room
      appData.rooms.splice(roomIndex, 1);

      // add activity
      addActivity("room", `Room ${roomNumber} was deleted`);

      // reload tables
      loadDashboard();
      loadRoomTable();

      // show success message
      alert("Room deleted successfully!");
    }
  }

  function openAddPaymentModal() {
    // clear form
    document.getElementById("add-payment-form").reset();

    // set default date to today
    document.getElementById("payment-date").valueAsDate = new Date();

    // populate student dropdown
    const studentSelect = document.getElementById("payment-student");
    studentSelect.innerHTML = '<option value="">Select Student</option>';

    appData.students.forEach((student) => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = `${student.name} (Room: ${student.room})`;
      studentSelect.appendChild(option);
    });
    openModal("add-payment-modal");
  }

  // new payment adding
  function addNewPayment() {
    const studentId = document.getElementById("payment-student").value;
    const amount = parseFloat(document.getElementById("payment-amount").value);
    const date = document.getElementById("payment-date").value;
    const method = document.getElementById("payment-method").value;
    const description = document.getElementById("payment-description").value;

    const student = appData.students.find((s) => s.id === studentId);
    if (!student) {
      alert("Please select a valid student!");
      return;
    }

    // generate receipt number
    const receiptNo =
      "PAY" + (appData.payments.length + 1).toString().padStart(3, "0");

    // add new payment
    const addNewPayment = {
      receiptNo,
      studentId,
      amount,
      date,
      method,
      description,
      status: "Completed",
    };
    appData.payments.push(newPayment);

    // add activity
    addActivity("payment", `${student.name} made a payment of ${amount}`);

    // reload tables
    loadDashboard();
    loadPaymentsTable();

    // close modal
    closeModal();

    // show success message
    alert("Payment recorded successfully!");
  }

  function viewPaymentDetails(receiptNo) {
    const payment = appData.payments.find((p) => p.receiptNo === receiptNo);

    if (payment) {
      document.getElementById("details-title").textContent = "Payment Details";

      const detailsContent = document.getElementById("details-content");
      detailsContent.innerHTML = `
      <div class="detail-row">
        <strong>Receipt No:</strong> ${payment.receiptNo}
      </div>
      <div class="detail-row">
        <strong>Student:</strong> ${payment.studentName} (ID: ${
        payment.studentId
      })
      </div>
      <div class="detail-row">
        <strong>Amount:</strong> ${payment.amount}
      </div>
      <div class="detail-row">
        <strong>Date:</strong> ${payment.date}
      </div>
      <div class="detail-row">
        <strong>Method:</strong> ${payment.method}
      </div>
      <div class="detail-row">
        <strong>Description:</strong> ${payment.description || "N/A"}
      </div>
      <div class="detail-row">
        <strong>Status:</strong><span class="status ${
          payment.status === "Completed" ? "status-available" : "status-pending"
        }">${payment.status}</span>
      </div>
    `;
      openModal("details-modal");
    }
  }
  // delete payment
  function deletePayment(receiptNo) {
    const paymentIndex = appData.payments.find(
      (p) => p.receiptNo === receiptNo
    );

    if (paymentIndex !== -1) {
      const paymentIndex = appData.payments[paymentIndex];

      // remove payment
      appData.payments.splice(paymentIndex, 1);

      // add activity
      addActivity(
        "payment",
        `Payment ${receiptNo} for ${payment.studentName} was deleted`
      );

      // reload tables
      loadDashboard();
      loadPaymentsTable();

      // show success message
      alert("Payment record deleted successfully!");
    }
  }

  function viewStayDetails(requestNo) {
    const stay = appData.stay.find((s) => s.requestNo == requestNo);
    if (!stay) return;

    document.getElementById("details-title").textContent =
      "Stay Extension Request";
    document.getElementById("details-content").innerHTML = `
        <p><strong>Request No:</strong> ${stay.requestNo}</p>
        <p><strong>Student:</strong> ${stay.studentName} (${stay.studentID})</p>
        <p><strong>Education Level:</strong> ${stay.educationLevel}</p>
        <p><strong>Semester:</strong> ${stay.semester}</p>
        <p><strong>Reason:</strong> ${stay.reasonForExtension}</p>
        <p><strong>Duration:</strong> ${stay.extensionDuration}</p>
        <p><strong>Status:</strong> ${stay.status || "Pending"}</p>
        <p><strong>Eligibility:</strong> ${
          stay.educationLevel === "BS" &&
          (stay.semester === 7 || stay.semester === 8)
            ? "Eligible"
            : "Not Eligible"
        }</p>
        <div class="modal-actions">
            <button class="btn btn-success" onclick="approveStay(${
              stay.requestNo
            })">Approve</button>
            <button class="btn btn-danger" onclick="rejectStay(${
              stay.requestNo
            })">Reject</button>
        </div>
    `;
    openModal("details-modal");
  }

  function approveStay(requestNo) {
    const stay = appData.stay.find((s) => s.requestNo == requestNo);
    if (!stay) return;

    // eligibility check
    if (
      stay.educationLevel === "BS" &&
      (stay.semester === 7 || stay.semester === 8)
    ) {
      stay.status = "Approved";
    } else {
      alert("This student is not eligible for approval.");
      return;
    }

    loadStayTable();
    closeModal();
  }

  function rejectStay(requestNo) {
    const stay = appData.stay.find((s) => s.requestNo == requestNo);
    if (!stay) return;

    stay.status = "Rejected";
    loadStayTable();
    closeModal();
  }

  // View Complaint Details
  function viewComplaintDetails(id) {
    const complaint = appData.complaints.find((c) => c.id == id);
    if (!complaint) return;

    document.getElementById("details-title").textContent = "Complaint Details";
    document.getElementById("details-content").innerHTML = `
          <p><strong>ID:</strong> ${complaint.id}</p>
          <p><strong>Student:</strong> ${complaint.studentName}</p>
          <p><strong>Complaint:</strong> ${complaint.message}</p>
          <p><strong>Date:</strong> ${complaint.date || "N/A"}</p>
      `;
    openModal("details-modal");
  }

  // View Feedback Details
  function viewFeedbackDetails(id) {
    const feedback = appData.feedback.find((f) => f.id == id);
    if (!feedback) return;

    document.getElementById("details-title").textContent = "Feedback Details";
    document.getElementById("details-content").innerHTML = `
          <p><strong>ID:</strong> ${feedback.id}</p>
          <p><strong>Student:</strong> ${feedback.studentName}</p>
          <p><strong>Feedback:</strong> ${feedback.message}</p>
          <p><strong>Date:</strong> ${feedback.date || "N/A"}</p>
      `;
    openModal("details-modal");
  }
  // view attendance and penalty lists
  function viewAttendanceDetails(id) {
    const attendance = appData.attendance.find((a) => a.id == id);
    if (!attendance) return;

    document.getElementById("details-title").textContent = "Attendance Details";
    document.getElementById("details-content").innerHTML = `
        <p><strong>ID:</strong> ${attendance.id}</p>
        <p><strong>Student:</strong> ${attendance.studentName}</p>
        <p><strong>Date:</strong> ${attendance.date}</p>
        <p><strong>Status:</strong> ${attendance.status}</p>
        <p><strong>Remarks:</strong> ${attendance.remarks || "N/A"}</p>
      `;
    openModal("details-modal");
  }
  function viewPenaltyDetails(id) {
    const penalty = appData.penalties.find((p) => p.id == id);
    if (!penalty) return;

    document.getElementById("details-title").textContent = "Penalty Details";
    document.getElementById("details-content").innerHTML = `
          <p><strong>ID:</strong> ${penalty.id}</p>
          <p><strong>Student:</strong> ${penalty.studentName}</p>
          <p><strong>Reason:</strong> ${penalty.reason}</p>
          <p><strong>Amount:</strong> ${penalty.amount}</p>
          <p><strong>Date:</strong> ${penalty.date || "N/A"}</p>
          <p><strong>Status:</strong> ${penalty.status}</p>
        `;
    openModal("details-modal");
  }

  //add staff modal
  function openAddStaffModal() {
    // clear form
    document.getElementById('add-staff-form').reset();

    openModal('add-staff-modal');
  }

  function addNewStaff() {
    const name = document.getElementById('staff-name').value;
    const position = document.getElementById('staff-position').value;
    const phone = document.getElementById('staff-phone').value;
    const email = document.getElementById('staff-email').value;
    const shift = document.getElementById('staff-shift').value;
    const salary = parseFloat(document.getElementById('staff-salary').value);

    // generate new id
    const newId = appData.staff.length > 0 ?
      Math.max(...appData.staff.map(s=> s.id)) + 1 : 1;

    // Add new staff
    const newStaff = {
      id: newId, 
      name, 
      position,
      phone,
      email, 
      shift, 
      salary, 
      status: 'Active' 
    };

    appData.staff.push(newStaff);

    // add activity
    addActivity('staff', `New staff member ${name} (${position}) added`);

    // reload tables
    loadDashboard();
    loadStaffTable();

    // close modal
    closeModal();

    // show success message
    alert('Staff member added successfully!');
  }

  function viewStaffDetails(staffId) {
    const staff = appData.staff.find(s=> s.id === staffId)

    if (staff) {
      document.getElementById('details-title').textContent = 'Staff Details';

      const detailsContent = document.getElementById('details-content');
      detailsContent.innerHTML = `
        <div class="detail-row">
          <strong>ID:</strong> ${staff.id}
        </div>
        <div class="detail-row">
          <strong>Name:</strong> ${staff.name}
        </div>
        <div class="detail-row">
          <strong>Position:</strong> ${staff.position}
        </div>
        <div class="detail-row">
          <strong>Phone:</strong> ${staff.phone}
        </div>
        <div class="detail-row">
          <strong>Email:</strong> ${staff.email || 'N/A'}
        </div>
        <div class="detail-row">
          <strong>Shift:</strong> ${staff.shift}
        </div>
        <div class="detail-row">
          <strong>Salary:</strong> ${staff.salary}
        </div>
        <div class="detail-row">
          <strong>Status:</strong><span class="status-available">${staff.status}</span>
        </div>
      `;
        openModal('details-modal')
    }
  }
  function editStaff(staffId) {
    const staff = appData.staff.find(s=> s.id === staffId);

    if (staff) {
      document.getElementById('detail-content');
      detailsContent.innerHTML = `
        <div class="detail-row>
          <strong>ID:</strong> ${staff.id}
        </div>
        <div class="detail-row>
          <strong>Name:</strong> ${staff.name}
        </div>
        <div class="detail-row>
          <strong>Position:</strong> ${staff.position}
        </div>
        <div class="detail-row>
          <strong>Phone:</strong> ${staff.phone}
        </div>
        <div class="detail-row>
          <strong>Email:</strong> ${staff.email}
        </div>
        <div class="detail-row>
          <strong>Shift:</strong> ${staff.shift}
        </div>
        <div class="detail-row>
          <strong>Salary:</strong> ${staff.salary}
        </div>
        <div class="detail-row>
          <strong>Status:</strong><span class="status-available"> ${staff.status}</span>
        </div>
      `;
      openModal('details-modal');
    }
  }

  function editStaff(staffId) {
    const staff = appData.staff.find(s => s.id === staffId);

    if(staff) {
      // edit modal with staff data
      document.getElementById('edit-staff-id').value = staff.id;
      document.getElementById('edit-staff-name').value = staff.name;
      document.getElementById('edit-staff-position').value = staff.position;
      document.getElementById('edit-staff-email').value = staff.email;
      document.getElementById('edit-staff-shift').value = staff.shift;
      document.getElementById('edit-staff-salary').value = staff.salary;

      openModal('edit-staff-modal');
    }
  }

  function updateStaff() {
    const staffId = document.getElementById('edit-staff-id').value;
    const name = document.getElementById('edit-staff-name').value;
    const position = document.getElementById('edit-staff-position').value;
    const email = document.getElementById('edit-staff-email').value;
    const shift = document.getElementById('edit-staff-shift').value;
    const salary = parseFloat(document.getElementById('edit-staff-salary').value);

    const staffIndex = appData.staff.findIndex(s => s.id == staffId);
    if (staffIndex === -1) return;

    // update staff
    appData.staff[staffIndex] = {
      id: staffId, 
      name, 
      position, 
      phone, 
      email, 
      shift, 
      salary, 
      status: 'Active'
    };

    // add activity
    addActivity('staff', `Staff member ${name} (ID: ${staffId}) was updated`);

    // reload tables
    loadDashboard();
    loadStaffTable();

    // close modal
    closeModal();

    // show success message
    alert('Staff member updated successfully!');
  }

  function deleteStaff(staffId) {
    const staffIndex = appData.staff.findIndex(s => s.id === staffId);
    if (staffIndex !== -1) {
      const staff = appData.staff[staffIndex];

      // remove staff
      appData.staff.splice(staffIndex, 1);

      // add activity
      addActivity('staff', `Staff member ${staff.name} (ID: ${staffId}) was deleted`);

      // reload tables
      loadDashboard();
      loadStaffTable();

      // show success message
      alert('Staff member deleted successfully!');
    }
  }
  function saveSettings() {
    appData.settings.hostelName = document.getElementById('hostel-name').value;
    appData.settings.hostelAddress = document.getElementById('hostel-address').value;
    appData.settings.hostelContact = document.getElementById('hostel-contact').value;

    // add activity
    addActivity('settings', 'Hostel settings were updated');

    // show success message
    alert('Settings saved successfulyy!');
  }
  
  
});
 