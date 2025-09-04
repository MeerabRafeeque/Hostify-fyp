
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

document.addEventListener("DOMContentLoaded", () => {
  const profileToggle = document.getElementById("profileToggle");
  const profileMenu = document.getElementById("profileMenu");

  if (profileToggle && profileMenu) {
    profileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.style.display =
        profileMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
      profileMenu.style.display = "none";
    });
  }

  // logout button click
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    const logoutLink = logoutBtn.querySelector('a');
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault();
        
        try {
          // call backend logout API
          const response = await fetch('/api/auth/logout/', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          // clear any local storage
          localStorage.clear();
          
          // redirect to login page
          window.location.href = "/student-public.html/login-all.html";
        } catch (error) {
          console.error('Logout error:', error);
          
          // still redirect even if logout API fails
          window.location.href = "/student-public.html/login-all.html";
        }
      });
    }
  }
});
