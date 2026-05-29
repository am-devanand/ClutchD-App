import axios from "axios";
import { API_BASE_URL } from "./constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  maxContentLength: 10 * 1024 * 1024, // 10MB max response
  maxBodyLength: 10 * 1024 * 1024,    // 10MB max request
});

// Request interceptor — attach token + CSRF-style header for mutations
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("clutchd_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Add CSRF-style header for state-changing requests
    const method = (config.method || "").toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh, and other errors
let isRefreshing = false;
let pendingRequests = [];

function onTokenRefreshed(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthPage = typeof window !== "undefined" && window.location.pathname.startsWith("/auth");
      const isAuthRequest = originalRequest?.url?.includes("/auth/");
      const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");

      // Don't retry refresh requests or auth page requests
      if (isAuthPage || isAuthRequest || isRefreshRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await api.post("/auth/refresh");
          const newToken = res.data.token;
          if (typeof window !== "undefined" && newToken) {
            localStorage.setItem("clutchd_token", newToken);
          }
          isRefreshing = false;
          onTokenRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          pendingRequests = [];
          
          const status = refreshError.response?.status;
          // Only force logout on explicit 401/403 credentials failure.
          if (status === 401 || status === 403) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("clutchd_token");
              window.location.href = "/auth";
            }
          }
          return Promise.reject(refreshError);
        }
      }

      // Another request triggered refresh — queue this one
      return new Promise((resolve) => {
        pendingRequests.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    if (!error.response) {
      // No HTTP response — timeout / CORS / backend offline
    } else if (error.response?.status >= 500) {
      console.warn("[API] Server Error:", error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

/**
 * Extract a user-readable error message from an Axios error.
 * Handles FastAPI's `{ detail: "..." }` and `{ detail: [{...}] }` formats.
 */
export function extractApiError(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (!error.response) return "Server unreachable. Please check your connection.";
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map(d => d.msg || d.message || JSON.stringify(d)).join("; ");
  }
  return error.response?.statusText || fallback;
}
