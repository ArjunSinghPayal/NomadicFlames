const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError.js");
const Campground = require("./models/campground.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${campground._id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user || !req.user.isAdmin) {
    req.flash("error", "You do not have permission to access the admin panel.");
    return res.redirect("/campgrounds");
  }
  next();
};

// middleware/sanitize.js

function sanitizeObject(obj) {
  for (const key in obj) {
    if (/\$|\./.test(key)) {
      const sanitizedKey = key.replace(/\$/g, "_").replace(/\./g, "_");
      obj[sanitizedKey] = obj[key];
      delete obj[key];
    }
  }
}

module.exports.sanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);

  // Optional: uncomment if you want to sanitize query strings later
  // if (req.query) sanitizeObject(req.query);

  next();
};
