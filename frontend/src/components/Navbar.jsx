import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Tv,
  Home,
  Lock,
  Menu,
  X,
  Sparkles,
  Search,
  ArrowLeft,
  Loader2,
  Film,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api"; // Make sure to import your API

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Outside Click to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus mobile input
  useEffect(() => {
    if (showMobileSearch && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [showMobileSearch]);

  // LIVE SEARCH LOGIC (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          // Fetch from both Movies and Series
          const [moviesRes, seriesRes] = await Promise.all([
            api.get(`/list/movie?search=${searchTerm}`),
            api.get(`/list/series?search=${searchTerm}`),
          ]);

          // Combine and Format Data
          const movieHits = moviesRes.data.items.map((m) => ({
            ...m,
            type: "movie",
          }));
          const seriesHits = seriesRes.data.items.map((s) => ({
            ...s,
            type: "series",
          }));

          // Merge and take top 6 results
          const combined = [...movieHits, ...seriesHits].slice(0, 6);
          setSuggestions(combined);
        } catch (error) {
          console.error("Search Error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300); // Wait 300ms after typing stops

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
      setShowMobileSearch(false);
      setShowDropdown(false);
      setSearchTerm("");
    }
  };

  const handleSuggestionClick = (id, type) => {
    navigate(`/${type}/${id}`);
    setIsOpen(false);
    setShowMobileSearch(false);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/movies", label: "Movies", icon: Film },
    { path: "/series", label: "Series", icon: Tv },
    // { path: "/admin", label: "Admin", icon: Lock },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled || isOpen || showMobileSearch
            ? "bg-gray-900/95 backdrop-blur-lg shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 relative">
            {/* --- MOBILE SEARCH MODE --- */}
            <AnimatePresence mode="wait">
              {showMobileSearch ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex items-center gap-3 md:hidden"
                  key="mobile-search-bar"
                >
                  <button
                    onClick={() => {
                      setShowMobileSearch(false);
                      setSearchTerm("");
                    }}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <form
                    onSubmit={handleManualSearch}
                    className="flex-1 relative"
                  >
                    <input
                      ref={mobileInputRef}
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:border-red-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 text-red-500 animate-spin absolute left-3 top-1/2 transform -translate-y-1/2" />
                    ) : (
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </form>
                </motion.div>
              ) : (
                /* --- STANDARD NAVBAR CONTENT --- */
                <motion.div
                  className="w-full flex justify-between items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="standard-navbar"
                >
                  {/* Logo */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <Link to="/" className="flex items-center gap-2">
                      <div className="relative">
                        <img
                          src="/favicon.png"
                          alt="Logo"
                          className="w-10 h-10 object-contain animate-pulse drop-shadow-lg"
                        />
                        <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-spin" />
                      </div>
                      <motion.span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-[length:200%] animate-gradient hidden sm:block">
                        DVStream
                      </motion.span>
                    </Link>
                  </motion.div>

                  {/* Desktop Navigation & Search */}
                  <div
                    className="hidden md:flex items-center gap-6"
                    ref={dropdownRef}
                  >
                    <form
                      onSubmit={handleManualSearch}
                      className="relative group"
                    >
                      <input
                        type="text"
                        placeholder="Search movies..."
                        className="bg-gray-800/50 text-white pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:border-red-500 focus:w-72 w-56 transition-all duration-300 outline-none backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowDropdown(true);
                        }}
                      />
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 text-red-500 animate-spin absolute left-3 top-1/2 transform -translate-y-1/2" />
                      ) : (
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-red-500 transition-colors" />
                      )}

                      {/* --- DESKTOP DROPDOWN --- */}
                      <AnimatePresence>
                        {showDropdown && suggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-12 left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
                          >
                            {suggestions.map((item) => (
                              <div
                                key={item._id}
                                onClick={() =>
                                  handleSuggestionClick(item._id, item.type)
                                }
                                className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition border-b border-gray-800 last:border-none"
                              >
                                <img
                                  src={item.poster}
                                  className="w-10 h-14 object-cover rounded"
                                  alt={item.title}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="uppercase text-[10px] bg-red-600 px-1 rounded text-white">
                                      {item.type}
                                    </span>
                                    {item.year}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div
                              onClick={handleManualSearch}
                              className="p-2 text-center text-xs text-red-400 hover:text-white cursor-pointer bg-gray-800"
                            >
                              View all results
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>

                    {/* Nav Items */}
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                            isActive(item.path)
                              ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-500/30"
                              : "hover:bg-gray-800/50"
                          }`}
                        >
                          <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span className="font-medium relative">
                            {item.label}
                            {isActive(item.path) && (
                              <motion.div
                                layoutId="underline"
                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"
                              />
                            )}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile Icons */}
                  <div className="flex items-center gap-2 md:hidden">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsOpen(false);
                        setShowMobileSearch(true);
                      }}
                      className="p-2 rounded-lg bg-gray-800/50 text-gray-200"
                    >
                      <Search size={24} />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(!isOpen)}
                      className="p-2 rounded-lg bg-gray-800/50 text-gray-200"
                    >
                      {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- MOBILE DROPDOWN SUGGESTIONS (Appears below Navbar when searching) --- */}
          <AnimatePresence>
            {showMobileSearch && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-16 left-0 right-0 mx-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-b-xl shadow-2xl overflow-hidden z-40 md:hidden"
              >
                {suggestions.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleSuggestionClick(item._id, item.type)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-none"
                  >
                    <img
                      src={item.poster}
                      className="w-10 h-14 object-cover rounded"
                      alt={item.title}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="uppercase text-[10px] bg-red-600 px-1 rounded text-white">
                          {item.type}
                        </span>
                        {item.year}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mobile Menu (Standard) */}
      <AnimatePresence>
        {isOpen && !showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-lg md:hidden z-40 overflow-hidden shadow-xl border-t border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-red-600 to-orange-500"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-lg">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;
