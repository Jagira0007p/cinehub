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
    genre: String,
    year: Number,
    poster: String,
    previewImages: [String],
    episodes: [episodeSchema], // Embedded episodes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
