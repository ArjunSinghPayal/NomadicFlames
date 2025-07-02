const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds.js");
const catchAsync = require("../utils/catchAsync.js");
const Campground = require("../models/campground.js");
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudinary/index.js");
const upload = multer({ storage });

router
  .route("/")
  .get(campgrounds.index)
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.post(
  "/generate-description",
  catchAsync(campgrounds.generateDescription)
);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
