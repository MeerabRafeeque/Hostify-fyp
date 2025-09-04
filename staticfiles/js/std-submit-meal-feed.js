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
      alert("Please fill all fields.");
      return;
    }

    // Save feedback
    const feedbacks = JSON.parse(localStorage.getItem("studentFeedbacks")) || [];
    feedbacks.push({ name, id, day, meal, feedback });
    localStorage.setItem("studentFeedbacks", JSON.stringify(feedbacks));

    alert("Feedback submitted!");
    this.reset();
  });

  // Render meals
  const tbody = document.getElementById("studentMealTable");
  const meals = JSON.parse(localStorage.getItem("mealPlan")) || [];
  tbody.innerHTML = meals.length
    ? meals.map(m => `
        <tr>
          <td>${m.day}</td>
          <td>${m.meal}</td>
          <td>${m.description}</td>
          <td>${m.updatedBy}</td>
          <td>${m.updatedDate}</td>
        </tr>`).join('')
    : `<tr><td colspan="5">No meals yet</td></tr>`;
});
