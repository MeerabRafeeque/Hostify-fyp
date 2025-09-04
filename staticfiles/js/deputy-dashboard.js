document.addEventListener("DOMContentLoaded", () => {
  // ---------- Sample Data ----------
  let students = JSON.parse(localStorage.getItem("students")) || [
    { name: "Ali Khan", id: "STU001" },
    { name: "Fatima Noor", id: "STU002" },
    { name: "Hamza Ali", id: "STU003" },
  ];

  let mealMenu = JSON.parse(localStorage.getItem("mealMenu")) || {
    lastUpdated: "2025-08-22",
    description: "Biryani, Daal, Roti",
  };

  let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [
    { student: "Ali Khan", meal: "Lunch", feedback: "Good", seen: false },
    {
      student: "Fatima Noor",
      meal: "Dinner",
      feedback: "Average",
      seen: false,
    },
  ];

  let notifications = JSON.parse(
    localStorage.getItem("deputyNotifications")
  ) || [
    { message: "New student added", seen: false, date: "2025-08-22" },
    { message: "Feedback received", seen: false, date: "2025-08-22" },
  ];

  let newStudents = JSON.parse(localStorage.getItem("newStudents")) || [
    { name: "Sara Ahmed", id: "STU004" },
    { name: "Bilal Khan", id: "STU005" },
  ];

  // ---------- Dashboard Cards ----------
  document.querySelectorAll(".deputy-card").forEach((card) => {
    const cardTitle = card.querySelector("h3").textContent;

    // Total Students
    if (cardTitle.includes("Total Students")) {
      card.querySelector(".deputy-value").textContent = students.length;
      card.addEventListener("click", () => {
        alert(
          "Students List:\n" +
            students.map((s) => `${s.name} (${s.id})`).join("\n")
        );
      });
    }

    // Meal Menu
    if (cardTitle.includes("Meal Menu")) {
      card.querySelector(".deputy-value").textContent =
        "Updated: " + mealMenu.lastUpdated;
      card.addEventListener("click", () => {
        alert("Latest Meal Menu:\n" + mealMenu.description);
      });
    }

    // New Feedbacks
    if (cardTitle.includes("New Feedbacks")) {
      const unreadFeedbacks = feedbacks.filter((f) => !f.seen).length;
      card.querySelector(".deputy-value").textContent = unreadFeedbacks;
      card.addEventListener("click", () => {
        alert(
          "Feedbacks:\n" +
            feedbacks.map((f) => `${f.student} - ${f.feedback}`).join("\n")
        );
      });
    }

    // Notifications
    if (cardTitle.includes("Notifications")) {
      function updateNotificationCard() {
        const unread = notifications.filter((n) => !n.seen).length;
        card.querySelector(".deputy-value").textContent = unread;
      }

      updateNotificationCard();

      card.addEventListener("click", () => {
        const tableBody = document.querySelector(
          ".deputy-notification-table tbody"
        );
        tableBody.innerHTML = ""; // clear table
        notifications.forEach((note, index) => {
          const tr = document.createElement("tr");

          const dateTd = document.createElement("td");
          dateTd.textContent = note.date;
          tr.appendChild(dateTd);

          const messageTd = document.createElement("td");
          messageTd.textContent = note.message;
          tr.appendChild(messageTd);

          const actionTd = document.createElement("td");
          const btn = document.createElement("button");
          btn.classList.add("deputy-btn");
          btn.textContent = note.seen ? "Seen" : "Mark as Read";
          if (note.seen) btn.disabled = true;

          btn.addEventListener("click", () => {
            notifications[index].seen = true;
            localStorage.setItem(
              "deputyNotifications",
              JSON.stringify(notifications)
            );
            updateNotificationCard();
            renderTable(); // refresh table
          });

          actionTd.appendChild(btn);
          tr.appendChild(actionTd);
          tableBody.appendChild(tr);
        });
      });

      function renderTable() {
        const tableBody = document.querySelector(
          ".deputy-notification-table tbody"
        );
        tableBody.innerHTML = "";
        notifications.forEach((note, index) => {
          const tr = document.createElement("tr");

          const dateTd = document.createElement("td");
          dateTd.textContent = note.date;
          tr.appendChild(dateTd);

          const messageTd = document.createElement("td");
          messageTd.textContent = note.message;
          tr.appendChild(messageTd);

          const actionTd = document.createElement("td");
          const btn = document.createElement("button");
          btn.classList.add("deputy-btn");
          btn.textContent = note.seen ? "Seen" : "Mark as Read";
          if (note.seen) btn.disabled = true;

          btn.addEventListener("click", () => {
            notifications[index].seen = true;
            localStorage.setItem(
              "deputyNotifications",
              JSON.stringify(notifications)
            );
            updateNotificationCard();
            renderTable();
          });

          actionTd.appendChild(btn);
          tr.appendChild(actionTd);
          tableBody.appendChild(tr);
        });
      }
    }

    // New Students
    if (cardTitle.includes("New Students")) {
      card.querySelector(".deputy-value").textContent = newStudents.length;
      card.addEventListener("click", () => {
        alert(
          "New Students:\n" +
            newStudents.map((s) => `${s.name} (${s.id})`).join("\n")
        );
      });
    }
  });
});
