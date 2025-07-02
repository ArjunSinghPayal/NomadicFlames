// Bootstrap Bundle Loader (required for dropdowns, collapse, etc.)
import(
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
);

// 📌 Live Clock (for admin dashboard)
function updateClock() {
  const now = new Date();
  const formattedTime = now.toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const clock = document.getElementById("clock");
  if (clock) clock.innerText = formattedTime;
}
setInterval(updateClock, 1000);
updateClock(); // Initial run

// 📌 Read More / Show Less for long review text
document.addEventListener("DOMContentLoaded", () => {
  const readMoreLinks = document.querySelectorAll(".read-more");

  readMoreLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const p = this.closest(".review-text");
      const fullText = p.getAttribute("data-full");

      if (this.textContent === "Read More") {
        p.innerHTML =
          fullText +
          ' <a href="#" class="read-more text-info ms-2">Show Less</a>';
      } else {
        const shortText = fullText.slice(0, 100) + "...";
        p.innerHTML =
          shortText +
          ' <a href="#" class="read-more text-info ms-2">Read More</a>';
      }

      // Re-bind the new link
      p.querySelector(".read-more").addEventListener("click", arguments.callee);
    });
  });
});
