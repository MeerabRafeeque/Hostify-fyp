// Select all sidebar items
const sidebarItems = document.querySelectorAll("aside nav ul li");

sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    const targetPage = item.getAttribute("data-page"); // custom attribute for page link
    if(targetPage) {
      window.location.href = targetPage; // open the target page
    }
  });
});
