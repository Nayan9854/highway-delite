import axios from "axios";

export const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080",
  baseURL : "https://highway-delite-8.onrender.com",
  withCredentials: true,
});
