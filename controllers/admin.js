const Campground = require("../models/campground");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.renderAdminPage = async (req, res) => {
  const totalCamps = await Campground.countDocuments();
  const totalReviews = await Review.countDocuments();
  const totalUsers = await User.countDocuments();

  const [recentCamps, recentReviews] = await Promise.all([
    Campground.find({}).sort({ createdAt: -1 }).limit(5).populate("author"),
    Review.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("author campground"),
  ]);

  res.render("dashboard/admin/admin", {
    stats: { totalCamps, totalReviews, totalUsers },
    recentCamps,
    recentReviews,
  });
};

module.exports.renderAdminCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({})
    .populate("author")
    .sort({ createdAt: -1 });

  res.render("dashboard/admin/campgrounds", { campgrounds });
};

module.exports.renderAdminReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate("author campground")
    .sort({ createdAt: -1 });
  res.render("dashboard/admin/reviews", { reviews });
};

module.exports.renderAdminUsers = async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.render("dashboard/admin/users", { users });
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;

  const deletedCamp = await Campground.findByIdAndDelete(id);

  if (!deletedCamp) {
    req.flash("error", "Campground not found.");
    return res.redirect("/admin/campgrounds");
  }

  req.flash("success", "Campground deleted successfully.");
  res.redirect("/admin/campgrounds");
};

module.exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (review?.campground) {
    await Campground.findByIdAndUpdate(review.campground, {
      $pull: { reviews: id },
    });
  }

  await Review.findByIdAndDelete(id);
  req.flash("success", "Review deleted.");
  res.redirect("/admin/reviews");
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/admin/users");
  }

  if (user.isAdmin) {
    req.flash("error", "Admin accounts cannot be deleted.");
    return res.redirect("/dashboard/settings");
  }

  const camps = await Campground.find({ author: id });

  for (let camp of camps) {
    await Review.deleteMany({ _id: { $in: camp.reviews } });
  }

  await Campground.deleteMany({ author: id });
  await Review.deleteMany({ author: id });
  await User.findByIdAndDelete(id);

  req.flash("success", "User and all related data deleted.");
  res.redirect("/admin/users");
};

// Settings
let maintenanceMode = false;

module.exports.renderSettingsPage = (req, res) => {
  res.render("dashboard/admin/settings", {
    user: req.user,
    maintenanceMode,
  });
};

module.exports.updateProfile = async (req, res, next) => {
  const { username, email } = req.body;

  const user = await User.findById(req.user._id);
  const usernameChanged = username && username !== user.username;

  if (usernameChanged) user.username = username;
  if (email) user.email = email;

  await user.save();

  if (usernameChanged) {
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Profile updated successfully!");
      return res.redirect("/admin/settings");
    });
  } else {
    req.flash("success", "Profile updated successfully!");
    res.redirect("/admin/settings");
  }
};

module.exports.updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const { user: authenticatedUser, error } = await user.authenticate(
    currentPassword
  );

  if (!authenticatedUser) {
    req.flash("error", "Current password is incorrect.");
    return res.redirect("/admin/settings");
  }

  await user.setPassword(newPassword);
  await user.save();

  req.login(user, (err) => {
    if (err) return next(err);
    req.flash("success", "Password updated successfully!");
    res.redirect("/admin/settings");
  });
};

module.exports.toggleMaintenance = (req, res) => {
  maintenanceMode = !maintenanceMode;
  req.flash(
    "success",
    `Maintenance mode is now ${maintenanceMode ? "ON" : "OFF"}`
  );
  res.redirect("/admin/settings");
};
