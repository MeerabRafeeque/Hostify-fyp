document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("globalSearch");
  if (!searchInput) return;

  searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();

    // search rows of the whole table
    document.querySelectorAll("table tbody tr").forEach((row) => {
      row.style.display = row.innerText.toLowerCase().includes(filter)
        ? ""
        : "none";
    });

    // search all cards
    document.querySelectorAll(".stat-card, .card").forEach((card) => {
      card.style.display = card.innerText.toLowerCase().includes(filter)
        ? ""
        : "none";
    });

    // search all list items
    document.querySelectorAll("ul li").forEach((li) => {
      li.style.display = li.innerText.toLowerCase().includes(filter)
        ? ""
        : "none";
    });
  });
});
