document.addEventListener("DOMContentLoaded", () => {
  const fullNameEl = document.getElementById("fullName");
  const userRoleEl = document.getElementById("userRole");

  // --- Get current logged-in user ---
  // Replace with actual backend or session check
  const currentUserId = localStorage.getItem("currentUserId");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.id === currentUserId) || {
    fullName: "John Doe",
    userId: "U1001",
    contact: "0300-1234567",
    password: "password123",
    role: "role", // student/admin/mess/deputy/warden
    position: "role",
  };

  // --- Populate profile fields ---
  if (fullNameEl && userRoleEl) {
    fullNameEl.textContent = user.fullName;
    userRoleEl.textContent =
      user.role.charAt(0).toUpperCase() + user.role.slice(1);

    document.getElementById("fullNameInput").value = user.fullName;
    document.getElementById("userIdInput").value = user.id || user.userId;
    document.getElementById("contactInput").value = user.contact;
    document.getElementById("passwordInput").value = user.password;

    if (user.role !== "student") {
      document.getElementById("positionInput").value = user.position;
    } else {
      document.getElementById("positionGroup").style.display = "none";
    }
  }

  // --- Toggle password visibility ---
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

  // --- Save updates ---
  const saveBtn = document.getElementById("saveProfile");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const updatedName = document.getElementById("fullNameInput").value.trim();
      const updatedContact = document.getElementById("contactInput").value.trim();
      const updatedPassword = document.getElementById("passwordInput").value;

      if (!updatedName || !updatedPassword) {
        alert("Name and password cannot be empty!");
        return;
      }

      // Update localStorage
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].fullName = updatedName;
        users[userIndex].contact = updatedContact;
        users[userIndex].password = updatedPassword;
        localStorage.setItem("users", JSON.stringify(users));

        alert("Profile updated successfully!");
        // Refresh displayed data
        fullNameEl.textContent = updatedName;
      }
    });
  }
});
