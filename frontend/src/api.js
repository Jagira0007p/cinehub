import axios from "axios";

const api = axios.create({
  // FIX: Change process.env to import.meta.env.VITE_API_URL
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const adminPassword = localStorage.getItem("adminPassword");
    if (adminPassword) {
      config.headers["x-admin-password"] = adminPassword;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminPassword");
      window.location.href = "/admin";
    }
    return Promise.reject(error);
  }
);

export const getAdminHeaders = () => {
  const adminPassword = localStorage.getItem("adminPassword");
  return {
    headers: {
      "x-admin-password": adminPassword,
    },
  };
};

export default api;
