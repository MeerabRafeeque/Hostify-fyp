document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("globalSearch");
  if (!searchInput) return;

  searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();

    // 🔹 1. Sare tables ke rows search karo
    document.querySelectorAll("table tbody tr").forEach((row) => {
      row.style.display = row.innerText.toLowerCase().includes(filter)
        ? ""
        : "none";
    });

    // 🔹 2. Sare cards search karo (agar hain)
    document.querySelectorAll(".stat-card, .card").forEach((card) => {
      card.style.display = card.innerText.toLowerCase().includes(filter)
        ? ""
        : "none";
    });

    // 🔹 3. Sare list items search karo (agar hain)
    document.querySelectorAll("ul li").forEach((li) => {
      li.style.display = li.innerText.toLowerCase().includes(filter)
        ? ""
        : "none";
    });
  });
});
