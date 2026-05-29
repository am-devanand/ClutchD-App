// Application-wide constants

export const ROLES = {
  CUSTOMER: "customer",
  MECHANIC: "mechanic",
  GARAGE: "garage",
  ADMIN: "admin",
};

export const SERVICE_STATUS = {
  IDLE: "idle",
  SEARCHING: "searching",
  ASSIGNED: "assigned",
  EN_ROUTE: "en_route",
  IN_PROGRESS: "in_progress",
  PAYMENT_PENDING: "payment_pending",
  COMPLETED: "completed",
};

export const EXPERTISE_OPTIONS = [
  { value: "engine", label: "Engine Repair" },
  { value: "electrical", label: "Electrical Systems" },
  { value: "tires", label: "Tires & Wheels" },
  { value: "brakes", label: "Brake Systems" },
  { value: "transmission", label: "Transmission" },
  { value: "ac", label: "AC & Heating" },
  { value: "bodywork", label: "Body Work" },
  { value: "oil", label: "Oil & Fluids" },
  { value: "battery", label: "Battery Service" },
  { value: "suspension", label: "Suspension" },
  { value: "exhaust", label: "Exhaust System" },
  { value: "diagnostics", label: "Diagnostics" },
];

export const ISSUE_TAGS = [
  { value: "flat_tire", label: "Flat Tire" },
  { value: "engine_failure", label: "Engine Failure" },
  { value: "battery_dead", label: "Dead Battery" },
  { value: "overheating", label: "Overheating" },
  { value: "brake_issue", label: "Brake Issue" },
  { value: "oil_leak", label: "Oil Leak" },
  { value: "electrical", label: "Electrical Problem" },
  { value: "ac_not_working", label: "AC Not Working" },
  { value: "transmission", label: "Transmission Issue" },
  { value: "starting_issue", label: "Won't Start" },
  { value: "noise", label: "Strange Noise" },
  { value: "other", label: "Other" },
];

export const PAYMENT_METHODS = [
  { value: "upi", label: "UPI", icon: "Smartphone" },
  { value: "card", label: "Credit/Debit Card", icon: "CreditCard" },
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/backend-api";

function getDefaultWsUrl() {
  if (typeof window === "undefined") {
    return "ws://127.0.0.1:8000/ws";
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const hostname = window.location.hostname || "127.0.0.1";
  const port = process.env.NEXT_PUBLIC_WS_PORT || "8000";
  return `${protocol}//${hostname}:${port}/ws`;
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || getDefaultWsUrl();

export const MAP_DEFAULT_CENTER = [11.0168, 76.9558]; // Coimbatore
export const MAP_DEFAULT_ZOOM = 13;
