import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import {
  Download,
  PlayCircle,
  Share2,
  Bookmark,
  X,
  Copy,
  CheckCircle,
  FolderDown,
  ExternalLink,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import AdBanner from "../components/AdBanner"; // Ad Banner Imported

const Detail = () => {
  const { type, id } = useParams();
  const [item, setItem] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Modals
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchQuality, setBatchQuality] = useState("720p");
  const [copied, setCopied] = useState(false);

  // Screenshot Viewer Modal
  const [previewImage, setPreviewImage] = useState(null);

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
          text: `Check out ${item?.title} on DVStream`,
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
    if (!item?.batchLinks) return null;
    const key = `p${batchQuality.replace("p", "")}`;
    return item.batchLinks[key];
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
    return (
      <div className="text-center py-20 text-gray-400">Loading content...</div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* HERO BANNER */}
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
              {[
                item.year,
                ...(Array.isArray(item.genre) ? item.genre : [item.genre]),
                type,
              ].map((tag, idx) => (
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
          {/* SYNOPSIS */}
          <div className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-500 pl-3">
              Synopsis
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {item.description}
            </p>
          </div>

          {/* SCREENSHOTS */}
          {item.previewImages && item.previewImages.length > 0 && (
            <div className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ImageIcon className="text-blue-500" /> Screenshots
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.previewImages.map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl overflow-hidden shadow-lg cursor-pointer border border-gray-700"
                    onClick={() => setPreviewImage(img)}
                  >
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover hover:opacity-90 transition"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* AD BANNER 1 (Above Downloads) */}
          <AdBanner />

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
                          Fast Download
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
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-full font-bold shadow-lg hover:shadow-red-500/20 transition"
                >
                  <FolderDown size={18} /> Batch Download
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

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-xl font-bold mb-4">Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Released</span>
                <span>{item.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Format</span>
                <span>MKV / MP4</span>
              </div>
            </div>
          </div>

          {/* AD BANNER 2 (Sidebar) */}
          <div className="sticky top-24">
            <AdBanner />
          </div>
        </div>
      </div>

      {/* --- PREVIEW IMAGE MODAL --- */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition"
            >
              <X size={32} />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- EPISODE POPUP --- */}
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
                  <p className="text-center text-gray-500">No links added.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BATCH DOWNLOAD MODAL --- */}
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

              {getBatchLink() ? (
                <div className="text-center py-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="mb-4">
                    <p className="text-green-400 font-medium mb-1">
                      Single Link Available!
                    </p>
                    <p className="text-xs text-gray-500">
                      Click below to open the complete season folder.
                    </p>
                  </div>
                  <a
                    href={getBatchLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 shadow-lg mb-2"
                  >
                    <ExternalLink size={20} /> Open {batchQuality} Season Pack
                  </a>
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
                    )}
                    {copied ? "Copied!" : "Copy All Links (For IDM)"}
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
