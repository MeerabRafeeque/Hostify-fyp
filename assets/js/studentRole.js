// wait until DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const passwordField = document.getElementById("password");
  const toggleBtn = document.querySelector(".toggle-password i");

  // toggle password visibility
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
  document.querySelector("form").addEventListener("submit", async function (e) {

    // stop default form submission
    e.preventDefault(); 

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

    try {

      // call the backend login API
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: email,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        // check user role and redirect accordingly
        if (data.user && data.user.role === 'student') {

          // check if student has room assigned
          const studentResponse = await fetch('/api/students/me/', {
            credentials: 'include'
          });
          
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            if (studentData.room) {

              // std has room assigned - redirect to post-room dashboard
              window.location.href = "/student-dashoard-post/dashboard-post.html";
            } else {

              // std has no room - redirect to pre-room dashboard
              window.location.href = "/student-dashboard-pre/dashboard-pre.html";
            }
          } else {
            
            // fallback to pre-room dashboard
            window.location.href = "/student-dashboard-pre/dashboard-pre.html";
          }
        } else {
          alert('Invalid user role. Only students can access this login.');
        }
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.non_field_errors ? errorData.non_field_errors[0] : 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  });
});
