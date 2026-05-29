import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import { connectWebSocket, disconnectWebSocket } from "../lib/socket";

// Proactive refresh: refresh the access token at 80% of its TTL.
// Default access token TTL is 15 min (from backend config); override via env.
const ACCESS_TTL_MS =
  (parseInt(process.env.NEXT_PUBLIC_ACCESS_TTL_MINUTES, 10) || 15) * 60 * 1000;
const REFRESH_AT_MS = ACCESS_TTL_MS * 0.8; // e.g. 12 min for a 15-min token

let refreshTimer = null;

function scheduleProactiveRefresh() {
  clearProactiveRefresh();
  refreshTimer = setTimeout(async () => {
    try {
      const res = await api.post("/auth/refresh");
      const newToken = res.data.token;
      if (typeof window !== "undefined" && newToken) {
        localStorage.setItem("clutchd_token", newToken);
        // Reconnect WebSocket with the fresh token
        connectWebSocket(newToken);
      }
      // Schedule the next refresh
      scheduleProactiveRefresh();
    } catch {
      // Refresh failed — the 401 interceptor in api.js will handle logout
    }
  }, REFRESH_AT_MS);
}

function clearProactiveRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Validate the current session on app startup.
       * Attempts to refresh the access token using the httpOnly refresh cookie.
       * If successful, the user stays logged in; otherwise they are logged out.
       */
      checkAuth: async () => {
        // Only run if Zustand thinks we are authenticated
        if (!get().isAuthenticated) return;

        const existingToken =
          typeof window !== "undefined"
            ? localStorage.getItem("clutchd_token")
            : null;

        // If there is no stored access token at all, the session is gone
        if (!existingToken) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          // Attempt a silent refresh to get a guaranteed-fresh access token
          const res = await api.post("/auth/refresh");
          const newToken = res.data.token;
          if (typeof window !== "undefined" && newToken) {
            localStorage.setItem("clutchd_token", newToken);
            connectWebSocket(newToken);
            scheduleProactiveRefresh();
          }
        } catch (error) {
          // Only force logout on explicit 401/403 credentials failure.
          // Keep the session on network or server errors.
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("clutchd_token");
              disconnectWebSocket();
            }
            set({ user: null, isAuthenticated: false, error: null });
          }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post("/auth/login", { email, password });
          
          if (response.data.token && typeof window !== "undefined") {
            localStorage.setItem("clutchd_token", response.data.token);
            connectWebSocket(response.data.token);
            scheduleProactiveRefresh();
          }
          
          set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          return response.data.user;
          
        } catch (error) {
          const msg =
            error.response?.data?.detail ||
            (error.response ? "Login failed. Please try again." : "Server unreachable. Please check your connection.");
          set({ isLoading: false, error: msg });
          return null;
        }
      },

      loginWithGoogle: async (credential, role = null) => {
        set({ isLoading: true, error: null });

        const safeRole =
          typeof role === "string" ? role.toLowerCase() : null;

        try {
          const response = await api.post("/auth/oauth/google", {
            credential,
            role: safeRole || undefined,
          });

          if (response.data.token && typeof window !== "undefined") {
            localStorage.setItem("clutchd_token", response.data.token);
            connectWebSocket(response.data.token);
            scheduleProactiveRefresh();
          }

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return response.data.user;
        } catch (error) {
          const msg =
            error.response?.data?.detail ||
            (error.response ? "Google login failed." : "Server unreachable. Please check your connection.");
          set({ isLoading: false, error: msg });
          return null;
        }
      },

      signup: async (data, role) => {
        set({ isLoading: true, error: null });
        
        try {
          const payload = { ...data, role };
          const response = await api.post("/auth/signup", payload);
          
          if (response.data.token && typeof window !== "undefined") {
            localStorage.setItem("clutchd_token", response.data.token);
            connectWebSocket(response.data.token);
            scheduleProactiveRefresh();
          }
          
          set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          return response.data.user;
          
        } catch (error) {
          const msg =
            error.response?.data?.detail ||
            (error.response ? "Signup failed. Please try again." : "Server unreachable. Please check your connection.");
          set({ isLoading: false, error: msg });
          return null;
        }
      },

      logout: async () => {
        clearProactiveRefresh();
        try {
          await api.post("/auth/logout");
        } catch (e) {
          // ignore
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("clutchd_token");
          disconnectWebSocket();
        }
        set({ user: null, isAuthenticated: false, error: null });
        // Navigate to auth page
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      },

      clearError: () => set({ error: null }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateUserData: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
