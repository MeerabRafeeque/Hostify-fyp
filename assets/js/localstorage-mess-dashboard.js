document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // 1. DOM ELEMENTS
  // ---------------------------
  const feedbackCard = document.getElementById("pending-feed");
  const shortageCard = document.getElementById("total-shortage");
  const mealPlanStatus = document.getElementById("meal-plan-status");
  const notificationCard = document.getElementById("notifications-card"); // optional

  // ---------------------------
  // 2. FETCH DATA FROM LOCALSTORAGE
  // ---------------------------
  function getPendingFeedback() {
    const allFeedback = JSON.parse(localStorage.getItem("studentFeedbacks") || "[]");
    return allFeedback; // return all feedbacks, ya filter if needed
  }

  function getFoodShortageReports() {
    return JSON.parse(localStorage.getItem("foodShortage") || "[]");
  }

  function getCurrentWeekMealPlan() {
    const mealPlans = JSON.parse(localStorage.getItem("mealPlan") || "[]");
    if (!mealPlans.length) return false;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return mealPlans.some(mp => {
      const planDate = new Date(mp.updatedDate);
      return planDate >= monday && planDate <= sunday;
    });
  }

  function getDeputyNotifications() {
    return JSON.parse(localStorage.getItem("deputyNotifications") || "[]");
  }

  // ---------------------------
  // 3. UPDATE DASHBOARD COUNTS
  // ---------------------------
  function updateDashboard() {
    document.getElementById("total-feedback").textContent = getPendingFeedback().length;
    document.getElementById("total-shortage").textContent = getFoodShortageReports().length;
    mealPlanStatus.textContent = getCurrentWeekMealPlan() ? "Submitted" : "Not Submitted";

    if (notificationCard) {
      const unreadCount = getDeputyNotifications().filter(n => !n.seen).length;
      notificationCard.querySelector(".deputy-value").textContent = unreadCount;
    }
  }

  // Initial update
  updateDashboard();

  // Auto refresh every minute
  setInterval(updateDashboard, 60 * 1000);

  // ---------------------------
  // 4. CARD CLICK HANDLERS
  // ---------------------------
  feedbackCard.addEventListener("click", () => {
    window.location.href = "meal-feedback.html";
  });

  if (shortageCard) {
    shortageCard.parentElement.addEventListener("click", () => {
      window.location.href = "food-shortage.html";
    });
  }

  if (mealPlanStatus) {
    mealPlanStatus.parentElement.addEventListener("click", () => {
      window.location.href = "meal-plan.html";
    });
  }

  if (notificationCard) {
    notificationCard.addEventListener("click", () => {
      window.location.href = "deputy-notification.html";
    });
  }

  // ---------------------------
  // 5. DEPUTY NOTIFICATIONS TABLE (OPTIONAL)
  // ---------------------------
  if (document.querySelector(".deputy-notification-table")) {
    let notifications = getDeputyNotifications();

    function renderNotifications() {
      const tbody = document.querySelector(".deputy-notification-table tbody");
      tbody.innerHTML = "";
      notifications.forEach((n, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${n.date}</td>
          <td>${n.message}</td>
          <td><button class="deputy-btn" data-index="${index}">${n.seen ? "Read" : "Mark as Read"}</button></td>
        `;
        if (!n.seen) row.style.fontWeight = "bold";
        tbody.appendChild(row);
      });

      // Update dashboard unread count
      const unreadCount = notifications.filter(n => !n.seen).length;
      if (notificationCard) {
        notificationCard.querySelector(".deputy-value").textContent = unreadCount;
      }

      // Mark as read
      document.querySelectorAll(".deputy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = parseInt(btn.dataset.index);
          notifications[i].seen = true;
          localStorage.setItem("deputyNotifications", JSON.stringify(notifications));
          renderNotifications();
        });
      });
    }

    renderNotifications();
  }
});
