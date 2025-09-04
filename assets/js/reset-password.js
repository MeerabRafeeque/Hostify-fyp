// wait until DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const newPassField = document.getElementById("newPass");
  const confirmPassField = document.getElementById("confirmPass");

  // helper function to add toggle eye
  function addToggleIcon(field) {
    if (!field) return;

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    field.parentNode.insertBefore(wrapper, field);
    wrapper.appendChild(field);

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-eye-slash toggle-reset-eye"; 
    icon.style.position = "absolute";
    icon.style.right = "10px";
    icon.style.top = "50%";
    icon.style.transform = "translateY(-50%)";
    icon.style.cursor = "pointer";
    icon.style.color = "#1e3a8a";
    wrapper.appendChild(icon);

    // toggle password visibility
    icon.addEventListener("click", function () {
      if (field.type === "password") {
        field.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      } else {
        field.type = "password";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    });
  }

  // apply toggle to both fields
  addToggleIcon(newPassField);
  addToggleIcon(confirmPassField);
});
