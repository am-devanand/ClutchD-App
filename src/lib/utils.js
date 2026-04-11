// Utility helpers

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name) {
  if (!name || typeof name !== "string") return "??";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";
}

export function estimatePrice(issueTag) {
  const prices = {
    flat_tire: { min: 200, max: 800 },
    engine_failure: { min: 2000, max: 8000 },
    battery_dead: { min: 500, max: 2000 },
    overheating: { min: 800, max: 3000 },
    brake_issue: { min: 1000, max: 4000 },
    oil_leak: { min: 500, max: 2500 },
    electrical: { min: 600, max: 3000 },
    ac_not_working: { min: 1000, max: 5000 },
    transmission: { min: 3000, max: 10000 },
    starting_issue: { min: 500, max: 3000 },
    noise: { min: 300, max: 2000 },
    other: { min: 500, max: 5000 },
  };
  return prices[issueTag] || { min: 500, max: 5000 };
}

export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}
