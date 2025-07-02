// clusterMapEnhanced.js

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("clusterMap");
  if (!mapContainer) return;

  const campgrounds = JSON.parse(mapContainer.dataset.campgrounds);
  const map = L.map("clusterMap", {
    center: [25.9734, 82.6569], // Center of India
    zoom: 4.5,
    worldCopyJump: false,
    maxBounds: [
      [-85, -180], // Southwest corner of allowed bounds
      [85, 180], // Northeast corner of allowed bounds
    ],
    maxBoundsViscosity: 1.0, // Prevent panning beyond bounds
    minZoom: 2,
    maxZoom: 18,
  });

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

  let indiaBorderLayer;

  fetch("/geojson/india-border.geojson")
    .then((res) => res.json())
    .then((data) => {
      indiaBorderLayer = L.geoJSON(data, {
        style: {
          color: map.getZoom() > 5 ? "#ecd6d8" : "#f2e4e4",
          weight: 1.2,
          fill: false,
        },
      }).addTo(map);

      // Update border style based on zoom level
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

  map.on("tileerror", function () {
    alert(
      "⚠️ Map tiles failed to load. Please check your internet connection or tile provider."
    );
  });

  // Marker cluster group with custom icons
  const markers = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount();
      let className = "marker-cluster ";

      if (count < 10) {
        className += "bottom-marker"; // smallest cluster
      } else if (count < 100) {
        className += "middle-marker"; // medium cluster
      } else {
        className += "top-marker"; // biggest cluster
      }

      return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: className,
        iconSize: L.point(40, 40),
      });
    },
  });

  // Custom divIcon for individual markers
  const customDivIcon = L.divIcon({
    className: "custom-marker",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });

  // Add each campground marker
  campgrounds.forEach((camp) => {
    if (!camp.geometry || !camp.geometry.coordinates) return;

    const [lng, lat] = camp.geometry.coordinates;

    const marker = L.marker([lat, lng], { icon: customDivIcon })
      .bindPopup(
        `<div class="popup-content"><strong><a href="/campgrounds/${camp._id}">${camp.title}</a></strong><br>${camp.location}</div>`
      )

      .bindTooltip(camp.title, {
        direction: "top",
        offset: [6, -8],
      });

    marker.on("click", () => {
      console.log(`Clicked: ${camp.title}`);
    });

    markers.addLayer(marker);
  });

  // Hover style for clusters
  markers.on("clustermouseover", function (a) {
    a.layer._icon.style.cursor = "pointer";
  });

  // Add the complete group to the map
  map.addLayer(markers);
});
