document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".warden-sideBar");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
});
