import { create } from "zustand";
import api from "../lib/api";
import { MAP_DEFAULT_CENTER } from "../lib/constants";

export const useTrackingStore = create((set, get) => ({
  userLocation: MAP_DEFAULT_CENTER,
  mechanicLocation: null,
  navigationTarget: null,
  nearbyMechanics: [],
  nearbyGarages: [],
  isLoading: false,
  error: null,
  gpsStatus: "idle", // "idle" | "requesting" | "granted" | "denied" | "unavailable"
  
  setUserLocation: (coords) => {
    set({ userLocation: coords });
    // Automatically refresh providers when location changes
    get().fetchNearbyProviders();
  },
  setMechanicLocation: (coords) => set({ mechanicLocation: coords }),
  setNavigationTarget: (coords) => set({ navigationTarget: coords }),

  /**
   * Request the user's GPS location via the browser Geolocation API.
   * Falls back to the default map center if denied or unavailable.
   */
  requestGPSLocation: () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      set({ gpsStatus: "unavailable" });
      return;
    }

    set({ gpsStatus: "requesting" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        set({ userLocation: coords, gpsStatus: "granted" });
        get().fetchNearbyProviders();
      },
      (error) => {
        console.warn("GPS denied or unavailable:", error.message);
        set({ gpsStatus: error.code === 1 ? "denied" : "unavailable" });
        // Keep the default / previously set location
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  },

  /**
   * Watch GPS position continuously (useful for mechanic en-route tracking).
   * Returns a cleanup function to stop watching.
   */
  watchGPSLocation: () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        set({ userLocation: coords, gpsStatus: "granted" });
      },
      (error) => {
        console.warn("GPS watch error:", error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  },
  
  fetchNearbyProviders: async () => {
    const center = get().userLocation;
    set({ isLoading: true, error: null });
    
    try {
      const { data } = await api.get(`/providers/nearby?lat=${center[0]}&lng=${center[1]}`);
      set({ 
        nearbyMechanics: data.mechanics || [], 
        nearbyGarages: data.garages || [],
        isLoading: false,
      });
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        (error.response ? "Failed to load nearby providers." : "Server unreachable.");
      set({ 
        nearbyMechanics: [], 
        nearbyGarages: [],
        isLoading: false,
        error: msg,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
