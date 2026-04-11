import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import { connectWebSocket, disconnectWebSocket } from "../lib/socket";

// Mock user for development
const mockUsers = {
  customer: {
    id: "c1",
    email: "customer@demo.com",
    role: "customer",
    name: "Rahul Sharma",
  },
  mechanic: {
    id: "m1",
    email: "mechanic@demo.com",
    role: "mechanic",
    name: "Vijay Kumar",
    phone: "9876543210",
    experience: "5",
    expertise: ["engine", "brakes", "electrical"],
    location: "RS Puram, Coimbatore",
    rating: 4.7,
    isOnline: true,
  },
  garage: {
    id: "g1",
    email: "garage@demo.com",
    role: "garage",
    name: "SpeedFix Auto Garage",
    ownerName: "Suresh Patel",
    phone: "9876543211",
    location: "Saibaba Colony, Coimbatore",
    services: ["engine", "brakes", "ac", "electrical", "tires"],
    mechanicCount: 8,
    operatingHours: "8:00 AM - 9:00 PM",
    rating: 4.5,
  },
  admin: {
    id: "a1",
    email: "admin@clutchd.com",
    role: "admin",
    name: "Admin",
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, role = null) => {
        set({ isLoading: true, error: null });
        
        try {
          // Try real backend API
          const response = await api.post("/auth/login", { email, password });
          
          if (response.data.token && typeof window !== "undefined") {
            localStorage.setItem("clutchd_token", response.data.token);
            connectWebSocket(response.data.token);
          }
          
          set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          return response.data.user;
          
        } catch (error) {
          if (error.response) {
            console.warn("Backend login failed, using fallback mock data.", error.message);
          }

          // If it's a real auth error (not network), set error state
          if (error.response?.status === 401 || error.response?.status === 403) {
            set({ isLoading: false, error: "Invalid email or password" });
            return null;
          }

          // Fallback: Simulate API delay (network error / backend down)
          await new Promise((r) => setTimeout(r, 800));

          const normalizedRole =
            typeof role === "string" ? role.toLowerCase() : null;

          let user = null;
          if (normalizedRole && mockUsers[normalizedRole]) {
            user = mockUsers[normalizedRole];
          } else {
            // Infer role from email only when explicit role is not provided
            if (email.includes("mechanic")) user = mockUsers.mechanic;
            else if (email.includes("garage")) user = mockUsers.garage;
            else if (email.includes("admin")) user = mockUsers.admin;
            else user = mockUsers.customer;
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        }
      },

      loginWithGoogle: async (credential, role = null) => {
        set({ isLoading: true, error: null });

        const safeRole =
          typeof role === "string" ? role.toLowerCase() : null;

        const decodeJwtPayload = (token) => {
          try {
            const base64Url = token.split(".")[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
            );
            return JSON.parse(jsonPayload);
          } catch {
            return null;
          }
        };

        try {
          const response = await api.post("/auth/oauth/google", {
            credential,
            role: safeRole || undefined,
          });

          if (response.data.token && typeof window !== "undefined") {
            localStorage.setItem("clutchd_token", response.data.token);
            connectWebSocket(response.data.token);
          }

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return response.data.user;
        } catch (error) {
          // Development/offline fallback: decode email from id_token (no verification)
          if (!error.response && typeof window !== "undefined") {
            await new Promise((r) => setTimeout(r, 600));
            const payload = decodeJwtPayload(credential);
            const email = payload?.email?.toLowerCase() ?? null;

            const fallbackRole =
              safeRole && mockUsers[safeRole] ? safeRole : "customer";

            const baseUser = mockUsers[fallbackRole];
            const user = {
              ...baseUser,
              email: email || baseUser.email,
            };

            set({ user, isAuthenticated: true, isLoading: false });
            return user;
          }

          // Real auth errors (bad token, audience mismatch, etc.)
          if (error.response?.status === 401 || error.response?.status === 403) {
            set({ isLoading: false, error: "Invalid Google token" });
            return null;
          }

          set({ isLoading: false, error: "Google login failed" });
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
          }
          
          set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          return response.data.user;
          
        } catch (error) {
          if (error.response) {
            console.warn("Backend signup failed, using fallback mock data.", error.message);
          }

          // If it's a real validation error, set error state
          if (error.response?.status === 400 || error.response?.status === 409) {
            const msg = error.response?.data?.detail || "Signup failed. Please try again.";
            set({ isLoading: false, error: msg });
            return null;
          }

          // Fallback logic (network error / backend down)
          await new Promise((r) => setTimeout(r, 1000));
          const user = { id: "new_" + Date.now(), email: data.email, role, name: data.fullName || data.garageName || "User" };
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        }
      },

      logout: async () => {
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

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "auth-storage",
    }
  )
);
