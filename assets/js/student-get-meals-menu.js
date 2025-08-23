document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".feedback-form");

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const id = document.getElementById("studentID").value.trim();
    const day = document.getElementById("day").value;
    const meal = document.getElementById("mealName").value.trim();
    const feedback = document.getElementById("feedback").value.trim();

    if (!name || !id || !day || !meal || !feedback) {
      alert("Please fill all the fields.");
      return;
    }

    const feedbacks = JSON.parse(localStorage.getItem("studentFeedbacks")) || [];
    feedbacks.push({ name, id, day, meal, feedback });
    localStorage.setItem("studentFeedbacks", JSON.stringify(feedbacks));

    alert("Thank you so much for your feedback!");
    form.reset();
  });

  // Render meals
  function renderStudentMeals() {
    const meals = JSON.parse(localStorage.getItem("mealPlan")) || [];
    const tbody = document.getElementById("studentMealTable");
    tbody.innerHTML = "";

    if (meals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No meals available yet</td></tr>`;
      return;
    }

    meals.forEach(m => {
      const row = `
        <tr>
          <td>${m.day}</td>
          <td>${m.meal}</td>
          <td>${m.description}</td>
          <td>${m.updatedBy}</td>
          <td>${m.updatedDate}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  renderStudentMeals();
});
