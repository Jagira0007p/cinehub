const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  title: String,
  episodeNumber: Number,
  // Old
  downloads: { p480: String, p720: String, p1080: String },
  // New
  downloadLinks: [{ quality: String, size: String, url: String }],
});

const seriesSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    genre: [String],
    year: Number,
    poster: String,
    previewImages: [String],
    // Old
    batchLinks: { p480: String, p720: String, p1080: String },
    // New
    batchDownloadLinks: [{ quality: String, size: String, url: String }],

    episodes: [episodeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
