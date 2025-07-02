const Campground = require("../models/campground");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.renderUserDashboard = async (req, res) => {
  const userId = req.user._id;

  const [campgrounds, reviews] = await Promise.all([
    Campground.find({ author: userId }),
    Review.find({ author: userId }).populate("author").populate("campground"),
  ]);

  res.render("dashboard/users/user", {
    user: req.user,
    campgrounds,
    reviews,
    stats: {
      totalCamps: campgrounds.length,
      totalReviews: reviews.length,
    },
  });
};

module.exports.renderUserSettings = (req, res) => {
  res.render("dashboard/users/settings", { user: req.user });
};

module.exports.updateUserPassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const { user: authenticatedUser } = await user.authenticate(currentPassword);
  if (!authenticatedUser) {
    req.flash("error", "Current password is incorrect.");
    return res.redirect("/dashboard/settings");
  }

  await user.setPassword(newPassword);
  await user.save();

  req.login(user, (err) => {
    if (err) return next(err);
    req.flash("success", "Password updated successfully!");
    res.redirect("/dashboard/settings");
  });
};

module.exports.updateUserEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findById(req.user._id);
  user.email = email;
  await user.save();
  req.flash("success", "Email updated successfully!");
  res.redirect("/dashboard/settings");
};

module.exports.deleteUserAccount = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  // Prevent admin accounts from being deleted
  if (user.isAdmin) {
    req.flash("error", "Admin accounts cannot be deleted.");
    return res.redirect("/dashboard/settings");
  }

  // Delete associated reviews and campgrounds
  const camps = await Campground.find({ author: userId });

  for (let camp of camps) {
    await Review.deleteMany({ _id: { $in: camp.reviews } });
  }

  await Campground.deleteMany({ author: userId });
  await Review.deleteMany({ author: userId });
  await User.findByIdAndDelete(userId);

  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "Your account and data have been deleted.");
    res.redirect("/campgrounds");
  });
};
