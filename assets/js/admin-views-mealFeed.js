document.addEventListener("DOMContentLoaded", () => {

  // DOM elements
  const mealTableBody = document.querySelector("#meal-table tbody");
  const feedbackTableBody = document.querySelector("#meal-feedback tbody");

  // fetch data from localstorage
  function getMealMenu() {
    return JSON.parse(localStorage.getItem("mealPlan") || "[]");
  }

  function getStudentFeedbacks() {
    return JSON.parse(localStorage.getItem("studentFeedbacks") || "[]");
  }

  
  // render meal menu
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

  // render std feedback
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

  // initial render
  renderMealMenu();
  renderStudentFeedback();

  // optional: auto-refresh every 30s
  setInterval(() => {
    renderMealMenu();
    renderStudentFeedback();
  }, 30000);
});
