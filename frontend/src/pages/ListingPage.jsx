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
  Loader2,
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [availableFilters, setAvailableFilters] = useState({
    genres: [],
    years: [],
  });

  const debouncedSearch = useDebounce(searchTerm, 500);
  const title = type === "movie" ? "Movies" : "Series";

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await api.get(`/filters/${type}`);
        setAvailableFilters(res.data);
      } catch (error) {
        console.error("Error filters");
      }
    };
    loadFilters();
  }, [type]);

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
        console.error("Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, page, debouncedSearch, selectedGenre, selectedYear]);

  // Handlers
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

  // Helper to join genres
  const formatGenre = (genre) =>
    Array.isArray(genre) ? genre.join(", ") : genre;

  const FilterSection = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl mb-6 border border-gray-700/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-red-500 outline-none"
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
        <select
          className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-red-500 outline-none"
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
      <div className="flex justify-between items-center mt-4">
        {(selectedGenre || selectedYear || searchTerm) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
          >
            Clear Filters
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen">
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition"
            >
              <Filter className="w-4 h-4" /> Filters
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading {title}...</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                No results found
              </div>
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
                    transition={{ delay: index * 0.05 }}
                    className={
                      viewMode === "grid"
                        ? "group"
                        : "flex gap-4 bg-gray-800/30 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/30 hover:border-gray-600/50 transition"
                    }
                  >
                    <Link to={`/${type}/${item._id}`} className="block w-full">
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
                        {/* ✅ REMOVED DUPLICATE TITLE FROM INSIDE IMAGE */}
                      </div>

                      {viewMode === "list" ? (
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {item.year} • {formatGenre(item.genre)}
                          </p>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-bold truncate group-hover:text-red-400 transition">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {item.year} • {formatGenre(item.genre)}
                          </p>
                        </>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`p-3 rounded-full ${
                  page === 1
                    ? "bg-gray-800 text-gray-600"
                    : "bg-red-600 text-white"
                }`}
              >
                <ChevronLeft />
              </button>
              <span className="font-bold">
                {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`p-3 rounded-full ${
                  page === totalPages
                    ? "bg-gray-800 text-gray-600"
                    : "bg-red-600 text-white"
                }`}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingPage;
