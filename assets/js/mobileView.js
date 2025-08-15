document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sideBar, .warden-sideBar");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
});
