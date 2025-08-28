document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("view-req-btn");
  const addModal = document.getElementById("add-request-modal");
  const overlay = document.getElementById("modal-overlay");
  const closeBtns = document.querySelectorAll(".closeModal");

  const form = document.getElementById("add-request-form");
  const tableBody = document.querySelector("#stay-table tbody");

  let requests = JSON.parse(localStorage.getItem("extensionRequests")) || [];

  // modal function
  function openModal(modal) {
    if (!modal || !overlay) return;
    modal.classList.add("show");
    overlay.classList.add("show");
  }

  function closeModalAll() {
    document.querySelectorAll(".modal").forEach((m) => m.classList.remove("show"));
    overlay?.classList.remove("show");
  }

  addBtn?.addEventListener("click", () => openModal(addModal));
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModalAll));
  overlay?.addEventListener("click", closeModalAll);

  // load table
  function loadTable() {
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (requests.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9">No requests found</td></tr>`;
      return;
    }

    requests.forEach((r, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.reqId || r.requestNumber}</td>
        <td>${r.name || r.student}</td>
        <td>${r.studentId}</td>
        <td>${r.educationLevel || r.studentEducation || ""}</td>
        <td>${r.date}</td>
        <td>${r.duration}</td>
        <td>${r.reason}</td>
        <td>${r.status}</td>
        <td>
          <button class="btn btn-info" onclick="handleResponse(${i})">Respond</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  loadTable();

  // add request (optional admin manual addition)
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const newReq = {
        requestNumber: document.getElementById("request-number")?.value || "N/A",
        student: document.getElementById("student-request")?.value || "N/A",
        studentId: document.getElementById("student-request")?.value || "N/A",
        reason: document.getElementById("stay-reason")?.value || "N/A",
        duration: document.getElementById("extension-duration")?.value || "N/A",
        educationLevel: document.getElementById("student-education")?.value || "",
        yearSemester: document.getElementById("edit-yearSemester")?.value || "",
        date: new Date().toLocaleDateString(),
        status: "Pending",
        adminResponse: "Awaiting response",
      };

      requests.push(newReq);
      localStorage.setItem("extensionRequests", JSON.stringify(requests));
      form.reset();
      closeModalAll();
      loadTable();
    });
  }

  // admin response handler
  window.handleResponse = function (index) {
    const req = requests[index];
    if (!req) return;

    const response = prompt(
      `Student: ${req.name || req.student}\nEducation Level: ${req.educationLevel || ""}\nYear/Semester: ${req.yearSemester || ""}\nReason: ${req.reason}\n\nEnter your response:`
    );
    if (response === null) return;

    const decision = prompt("Approve, Reject, or Pending?")?.toLowerCase();
    if (!decision) return;

    // default status
    let newStatus = "Pending";

    if (decision === "approve") {
      const yrSem = req.yearSemester || "";
      if (yrSem.includes("7") || yrSem.includes("8")) {
        newStatus = "Approved";
      } else {
        newStatus = "Rejected";
        alert("Student is not in 7th/8th semester, automatically rejected!");
      }
    } else if (decision === "pending") {
      const yrSem = req.yearSemester || "";
      if (yrSem.includes("7") || yrSem.includes("8")) {
        newStatus = "Pending";
      } else {
        newStatus = "Rejected";
        alert("Student is not in 7th/8th semester, automatically rejected!");
      }
    } else if (decision === "reject") {
      newStatus = "Rejected";
    }

    req.status = newStatus;
    req.adminResponse = response;

    localStorage.setItem("extensionRequests", JSON.stringify(requests));
    loadTable();
    alert(`Status updated: ${req.status}`);
  };
});
