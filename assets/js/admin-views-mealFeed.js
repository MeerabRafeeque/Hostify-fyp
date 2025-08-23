document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // DOM ELEMENTS
  // ---------------------------
  const mealTableBody = document.querySelector("#meal-table tbody");
  const feedbackTableBody = document.querySelector("#meal-feedback tbody");

  // ---------------------------
  // FETCH DATA FROM LOCALSTORAGE
  // ---------------------------
  function getMealMenu() {
    return JSON.parse(localStorage.getItem("mealPlan") || "[]");
  }

  function getStudentFeedbacks() {
    return JSON.parse(localStorage.getItem("studentFeedbacks") || "[]");
  }

  // ---------------------------
  // RENDER MEAL MENU
  // ---------------------------
  function renderMealMenu() {
    const meals = getMealMenu();
    mealTableBody.innerHTML = "";

    if (meals.length === 0) {
      mealTableBody.innerHTML = `<tr><td colspan="5">No meals available yet</td></tr>`;
      return;
    }

    meals.forEach((meal) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${meal.day}</td>
        <td>${meal.meal}</td>
        <td>${meal.description}</td>
        <td>${meal.updatedBy}</td>
        <td>${meal.updatedDate}</td>
      `;
      mealTableBody.appendChild(row);
    });
  }

  // ---------------------------
  // RENDER STUDENT FEEDBACK
  // ---------------------------
  function renderStudentFeedback() {
    const feedbacks = getStudentFeedbacks();
    feedbackTableBody.innerHTML = "";

    if (feedbacks.length === 0) {
      feedbackTableBody.innerHTML = `<tr><td colspan="4">No feedback submitted yet</td></tr>`;
      return;
    }

    feedbacks.forEach((fb) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${fb.day}</td>
        <td>${fb.meal}</td>
        <td>${fb.name}</td>
        <td>${fb.feedback}</td>
      `;
      feedbackTableBody.appendChild(row);
    });
  }

  // ---------------------------
  // INITIAL RENDER
  // ---------------------------
  renderMealMenu();
  renderStudentFeedback();

  // Optional: Auto-refresh every 30s
  setInterval(() => {
    renderMealMenu();
    renderStudentFeedback();
  }, 30000);
});
