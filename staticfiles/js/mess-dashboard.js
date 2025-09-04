document.addEventListener("DOMContentLoaded", () => {
  // --- Keys for localStorage ---
  const FEEDBACK_KEY = "studentMealFeedback";
  const SHORTAGE_KEY = "foodShortageReports";
  const MEAL_PLAN_KEY = "weeklyMealPlan";

  // --- Dashboard Cards ---
  const feedbackCard = document.getElementById("pending-feed");
  const shortageCard = document.getElementById("total-shortage");
  const mealPlanCard = document.getElementById("meal-plan-status");

  // --- Update counts/status on load ---
  function updateDashboard() {
    const feedbacks = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
    const shortages = JSON.parse(localStorage.getItem(SHORTAGE_KEY) || "[]");
    const mealPlans = JSON.parse(localStorage.getItem(MEAL_PLAN_KEY) || "[]");

    // Pending feedback
    document.getElementById("total-feedback").textContent = feedbacks.length;

    // Food shortage reports
    document.getElementById("total-shortage").textContent = shortages.length;

    // Weekly meal plan
    // Assume mealPlans array has objects with 'week' property (current week check optional)
    const currentWeekPlan =
      mealPlans.length > 0 ? "Submitted" : "Not Submitted";
    document.getElementById("meal-plan-status").textContent = currentWeekPlan;
  }

  // --- Redirect on card click ---
  feedbackCard.addEventListener("click", () => {
    window.location.href = "meal-feedback.html"; // student feedback tab
  });

  document
    .getElementById("total-shortage")
    .parentElement.addEventListener("click", () => {
      window.location.href = "food-shortage.html"; // food shortage tab
    });

  document
    .getElementById("meal-plan-status")
    .parentElement.addEventListener("click", () => {
      window.location.href = "meal-plan.html"; // weekly meal plan tab
    });

  // --- Initial load ---
  updateDashboard();
});
