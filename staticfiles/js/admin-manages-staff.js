document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("add-staff-btn");
  const addModal = document.getElementById("add-staff-modal");
  const editModal = document.getElementById("edit-staff-modal");
  const detailsModal = document.getElementById("details-modal");
  const overlay = document.getElementById("modal-overlay");
  const closeBtns = document.querySelectorAll(".closeModal");

  const addForm = document.getElementById("add-staff-form");
  const editForm = document.getElementById("edit-staff-form");
  const tableBody = document.querySelector("#staff-table tbody");

  let staffList = JSON.parse(localStorage.getItem("staffList")) || [];

  // modal functions
  function openModal(modal) {
    modal.classList.add("show");
    overlay.classList.add("show");
  }
  function closeModalAll() {
    document
      .querySelectorAll(".modal")
      .forEach((m) => m.classList.remove("show"));
    overlay.classList.remove("show");
  }
  addBtn.addEventListener("click", () => openModal(addModal));
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModalAll));
  overlay.addEventListener("click", closeModalAll);

  // load staff table
  function loadStaffTable() {
    tableBody.innerHTML = "";
    if (staffList.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6">No staff available</td></tr>`;
      return;
    }
    staffList.forEach((staff, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${staff.name}</td>
        <td>${staff.email}</td>
        <td>${staff.position}</td>
        <td>${staff.shift}</td>
        <td>
          <button class="btn btn-info" onclick="viewStaff(${i})">View</button>
          <button class="btn btn-warning" onclick="editStaff(${i})">Update</button>
          <button class="btn btn-danger" onclick="deleteStaff(${i})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
  loadStaffTable();

  addBtn.addEventListener("click", () => {
    console.log("Add Staff button clicked");
    openModal(addModal);
  });

  // add staff
  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const newStaff = {
      name: document.getElementById("staff-name").value,
      email: document.getElementById("staff-email").value,
      position: document.getElementById("staff-position").value,
      phone: document.getElementById("staff-phone").value,
      shift: document.getElementById("staff-shift").value,
    };
    staffList.push(newStaff);
    localStorage.setItem("staffList", JSON.stringify(staffList));
    addForm.reset();
    closeModalAll();
    loadStaffTable();
  });

  // view staff
  window.viewStaff = function (index) {
    const staff = staffList[index];
    const details = document.getElementById("details-content");
    details.innerHTML = `
      <p><strong>Name:</strong> ${staff.name}</p>
      <p><strong>Email:</strong> ${staff.email}</p>
      <p><strong>Position:</strong> ${staff.position}</p>
      <p><strong>Phone:</strong> ${staff.phone}</p>
      <p><strong>Shift:</strong> ${staff.shift}</p>
    `;
    openModal(detailsModal);
  };

  // edit staff
  window.editStaff = function (index) {
    const staff = staffList[index];
    document.getElementById("edit-staff-id").value = index;
    document.getElementById("edit-staff-name").value = staff.name;
    document.getElementById("edit-staff-email").value = staff.email;
    document.getElementById("edit-staff-position").value = staff.position;
    document.getElementById("edit-staff-phone").value = staff.phone;
    document.getElementById("edit-staff-shift").value = staff.shift;
    openModal(editModal);
  };

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const index = document.getElementById("edit-staff-id").value;
    staffList[index] = {
      name: document.getElementById("edit-staff-name").value,
      email: document.getElementById("edit-staff-email").value,
      position: document.getElementById("edit-staff-position").value,
      phone: document.getElementById("edit-staff-phone").value,
      shift: document.getElementById("edit-staff-shift").value,
    };
    localStorage.setItem("staffList", JSON.stringify(staffList));
    closeModalAll();
    loadStaffTable();
  });

  // delete staff
  window.deleteStaff = function (index) {
    if (confirm("Are you sure you want to delete this staff?")) {
      const removedStaff = staffList.splice(index, 1)[0];
      localStorage.setItem("staffList", JSON.stringify(staffList));
      loadStaffTable();

      // Notification + logout simulation
      alert(`Staff ${removedStaff.name} has been removed and logged out.`);
      // redirect to login page
      window.location.href = "/login-all.html";
    }
  };
});
