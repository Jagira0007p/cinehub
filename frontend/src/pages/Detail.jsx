import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  X,
  Copy,
  CheckCircle,
  Layers,
  FolderDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Detail = () => {
  const { type, id } = useParams();
  const [item, setItem] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchQuality, setBatchQuality] = useState("720p");
  const [copied, setCopied] = useState(false);

  const { ref: screenshotRef, inView: screenshotInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    api.get(`/content/${type}/${id}`).then((res) => setItem(res.data));
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
          text: `Check out ${item?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  const getBatchLink = () => {
    return item?.batchLinks?.[`p${batchQuality.replace("p", "")}`];
  };

  const copyBatchLinks = () => {
    if (!item?.episodes) return;
    const links = item.episodes
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
      .map((ep) => ep.downloads?.[`p${batchQuality.replace("p", "")}`])
      .filter((link) => link)
      .join("\n");
    navigator.clipboard.writeText(links);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

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
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {item.title}
            </h1>
            <div className="flex flex-wrap gap-3 mb-6">
              {[item.year, item.genre, type].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gray-900/70 backdrop-blur-sm rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleBookmark}
                className={`p-3 rounded-full backdrop-blur-sm border ${
                  isBookmarked
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-gray-900/50 border-gray-700"
                }`}
              >
                <Bookmark
                  size={20}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={shareContent}
                className="p-3 rounded-full backdrop-blur-sm border border-gray-700 bg-gray-900/50"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-500 pl-3">
              Synopsis
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {item.description}
            </p>
          </div>

          {/* MOVIE DOWNLOADS */}
          {type === "movie" && item.downloads && (
            <div className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6">Download Links</h2>
              <div className="space-y-3">
                {Object.entries(item.downloads).map(
                  ([quality, link]) =>
                    link && (
                      <a
                        key={quality}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-700 hover:border-red-500 hover:bg-red-500/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Download size={20} className="text-red-500" />
                          <span className="font-bold uppercase">
                            {quality.replace("p", "")}p
                          </span>
                        </div>
                        <span className="text-xs bg-gray-800 px-3 py-1 rounded-full">
                          Download
                        </span>
                      </a>
                    )
                )}
              </div>
            </div>
          )}

          {/* SERIES EPISODES */}
          {type === "series" && item.episodes && (
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Layers className="text-red-500" /> Episodes (
                  {item.episodes.length})
                </h3>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm border border-gray-600 transition"
                >
                  <FolderDown size={16} /> Batch / Season Pack
                </button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {item.episodes
                  ?.sort((a, b) => a.episodeNumber - b.episodeNumber)
                  .map((ep, idx) => (
                    <motion.div
                      key={ep._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedEpisode(ep)}
                      className="group p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700 cursor-pointer border border-transparent hover:border-red-500/30 transition flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                          {ep.episodeNumber}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-red-400 transition">
                            {ep.title || `Episode ${ep.episodeNumber}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            Click to download
                          </p>
                        </div>
                      </div>
                      <Download
                        size={20}
                        className="text-gray-500 group-hover:text-white"
                      />
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6">{/* Sidebar Info can go here */}</div>
      </div>

      {/* EPISODE POPUP */}
      <AnimatePresence>
        {selectedEpisode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedEpisode(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEpisode(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X />
              </button>
              <h3 className="text-2xl font-bold mb-1">
                Episode {selectedEpisode.episodeNumber}
              </h3>
              <p className="text-gray-400 mb-6">{selectedEpisode.title}</p>
              <div className="space-y-3">
                {Object.entries(selectedEpisode.downloads || {}).map(
                  ([res, link]) =>
                    link ? (
                      <a
                        key={res}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500 transition group"
                      >
                        <span className="font-bold text-lg uppercase">
                          {res.replace("p", "")}p
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white">
                          Download <Download size={16} />
                        </div>
                      </a>
                    ) : null
                )}
                {!Object.values(selectedEpisode.downloads || {}).some(
                  (x) => x
                ) && (
                  <p className="text-center text-gray-500">
                    No links available.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BATCH DOWNLOAD MODAL */}
      <AnimatePresence>
        {showBatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowBatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowBatchModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X />
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FolderDown className="text-red-500" /> Batch Download
              </h3>

              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Select Quality:</p>
                <div className="flex gap-2">
                  {["480p", "720p", "1080p"].map((q) => (
                    <button
                      key={q}
                      onClick={() => setBatchQuality(q)}
                      className={`px-4 py-2 rounded-lg border text-sm font-bold transition ${
                        batchQuality === q
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* LOGIC: IF BATCH LINK EXISTS, SHOW BUTTON. ELSE SHOW COPY LIST */}
              {getBatchLink() ? (
                <div className="text-center py-6">
                  <a
                    href={getBatchLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 mb-2"
                  >
                    <Download size={20} /> Download Complete Season (
                    {batchQuality})
                  </a>
                  <p className="text-xs text-gray-500">
                    Direct Zip/Folder Link
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-black/50 p-4 rounded-xl border border-gray-800 mb-4 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
                      {item.episodes
                        .sort((a, b) => a.episodeNumber - b.episodeNumber)
                        .map(
                          (ep) =>
                            ep.downloads?.[`p${batchQuality.replace("p", "")}`]
                        )
                        .filter((l) => l)
                        .join("\n") || "No individual links found."}
                    </pre>
                  </div>
                  <button
                    onClick={copyBatchLinks}
                    className="w-full py-3 bg-gray-800 border border-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <CheckCircle className="text-green-600" />
                    ) : (
                      <Copy size={18} />
                    )}{" "}
                    {copied ? "Copied!" : "Copy Individual Links"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Detail;
