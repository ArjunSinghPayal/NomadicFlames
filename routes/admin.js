const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const admin = require("../controllers/admin");
const { isAdmin, isLoggedIn } = require("../middleware");

// Dashboard
router.get("/", isAdmin, catchAsync(admin.renderAdminPage));

// Admin Panels
router.get("/campgrounds", isAdmin, catchAsync(admin.renderAdminCampgrounds));
router.get("/reviews", isAdmin, catchAsync(admin.renderAdminReviews));
router.get("/users", isAdmin, catchAsync(admin.renderAdminUsers));

// Campgrounds Admin Actions
router.delete(
  "/campgrounds/:id",
  isLoggedIn,
  isAdmin,
  catchAsync(admin.deleteCampground)
);

// Reviews Admin Actions
router.delete(
  "/reviews/:id",
  isLoggedIn,
  isAdmin,
  catchAsync(admin.deleteReview)
);

// Users Admin Actions
router.delete("/users/:id", isLoggedIn, isAdmin, catchAsync(admin.deleteUser));

// Settings
router.get("/settings", isLoggedIn, isAdmin, admin.renderSettingsPage);
router.post(
  "/settings/profile",
  isLoggedIn,
  isAdmin,
  catchAsync(admin.updateProfile)
);
router.post(
  "/settings/password",
  isLoggedIn,
  isAdmin,
  catchAsync(admin.updatePassword)
);
router.post(
  "/settings/maintenance",
  isLoggedIn,
  isAdmin,
  admin.toggleMaintenance
);

module.exports = router;
