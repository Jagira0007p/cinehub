import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
  Grid,
  List,
  Loader2, // Imported correctly
} from "lucide-react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../hooks/useDebounce";

const ListingPage = ({ type }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [availableFilters, setAvailableFilters] = useState({
    genres: [],
    years: [],
  });

  const debouncedSearch = useDebounce(searchTerm, 500);
  const title = type === "movie" ? "Movies" : "Series";

  // 1. Fetch Filter Options
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await api.get(`/filters/${type}`);
        setAvailableFilters(res.data);
        setSearchTerm("");
        setSelectedGenre("");
        setSelectedYear("");
        setPage(1);
      } catch (error) {
        console.error("Error loading filters");
      }
    };
    loadFilters();
  }, [type]);

  // 2. Fetch Content
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          search: debouncedSearch,
          genre: selectedGenre,
          year: selectedYear,
        });

        const res = await api.get(`/list/${type}?${params.toString()}`);
        setItems(res.data.items);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, page, debouncedSearch, selectedGenre, selectedYear]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleGenre = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  const handleYear = (e) => {
    setSelectedYear(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("");
    setSelectedYear("");
    setPage(1);
  };

  const FilterSection = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl mb-6 border border-gray-700/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search title..."
            className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Genre Dropdown */}
        <select
          className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none cursor-pointer"
          value={selectedGenre}
          onChange={handleGenre}
        >
          <option value="">All Genres</option>
          {availableFilters.genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none cursor-pointer"
          value={selectedYear}
          onChange={handleYear}
        >
          <option value="">All Years</option>
          {availableFilters.years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          {(selectedGenre || selectedYear || searchTerm) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
            >
              Clear Filters
            </motion.button>
          )}
        </div>
        <div className="text-sm text-gray-400">
          {items.length} {title.toLowerCase()} found
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-red-500 to-orange-400 rounded-full" />
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="flex bg-gray-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid" ? "bg-red-600" : "hover:bg-gray-700"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list" ? "bg-red-600" : "hover:bg-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>{showFilters && <FilterSection />}</AnimatePresence>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            {/* FIX: Changed Loader to Loader2 */}
            <Loader2 className="w-12 h-12 text-red-500" />
          </motion.div>
          <p className="text-xl text-gray-400">Loading {title}...</p>
        </div>
      ) : (
        <>
          {/* Content Grid */}
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700/50"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No results found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Clear all filters
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                    : "space-y-4"
                }
              >
                {items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className={
                      viewMode === "grid"
                        ? "group"
                        : "flex gap-4 bg-gray-800/30 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/30 hover:border-gray-600/50 transition"
                    }
                  >
                    <Link to={`/${type}/${item._id}`} className="block">
                      <div
                        className={
                          viewMode === "grid"
                            ? "relative overflow-hidden rounded-xl mb-3 aspect-[2/3]"
                            : "w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden"
                        }
                      >
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {viewMode === "grid" && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-gradient-to-t from-black/80 to-transparent p-2 rounded-lg backdrop-blur-sm">
                              <p className="text-xs font-semibold truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-300">
                                {item.year} • {item.genre}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {viewMode === "list" && (
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {item.year} • {item.genre}
                          </p>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      )}
                      {viewMode === "grid" && (
                        <>
                          <h3 className="font-bold truncate group-hover:text-red-400 transition">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {item.year} • {item.genre}
                          </p>
                        </>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center gap-4 mt-12"
            >
              <motion.button
                whileHover={{ scale: page === 1 ? 1 : 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`p-3 rounded-full ${
                  page === 1
                    ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                }`}
              >
                <ChevronLeft />
              </motion.button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-full font-bold ${
                        page === pageNum
                          ? "bg-gradient-to-r from-red-600 to-orange-500"
                          : "bg-gray-800/50 hover:bg-gray-700/50"
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
                {totalPages > 5 && <span className="px-2">...</span>}
              </div>

              <motion.button
                whileHover={{ scale: page === totalPages ? 1 : 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`p-3 rounded-full ${
                  page === totalPages
                    ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                }`}
              >
                <ChevronRight />
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingPage;
