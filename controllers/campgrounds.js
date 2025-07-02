const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const { geocodeLocation } = require("../utils/GeoLocationData");
const generateCampgroundDescription = require("../utils/cohereAI");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports.index = async (req, res) => {
  const { q, state, page = 1, ajax } = req.query;
  const perPage = 8;
  const skip = (page - 1) * perPage;

  const query = {};

  // Search by title (regex safe)
  if (q && q.trim() !== "") {
    const regex = new RegExp(escapeRegex(q), "i");
    query.title = regex;
  }

  // Filter by state
  if (state && state.trim() !== "") {
    query.state = state;
  }

  const campgrounds = await Campground.find(query)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(perPage)
    .select("title location description images _id") // only essential fields
    .lean();

  // 🔁 Handle infinite scroll fetch
  if (ajax === "true") {
    const response = campgrounds.map((camp) => ({
      _id: camp._id,
      title: camp.title,
      location: camp.location,
      description: camp.description,
      image: camp.images.length
        ? camp.images[0].url
        : "https://images.unsplash.com/photo-1644365977963-e96e883a8e74?q=80&w=2070&auto=format&fit=crop",
    }));
    return res.json(response);
  }

  // ⬇️ For the filter dropdown
  const states = await Campground.distinct("state");

  const allCampgroundsForMap = await Campground.find(query)
    .select("title location geometry _id images")
    .lean();

  res.render("campgrounds/index", {
    campgrounds, // paginated
    allCampgroundsForMap, // full data for cluster map
    searchQuery: q || "",
    selectedState: state || "",
    states,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  const campground = new Campground(req.body.campground);

  const geoData = await geocodeLocation(req.body.campground.location);
  if (!geoData || !geoData.geometry) {
    req.flash(
      "error",
      "Could not geocode the provided location. Please try a more specific address."
    );
    return res.redirect("/campgrounds/new");
  }

  campground.geometry = geoData.geometry;
  campground.state = geoData.state;

  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  campground.author = req.user._id;

  const userInput = req.body.campground.description?.trim();
  const askedAI = req.body.generateDescription === "true";

  // 🔁 Description logic
  if (askedAI) {
    const prompt = `Write a poetic 2–3 line description for a campground titled "${campground.title}" located in "${campground.location}".`;
    campground.description = await generateCampgroundDescription(prompt);
  } else if (userInput) {
    campground.description = userInput;
  } else {
    campground.description =
      "A cozy escape into nature’s calm, waiting for your story to begin.";
  }

  await campground.save();

  req.flash("success", "Successfully made a new Campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.generateDescription = async (req, res) => {
  const { title, location } = req.body;

  const prompt = `Write a poetic 2–3 line description for a campground titled "${title}" located in "${location}".`;

  try {
    const description = await generateCampgroundDescription(prompt);
    res.json({ description });
  } catch (err) {
    console.error("❌ Error from Cohere:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const updatedData = { ...req.body.campground };

  const existingCampground = await Campground.findById(id);

  // If location has changed, update geometry and state
  if (updatedData.location !== existingCampground.location) {
    try {
      const geoData = await geocodeLocation(updatedData.location);
      if (!geoData) {
        req.flash("error", "Failed to geocode the new location.");
        return res.redirect(`/campgrounds/${id}/edit`);
      }
      updatedData.geometry = geoData.geometry;
      updatedData.state = geoData.state;
    } catch (err) {
      console.log("Geocoding error:", err);
      req.flash("error", `Failed to geocode the new location. ${err.message}`);
      return res.redirect(`/campgrounds/${id}/edit`);
    }
  }

  // Update campground details
  const campground = await Campground.findByIdAndUpdate(id, updatedData, {
    runValidators: true,
    new: true,
  });

  // Handle new image uploads
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();

  // Handle image deletions
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Successfully updated the Campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a Campground!");
  res.redirect("/campgrounds");
};
