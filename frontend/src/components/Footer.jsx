import { Heart, Code, Github, Twitter, Film, Send } from "lucide-react"; // Added 'Send' for Telegram
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Function to handle genre click
  const handleGenreClick = (genre) => {
    // Redirect to search page with the selected genre
    // Assuming you want to search both movies and series, but SearchPage usually handles one type at a time.
    // Defaulting to 'movie' tab for genre search, user can switch tabs on SearchPage.
    // Or you could make a specific route, but query params are standard.
    navigate(`/search?genre=${genre}`);
  };

  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Film className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
                DVStream
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for premium movies and series. Download
              in 480p, 720p, 1080p quality.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2">
              {["Movies", "Series"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Genres (Functional) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {["Action", "Drama", "Comedy", "Horror", "Sci-Fi", "Romance"].map(
                (genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className="px-3 py-1 bg-gray-800 rounded-full text-xs hover:bg-red-600 transition cursor-pointer text-gray-300 hover:text-white border border-gray-700 hover:border-red-500"
                  >
                    {genre}
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* Social & Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold">Connect</h3>
            <div className="flex gap-4">
              {/* Telegram */}
              <motion.a
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                href="https://t.me/YOUR_TELEGRAM_GROUP_LINK" // Replace with your actual Telegram link
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-500 transition text-white"
              >
                <Send className="w-5 h-5" />
              </motion.a>

              {/* Github (Keep existing or remove if not needed) */}
              <motion.a
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-white"
              >
                <Github className="w-5 h-5" />
              </motion.a>

              {/* Twitter */}
              <motion.a
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-400 transition text-white"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
            <p className="text-gray-400 text-sm">
              Made with <Heart className="inline w-4 h-4 text-red-500" /> by the
              DVStream Team
            </p>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm"
        >
          <p>
            © {currentYear} DVStream. All content is for demonstration purposes
            only.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Code className="w-4 h-4" />
            <span>Powered by MERN Stack</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;