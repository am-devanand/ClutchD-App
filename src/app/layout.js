import "./globals.css";

import { ThemeProvider } from "../components/ui/ThemeProvider";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { AuthInit } from "../components/ui/AuthInit";

export const metadata = {
  title: "ClutchD — On-Demand Mechanic Platform",
  description:
    "Find trusted mechanics and garages near you with ClutchD. Get instant vehicle service with real-time tracking, transparent pricing, and verified professionals.",
  keywords: "mechanic, garage, vehicle service, on-demand, car repair",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-mesh">
        <ThemeProvider>
          <AuthInit />
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
