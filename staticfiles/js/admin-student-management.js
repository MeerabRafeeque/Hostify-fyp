document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("reg-student-btn");
  const addModal = document.getElementById("add-student-modal");
  const editModal = document.getElementById("edit-student-modal");
  const detailsModal = document.getElementById("details-modal");
  const overlay = document.getElementById("modal-overlay");
  const closeBtns = document.querySelectorAll(".closeModal");

  const addForm = document.getElementById("add-student-form");
  const editForm = document.getElementById("edit-student-form");
  const studentTableBody = document.querySelector("#students-table tbody");

  const studentRoomSelect = document.getElementById("student-room");
  const editStudentRoomSelect = document.getElementById("edit-student-room");

  let students = JSON.parse(localStorage.getItem("students")) || [];

  // modal handling 
  function openModal(modal) {
    modal.style.display = "block";
    overlay.style.display = "block";
  }
  function closeModalAll() {
    addModal.style.display = "none";
    editModal.style.display = "none";
    detailsModal.style.display = "none";
    overlay.style.display = "none";
  }
  addBtn.addEventListener("click", () => openModal(addModal));
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModalAll));
  overlay.addEventListener("click", closeModalAll);

  // load rooms into dropdown
  function loadRoomsForStudents() {
    const rooms = JSON.parse(localStorage.getItem("rooms")) || [];
    studentRoomSelect.innerHTML = `<option value="">Select Room</option>`;
    editStudentRoomSelect.innerHTML = `<option value="">Select Room</option>`;

    rooms
      .filter((r) => r.status === "Available" && r.occupied < r.capacity)
      .forEach((room) => {
        const optionText = `${room.roomNo} (${room.roomType}) [${room.occupied}/${room.capacity}]`;

        const opt1 = document.createElement("option");
        opt1.value = room.roomNo;
        opt1.textContent = optionText;
        studentRoomSelect.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = room.roomNo;
        opt2.textContent = optionText;
        editStudentRoomSelect.appendChild(opt2);
      });
  }
  loadRoomsForStudents();

  // load students
  function loadStudents() {
    studentTableBody.innerHTML = "";
    students.forEach((s, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${s.name}</td>
        <td>${s.room}</td>
        <td>${s.roomType}</td>  
        <td>${s.email}</td>
        <td>${s.status || "Active"}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewStudent(${i})">View</button>
          <button class="btn btn-sm btn-warning" onclick="editStudent(${i})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent(${i})">Delete</button>
        </td>
      `;
      studentTableBody.appendChild(row);
    });
  }
  loadStudents();

  // save room allocation (for Warden view)
  function saveRoomAllocation(student) {
    let allocations = JSON.parse(localStorage.getItem("roomAllocations")) || [];

    // check if student allocation already exists
    const existingIndex = allocations.findIndex(a => a.email === student.email);

    const allocation = {
      name: student.name,
      email: student.email,
      roomNo: student.room,
      roomType: student.roomType,
      edu: student.edu,
      yearSem: student.yearSem,
      regDate: student.regDate,
      status: "Assigned",
      capacity: getRoomCapacity(student.room) // Added capacity
    };

    if (existingIndex > -1) {
      allocations[existingIndex] = allocation;
    } else {
      allocations.push(allocation);
    }

    localStorage.setItem("roomAllocations", JSON.stringify(allocations));
  }

  // ====== Helper: Get capacity of a room ======
  function getRoomCapacity(roomNo) {
    const rooms = JSON.parse(localStorage.getItem("rooms")) || [];
    const room = rooms.find(r => r.roomNo === roomNo);
    return room ? room.capacity : '-';
  }

  // ====== Update Room Occupancy ======
  function updateRoomOccupancy(roomNo, change) {
    let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
    const roomIndex = rooms.findIndex((r) => r.roomNo === roomNo);
    if (roomIndex > -1) {
      rooms[roomIndex].occupied = (rooms[roomIndex].occupied || 0) + change;

      // Agar capacity exceed ho gayi toh rollback
      if (rooms[roomIndex].occupied > rooms[roomIndex].capacity) {
        rooms[roomIndex].occupied = rooms[roomIndex].capacity;
      }
      // Agar occupied 0 se kam ho gaya toh rollback
      if (rooms[roomIndex].occupied < 0) {
        rooms[roomIndex].occupied = 0;
      }

      localStorage.setItem("rooms", JSON.stringify(rooms));
    }
  }

  // ====== Add Student ======
  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const selectedRoom = studentRoomSelect.value;
    let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
    const room = rooms.find((r) => r.roomNo === selectedRoom);

    if (!room) {
      alert("Invalid room selection!");
      return;
    }
    if (room.occupied >= room.capacity) {
      alert("Room already occupied!");
      return;
    }

    const newStudent = {
      name: document.getElementById("student-name").value,
      email: document.getElementById("student-email").value,
      room: selectedRoom,
      roomType: room.roomType,
      edu: document.getElementById("student-edu").value,
      yearSem: document.getElementById("yearSemester").value,
      regDate: document.getElementById("student-regDate").value,
      status: "Active",
    };

    students.push(newStudent);
    localStorage.setItem("students", JSON.stringify(students));

    // Save allocation + Update room occupancy
    saveRoomAllocation(newStudent);
    updateRoomOccupancy(selectedRoom, +1);

    addForm.reset();
    closeModalAll();
    loadStudents();
    loadRoomsForStudents();
  });

  // ====== Edit Student ======
  window.editStudent = function (index) {
    const s = students[index];
    document.getElementById("edit-student-id").value = index;
    document.getElementById("edit-student-name").value = s.name;
    document.getElementById("edit-student-email").value = s.email;
    editStudentRoomSelect.value = s.room;
    document.getElementById("edit-student-edu").value = s.edu;
    document.getElementById("edit-yearSemester").value = s.yearSem;
    document.getElementById("edit-student-regDate").value = s.regDate;

    openModal(editModal);
  };

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const index = document.getElementById("edit-student-id").value;
    const oldRoom = students[index].room;
    const newRoom = editStudentRoomSelect.value;

    let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
    const room = rooms.find((r) => r.roomNo === newRoom);
    if (!room) {
      alert("Invalid room selection!");
      return;
    }
    if (room.occupied >= room.capacity && newRoom !== oldRoom) {
      alert("Room already occupied!");
      return;
    }

    students[index] = {
      name: document.getElementById("edit-student-name").value,
      email: document.getElementById("edit-student-email").value,
      room: newRoom,
      roomType: room.roomType,
      edu: document.getElementById("edit-student-edu").value,
      yearSem: document.getElementById("edit-yearSemester").value,
      regDate: document.getElementById("edit-student-regDate").value,
      status: "Active",
    };
    localStorage.setItem("students", JSON.stringify(students));

    // Update allocations
    saveRoomAllocation(students[index]);

    // Occupancy adjust (only if room changed)
    if (newRoom !== oldRoom) {
      updateRoomOccupancy(oldRoom, -1);
      updateRoomOccupancy(newRoom, +1);
    }

    editForm.reset();
    closeModalAll();
    loadStudents();
    loadRoomsForStudents();
  });

  // ====== Delete Student ======
  window.deleteStudent = function (index) {
    if (confirm("Are you sure to delete this student?")) {
      const roomNo = students[index].room;
      students.splice(index, 1);
      localStorage.setItem("students", JSON.stringify(students));
      updateRoomOccupancy(roomNo, -1);
      loadStudents();
      loadRoomsForStudents();
    }
  };

  // ====== View Student ======
  window.viewStudent = function (index) {
    const s = students[index];
    const details = document.getElementById("details-content");
    details.innerHTML = `
      <p><strong>Name:</strong> ${s.name}</p>
      <p><strong>Email:</strong> ${s.email}</p>
      <p><strong>Room:</strong> ${s.room}</p>
      <p><strong>Room:</strong> ${s.room} (${s.roomType})</p>
      <p><strong>Education:</strong> ${s.edu}</p>
      <p><strong>Year/Semester:</strong> ${s.yearSem}</p>
      <p><strong>Registration Date:</strong> ${s.regDate}</p>
      <p><strong>Status:</strong> ${s.status}</p>
    `;
    openModal(detailsModal);
  };
});
