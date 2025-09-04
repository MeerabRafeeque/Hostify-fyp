document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // 1. DOM ELEMENTS
  // ---------------------------
  const mealTableBody = document.querySelector(".deputy-meal-table tbody");
  const feedbackTableBody = document.querySelector(".deputy-feedback-table tbody");

  // ---------------------------
  // 2. FETCH DATA FROM LOCALSTORAGE
  // ---------------------------
  function getMealMenu() {
    return JSON.parse(localStorage.getItem("mealPlan") || "[]");
  }

  function getStudentFeedbacks() {
    return JSON.parse(localStorage.getItem("studentFeedbacks") || "[]");
  }

  // ---------------------------
  // 3. RENDER MEAL MENU
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
  // 4. RENDER STUDENT FEEDBACK
  // ---------------------------
  function renderStudentFeedback() {
    const feedbacks = getStudentFeedbacks();
    feedbackTableBody.innerHTML = "";

    if (feedbacks.length === 0) {
      feedbackTableBody.innerHTML = `<tr><td colspan="5">No feedback submitted yet</td></tr>`;
      return;
    }

    feedbacks.forEach((fb) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${fb.name}</td>
        <td>${fb.id}</td>
        <td>${fb.day}</td>
        <td>${fb.meal}</td>
        <td>${fb.feedback}</td>
      `;
      feedbackTableBody.appendChild(row);
    });
  }

  // ---------------------------
  // 5. INITIAL RENDER
  // ---------------------------
  renderMealMenu();
  renderStudentFeedback();

  // Optional: Auto-refresh every 30s
  setInterval(() => {
    renderMealMenu();
    renderStudentFeedback();
  }, 30000);
});
