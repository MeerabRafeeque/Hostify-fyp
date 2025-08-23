document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector(".roomAllocationTable tbody");

  // fetch data from localStorage
  let allocations = JSON.parse(localStorage.getItem("roomAllocations")) || [];

  // agar koi record nai hai
  if (allocations.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No records available</td></tr>`;
    return;
  }

  // clear first
  tableBody.innerHTML = "";

  allocations.forEach((alloc) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${alloc.name}</td>
      <td>${alloc.id}</td>
      <td>${alloc.roomNo}</td>
      <td>${alloc.roomType}</td>
      <td>${alloc.capacity}</td>
      <td><span class="status ${alloc.status ? alloc.status.toLowerCase() : ''}">
        ${alloc.status || "Pending"}
      </span></td>
    `;
    tableBody.appendChild(tr);
  });
});
