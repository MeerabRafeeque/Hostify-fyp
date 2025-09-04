document.addEventListener("DOMContentLoaded", () => {
  const hostelName = document.getElementById("hostel-name");
  const hostelAddress = document.getElementById("hostel-address");
  const hostelContact = document.getElementById("hostel-contact");
  const saveBtn = document.getElementById("save-settings");

  // load existing settings if available
  const savedSettings = JSON.parse(localStorage.getItem("systemSettings"));
  if (savedSettings) {
    hostelName.value = savedSettings.name || "";
    hostelAddress.value = savedSettings.address || "";
    hostelContact.value = savedSettings.contact || "";
  }

  // save/update settings
  saveBtn.addEventListener("click", () => {
    const settings = {
      name: hostelName.value.trim(),
      address: hostelAddress.value.trim(),
      contact: hostelContact.value.trim(),
    };

    localStorage.setItem("systemSettings", JSON.stringify(settings));
    alert(" Settings saved successfully!");
  });
});
