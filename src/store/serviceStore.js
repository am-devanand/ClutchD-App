import { create } from "zustand";
import api from "../lib/api";
import { SERVICE_STATUS } from "../lib/constants";

export const useServiceStore = create((set, get) => ({
  activeRequest: null,
  history: [],
  isLoading: false,
  
  createRequest: async (data) => {
    set({ isLoading: true });
    
    try {
      let mediaUrl = data.mediaUrl;
      
      // Handle file upload if media is a File object
      if (data.media instanceof File) {
        const formData = new FormData();
        formData.append("file", data.media);
        const uploadRes = await api.post("/uploads", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        mediaUrl = uploadRes.data.url;
      }
      
      const payload = {
        issueTag: data.issueTag,
        description: data.description,
        requestType: data.requestType,
        priceEstimate: data.priceEstimate,
        customerLat: data.customerLat,
        customerLng: data.customerLng,
        mediaUrl: mediaUrl,
      };

      const response = await api.post("/service/request", payload);
      
      const newRequest = response.data;
      set({ activeRequest: newRequest, isLoading: false });
      return newRequest;
      
    } catch (error) {
      if (error.response) {
        console.warn("Backend createRequest failed, using fallback mock data.", error.message);
      }

      // If it's a real server error (not network), show the error
      if (error.response?.status >= 400) {
        set({ isLoading: false });
        throw error;
      }

      // Fallback
      await new Promise(r => setTimeout(r, 1000));
      
      const newRequest = {
        id: "req_" + Date.now(),
        ...data,
        status: SERVICE_STATUS.SEARCHING,
        createdAt: new Date().toISOString(),
        mechanic: null,
        priceEstimate: data.priceEstimate,
      };
      
      set({ 
        activeRequest: newRequest,
        isLoading: false 
      });
      
      return newRequest;
    }
  },
  
  updateRequestStatus: async (status, mechanicData = null) => {
    const currentReq = get().activeRequest;
    if (!currentReq) return;

    try {
      await api.patch(`/service/request/${currentReq.id}/status`, { status, mechanicId: mechanicData?.id });
    } catch (error) {
      console.warn("Backend updateRequestStatus failed.", error.message);
    }
    
    // Update local state anyway
    set(state => {
      if (!state.activeRequest) return state;
      return {
        activeRequest: {
          ...state.activeRequest,
          status,
          mechanic: mechanicData || state.activeRequest.mechanic
        }
      };
    });
  },
  
  completeRequest: async (paymentDetails) => {
    const currentReq = get().activeRequest;
    if (!currentReq) return;

    try {
      await api.post(`/service/request/${currentReq.id}/complete`, paymentDetails);
    } catch (error) {
      if (error.response) {
        console.warn("Backend completeRequest failed.", error.message);
      }
    }

    set(state => {
      if (!state.activeRequest) return state;
      const completed = {
        ...state.activeRequest,
        status: SERVICE_STATUS.COMPLETED,
        payment: paymentDetails,
        completedAt: new Date().toISOString()
      };
      return {
        activeRequest: null,
        history: [completed, ...state.history]
      };
    });
  },
  
  cancelRequest: async () => {
    const currentReq = get().activeRequest;
    if (currentReq) {
      try {
        await api.post(`/service/request/${currentReq.id}/cancel`);
      } catch(e) {
        // console.warn(e);
      }
    }
    set({ activeRequest: null });
  }
}));
