document.addEventListener("DOMContentLoaded", () => {
  // Load meals from localStorage
  function renderStudentMeals() {
    const tbody = document.getElementById("studentMealTable");
    tbody.innerHTML = "";

    const meals = JSON.parse(localStorage.getItem("mealPlan")) || [];
    if (meals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No meals available yet.</td></tr>`;
      return;
    }

    meals.forEach(m => {
      const row = `<tr>
        <td>${m.day}</td>
        <td>${m.meal}</td>
        <td>${m.description}</td>
        <td>${m.updatedBy}</td>
        <td>${m.updatedDate}</td>
      </tr>`;
      tbody.innerHTML += row;
    });
  }

  document.addEventListener("DOMContentLoaded", renderStudentMeals);

});
