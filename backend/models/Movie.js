const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    genre: [String],
    year: Number,
    poster: String,
    previewImages: [String],

    // ✅ OLD SYSTEM (Kept for history)
    downloads: {
      p480: String,
      p720: String,
      p1080: String,
    },

    // ✅ NEW SYSTEM (Dynamic)
    downloadLinks: [
      {
        quality: String, // e.g. "720p"
        size: String, // e.g. "800MB"
        url: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
