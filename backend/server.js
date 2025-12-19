require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const axios = require("axios"); // ✅ REQUIRED FOR TELEGRAM

// --- MODELS ---
const Movie = require("./models/Movie");
const Series = require("./models/Series");

// ✅ SETTINGS SCHEMA (Inlined for safety)
const settingsSchema = new mongoose.Schema({
  activeDomain: { type: String, default: "https://dvstream.vercel.app" }, // Where users go
  stableUrl: { type: String, default: "" }, // Your Vercel Backend URL (The "Forever" Link)
  telegramChatId: { type: String, default: "" },
  telegramBotToken: { type: String, default: "" },
});
const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

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

const verifyAdmin = (req, res, next) => {
  const password = req.headers["x-admin-password"];
  if (password === process.env.ADMIN_SECRET) {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};

const processGenre = (genreInput) => {
  if (!genreInput) return [];
  if (Array.isArray(genreInput)) return genreInput;
  return genreInput.split(",").map((g) => g.trim());
};

// --- TELEGRAM AUTOMATION ---
const sendTelegramPost = async (item, type) => {
  try {
    const settings = await Settings.findOne();

    if (!settings || !settings.telegramBotToken || !settings.telegramChatId) {
      console.log("⚠️ Telegram Settings Missing. Skipping Auto-Post.");
      return;
    }

    // ✅ USE STABLE URL (Fallback to active if missing)
    // This creates the "Forever Link"
    const baseUrl =
      settings.stableUrl ||
      settings.activeDomain ||
      "https://dvstream.vercel.app";
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const redirectLink = `${cleanBaseUrl}/go/${type}/${item._id}`;

    const caption = `
🎬 <b>${item.title} (${item.year})</b>
✨ <i>${item.genre.join(", ")}</i>

${item.description ? item.description.substring(0, 150) + "..." : ""}

🔥 <b>Quality:</b> 480p, 720p, 1080p
🚀 <b>Audio:</b> Dual Audio [Hin-Eng]

👇 <b>Download & Watch Here:</b>
${redirectLink}

📢 <i>Join Channel for more!</i>
`;

    await axios.post(
      `https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`,
      {
        chat_id: settings.telegramChatId,
        photo: item.poster,
        caption: caption,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "📥 Download Now", url: redirectLink }]],
        },
      }
    );
    console.log("✅ Telegram Post Sent!");
  } catch (error) {
    console.error("❌ Telegram Error:", error.message);
  }
};

// --- ROUTES ---

// ✅ 1. THE "FOREVER" REDIRECTOR
// Users click this link in Telegram -> Redirects to Current Active Domain
app.get("/go/:type/:id", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const activeDomain =
      settings?.activeDomain || "https://dvstream.vercel.app";

    // Clean domain string
    const targetDomain = activeDomain.replace(/\/$/, "");

    // Perform Redirect
    res.redirect(`${targetDomain}/${req.params.type}/${req.params.id}`);
  } catch (err) {
    res.status(500).send("Redirect Error");
  }
});

// ✅ 2. SETTINGS ROUTES
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/settings", verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EXISTING ROUTES ---

app.get("/api/home", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).limit(6);
    const series = await Series.find().sort({ updatedAt: -1 }).limit(6);
    res.json({ movies, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    const sortField = type === "series" ? { updatedAt: -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Model.find(query).sort(sortField).skip(skip).limit(limit),
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
    const series = await Series.find().sort({ updatedAt: -1 });
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
    const recentSeries = await Series.find().sort({ updatedAt: -1 }).limit(5);
    const recent = [...recentMovies, ...recentSeries]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
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

app.delete("/api/upload", verifyAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });
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

// ✅ CREATE Content + TRIGGER TELEGRAM
app.post("/api/content/:type", verifyAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const Model = type === "movie" ? Movie : Series;
    const data = { ...req.body, genre: processGenre(req.body.genre) };
    if (type === "series")
      data.batchDownloadLinks = req.body.batchDownloadLinks;

    const newItem = new Model(data);
    await newItem.save();

    // 🚀 Auto-Post to Telegram with Redirect Link
    sendTelegramPost(newItem, type);

    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Content
app.put("/api/content/:type/:id", verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === "movie" ? Movie : Series;
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

// Episode Routes
app.put("/api/content/series/:id/episode", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const series = await Series.findById(id);
    if (!series) return res.status(404).json({ error: "Series not found" });

    series.episodes.push(req.body);
    series.markModified("episodes");
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
      episode.downloadLinks = req.body.downloadLinks;

      series.markModified("episodes");
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

app.get("/sitemap.xml", async (req, res) => {
  try {
    const movies = await Movie.find({}, "_id updatedAt");
    const series = await Series.find({}, "_id updatedAt");
    const baseUrl = "https://dvstream-app.vercel.app";
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
