import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import {
  Download,
  PlayCircle,
  Star,
  Clock,
  Calendar,
  Users,
  Share2,
  Bookmark,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Detail = () => {
  const { type, id } = useParams();
  const [item, setItem] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { ref: screenshotRef, inView: screenshotInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    api.get(`/content/${type}/${id}`).then((res) => setItem(res.data));
    // Check if bookmarked
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setIsBookmarked(bookmarks.includes(id));
  }, [type, id]);

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((b) => b !== id);
      localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    } else {
      bookmarks.push(id);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    }
    setIsBookmarked(!isBookmarked);
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: `Check out ${item?.title} on CinemaHub`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!item)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-400">Loading content...</p>
        </div>
      </div>
    );

  const DownloadBtn = ({ label, link, quality }) => (
    <motion.a
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setSelectedQuality(quality)}
      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
        selectedQuality === quality
          ? "border-red-500 bg-red-500/10"
          : "border-gray-700 hover:border-red-500 hover:bg-red-500/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            quality === "480p"
              ? "bg-blue-500/20 text-blue-400"
              : quality === "720p"
              ? "bg-green-500/20 text-green-400"
              : "bg-purple-500/20 text-purple-400"
          }`}
        >
          <Download size={20} />
        </div>
        <div>
          <p className="font-bold">{quality}</p>
          <p className="text-sm text-gray-400">HD Quality</p>
        </div>
      </div>
      <div className="px-3 py-1 bg-gray-800 rounded-full text-xs">
        {quality === "480p" ? "Fast" : quality === "720p" ? "HD" : "Best"}
      </div>
    </motion.a>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-3xl overflow-hidden h-[50vh] md:h-[60vh]"
      >
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"
          style={{
            backgroundImage: `url(${item.poster})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

        <div className="relative z-20 container mx-auto px-4 h-full flex items-end pb-12">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            >
              {item.title}
            </motion.h1>
            <div className="flex flex-wrap gap-3 mb-6">
              {[item.year, item.genre, type].map((tag, idx) => (
                <motion.span
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="px-4 py-2 bg-gray-900/70 backdrop-blur-sm rounded-full text-sm"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 rounded-full font-bold shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition flex items-center gap-2"
              >
                <PlayCircle size={20} />
                Watch Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBookmark}
                className={`p-3 rounded-full backdrop-blur-sm border ${
                  isBookmarked
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-gray-900/50 border-gray-700 hover:border-red-500"
                }`}
              >
                <Bookmark
                  size={20}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareContent}
                className="p-3 rounded-full backdrop-blur-sm border border-gray-700 hover:border-blue-500 bg-gray-900/50"
              >
                <Share2 size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-2 h-8 bg-red-500 rounded-full" />
              Synopsis
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {item.description}
            </p>
          </motion.div>

          {/* Movie Downloads */}
          {type === "movie" && item.downloads && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Download className="text-green-500" />
                  Download Links
                </h2>
                <div className="text-sm text-gray-400">
                  Select quality and click to download
                </div>
              </div>
              <div className="space-y-3">
                {item.downloads.p1080 && (
                  <DownloadBtn
                    label="1080p"
                    link={item.downloads.p1080}
                    quality="1080p"
                  />
                )}
                {item.downloads.p720 && (
                  <DownloadBtn
                    label="720p"
                    link={item.downloads.p720}
                    quality="720p"
                  />
                )}
                {item.downloads.p480 && (
                  <DownloadBtn
                    label="480p"
                    link={item.downloads.p480}
                    quality="480p"
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Screenshots */}
          {item.previewImages && item.previewImages.length > 0 && (
            <motion.div
              ref={screenshotRef}
              initial={{ opacity: 0 }}
              animate={screenshotInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Screenshots</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {item.previewImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={screenshotInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative overflow-hidden rounded-xl aspect-video cursor-pointer group"
                  >
                    <img
                      src={img}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="p-3 bg-red-600 rounded-full">
                        <PlayCircle size={20} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50"
          >
            <h3 className="text-xl font-bold mb-4">Details</h3>
            <div className="space-y-3">
              {[
                { icon: Calendar, label: "Year", value: item.year },
                { icon: Star, label: "Genre", value: item.genre },
                {
                  icon: Clock,
                  label: "Type",
                  value: type.charAt(0).toUpperCase() + type.slice(1),
                },
                { icon: Users, label: "Quality", value: "1080p/720p/480p" },
              ].map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <detail.icon size={16} className="text-gray-400" />
                    </div>
                    <span className="text-gray-400">{detail.label}</span>
                  </div>
                  <span className="font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Series Episodes */}
          {type === "series" && item.episodes && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Episodes</h3>
                <span className="text-sm text-gray-400">
                  {item.episodes.length} total
                </span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {item.episodes
                  ?.sort((a, b) => a.episodeNumber - b.episodeNumber)
                  .map((ep, idx) => (
                    <motion.div
                      key={ep._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center font-bold">
                            {ep.episodeNumber}
                          </div>
                          <div>
                            <p className="font-medium truncate">{ep.title}</p>
                            <p className="text-xs text-gray-400">
                              Episode {ep.episodeNumber}
                            </p>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition">
                          <Download className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Related Content */}
          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50"
          >
            <h3 className="text-xl font-bold mb-4">You might also like</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Link
                  key={i}
                  to="#"
                  className="flex gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition"
                >
                  <img
                    src={item.poster}
                    className="w-12 h-16 rounded object-cover"
                    alt="Related"
                  />
                  <div>
                    <p className="font-medium">Related Title {i}</p>
                    <p className="text-xs text-gray-400">2023 • Action</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div> */}
        </div>
      </div>
    </div>
  );
};

export default Detail;
