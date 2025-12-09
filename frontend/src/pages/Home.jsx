import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import {
  Play,
  Star,
  TrendingUp,
  Download,
  Sparkles,
  Film,
  Smartphone,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
// import SEO from "../components/SEO";

const Home = () => {
  const [data, setData] = useState({ movies: [], series: [] });
  const [stats, setStats] = useState({ movies: 0, series: 0, downloads: 0 });

  useEffect(() => {
    api.get("/home").then((res) => setData(res.data));
    setStats({ movies: 1250, series: 350, downloads: "2.5M+" });
  }, []);

  // Helper to find latest episode number
  const getLatestEp = (item) => {
    if (!item.episodes || item.episodes.length === 0) return null;
    return Math.max(...item.episodes.map((e) => e.episodeNumber));
  };

  const Showcase = ({ title, items, type, viewAllLink }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-orange-400 rounded-full" />
          </div>
          <motion.div whileHover={{ x: 5 }}>
            <Link
              to={viewAllLink}
              className="group flex items-center gap-2 text-red-400 hover:text-white text-sm font-semibold"
            >
              View All{" "}
              <div className="w-0 group-hover:w-5 transition-all duration-300 overflow-hidden">
                →
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {items.map((item, index) => {
            const latestEp = type === "series" ? getLatestEp(item) : null;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link to={`/${type}/${item._id}`}>
                  <div className="relative overflow-hidden rounded-xl mb-3 aspect-[2/3] shadow-2xl">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>

                    {/* ✅ NEW: LATEST EPISODE BADGE */}
                    {latestEp && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                        Ep {latestEp}
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/70 flex items-center justify-center"
                    >
                      <div className="p-3 bg-red-600 rounded-full">
                        <Play className="w-6 h-6" />
                      </div>
                    </motion.div>
                  </div>
                  <h3 className="font-bold break-words group-hover:text-red-400 transition leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.year} • {item.genre?.[0]}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-gray-400 text-sm">{label}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-16">
      {/* <SEO title="Home" description="Watch and download movies and series." /> */}
      <section className="relative rounded-3xl overflow-hidden min-h-[70vh] flex items-center">
        <div
          className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-20 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                PREMIUM COLLECTION
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Unlimited{" "}
              <span className="bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-[length:200%] animate-gradient bg-clip-text text-transparent">
                Movies
              </span>{" "}
              &{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-[length:200%] animate-gradient bg-clip-text text-transparent">
                Series
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Stream or download in stunning 4K, 1080p, 720p quality. No ads, no
              restrictions.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/movies"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 px-8 py-3 rounded-full font-bold text-lg shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition"
                >
                  <Play className="w-5 h-5" /> Start Watching
                </Link>
              </motion.div>
              {/* <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="/dvstream.apk"
                  download
                  className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-8 py-3 rounded-full font-bold text-lg border border-gray-700 hover:bg-gray-700/50 transition text-green-400 border-green-500/50"
                >
                  <Smartphone className="w-5 h-5" /> Download App
                </a>
              </motion.div> */}
            </div>
          </motion.div>
        </div>
      </section>
      {/* <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard
          icon={Film}
          label="Movies"
          value={stats.movies}
          color="bg-red-500/20 text-red-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Series"
          value={stats.series}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={Download}
          label="Downloads"
          value={stats.downloads}
          color="bg-green-500/20 text-green-400"
        />
      </motion.div> */}
      <Showcase
        title="Latest Movies"
        items={data.movies}
        type="movie"
        viewAllLink="/movies"
      />
      <Showcase
        title="Latest Updates"
        items={data.series}
        type="series"
        viewAllLink="/series"
      />
    </div>
  );
};

export default Home;
