document.addEventListener("DOMContentLoaded", () => {

  // meals
  const STORAGE_MEAL = "weeklyMealData"; 

  // feedbacks (from students)
  const STORAGE_FEEDBACK = "mealFeedbacks"; 

  // selectors
  const mealForm = document.querySelector(".mess-meal-form");
  const mealTableBody = document.querySelector(".mess-meal-table tbody");

  // save meal 
  function saveMeal(meal) {
    let allMeals = JSON.parse(localStorage.getItem(STORAGE_MEAL) || "[]");

    // check if same day + meal already exists → update
    const index = allMeals.findIndex(
      (m) => m.day === meal.day && m.meal === meal.meal
    );
    if (index !== -1) {
      allMeals[index] = meal;
    } else {
      allMeals.push(meal);
    }

    localStorage.setItem(STORAGE_MEAL, JSON.stringify(allMeals));
  }

  // load meals
  function loadMeals() {
    let allMeals = JSON.parse(localStorage.getItem(STORAGE_MEAL) || "[]");
    mealTableBody.innerHTML = "";
    allMeals.forEach((m) => {
      const row = `
      <tr>
        <td>${m.day}</td>
        <td>${m.meal}</td>
        <td>${m.description}</td>
        <td>${m.updatedBy}</td>
        <td>${m.updatedDate}</td>
      </tr>
    `;
      mealTableBody.insertAdjacentHTML("beforeend", row);
    });
  }

  // form submit
  mealForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const day = document.getElementById("mess-day").value.trim();
    const meal = document.getElementById("mess-meal").value.trim();
    const desc = document.getElementById("mess-description").value.trim();
    const updatedBy = document.getElementById("mess-updated-by").value.trim();
    const updatedDate = document.getElementById("mess-updated-date").value;

    if (!day || !meal || !desc || !updatedBy || !updatedDate) {
      alert("Please fill all fields correctly.");
      return;
    }

    const mealObj = { day, meal, description: desc, updatedBy, updatedDate };
    saveMeal(mealObj);
    loadMeals();
    mealForm.reset();
  });

  // initialization
  document.addEventListener("DOMContentLoaded", loadMeals);
});
