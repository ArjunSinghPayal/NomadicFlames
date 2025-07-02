// app.js (Refactored - Production-Ready)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");

const ExpressError = require("./utils/ExpressError");
const { sanitizeMiddleware } = require("./middleware");
const User = require("./models/user");
const MongoDBStore = require("connect-mongo");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");

// DB Setup
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
main().catch((err) => console.error("❌ Mongo Connection Error:", err));
async function main() {
  await mongoose.connect(dbUrl);
  console.log("✅ MongoDB Connected!");
}

// Express App Init
const app = express();
const port = process.env.PORT || 3000;

// View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "200kb" })); // Limit JSON payload to prevent DoS
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Store
const secret = process.env.SECRET || "thisshouldbebettersecret!";
let store;
try {
  store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: { secret },
  });
  store.on("error", (e) => console.log("SESSION STORE ERROR:", e));
} catch (err) {
  console.error("❌ Failed to initialize session store:", err);
}

// Session Config
app.use(
  session({
    store,
    name: "Trek&Dine",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Enable in production with HTTPS
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Flash Messages
app.use(flash());

// Helmet Security
app.use(helmet());
const scriptSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://api.mapbox.com",
  "https://cdn.jsdelivr.net/npm",
  "https://api.cohere.ai",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://fonts.googleapis.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://a.tiles.mapbox.com",
  "https://b.tiles.mapbox.com",
  "https://events.mapbox.com",
  "https://api.locationiq.com",
  "https://api.cohere.ai",
];
const fontSrcUrls = ["https://fonts.gstatic.com", "https://cdn.jsdelivr.net"];
const imgSrcUrls = [
  "https://res.cloudinary.com",
  "https://images.unsplash.com",
  "https://a.basemaps.cartocdn.com",
  "https://b.basemaps.cartocdn.com",
  "https://c.basemaps.cartocdn.com",
  "https://d.basemaps.cartocdn.com",
  "data:",
  "blob:",
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", ...imgSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Auth Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser((id, done) => {
  User.deserializeUser()(id, (err, user) => {
    if (err) return done(err);
    done(null, user);
  });
});

// Globals
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Custom Sanitizer
app.use(sanitizeMiddleware);

// Routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);
app.get("/", (req, res) => res.render("home"));

// 404 Handler
app.all(/.*/, (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  const message = err.message || "Oh No, Something Went Wrong!";

  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.status(statusCode).json({ error: message });
  }
  res.status(statusCode).render("error", { err: { ...err, message } });
});

// Server Start
app.listen(port, () => {
  console.log("🚀 Server running on port:", port);
});
