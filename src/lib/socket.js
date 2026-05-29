import { WS_URL } from "./constants";
import { useTrackingStore } from "../store/trackingStore";

let wsInstance = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 3000;

export const connectWebSocket = (token) => {
  if (typeof window === "undefined") return null;
  // Don't reconnect if connecting or open
  if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
    return wsInstance;
  }

  // Close any existing stale connection
  if (wsInstance) {
    try { 
      wsInstance.onclose = null; // Prevent triggering an automatic reconnect loop
      wsInstance.close(); 
    } catch (_) { /* ignore */ }
    wsInstance = null;
  }

  // Clear pending reconnects
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const url = token ? `${WS_URL}?token=${token}` : WS_URL;
  
  try {
    wsInstance = new window.WebSocket(url);
  } catch (err) {
    console.warn("[WebSocket] Failed to create connection", err);
    return null;
  }

  wsInstance.onopen = () => {
    console.log("[WebSocket] Connected successfully");
    reconnectAttempts = 0; // Reset on successful connection
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  wsInstance.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle real-time mechanic location updates
      if (data.type === "LOCATION_UPDATE" && data.payload?.coords) {
        useTrackingStore.getState().setMechanicLocation(data.payload.coords);
      }
      
      // Handle service status updates from server — pass fromServer=true to avoid duplicate PATCH
      if (data.type === "STATUS_UPDATE") {
        import("../store/serviceStore").then((m) => {
          m.useServiceStore.getState().updateRequestStatus(
            data.payload.status,
            data.payload.mechanic,
            true, // fromServer — skip backend PATCH
            data.payload.pricing // pricing breakdown for payment_pending
          );
        });
      }

      // Handle notification count updates
      if (data.type === "NOTIFICATION_UPDATE") {
        import("../store/notificationStore").then((m) => {
          if (m.useNotificationStore) {
            m.useNotificationStore.getState().setUnreadCount(data.payload.unreadCount);
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("[WebSocket] Failed to parse message", err);
    }
  };

  wsInstance.onclose = (event) => {
    console.log("[WebSocket] Disconnected", event.code);
    wsInstance = null;
    
    // Don't reconnect if closed intentionally (1000) or auth failed (4401)
    if (event.code === 1000 || event.code === 4401) {
      reconnectAttempts = 0;
      return;
    }

    // Don't reconnect if user logged out
    if (typeof window !== "undefined" && !localStorage.getItem("clutchd_token")) {
      console.log("[WebSocket] User logged out, not reconnecting");
      reconnectAttempts = 0;
      return;
    }

    // Exponential backoff with max attempts
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
      reconnectAttempts++;
      console.log(`[WebSocket] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      reconnectTimer = setTimeout(() => {
        // Re-read the token from localStorage so we use the latest refreshed token,
        // not the stale one captured in the closure.
        const freshToken = typeof window !== "undefined"
          ? localStorage.getItem("clutchd_token")
          : token;
        connectWebSocket(freshToken);
      }, delay);
    } else {
      console.warn("[WebSocket] Max reconnect attempts reached. Giving up.");
    }
  };

  wsInstance.onerror = (error) => {
    console.warn("[WebSocket] Error occurred", error);
  };

  return wsInstance;
};

export const disconnectWebSocket = () => {
  reconnectAttempts = 0;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (wsInstance) {
    wsInstance.close(1000, "Client disconnect");
    wsInstance = null;
  }
};

/**
 * Send mechanic GPS location to the server for real-time tracking.
 */
export const sendMechanicLocation = (lat, lon) => {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify({ type: "MECHANIC_LOCATION", lat, lon }));
  }
};

/**
 * Check if the WebSocket is currently connected.
 */
export const isConnected = () => {
  return wsInstance !== null && wsInstance.readyState === WebSocket.OPEN;
};

/**
 * Get current connection state for UI indicators.
 */
export const getConnectionState = () => {
  if (!wsInstance) return "disconnected";
  switch (wsInstance.readyState) {
    case WebSocket.CONNECTING: return "connecting";
    case WebSocket.OPEN: return "connected";
    case WebSocket.CLOSING: return "closing";
    case WebSocket.CLOSED: return "disconnected";
    default: return "disconnected";
  }
};
