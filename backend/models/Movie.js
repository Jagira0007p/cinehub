const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    genre: String,
    year: Number,
    poster: String, // URL from Cloudinary
    previewImages: [String], // Array of 4 URLs
    downloads: {
      p480: String,
      p720: String,
      p1080: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
