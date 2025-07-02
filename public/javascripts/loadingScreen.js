document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form");
  const loadingScreen = document.getElementById("loading-screen");

  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (form.checkValidity()) {
        // Only show loading screen if form is valid
        loadingScreen.classList.remove("d-none");
      }
    });
  });
});
