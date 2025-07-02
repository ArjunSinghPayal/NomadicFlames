const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ACCESS_KEY = "YOUR_API_KEY_HERE";
const SEARCH_QUERY = "camping";
const PER_PAGE = 30;
const TOTAL_CALLS = 2;

const outputPath = path.join(__dirname, "campImages.json");

async function fetchImages() {
  const allUrls = [];

  for (let page = 1; page <= TOTAL_CALLS; page++) {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/search/photos",
        {
          params: {
            query: SEARCH_QUERY,
            page,
            per_page: PER_PAGE,
          },
          headers: {
            Authorization: `Client-ID ${ACCESS_KEY}`,
          },
        }
      );

      const urls = response.data.results.map((photo) => photo.urls.regular);
      allUrls.push(...urls);
    } catch (err) {
      console.error(`❌ Failed to fetch page ${page}:`, err.message);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(allUrls, null, 2));
  console.log(`✅ Saved ${allUrls.length} image URLs to campImages.json`);
}

fetchImages();
