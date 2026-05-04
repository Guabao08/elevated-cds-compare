import axios from "axios";

// In production (Vercel) the backend is served at /_/backend.
// In development the Vite proxy maps /api → http://backend:8000.
const baseURL = import.meta.env.PROD ? "/_/backend" : "/api";

const api = axios.create({
  baseURL,
  timeout: 30000,
});

export default api;
