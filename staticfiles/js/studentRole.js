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

  // form validation and login
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault(); // stop default form submission

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // email/username required
    if (email === "") {
      alert("Please enter your Email or Username.");
      return;
    }

    // password required
    if (password === "") {
      alert("Please enter your Password.");
      return;
    }

    // password length check
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    const studentName = email; // assuming email is used as unique identifier

    // --- Check for rejection notification ---
    const rejectReason = localStorage.getItem(`${studentName}_paymentReject`);
    if (rejectReason) {
      alert(`Your payment was rejected: ${rejectReason}`);
      localStorage.removeItem(`${studentName}_paymentReject`); // clear after showing
    }

    // --- Check for verification notification ---
    if (localStorage.getItem(`${studentName}_paymentVerified`) === "true") {
      alert("Your payment has been verified. You now have full access!");
      localStorage.removeItem(`${studentName}_paymentVerified`);
    }

    // --- Redirect based on access flag ---
    if (localStorage.getItem(`${studentName}_fullAccess`) === "true") {
      window.location.href = "/student-dashboard-post/dashboard-post.html"; // post-room dashboard
    } else {
      window.location.href = "/student-dashboard-pre/dashboard-pre.html"; // pre-room dashboard
    }

    // Optional success alert
    // alert("Login successful (dummy alert, backend required).");
  });
});
