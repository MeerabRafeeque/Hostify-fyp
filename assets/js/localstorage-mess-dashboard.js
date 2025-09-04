document.addEventListener("DOMContentLoaded", () => {

  // 1. DOM elements
  const feedbackCard = document.getElementById("pending-feed");
  const shortageCard = document.getElementById("total-shortage");
  const mealPlanStatus = document.getElementById("meal-plan-status");
  const notificationCard = document.getElementById("notifications-card"); // optional

  
  // 2. fetch data from localstorage
  function getPendingFeedback() {
    const allFeedback = JSON.parse(localStorage.getItem("studentFeedbacks") || "[]");

    // return all feedbacks, or filter if needed
    return allFeedback; 
  }

  function getFoodShortageReports() {
    return JSON.parse(localStorage.getItem("foodShortage") || "[]");
  }

  function getCurrentWeekMealPlan() {
    const mealPlans = JSON.parse(localStorage.getItem("mealPlan") || "[]");
    if (!mealPlans.length) return false;

    const now = new Date();

    // 0=Sun, 1=Mon
    const dayOfWeek = now.getDay(); 
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

  // 3. update dashboard counts
  function updateDashboard() {
    document.getElementById("total-feedback").textContent = getPendingFeedback().length;
    document.getElementById("total-shortage").textContent = getFoodShortageReports().length;
    mealPlanStatus.textContent = getCurrentWeekMealPlan() ? "Submitted" : "Not Submitted";

    if (notificationCard) {
      const unreadCount = getDeputyNotifications().filter(n => !n.seen).length;
      notificationCard.querySelector(".deputy-value").textContent = unreadCount;
    }
  }

  // initial update
  updateDashboard();

  // auto refresh every minute
  setInterval(updateDashboard, 60 * 1000);

  
  // 4. card click handlers
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

  
  // 5. deputy notifications table (opt)
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

      // update dashboard unread count
      const unreadCount = notifications.filter(n => !n.seen).length;
      if (notificationCard) {
        notificationCard.querySelector(".deputy-value").textContent = unreadCount;
      }

      // mark as read
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
