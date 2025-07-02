const axios = require("axios");

const COHERE_API_KEY = process.env.COHERE_API_KEY; // Set in .env

async function generateCampgroundDescription(prompt) {
  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command-r-plus",
        prompt,
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.generations[0].text.trim();
  } catch (err) {
    console.error("Cohere API error:", err.response?.data || err.message);
    return "A beautiful place to relax in nature.";
  }
}

module.exports = generateCampgroundDescription;
