const fs = require("fs");
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

main().catch((err) => console.log("Mongo Connection Error!: ", err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
  console.log("✅ MongoDB Connected!");
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const imageURLs = JSON.parse(fs.readFileSync("./campImages.json", "utf-8"));

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const random1000 = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "685fae48e70ec2f2bb181bf4",
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      state: cities[random1000].state,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dppcipyh2/image/upload/v1751191068/YelpCamp/wsb7wx6zfj1p3gtolt83.jpg",
          filename: "YelpCamp/wsb7wx6zfj1p3gtolt83",
        },
        {
          url: "https://res.cloudinary.com/dppcipyh2/image/upload/v1751191075/YelpCamp/nca4ukzy7goeuqzgg8gv.jpg",
          filename: "YelpCamp/nca4ukzy7goeuqzgg8gv",
        },
        {
          url: "https://res.cloudinary.com/dppcipyh2/image/upload/v1751191079/YelpCamp/yuh7fr2hs72v85hcu5zi.jpg",
          filename: "YelpCamp/yuh7fr2hs72v85hcu5zi",
        },
        {
          url: "https://res.cloudinary.com/dppcipyh2/image/upload/v1751191081/YelpCamp/ouwmb6kq55frvqq5tn8v.jpg",
          filename: "YelpCamp/ouwmb6kq55frvqq5tn8v",
        },
      ],

      description: cities[random1000].description,
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
