document.addEventListener("DOMContentLoaded", () => {
  const attendanceTableBody = document.getElementById("attendanceTable");
  const penaltyTableBody = document.querySelector("#penalty-table tbody");

  const students = JSON.parse(localStorage.getItem("students")) || [];
  const attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
  const penalties = JSON.parse(localStorage.getItem("penalties")) || [];

  // helper: compute summary
  function computeSummary(record) {
    let present = 0, absent = 0, leave = 0, holiday = 0;
    const shifts = [record.morning, record.evening, record.night];

    if ((record.morning === "Present" && record.evening === "Present") || 
        (record.morning === "Present" && record.night === "Present")) {
      present = 1;
    } else if ((record.morning === "Absent" && record.evening === "Absent") || 
               (record.morning === "Absent" && record.night === "Absent")) {
      absent = 1;
    } else if (shifts.filter(v => v === "Leave").length >= 2) {
      leave = 1;
    } else if (shifts.filter(v => v === "Holiday").length >= 2) {
      holiday = 1;
    }
    return `Present:${present}, Absent:${absent}, Leave:${leave}, Holiday:${holiday}`;
  }

  // render attendance table (view-only)
  function renderAttendance() {
    attendanceTableBody.innerHTML = "";
    attendanceRecords.forEach((rec) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${rec.student_id}</td>
        <td>${rec.student_name}</td>
        <td>${rec.morning}</td>
        <td>${rec.evening}</td>
        <td>${rec.night}</td>
        <td>${rec.marked_by}</td>
        <td>${rec.date}</td>
        <td>${computeSummary(rec)}</td>
      `;
      attendanceTableBody.appendChild(tr);
    });
  }

  // render penalty table (with monthly total)
  function renderPenalties() {
    penaltyTableBody.innerHTML = "";
    students.forEach(student => {
      const studentPenalties = penalties.filter(p => p.student_id === student.id);
      const monthlyTotal = studentPenalties.reduce((sum, p) => sum + p.penalty_amount, 0);

      studentPenalties.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${p.date}</td>
          <td>${p.penalty_amount}</td>
          <td>${p.marked_by}</td>
          <td>${monthlyTotal}</td>
        `;
        penaltyTableBody.appendChild(tr);
      });
    });
  }

  renderAttendance();
  renderPenalties();
});
