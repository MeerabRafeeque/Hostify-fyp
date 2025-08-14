document.addEventListener("DOMContentLoaded", () => {
  const profileToggle = document.getElementById("profileToggle");
  const profileMenu = document.getElementById("profileMenu");

  profileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.style.display =
      profileMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    profileMenu.style.display = "none";
  });

  // Logout button click
  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "login.html"; // Redirect to login page
  });
});
