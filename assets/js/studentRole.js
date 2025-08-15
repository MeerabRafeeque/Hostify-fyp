document.addEventListener("DOMContentLoaded", () => {
  const userRole = document.getElementById("userRole").innerText.trim();
  const positionGroup = document.getElementById("positionGroup");

//   if student then no position
  if (userRole.toLowerCase() === "student") {
    positionGroup.style.display = "none";
  }
});
