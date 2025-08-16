// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const passwordField = document.getElementById("password");
  const toggleBtn = document.querySelector(".toggle-password i");

  // Toggle password visibility
  toggleBtn.addEventListener("click", function () {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      toggleBtn.classList.remove("fa-eye");
      toggleBtn.classList.add("fa-eye-slash");
    } else {
      passwordField.type = "password";
      toggleBtn.classList.remove("fa-eye-slash");
      toggleBtn.classList.add("fa-eye");
    }
  });
});
