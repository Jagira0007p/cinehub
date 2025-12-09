import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Film,
  Tv,
} from "lucide-react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // State for Tabs & Pagination
  const [activeTab, setActiveTab] = useState("movie"); // 'movie' or 'series'
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reset page when tab or query changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, query]);

  // Fetch Data whenever dependencies change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Calls the existing endpoint: /api/list/movie?search=...&page=...
        const res = await api.get(
          `/list/${activeTab}?search=${query}&page=${page}`
        );
        setItems(res.data.items);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchData();
    }
  }, [activeTab, query, page]);

  // Helper for Genres
  const formatGenre = (genre) =>
    Array.isArray(genre) ? genre.join(", ") : genre;

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Search Results for: <span className="text-red-500">"{query}"</span>
        </h1>
        <p className="text-gray-400">Found results in the library</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-800 pb-1">
        <button
          onClick={() => setActiveTab("movie")}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all border-b-2 ${
            activeTab === "movie"
              ? "border-red-500 text-red-500 bg-red-500/10"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Film size={20} /> Movies
        </button>
        <button
          onClick={() => setActiveTab("series")}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all border-b-2 ${
            activeTab === "series"
              ? "border-red-500 text-red-500 bg-red-500/10"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Tv size={20} /> Series
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
          <p className="text-gray-400">Searching...</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700/50"
              >
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold mb-2">
                  No {activeTab}s found
                </h3>
                <p className="text-gray-400">
                  Try searching for something else or switch tabs.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
              >
                {items.map((item) => (
                  <Link
                    key={item._id}
                    to={`/${activeTab}/${item._id}`}
                    className="group relative block bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition duration-300 shadow-xl"
                  >
                    <div className="aspect-[2/3] w-full relative">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="bg-red-600 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                          Download
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      {/* ✅ FIXED: Removed truncate, added break-words */}
                      <h3 className="font-semibold break-words text-white group-hover:text-red-400 transition leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{item.year}</span>
                        <span className="bg-gray-700 px-2 py-0.5 rounded capitalize">
                          {formatGenre(item.genre)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`p-3 rounded-full transition ${
                  page === 1
                    ? "bg-gray-800 text-gray-600"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="font-bold text-lg text-gray-300">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`p-3 rounded-full transition ${
                  page === totalPages
                    ? "bg-gray-800 text-gray-600"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
