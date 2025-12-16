import { useState, useEffect } from "react";
import api, { getAdminHeaders } from "../api";
import {
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  Film,
  Tv,
  BarChart3,
  Shield,
  Search,
  Loader2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// --- DYNAMIC LINK COMPONENT ---
const DynamicLinks = ({ links, setLinks, label }) => {
  const addLink = () => {
    setLinks([...links, { quality: "", size: "", url: "" }]);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-blue-400">{label}</p>
        <button
          type="button"
          onClick={addLink}
          className="text-xs flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition"
        >
          <Plus size={12} /> Add Link
        </button>
      </div>
      {links.map((link, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="w-1/4 p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
            placeholder="Quality (e.g. 1080p)"
            value={link.quality}
            onChange={(e) => updateLink(i, "quality", e.target.value)}
          />
          <input
            className="w-1/4 p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
            placeholder="Size (e.g. 2.4GB)"
            value={link.size}
            onChange={(e) => updateLink(i, "size", e.target.value)}
          />
          <input
            className="flex-1 p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
            placeholder="Download URL"
            value={link.url}
            onChange={(e) => updateLink(i, "url", e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeLink(i)}
            className="text-red-400 hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      {links.length === 0 && (
        <p className="text-xs text-gray-500 italic">No links added.</p>
      )}
    </div>
  );
};

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
            { headers: { "x-admin-password": savedPassword } }
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
        { headers: { "x-admin-password": password } }
      );
      localStorage.setItem("adminPassword", password);
      setIsAuthenticated(true);
      toast.success("Welcome back!");
    } catch (error) {
      toast.error("Invalid Password!");
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

// --- CONTENT MANAGER ---
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
    downloadLinks: [],
    batchDownloadLinks: [], // Using new name matching Schema
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

  // Convert old object format to new array format if needed
  const convertOldLinks = (oldLinks) => {
    if (!oldLinks) return [];
    return Object.entries(oldLinks)
      .filter(([_, url]) => url)
      .map(([key, url]) => ({
        quality: key.replace("p", "") + "p",
        size: "N/A",
        url: url,
      }));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    const genreString = Array.isArray(item.genre)
      ? item.genre.join(", ")
      : item.genre;

    // Auto-migrate on edit open
    let dLinks = item.downloadLinks || [];
    if (dLinks.length === 0 && item.downloads)
      dLinks = convertOldLinks(item.downloads);

    let bLinks = item.batchDownloadLinks || [];
    // Check old batchLinks (which was object in Series schema previously)
    if (
      bLinks.length === 0 &&
      item.batchLinks &&
      !Array.isArray(item.batchLinks)
    ) {
      bLinks = convertOldLinks(item.batchLinks);
    } else if (item.batchLinks && Array.isArray(item.batchLinks)) {
      bLinks = item.batchLinks;
    }

    setFormData({
      ...item,
      genre: genreString,
      downloadLinks: dLinks,
      batchDownloadLinks: bLinks,
      previewImages: item.previewImages || [],
      type: item.episodes ? "series" : "movie",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Delete?")) return;
    try {
      await api.delete(`/content/${type}/${id}`, getAdminHeaders());
      toast.success("Deleted");
      fetchContent();
    } catch (error) {
      toast.error("Failed");
    }
  };

  const deleteImage = async (url, type, index) => {
    if (!confirm("Delete?")) return;
    try {
      await api.delete("/upload", { data: { url }, ...getAdminHeaders() });
      if (type === "poster") setFormData({ ...formData, poster: "" });
      else
        setFormData({
          ...formData,
          previewImages: formData.previewImages.filter((_, i) => i !== index),
        });
      toast.success("Deleted image");
    } catch (e) {
      toast.error("Failed");
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
        if (formData.poster)
          await api.delete("/upload", {
            data: { url: formData.poster },
            ...getAdminHeaders(),
          });
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
    const payload = { ...formData }; // FormData already matches schema structure now
    try {
      if (editingId)
        await api.put(
          `/content/${formData.type}/${editingId}`,
          payload,
          getAdminHeaders()
        );
      else
        await api.post(`/content/${formData.type}`, payload, getAdminHeaders());
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
                      className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white shadow-lg"
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
                        className="absolute -top-1 -right-1 bg-red-600 p-0.5 rounded-full text-white"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DYNAMIC LINKS */}
            {formData.type === "movie" && (
              <div className="border-t border-gray-700 mt-2">
                <DynamicLinks
                  label="Movie Links"
                  links={formData.downloadLinks}
                  setLinks={(l) =>
                    setFormData({ ...formData, downloadLinks: l })
                  }
                />
              </div>
            )}
            {formData.type === "series" && (
              <div className="border-t border-gray-700 mt-2">
                <DynamicLinks
                  label="Series Batch Links"
                  links={formData.batchDownloadLinks}
                  setLinks={(l) =>
                    setFormData({ ...formData, batchDownloadLinks: l })
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

      {/* List Section */}
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
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-blue-600/20 text-blue-400 rounded"
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

// --- EPISODE MANAGER ---
const EpisodeManager = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingEpId, setEditingEpId] = useState(null);
  const initialForm = { title: "", episodeNumber: "", downloadLinks: [] };
  const [epForm, setEpForm] = useState(initialForm);
  // ✅ NEW: Search State
  const [seriesSearch, setSeriesSearch] = useState("");

  useEffect(() => {
    api.get("/content").then((res) => setSeriesList(res.data.series));
  }, []);

  const handleSeriesSelect = async (e) => {
    if (!e.target.value) {
      setSelectedSeries(null);
      return;
    }
    try {
      const res = await api.get(`/content/series/${e.target.value}`);
      setSelectedSeries(res.data);
    } catch (e) {}
  };

  const handleEditEp = (ep) => {
    setEditingEpId(ep._id);
    let links = ep.downloadLinks || [];
    if (links.length === 0 && ep.downloads) {
      links = Object.entries(ep.downloads)
        .filter(([_, url]) => url)
        .map(([key, url]) => ({
          quality: key.replace("p", "") + "p",
          size: "N/A",
          url,
        }));
    }
    setEpForm({
      title: ep.title,
      episodeNumber: ep.episodeNumber,
      downloadLinks: links,
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

  // ✅ NEW: Filtered Series Logic
  const filteredSeries = seriesList.filter((s) =>
    s.title.toLowerCase().includes(seriesSearch.toLowerCase())
  );

  return (
    <div className="glass-effect p-6 rounded-2xl max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Manage Episodes</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          {/* ✅ NEW: Series Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="w-full pl-10 p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition"
              placeholder="Search Series..."
              value={seriesSearch}
              onChange={(e) => setSeriesSearch(e.target.value)}
            />
          </div>

          {/* Modified Select to use filteredSeries */}
          <select
            className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white mb-6"
            onChange={handleSeriesSelect}
          >
            <option value="">-- Select Series --</option>
            {filteredSeries.map((s) => (
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

                <div className="border-t border-gray-700 pt-2">
                  <DynamicLinks
                    label="Episode Links"
                    links={epForm.downloadLinks}
                    setLinks={(l) => setEpForm({ ...epForm, downloadLinks: l })}
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
