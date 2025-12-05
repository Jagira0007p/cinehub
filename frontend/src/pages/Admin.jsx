import { useState, useEffect } from "react";
import api, { getAdminHeaders } from "../api";
import {
  Pencil,
  Trash2,
  X,
  Upload,
  Film,
  Tv,
  BarChart3,
  Shield,
  Search,
  Loader2,
  PlayCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("content");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyExistingLogin = async () => {
      const savedPassword = localStorage.getItem("adminPassword");
      if (savedPassword) {
        try {
          await api.post(
            "/verify-admin",
            {},
            {
              headers: { "x-admin-password": savedPassword },
            }
          );
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("adminPassword");
          setIsAuthenticated(false);
        }
      }
      setVerifying(false);
    };
    verifyExistingLogin();
  }, []);

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    try {
      await api.post(
        "/verify-admin",
        {},
        {
          headers: { "x-admin-password": password },
        }
      );
      localStorage.setItem("adminPassword", password);
      setIsAuthenticated(true);
      toast.success("Welcome back!");
    } catch (error) {
      toast.error("Invalid Password!");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) return null;

  if (!isAuthenticated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="glass-effect p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
              Admin Portal
            </h2>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter Admin Password"
              className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-red-500 outline-none text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl font-bold text-lg disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Login"}
            </button>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
              Dashboard
            </h1>
            <p className="text-gray-400">Manage Content</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("adminPassword");
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 bg-gray-800 rounded-xl border border-gray-700 hover:border-red-500 transition flex gap-2 items-center"
          >
            <Shield className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "content", label: "Manage Movies/Series", icon: Film },
            { id: "episodes", label: "Manage Episodes", icon: Tv },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-lg"
                  : "bg-gray-800/50 hover:bg-gray-700 text-gray-400"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {activeTab === "content" ? <ContentManager /> : <EpisodeManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- CONTENT MANAGER (UPDATED) ---
const ContentManager = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm = {
    title: "",
    description: "",
    genre: "",
    year: new Date().getFullYear(),
    type: "movie",
    downloads: { p480: "", p720: "", p1080: "" },
    batchLinks: { p480: "", p720: "", p1080: "" },
    poster: "",
    previewImages: [],
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchContent = async () => {
    try {
      const res = await api.get("/content");
      setItems([...res.data.movies, ...res.data.series]);
    } catch (error) {
      console.error("Failed to load content");
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    const genreString = Array.isArray(item.genre)
      ? item.genre.join(", ")
      : item.genre;
    setFormData({
      ...item,
      genre: genreString,
      downloads: item.downloads || initialForm.downloads,
      batchLinks: item.batchLinks || initialForm.batchLinks,
      previewImages: item.previewImages || [],
      type: item.episodes ? "series" : "movie",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/content/${type}/${id}`, getAdminHeaders());
      toast.success("Deleted");
      fetchContent();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // --- NEW: DELETE IMAGE FUNCTION ---
  const deleteImage = async (url, type, index = null) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // 1. Delete from Cloudinary
      await api.delete("/upload", {
        data: { url },
        ...getAdminHeaders(),
      });

      // 2. Update Form State
      if (type === "poster") {
        setFormData({ ...formData, poster: "" });
      } else {
        const newPreviews = formData.previewImages.filter(
          (_, i) => i !== index
        );
        setFormData({ ...formData, previewImages: newPreviews });
      }
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete image");
    }
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
        // If a poster already exists, delete it first to keep Cloudinary clean
        if (formData.poster) {
          await api.delete("/upload", {
            data: { url: formData.poster },
            ...getAdminHeaders(),
          });
        }
        setFormData({ ...formData, poster: res.data.url });
      } else {
        setFormData({
          ...formData,
          previewImages: [...formData.previewImages, res.data.url],
        });
      }
      toast.success("Uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId)
        await api.put(
          `/content/${formData.type}/${editingId}`,
          formData,
          getAdminHeaders()
        );
      else
        await api.post(
          `/content/${formData.type}`,
          formData,
          getAdminHeaders()
        );
      toast.success(editingId ? "Updated!" : "Created!");
      setEditingId(null);
      setFormData(initialForm);
      fetchContent();
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const filteredItems = items.filter((i) =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="glass-effect p-6 rounded-2xl sticky top-24">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? "Edit" : "Create"} Content
            </h2>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData(initialForm);
                }}
                className="text-red-400 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              disabled={!!editingId}
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
            <input
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
            <textarea
              className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                placeholder="Genre (comma separated)"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
              />
              <input
                className="p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                type="number"
                placeholder="Year"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            {/* Images Section Updated */}
            <div className="border-t border-gray-700 pt-4 space-y-4">
              <div>
                <p className="text-xs font-bold mb-1">Poster</p>
                {!formData.poster ? (
                  <input
                    type="file"
                    onChange={(e) => uploadImage(e, "poster")}
                    className="text-xs text-gray-400"
                  />
                ) : (
                  <div className="relative inline-block group">
                    <img
                      src={formData.poster}
                      className="h-20 rounded shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => deleteImage(formData.poster, "poster")}
                      className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white shadow-lg hover:bg-red-700"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold mb-1">Screenshots (Max 4)</p>
                <input
                  type="file"
                  onChange={(e) => uploadImage(e, "preview")}
                  className="text-xs text-gray-400 mb-2"
                  disabled={formData.previewImages.length >= 4}
                />
                <div className="grid grid-cols-4 gap-2">
                  {formData.previewImages.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        className="h-12 w-full object-cover rounded border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => deleteImage(src, "preview", i)}
                        className="absolute -top-1 -right-1 bg-red-600 p-0.5 rounded-full text-white shadow-md hover:bg-red-700"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            {formData.type === "movie" && (
              <div className="space-y-2 pt-2 border-t border-gray-700 mt-2">
                <p className="text-xs font-bold text-blue-400">Movie Links</p>
                <input
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                  placeholder="480p Link"
                  value={formData.downloads.p480}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      downloads: {
                        ...formData.downloads,
                        p480: e.target.value,
                      },
                    })
                  }
                />
                <input
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                  placeholder="720p Link"
                  value={formData.downloads.p720}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      downloads: {
                        ...formData.downloads,
                        p720: e.target.value,
                      },
                    })
                  }
                />
                <input
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                  placeholder="1080p Link"
                  value={formData.downloads.p1080}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      downloads: {
                        ...formData.downloads,
                        p1080: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
            {formData.type === "series" && (
              <div className="space-y-2 pt-2 border-t border-gray-700 mt-2">
                <p className="text-xs font-bold text-green-400">
                  Series Batch Links
                </p>
                <input
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                  placeholder="480p Batch"
                  value={formData.batchLinks?.p480 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      batchLinks: {
                        ...formData.batchLinks,
                        p480: e.target.value,
                      },
                    })
                  }
                />
                <input
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                  placeholder="720p Batch"
                  value={formData.batchLinks?.p720 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      batchLinks: {
                        ...formData.batchLinks,
                        p720: e.target.value,
                      },
                    })
                  }
                />
                <input
                  className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                  placeholder="1080p Batch"
                  value={formData.batchLinks?.p1080 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      batchLinks: {
                        ...formData.batchLinks,
                        p1080: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}

            <button
              disabled={uploading}
              className="w-full bg-green-600 py-3 rounded-xl font-bold"
            >
              {uploading ? "Processing..." : "Save Content"}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-effect p-6 rounded-2xl">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-xl">Existing Content</h2>
            <input
              className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.poster}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {Array.isArray(item.genre)
                        ? item.genre.join(", ")
                        : item.genre}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-blue-600/20 rounded-lg text-blue-400"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(item._id, item.episodes ? "series" : "movie")
                    }
                    className="p-2 bg-red-600/20 rounded-lg text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- EPISODE MANAGER (Unchanged) ---
const EpisodeManager = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingEpId, setEditingEpId] = useState(null);
  const initialForm = {
    title: "",
    episodeNumber: "",
    downloads: { p480: "", p720: "", p1080: "" },
  };
  const [epForm, setEpForm] = useState(initialForm);

  useEffect(() => {
    api.get("/content").then((res) => setSeriesList(res.data.series));
  }, []);

  const handleSeriesSelect = async (e) => {
    const sId = e.target.value;
    if (!sId) {
      setSelectedSeries(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/content/series/${sId}`);
      setSelectedSeries(res.data);
      setEpForm(initialForm);
      setEditingEpId(null);
    } catch (error) {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEp = (ep) => {
    setEditingEpId(ep._id);
    setEpForm({
      title: ep.title,
      episodeNumber: ep.episodeNumber,
      downloads: {
        p480: ep.downloads?.p480 || "",
        p720: ep.downloads?.p720 || "",
        p1080: ep.downloads?.p1080 || "",
      },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEp = async (epId) => {
    if (!confirm("Delete episode?")) return;
    try {
      await api.delete(
        `/content/series/${selectedSeries._id}/episode/${epId}`,
        getAdminHeaders()
      );
      toast.success("Deleted");
      const res = await api.get(`/content/series/${selectedSeries._id}`);
      setSelectedSeries(res.data);
    } catch (error) {
      toast.error("Failed");
    }
  };

  const handleSaveEp = async (e) => {
    e.preventDefault();
    if (!selectedSeries) return;
    try {
      if (editingEpId) {
        await api.put(
          `/content/series/${selectedSeries._id}/episode/${editingEpId}`,
          epForm,
          getAdminHeaders()
        );
        toast.success("Updated!");
      } else {
        await api.put(
          `/content/series/${selectedSeries._id}/episode`,
          epForm,
          getAdminHeaders()
        );
        toast.success("Added!");
      }
      const res = await api.get(`/content/series/${selectedSeries._id}`);
      setSelectedSeries(res.data);
      setEpForm(initialForm);
      setEditingEpId(null);
    } catch (error) {
      toast.error("Failed");
    }
  };

  return (
    <div className="glass-effect p-6 rounded-2xl max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Manage Episodes</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <select
            className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white mb-6"
            onChange={handleSeriesSelect}
          >
            <option value="">-- Select Series --</option>
            {seriesList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>
          {selectedSeries && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="font-bold">
                  {editingEpId ? "Edit Episode" : "Add New"}
                </h3>
                {editingEpId && (
                  <button
                    onClick={() => {
                      setEditingEpId(null);
                      setEpForm(initialForm);
                    }}
                    className="text-red-400 text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveEp} className="space-y-3">
                <input
                  className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                  placeholder="Title"
                  value={epForm.title}
                  onChange={(e) =>
                    setEpForm({ ...epForm, title: e.target.value })
                  }
                  required
                />
                <input
                  className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                  type="number"
                  placeholder="Ep No"
                  value={epForm.episodeNumber}
                  onChange={(e) =>
                    setEpForm({ ...epForm, episodeNumber: e.target.value })
                  }
                  required
                />
                <div className="space-y-2">
                  <input
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                    placeholder="480p Link"
                    value={epForm.downloads.p480}
                    onChange={(e) =>
                      setEpForm({
                        ...epForm,
                        downloads: {
                          ...epForm.downloads,
                          p480: e.target.value,
                        },
                      })
                    }
                  />
                  <input
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                    placeholder="720p Link"
                    value={epForm.downloads.p720}
                    onChange={(e) =>
                      setEpForm({
                        ...epForm,
                        downloads: {
                          ...epForm.downloads,
                          p720: e.target.value,
                        },
                      })
                    }
                  />
                  <input
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
                    placeholder="1080p Link"
                    value={epForm.downloads.p1080}
                    onChange={(e) =>
                      setEpForm({
                        ...epForm,
                        downloads: {
                          ...epForm.downloads,
                          p1080: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <button className="w-full bg-blue-600 py-3 rounded-xl font-bold">
                  {editingEpId ? "Update" : "Add"}
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="md:col-span-7">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto" />
            </div>
          ) : (selectedSeries?.episodes || []).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No episodes found.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedSeries.episodes
                .sort((a, b) => a.episodeNumber - b.episodeNumber)
                .map((ep) => (
                  <div
                    key={ep._id}
                    className={`p-3 rounded-xl flex justify-between items-center ${
                      editingEpId === ep._id
                        ? "bg-blue-900/30 border border-blue-500"
                        : "bg-gray-800/50"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white">
                        Ep {ep.episodeNumber}
                      </p>
                      <p className="text-xs text-gray-400 truncate w-32">
                        {ep.title}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEp(ep)}
                        className="p-2 bg-blue-600/20 text-blue-400 rounded"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEp(ep._id)}
                        className="p-2 bg-red-600/20 text-red-400 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
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
