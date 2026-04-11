import axios from "axios";
import { API_BASE_URL } from "./constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    // Token is stored in httpOnly cookie by the backend
    // For dev/testing fallback, check localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("clutchd_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and other errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthPage = window.location.pathname.startsWith("/auth");
        const isAuthRequest = error.config?.url?.includes("/auth/");
        if (!isAuthPage && !isAuthRequest) {
          localStorage.removeItem("clutchd_token");
          window.location.href = "/auth";
        }
      }
    } else if (!error.response) {
      // No HTTP response — timeout / CORS / backend offline. Callers use mock fallbacks; stay silent
      // so Next.js dev overlay does not treat each request as an "Issue".
    } else if (error.response?.status >= 500) {
      console.error("[API] Server Error:", error.response.data);
    }
    
    // Ensure we always return a standardized rejection
    return Promise.reject(error);
  }
);

export default api;
