document.addEventListener("DOMContentLoaded", () => {
  (function initPreDashboard() {
    // Try to read saved registrationDate (YYYY-MM-DD)
    let reg = localStorage.getItem("registrationDate");
    if (!reg) {
      // Fallback: set today for demo so page always works
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      reg = `${yyyy}-${mm}-${dd}`;
      // don't save automatically if you don't want to; uncomment to persist:
      // localStorage.setItem("registrationDate", reg);
    }

    const regDate = new Date(reg + "T00:00:00");
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const elapsed = Math.floor((now - regDate) / oneDay);
    const total = 7;
    const left = Math.max(0, total - elapsed);
    const percent = Math.min(100, Math.max(0, ((total - left) / total) * 100));

    const daysLeftEl = document.getElementById("daysLeft");
    const bar = document.getElementById("progressBar");

    if (daysLeftEl) daysLeftEl.textContent = left;
    if (bar) bar.style.width = percent + "%";
  })();
});
