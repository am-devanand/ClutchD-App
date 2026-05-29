"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Something Went Wrong</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              {error?.message || "A critical error occurred."}
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                background: "#10b981",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
