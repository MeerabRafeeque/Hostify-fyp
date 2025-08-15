document.addEventListener("DOMContentLoaded", () => {
  const fullNameEl = document.getElementById("fullName");
  const userRoleEl = document.getElementById("userRole");

  if (fullNameEl && userRoleEl) {
    const user = {
      fullName: "John Doe",
      userId: "U1001",
      contact: "0300-1234567",
      password: "password123",
      role: "role", // other roles: student, admin, mess, deputy
      position: "role",
    };

    fullNameEl.textContent = user.fullName;
    userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    document.getElementById("fullNameInput").value = user.fullName;
    document.getElementById("userIdInput").value = user.userId;
    document.getElementById("contactInput").value = user.contact;
    document.getElementById("passwordInput").value = user.password;

    if (user.role !== "student") {
      document.getElementById("positionInput").value = user.position;
    } else {
      document.getElementById("positionGroup").style.display = "none";
    }
  }

  // Toggle password visibility
  const togglePasswordBtn = document.getElementById("togglePassword");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      const passField = document.getElementById("passwordInput");
      if (passField.type === "password") {
        passField.type = "text";
        togglePasswordBtn.textContent = "Hide";
      } else {
        passField.type = "password";
        togglePasswordBtn.textContent = "Show";
      }
    });
  }

  // Save updates
  const saveBtn = document.getElementById("saveProfile");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const updatedContact = document.getElementById("contactInput").value;
      const updatedPassword = document.getElementById("passwordInput").value;
      console.log("Saving:", { updatedContact, updatedPassword });
      alert("Profile updated successfully!");
    });
  }
});
