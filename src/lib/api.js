import axios from "axios";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : process.env.VITE_API_URL;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
