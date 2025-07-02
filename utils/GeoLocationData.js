const axios = require("axios");

module.exports.geocodeLocation = async function (location) {
  try {
    const res = await axios.get("https://us1.locationiq.com/v1/search.php", {
      params: {
        key: process.env.LOCATIONIQ_KEY,
        q: location,
        format: "json",
        limit: 1,
        normalizeaddress: 1, // This should help structure the response better
        addressdetails: 1,
      },
    });

    const data = res.data[0];

    if (!data || !data.lat || !data.lon) {
      console.error("Missing lat/lon in geocoding response.");
      return null;
    }

    const state =
      data.address?.state ||
      data.address?.state_district ||
      data.address?.county ||
      "Unknown";

    return {
      geometry: {
        type: "Point",
        coordinates: [parseFloat(data.lon), parseFloat(data.lat)],
      },
      state,
    };
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    return null;
  }
};
