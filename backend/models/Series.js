const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  title: String,
  episodeNumber: Number,
  downloads: {
    p480: String,
    p720: String,
    p1080: String,
  },
});

const seriesSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    // CHANGED: genre is now an Array of Strings
    genre: [String],
    year: Number,
    poster: String,
    previewImages: [String],
    batchLinks: {
      p480: String,
      p720: String,
      p1080: String,
    },
    episodes: [episodeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
