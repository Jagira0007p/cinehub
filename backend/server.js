require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");

// Models
const Movie = require("./models/Movie");
const Series = require("./models/Series");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Admin Middleware
const verifyAdmin = (req, res, next) => {
  const password = req.headers["x-admin-password"];
  if (password === process.env.ADMIN_SECRET) {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};

// --- PUBLIC ROUTES ---

// 1. Get Home Page Showcase
app.get("/api/home", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).limit(6);
    const series = await Series.find().sort({ createdAt: -1 }).limit(6);
    res.json({ movies, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Available Filters
app.get("/api/filters/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const Model = type === "movie" ? Movie : Series;
    const genres = await Model.distinct("genre");
    const years = await Model.distinct("year");
    res.json({
      genres: genres.filter(Boolean).sort(),
      years: years.filter(Boolean).sort((a, b) => b - a),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get List with Search & Pagination
app.get("/api/list/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const { search, genre, year } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (genre) query.genre = genre;
    if (year) query.year = year;

    const Model = type === "movie" ? Movie : Series;

    const [items, total] = await Promise.all([
      Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(query),
    ]);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/content/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === "movie" ? Movie : Series;
    const item = await Model.findById(id);
    res.json(item);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

app.get("/api/content", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    const series = await Series.find().sort({ createdAt: -1 });
    res.json({ movies, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

// NEW: Real Stats Route
app.get("/api/stats", async (req, res) => {
  try {
    const movieCount = await Movie.countDocuments();
    const seriesCount = await Series.countDocuments();

    // Count total episodes
    const allSeries = await Series.find({}, "episodes");
    const episodeCount = allSeries.reduce(
      (acc, curr) => acc + (curr.episodes ? curr.episodes.length : 0),
      0
    );

    // Get 5 most recent items for dashboard list
    const recentMovies = await Movie.find().sort({ createdAt: -1 }).limit(5);
    const recentSeries = await Series.find().sort({ createdAt: -1 }).limit(5);

    // Combine and sort by date
    const recent = [...recentMovies, ...recentSeries]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      movies: movieCount,
      series: seriesCount,
      episodes: episodeCount,
      total: movieCount + seriesCount,
      recent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verification Route
app.post("/api/verify-admin", verifyAdmin, (req, res) => {
  res.status(200).json({ success: true, message: "Admin verified" });
});

const upload = multer();
app.post("/api/upload", verifyAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "movie-site" },
    (error, result) => {
      if (error) return res.status(500).json(error);
      res.json({ url: result.secure_url });
    }
  );
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

app.post("/api/content/:type", verifyAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const Model = type === "movie" ? Movie : Series;
    const newItem = new Model(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/content/:type/:id", verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === "movie" ? Movie : Series;
    const updatedItem = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/content/:type/:id", verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === "movie" ? Movie : Series;
    await Model.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/content/series/:id/episode", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, episodeNumber, downloads } = req.body;
    const series = await Series.findById(id);
    if (!series) return res.status(404).json({ error: "Series not found" });

    series.episodes.push({ title, episodeNumber, downloads });
    await series.save();
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
