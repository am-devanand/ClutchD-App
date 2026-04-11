import { create } from "zustand";
import api from "../lib/api";
import { MAP_DEFAULT_CENTER } from "../lib/constants";

export const useTrackingStore = create((set, get) => ({
  userLocation: MAP_DEFAULT_CENTER,
  mechanicLocation: null,
  nearbyMechanics: [],
  nearbyGarages: [],
  
  setUserLocation: (coords) => set({ userLocation: coords }),
  setMechanicLocation: (coords) => set({ mechanicLocation: coords }),
  
  fetchNearbyProviders: async () => {
    const center = get().userLocation;
    
    try {
      const { data } = await api.get(`/providers/nearby?lat=${center[0]}&lng=${center[1]}`);
      if (data.mechanics || data.garages) {
        set({ 
          nearbyMechanics: data.mechanics || [], 
          nearbyGarages: data.garages || [] 
        });
        return;
      }
    } catch (error) {
      if (error.response) {
        console.warn("Backend fetchNearbyProviders failed, using fallback mock data.", error.message);
      }
    }
    
    // Fallback: Generate some fake nearby points slightly offset from center
    const mechanics = Array.from({length: 4}).map((_, i) => ({
      id: `m${i}`,
      name: `Mechanic ${i+1}`,
      location: [center[0] + (Math.random() - 0.5) * 0.05, center[1] + (Math.random() - 0.5) * 0.05],
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      expertise: ["engine", "brakes"]
    }));
    
    const garages = Array.from({length: 2}).map((_, i) => ({
      id: `g${i}`,
      name: `Garage ${i+1}`,
      location: [center[0] + (Math.random() - 0.5) * 0.06, center[1] + (Math.random() - 0.5) * 0.06],
      rating: (4.0 + Math.random() * 1.0).toFixed(1)
    }));
    
    set({ nearbyMechanics: mechanics, nearbyGarages: garages });
  }
}));
