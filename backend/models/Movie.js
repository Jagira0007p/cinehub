const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    // CHANGED: genre is now an Array of Strings
    genre: [String],
    year: Number,
    poster: String,
    previewImages: [String],
    downloads: {
      p480: String,
      p720: String,
      p1080: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
