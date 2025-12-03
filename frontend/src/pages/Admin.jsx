import { useState, useEffect } from "react";
import api, { getAdminHeaders } from "../api";
import {
  Pencil,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Upload,
  Film,
  Tv,
  Eye,
  Plus,
  Users,
  BarChart3,
  Shield,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("content");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Store password and verify
    localStorage.setItem("adminPassword", password);
    setTimeout(() => {
      setIsAuthenticated(true);
      toast.success("Welcome to Admin Dashboard!");
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem("adminPassword");
    if (savedPassword) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <Shield className="w-16 h-16 text-red-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Admin Portal
            </h2>
            <p className="text-gray-400">Secure access required</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Enter Admin Password"
                className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl pl-12 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
              <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400">Manage your movie library</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem("adminPassword");
                setIsAuthenticated(false);
                toast.info("Logged out successfully");
              }}
              className="px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-red-500 transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              icon: Film,
              label: "Movies",
              value: "1,250",
              color: "from-red-500 to-orange-500",
            },
            {
              icon: Tv,
              label: "Series",
              value: "350",
              color: "from-blue-500 to-purple-500",
            },
            {
              icon: Users,
              label: "Users",
              value: "25K",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: BarChart3,
              label: "Downloads",
              value: "2.5M",
              color: "from-yellow-500 to-orange-500",
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 mb-8 border-b border-gray-800 pb-4 overflow-x-auto"
        >
          {[
            { id: "content", label: "Manage Content", icon: Film },
            { id: "episodes", label: "Episodes", icon: Tv },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-lg"
                  : "bg-gray-800/50 hover:bg-gray-700/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "content" ? (
              <ContentManager />
            ) : activeTab === "episodes" ? (
              <EpisodeManager />
            ) : (
              <div className="glass-effect p-8 rounded-2xl text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <p className="text-gray-400">
                  Analytics dashboard is under development
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- CONTENT MANAGER ---
const ContentManager = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm = {
    title: "",
    description: "",
    genre: "",
    year: new Date().getFullYear(),
    type: "movie",
    downloads: { p480: "", p720: "", p1080: "" },
    poster: "",
    previewImages: [],
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await api.get("/content");
      setItems([...res.data.movies, ...res.data.series]);
    } catch (error) {
      toast.error("Failed to load content");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      ...item,
      downloads: item.downloads || { p480: "", p720: "", p1080: "" },
      previewImages: item.previewImages || [],
      type: item.episodes ? "series" : "movie",
    });
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/content/${type}/${id}`, getAdminHeaders());
      toast.success("Item deleted successfully");
      fetchContent();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const uploadImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await api.post("/upload", data, getAdminHeaders());
      if (type === "poster") {
        setFormData({ ...formData, poster: res.data.url });
      } else {
        if (formData.previewImages.length >= 4) {
          toast.warning("Maximum 4 screenshots allowed");
          return;
        }
        setFormData({
          ...formData,
          previewImages: [...formData.previewImages, res.data.url],
        });
      }
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (indexToRemove) => {
    setFormData({
      ...formData,
      previewImages: formData.previewImages.filter(
        (_, i) => i !== indexToRemove
      ),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(
          `/content/${formData.type}/${editingId}`,
          formData,
          getAdminHeaders()
        );
        toast.success("Content updated successfully");
      } else {
        await api.post(
          `/content/${formData.type}`,
          formData,
          getAdminHeaders()
        );
        toast.success("Content created successfully");
      }
      handleReset();
      fetchContent();
    } catch (error) {
      toast.error("Operation failed");
      console.error(error);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* FORM SECTION */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect p-6 rounded-2xl shadow-xl sticky top-24"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {editingId ? "Edit Content" : "Create New"}
            </h2>
            {editingId && (
              <button
                onClick={handleReset}
                className="text-sm text-red-400 hover:text-red-300 transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
              value={formData.type}
              disabled={!!editingId}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>

            <input
              placeholder="Title *"
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description *"
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
              required
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Genre"
                className="p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
              />
              <input
                placeholder="Year"
                type="number"
                className="p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4 border-t border-gray-700 pt-4">
              <div>
                <label className="text-sm font-bold block mb-2">
                  Poster Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 p-3 rounded-xl border border-gray-700 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadImage(e, "poster")}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5" />
                  </label>
                  {formData.poster && (
                    <img
                      src={formData.poster}
                      className="h-16 w-12 object-cover rounded-xl shadow-lg"
                      alt="Poster preview"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold block mb-2">
                  Screenshots (Max 4)
                </label>
                <label
                  className={`cursor-pointer bg-gray-800 hover:bg-gray-700 p-3 rounded-xl border border-gray-700 transition block mb-3 ${
                    formData.previewImages.length >= 4
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadImage(e, "screenshot")}
                    className="hidden"
                    disabled={formData.previewImages.length >= 4}
                  />
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Screenshot</span>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {formData.previewImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        alt={`Screenshot ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Download Links (Movies Only) */}
            {formData.type === "movie" && (
              <div className="glass-effect p-4 rounded-xl">
                <p className="text-sm font-bold mb-3">Download Links</p>
                <div className="space-y-2">
                  {["p480", "p720", "p1080"].map((quality) => (
                    <input
                      key={quality}
                      placeholder={`${quality.substring(1)}p URL`}
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:border-red-500 outline-none"
                      value={formData.downloads?.[quality] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          downloads: {
                            ...formData.downloads,
                            [quality]: e.target.value,
                          },
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={uploading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : editingId
                ? "Update Content"
                : "Create Content"}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* LIST SECTION */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect p-6 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold">Existing Content</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
              <p>Loading content...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No content found</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <motion.div
                    key={item._id}
                    whileHover={{ scale: 1.01 }}
                    className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl hover:bg-gray-800 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.poster}
                        className="w-12 h-16 object-cover rounded-lg shadow"
                        alt={item.title}
                      />
                      <div>
                        <p className="font-bold text-lg">{item.title}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                          <span className="bg-gray-900 px-2 py-1 rounded">
                            {item.episodes ? "Series" : "Movie"}
                          </span>
                          <span>{item.year}</span>
                          <span>{item.genre}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={18} className="text-blue-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleDelete(
                            item._id,
                            item.episodes ? "series" : "movie"
                          )
                        }
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// --- EPISODE MANAGER ---
const EpisodeManager = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [epForm, setEpForm] = useState({
    title: "",
    episodeNumber: "",
    downloads: { p480: "", p720: "", p1080: "" },
  });

  useEffect(() => {
    api.get("/content").then((res) => setSeriesList(res.data.series));
  }, []);

  const handleSeriesSelect = async (e) => {
    const sId = e.target.value;
    if (!sId) {
      setSelectedSeries(null);
      setEpisodes([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/content/series/${sId}`);
      setSelectedSeries(res.data);
      setEpisodes(res.data.episodes || []);
    } catch (error) {
      toast.error("Failed to load series");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEp = async (e) => {
    e.preventDefault();
    if (!selectedSeries) return;
    try {
      await api.put(
        `/content/series/${selectedSeries._id}/episode`,
        epForm,
        getAdminHeaders()
      );
      toast.success("Episode added successfully!");
      const res = await api.get(`/content/series/${selectedSeries._id}`);
      setEpisodes(res.data.episodes);
      setEpForm({
        title: "",
        episodeNumber: "",
        downloads: { p480: "", p720: "", p1080: "" },
      });
    } catch (error) {
      toast.error("Failed to add episode");
    }
  };

  return (
    <div className="glass-effect p-6 rounded-2xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Episodes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Add Episode */}
        <div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              Select Series
            </label>
            <select
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
              onChange={handleSeriesSelect}
              disabled={loading}
            >
              <option value="">-- Select Series --</option>
              {seriesList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title} ({s.year})
                </option>
              ))}
            </select>
          </div>

          {selectedSeries && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-lg">
                Add New Episode to: {selectedSeries.title}
              </h3>
              <form onSubmit={handleAddEp} className="space-y-4">
                <input
                  placeholder="Episode Title *"
                  className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
                  required
                  value={epForm.title}
                  onChange={(e) =>
                    setEpForm({ ...epForm, title: e.target.value })
                  }
                />
                <input
                  placeholder="Episode Number *"
                  type="number"
                  className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none"
                  required
                  value={epForm.episodeNumber}
                  onChange={(e) =>
                    setEpForm({ ...epForm, episodeNumber: e.target.value })
                  }
                />

                <div className="glass-effect p-4 rounded-xl">
                  <p className="text-sm font-bold mb-3">Download Links</p>
                  <div className="space-y-2">
                    {["p480", "p720", "p1080"].map((quality) => (
                      <input
                        key={quality}
                        placeholder={`${quality.substring(1)}p URL`}
                        className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm"
                        value={epForm.downloads[quality]}
                        onChange={(e) =>
                          setEpForm({
                            ...epForm,
                            downloads: {
                              ...epForm.downloads,
                              [quality]: e.target.value,
                            },
                          })
                        }
                      />
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 py-3 rounded-xl font-bold hover:shadow-lg transition"
                >
                  Add Episode
                </motion.button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Right Column - Episode List */}
        <div>
          <h3 className="font-bold text-lg mb-4">
            {selectedSeries
              ? `${selectedSeries.title} Episodes`
              : "Select a series to view episodes"}
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
              <p>Loading episodes...</p>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 glass-effect rounded-xl">
              <Tv className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No episodes found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {episodes
                .sort((a, b) => a.episodeNumber - b.episodeNumber)
                .map((ep) => (
                  <div
                    key={ep._id}
                    className="bg-gray-800/50 p-4 rounded-xl hover:bg-gray-800 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">Episode {ep.episodeNumber}</p>
                        <p className="text-sm text-gray-400">{ep.title}</p>
                      </div>
                      <div className="flex gap-2">
                        {ep.downloads.p480 && (
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                            480p
                          </span>
                        )}
                        {ep.downloads.p720 && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                            720p
                          </span>
                        )}
                        {ep.downloads.p1080 && (
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                            1080p
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
