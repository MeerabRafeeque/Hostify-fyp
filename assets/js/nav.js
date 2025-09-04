// select all sidebar items
const sidebarItems = document.querySelectorAll("aside nav ul li");

sidebarItems.forEach((item) => {
  item.addEventListener("click", () => {

    // custom attribute for page link
    const targetPage = item.getAttribute("data-page"); 
    if (targetPage) {

      // open the target page
      window.location.href = targetPage; 
    }
  });
});
