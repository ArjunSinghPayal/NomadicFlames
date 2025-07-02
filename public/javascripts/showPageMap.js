document.addEventListener("DOMContentLoaded", function () {
  const mapDiv = document.getElementById("map");
  const campground = JSON.parse(mapDiv.dataset.campground);

  if (campground.geometry && campground.geometry.coordinates) {
    const [lng, lat] = campground.geometry.coordinates;

    const map = L.map("map").setView([lat, lng], 14);

    // Light-themed tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    let indiaBorderLayer; // to store the overlay

    fetch("/geojson/india-border.geojson")
      .then((res) => res.json())
      .then((data) => {
        indiaBorderLayer = L.geoJSON(data, {
          style: {
            color: map.getZoom() > 5 ? "#ecd6d8" : "#f2e4e4", // initial color based on zoom
            weight: 1.2,
            fill: false,
          },
        }).addTo(map);

        // Attach zoomend after overlay is ready
        map.on("zoomend", function () {
          const zoom = map.getZoom();
          const color = zoom > 5 ? "#ecd6d8" : "#f2e4e4";
          indiaBorderLayer.setStyle({
            color: color,
            weight: 1.2,
            fill: false,
          });
        });
      })
      .catch((err) => {
        console.warn("❗ Failed to load India border overlay:", err);
      });

    // Optional fallback message for tile errors
    map.on("tileerror", function () {
      alert(
        "⚠️ Map tiles failed to load. Please check your internet connection or tile provider."
      );
    });

    // Custom circle marker using a divIcon
    const customMarker = L.divIcon({
      className: "custom-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -9],
    });

    L.marker([lat, lng], { icon: customMarker })
      .addTo(map)
      .bindPopup(`<b>${campground.title}</b><br>${campground.location}`)
      .openPopup();
  } else {
    console.error("No geometry found.");
  }
});
