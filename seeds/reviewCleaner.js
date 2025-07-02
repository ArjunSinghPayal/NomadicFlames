const mongoose = require("mongoose");
const Review = require("../models/review");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

async function cleanOrphanReviews() {
  const reviews = await Review.find({});
  let deletedCount = 0;

  for (let review of reviews) {
    if (!review.campground) {
      await Review.findByIdAndDelete(review._id);
      deletedCount++;
    }
  }

  console.log(`✅ Deleted ${deletedCount} orphan reviews.`);
  mongoose.connection.close();
}

cleanOrphanReviews();
