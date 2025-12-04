import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Film,
  Tv,
  Home,
  Lock,
  Menu,
  X,
  Sparkles,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // NEW: State for mobile search toggle
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-focus input when mobile search opens
  useEffect(() => {
    if (showMobileSearch && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [showMobileSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setShowMobileSearch(false); // Close mobile search after submitting
      setSearchTerm("");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/movies", label: "Movies", icon: Film },
    { path: "/series", label: "Series", icon: Tv },
    { path: "/admin", label: "Admin", icon: Lock },
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
          <div className="flex justify-between items-center h-16">
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
                    onClick={() => setShowMobileSearch(false)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <form onSubmit={handleSearch} className="flex-1 relative">
                    <input
                      ref={mobileInputRef}
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:border-red-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                        <Film className="w-8 h-8 text-red-500 animate-pulse" />
                        <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-spin" />
                      </div>
                      <motion.span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-[length:200%] animate-gradient">
                        DVStream
                      </motion.span>
                    </Link>
                  </motion.div>

                  {/* Desktop Navigation & Search (Hidden on Mobile) */}
                  <div className="hidden md:flex items-center gap-6">
                    <form onSubmit={handleSearch} className="relative group">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="bg-gray-800/50 text-white pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:border-red-500 focus:w-64 w-48 transition-all duration-300 outline-none backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-red-500 transition-colors" />
                    </form>

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

                  {/* Mobile Icons (Search & Menu) */}
                  <div className="flex items-center gap-2 md:hidden">
                    {/* NEW: Mobile Search Trigger */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsOpen(false); // Close menu if open
                        setShowMobileSearch(true);
                      }}
                      className="p-2 rounded-lg bg-gray-800/50 text-gray-200"
                    >
                      <Search size={24} />
                    </motion.button>

                    {/* Menu Trigger */}
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
        </div>
      </motion.nav>

      {/* Mobile Dropdown Menu (Only visible when NOT searching) */}
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
