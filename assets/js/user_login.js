document.addEventListener("DOMContentLoaded", function () {
  const passwordField = document.getElementById("password");
  const toggleBtn = document.querySelector(".toggle-password i");
  const roleSelect = document.querySelector("select");
  const loginForm = document.querySelector("form");
  
  // set CSRF token in hidden field
  const csrfTokenField = document.getElementById("csrfToken");
  if (csrfTokenField) {
    csrfTokenField.value = getCSRFToken();
  }

  // toggle password visibility
  if (toggleBtn) {
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
  }

  // form validation & authentication
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // stop default form submission

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const role = roleSelect ? roleSelect.value : '';

      // validation
      if (email === "") {
        showNotification("Please enter your Email or Username.", "error");
        return;
      }

      if (password === "") {
        showNotification("Please enter your Password.", "error");
        return;
      }

      if (password.length < 6) {
        showNotification("Password must be at least 6 characters long.", "error");
        return;
      }

      if (role && role === "") {
        showNotification("Please select your role.", "error");
        return;
      }

      // show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Logging in...";
      submitBtn.disabled = true;

      try {

        // authenticate with Django backend
        const response = await fetch('/api/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
          },
          credentials: 'include',
          body: JSON.stringify({
            username: email,
            password: password,
            role: role
          })
        });

        if (response.ok) {
          const data = await response.json();
          showNotification("Login successful!", "success");
          
          // role-based redirect
          setTimeout(() => {
            const userRole = data.user.role;
            if (userRole === "student") {
              window.location.href = "/student-dashboard-pre/dashboard-pre.html";
            } else if (userRole === "admin") {
              window.location.href = "/admin-dashboard/dashboard.html";
            } else if (userRole === "warden") {
              window.location.href = "/warden-dashboard/warden.html";
            } else if (userRole === "deputy_rt") {
              window.location.href = "/deputy-dashboard/deputy-dashboard.html";
            } else if (userRole === "mess_staff") {
              window.location.href = "/mess-dashboard/mess-dashboard.html";
            } else {

              // default redirect for unknown roles
              window.location.href = "/";
            }
          }, 1000);
        } else {
          const errorData = await response.json();
          showNotification(errorData.message || "Login failed. Please check your credentials.", "error");
        }
      } catch (error) {
        console.error('Login error:', error);
        showNotification("An error occurred during login. Please try again.", "error");
      } finally {

        // reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // get CSRF token
  function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return '';
  }

  // show notification
  function showNotification(message, type = 'info') {

    // remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      max-width: 300px;
      word-wrap: break-word;
    `;

    // set background color based on type
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#28a745';
        break;
      case 'error':
        notification.style.backgroundColor = '#dc3545';
        break;
      case 'warning':
        notification.style.backgroundColor = '#ffc107';
        notification.style.color = '#212529';
        break;
      default:
        notification.style.backgroundColor = '#17a2b8';
    }

    document.body.appendChild(notification);

    // auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 500);
      }
    }, 5000);
  }
});
