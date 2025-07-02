// ===============================
// State Filter Dropdown
// ===============================
const stateInput = document.getElementById("stateFilterInput");
const dropdownItems = document.querySelectorAll(".dropdown-menu li");

if (stateInput && dropdownItems) {
  stateInput.addEventListener("input", () => {
    const filter = stateInput.value.toLowerCase();
    dropdownItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(filter) ? "" : "none";
    });
  });
}

// ===============================
// Fade-in Image Logic
// ===============================
function fadeInImage(img) {
  if (img.complete) {
    img.classList.add("loaded");
  } else {
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });
  }
}

// Apply to all initially rendered images
document.querySelectorAll(".campground-img-thumb").forEach((img) => {
  fadeInImage(img);
});

// ===============================
// Infinite Scroll Logic
// ===============================
const loading = document.getElementById("loading");
const sentinel = document.getElementById("load-more-sentinel");
const campgroundList = document.getElementById("campground-list");

let currentPage = 1;
let isLoading = false;
let noMoreData = false;

const observer = new IntersectionObserver(
  async (entries) => {
    if (entries[0].isIntersecting && !isLoading && !noMoreData) {
      isLoading = true;
      loading.classList.remove("d-none");
      currentPage++;

      const params = new URLSearchParams(window.location.search);
      params.set("page", currentPage);
      params.set("ajax", "true");

      try {
        const res = await fetch(`/campgrounds?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (data.length === 0) {
          noMoreData = true;
          sentinel.remove();
          loading.innerHTML = `<p class="text-muted">No more campgrounds.</p>`;
        } else {
          data.forEach((camp) => {
            const card = document.createElement("div");
            card.className = "card mb-3 campground-card";
            card.innerHTML = `
              <div class="row">
                <div class="col-md-4">
                  <img src="${
                    camp.image ||
                    "https://images.unsplash.com/photo-1644365977963-e96e883a8e74?q=80&w=2070&auto=format&fit=crop"
                  }" class="card-img-top campground-img-thumb" loading="lazy" alt="Campground Image" />
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title">${camp.title}</h5>
                    <p class="card-text">${camp.description}</p>
                    <p class="card-text"><small class="text-muted">${
                      camp.location
                    }</small></p>
                    <a href="/campgrounds/${
                      camp._id
                    }" class="btn btn-primary">View ${camp.title}</a>
                  </div>
                </div>
              </div>`;

            // Apply fade-in
            const img = card.querySelector("img");
            fadeInImage(img);

            campgroundList.appendChild(card);
          });
        }
      } catch (err) {
        console.error("Failed to load more campgrounds", err);
      } finally {
        isLoading = false;
        loading.classList.add("d-none");
      }
    }
  },
  {
    threshold: 1.0,
  }
);

observer.observe(sentinel);
