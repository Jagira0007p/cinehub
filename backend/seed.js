require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const connectDB = require("./config/db");

const seedData = async () => {
  await connectDB();

  // Sample Movie
  const movie = new Movie({
    title: "Cyberpunk: The Movie",
    description: "A futuristic hacker fights to save the city.",
    genre: "Sci-Fi",
    year: 2025,
    poster: "https://via.placeholder.com/300x450", // Replace with real Cloudinary URL
    previewImages: [
      "https://via.placeholder.com/600x400",
      "https://via.placeholder.com/600x400",
    ],
    downloads: {
      p480: "https://shrinkme.io/test480",
      p720: "https://shrinkme.io/test720",
      p1080: "https://shrinkme.io/test1080",
    },
  });

  await movie.save();
  console.log("✅ Seed Data Added");
  process.exit();
};

seedData();
