document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector(".attendance-table tbody");

  // Load attendance records and students
  const attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
  const students = JSON.parse(localStorage.getItem("students")) || [];

  // Render function
  function renderAttendance() {
    tableBody.innerHTML = "";

    students.forEach(student => {
      // Get all records for this student
      const studentRecords = attendanceRecords.filter(r => r.student_id === student.id);

      // Get unique dates for this student
      const dates = [...new Set(studentRecords.map(r => r.date))];

      dates.forEach(date => {
        const tr = document.createElement("tr");

        // Find shift-wise records
        const morningRecord = studentRecords.find(r => r.shift === "Morning" && r.date === date);
        const eveningRecord = studentRecords.find(r => r.shift === "Evening" && r.date === date);
        const nightRecord = studentRecords.find(r => r.shift === "Night" && r.date === date);

        const marked_by = morningRecord?.marked_by || eveningRecord?.marked_by || nightRecord?.marked_by || "-";

        // Determine overall status
        let status = "Null";
        const shiftStatuses = [morningRecord?.status, eveningRecord?.status, nightRecord?.status];
        if (shiftStatuses.includes("Present")) status = "Present";
        else if (shiftStatuses.includes("Absent")) status = "Absent";
        else if (shiftStatuses.includes("Leave")) status = "Leave";
        else if (shiftStatuses.includes("Holiday")) status = "Holiday";

        // Create table row
        tr.innerHTML = `
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${morningRecord?.status || "Null"}</td>
          <td>${eveningRecord?.status || "Null"}</td>
          <td>${nightRecord?.status || "Null"}</td>
          <td>${marked_by}</td>
          <td>${date}</td>
          <td>${status}</td>
        `;

        tableBody.appendChild(tr);
      });
    });
  }

  // Initial render
  renderAttendance();
});
