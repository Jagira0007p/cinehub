import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Admin from "./pages/Admin";
import ListingPage from "./pages/ListingPage";
import SearchPage from "./pages/SearchPage";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTopOnNavigate />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans overflow-x-hidden">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <ScrollToTop />
        <Navbar />

        <AnimatePresence mode="wait">
          {/* FIX: Changed padding to pt-24 (top) and pb-12 (bottom) */}
          <div className="container mx-auto px-4 pt-24 pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<ListingPage type="movie" />} />
              <Route path="/series" element={<ListingPage type="series" />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/:type/:id" element={<Detail />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </AnimatePresence>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
