const Campground = require("../models/campground.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);

  const review = new Review(req.body.review);
  review.author = req.user._id;
  review.campground = campground._id;

  await review.save();

  campground.reviews.push(review); // Maintain reverse linkage
  await campground.save();

  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReviews = async (req, res) => {
  const { id, reviewId } = req.params;

  // Remove the review reference from campground's reviews array
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Optional: double-check that the review belongs to the campground (for safety)
  const review = await Review.findById(reviewId);
  if (review && review.campground.toString() === id) {
    await Review.findByIdAndDelete(reviewId);
  }

  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/campgrounds/${id}`);
};
