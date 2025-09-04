document.addEventListener("DOMContentLoaded", () => {
  const attendanceTbody = document.getElementById("attendance-tbody");
  const saveBtn = document.getElementById("save-attendance"); // button if any

  // Load existing records
  let attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
  let penalties = JSON.parse(localStorage.getItem("penalties")) || [];

  // Function to save attendance
  function saveAttendance() {
    const rows = attendanceTbody.querySelectorAll("tr");

    rows.forEach(tr => {
      const student_id = tr.children[0].textContent.trim();
      const student_name = tr.children[1].textContent.trim();
      const morning = tr.querySelector("select[data-shift='Morning']").value;
      const evening = tr.querySelector("select[data-shift='Evening']").value;
      const night = tr.querySelector("select[data-shift='Night']").value;
      const marked_by = tr.querySelector("td:nth-child(6) select").value;
      const date = tr.querySelector("input[type='date']").value;

      function addOrUpdateRecord(shift, status) {
        if (status === "Null") return;

        const existingIndex = attendanceRecords.findIndex(
          r => r.student_id === student_id && r.shift === shift && r.date === date
        );

        const record = {
          student_id,
          student_name,
          shift,
          status,
          marked_by,
          date
        };

        if (existingIndex !== -1) {
          attendanceRecords[existingIndex] = record; // update
        } else {
          attendanceRecords.push(record); // add
        }

        // Night penalty logic
        if (shift === "Night" && status === "Present") {
          if (!penalties.some(p => p.student_id === student_id && p.date === date)) {
            penalties.push({
              student_id,
              student_name,
              date,
              penalty_amount: 500,
              marked_by
            });
          }
        }
        if (shift === "Night" && status === "Null") {
          // remove penalty if any
          penalties = penalties.filter(p => !(p.student_id === student_id && p.date === date));
        }
      }

      addOrUpdateRecord("Morning", morning);
      addOrUpdateRecord("Evening", evening);
      addOrUpdateRecord("Night", night);
    });

    // Save to localStorage
    localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));
    localStorage.setItem("penalties", JSON.stringify(penalties));
    alert("Attendance saved successfully!");
  }

  // Attach save button
  if (saveBtn) {
    saveBtn.addEventListener("click", saveAttendance);
  }
});
