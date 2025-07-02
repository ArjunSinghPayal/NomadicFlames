document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generateDescriptionBtn");

  if (!btn) {
    console.error("❌ Generate button not found in DOM.");
    return;
  }

  btn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const location = document.getElementById("location").value.trim();

    if (!title || !location) {
      alert("Please fill in the title and location first.");
      return;
    }

    try {
      const response = await fetch("/campgrounds/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, location }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        throw new Error("Server responded with an error.");
      }

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Invalid JSON response:", text);
        throw new Error("Invalid JSON received from backend.");
      }

      const data = await response.json();

      if (data.description) {
        document.getElementById("description").value = data.description;
        document.getElementById("generateFlag").value = "true";
      } else {
        alert("No description received.");
      }
    } catch (err) {
      console.error("❌ Error generating description:", err);
      alert("Something went wrong while generating the description.");
    }
  });
});
