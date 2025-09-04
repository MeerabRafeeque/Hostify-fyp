document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector(".mess-feedback-table tbody");
  const feedbacks = JSON.parse(localStorage.getItem("studentFeedbacks")) || [];

  tbody.innerHTML = feedbacks.length
    ? feedbacks.map(fb => `
        <tr>
          <td>${fb.name}</td>
          <td>${fb.id}</td>
          <td>${fb.day}</td>
          <td>${fb.meal}</td>
          <td>${fb.feedback}</td>
        </tr>`).join('')
    : `<tr><td colspan="5">No feedback submitted yet</td></tr>`;
});
