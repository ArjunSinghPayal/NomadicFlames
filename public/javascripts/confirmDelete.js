document.addEventListener("DOMContentLoaded", () => {
  const deleteForms = document.querySelectorAll(".confirm-delete-form");

  deleteForms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      const message =
        form.getAttribute("data-confirm") ||
        "Are you sure you want to delete this item?";
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
});
