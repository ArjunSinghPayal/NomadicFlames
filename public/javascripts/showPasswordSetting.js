document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const inputId = toggle.getAttribute("data-target");
    const input = document.getElementById(inputId);
    const icon = toggle.querySelector("i");

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    icon.classList.toggle("bi-eye");
    icon.classList.toggle("bi-eye-slash");
  });
});
