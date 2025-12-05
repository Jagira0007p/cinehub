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

// Helper: Process Genre String to Array
const processGenre = (genreInput) => {
  if (!genreInput) return [];
  if (Array.isArray(genreInput)) return genreInput;
  // Split by comma and remove extra spaces
  return genreInput.split(",").map((g) => g.trim());
};

// --- ROUTES ---

app.get("/api/home", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).limit(6);
    const series = await Series.find().sort({ createdAt: -1 }).limit(6);
    res.json({ movies, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/filters/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const Model = type === "movie" ? Movie : Series;
    // MongoDB 'distinct' works perfectly with Arrays!
    // It will return unique genres like ["Action", "Sci-Fi"] automatically.
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

app.get("/api/list/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const { search, genre, year } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };

    // Exact match works for Arrays too in MongoDB (If array contains "Action", it matches)
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

app.get("/api/stats", async (req, res) => {
  try {
    const movieCount = await Movie.countDocuments();
    const seriesCount = await Series.countDocuments();
    const allSeries = await Series.find({}, "episodes");
    const episodeCount = allSeries.reduce(
      (acc, curr) => acc + (curr.episodes ? curr.episodes.length : 0),
      0
    );
    const recentMovies = await Movie.find().sort({ createdAt: -1 }).limit(5);
    const recentSeries = await Series.find().sort({ createdAt: -1 }).limit(5);
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

app.post("/api/verify-admin", verifyAdmin, (req, res) =>
  res.status(200).json({ success: true })
);

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

// CREATE Content (With Genre Split)
app.post("/api/content/:type", verifyAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const Model = type === "movie" ? Movie : Series;

    // Process genre string into array
    const data = { ...req.body, genre: processGenre(req.body.genre) };

    const newItem = new Model(data);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Content (With Genre Split)
app.put("/api/content/:type/:id", verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === "movie" ? Movie : Series;

    // Process genre string into array
    const data = { ...req.body, genre: processGenre(req.body.genre) };

    const updatedItem = await Model.findByIdAndUpdate(id, data, { new: true });
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

// Episode Routes (Keep unchanged)
app.put("/api/content/series/:id/episode", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const series = await Series.findById(id);
    if (!series) return res.status(404).json({ error: "Series not found" });
    series.episodes.push(req.body);
    await series.save();
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/content/series/:seriesId/episode/:episodeId",
  verifyAdmin,
  async (req, res) => {
    try {
      const { seriesId, episodeId } = req.params;
      const series = await Series.findById(seriesId);
      if (!series) return res.status(404).json({ error: "Series not found" });
      const episode = series.episodes.id(episodeId);
      if (!episode) return res.status(404).json({ error: "Episode not found" });
      episode.title = req.body.title;
      episode.episodeNumber = req.body.episodeNumber;
      episode.downloads = req.body.downloads;
      await series.save();
      res.json(series);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  "/api/content/series/:seriesId/episode/:episodeId",
  verifyAdmin,
  async (req, res) => {
    try {
      const { seriesId, episodeId } = req.params;
      const series = await Series.findById(seriesId);
      if (!series) return res.status(404).json({ error: "Series not found" });
      series.episodes = series.episodes.filter(
        (ep) => ep._id.toString() !== episodeId
      );
      await series.save();
      res.json(series);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
app.delete("/api/upload", verifyAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    // Extract public_id from URL (e.g., .../movie-site/abc.jpg -> movie-site/abc)
    const parts = url.split("/");
    const filename = parts.pop().split(".")[0];
    const folder = parts.pop();
    const publicId = `${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sitemap route (Keep unchanged)
app.get("/sitemap.xml", async (req, res) => {
  try {
    const movies = await Movie.find({}, "_id updatedAt");
    const series = await Series.find({}, "_id updatedAt");
    const baseUrl = "https://cinemahub.xyz";
    let xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url><url><loc>${baseUrl}/movies</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`;
    movies.forEach((movie) => {
      xml += `<url><loc>${baseUrl}/movie/${movie._id}</loc><lastmod>${new Date(
        movie.updatedAt
      ).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });
    series.forEach((s) => {
      xml += `<url><loc>${baseUrl}/series/${s._id}</loc><lastmod>${new Date(
        s.updatedAt
      ).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });
    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).end();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
