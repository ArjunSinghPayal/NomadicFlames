const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const dashboard = require("../controllers/dashboard");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, catchAsync(dashboard.renderUserDashboard));

router
  .route("/settings")
  .get(isLoggedIn, dashboard.renderUserSettings)
  .post(isLoggedIn, catchAsync(dashboard.updateUserPassword));

router.post(
  "/settings/email",
  isLoggedIn,
  catchAsync(dashboard.updateUserEmail)
);
router.delete(
  "/settings/delete",
  isLoggedIn,
  catchAsync(dashboard.deleteUserAccount)
);

module.exports = router;
