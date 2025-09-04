document.addEventListener("DOMContentLoaded", () => {
  // Assume registration date is saved in localStorage (server se bhi aa sakti hai)
  let regDate = localStorage.getItem("registrationDate");
  if (!regDate) {
    // just demo ke liye current date save kar raha hoon
    regDate = new Date().toISOString().split("T")[0];
    localStorage.setItem("registrationDate", regDate);
  }

  const startDate = new Date(regDate);
  const today = new Date();

  // 7-day deadline
  const deadline = new Date(startDate);
  deadline.setDate(startDate.getDate() + 7);

  function updateCountdown() {
    const now = new Date();
    const diff = deadline - now;

    let daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const daysEl = document.getElementById("daysLeft");
    const progressBar = document.getElementById("progressBar");

    if (daysLeft <= 0) {
      daysEl.textContent = "0";
      progressBar.style.width = "100%";
      progressBar.style.background = "red";
      document.querySelector(".chip.warn").textContent = "⚠️ Deadline Passed";
      alert("Your 7-day period has expired. Please contact admin.");
      return;
    }

    daysEl.textContent = daysLeft;

    // progress = % time passed
    const totalDays = 7;
    const passed = totalDays - daysLeft;
    const percent = (passed / totalDays) * 100;
    progressBar.style.width = percent + "%";

    // color shifting
    if (daysLeft > 4) {
      progressBar.style.background = "green";
    } else if (daysLeft > 2) {
      progressBar.style.background = "orange";
    } else {
      progressBar.style.background = "red";
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 60 * 60 * 1000); // update every 1 hr
});
