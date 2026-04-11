"use client";
import { useThemeStore } from "../../store/themeStore";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-xl z-[9999] fixed bottom-8 right-8
        ${theme === "light"
          ? "bg-white/90 border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:shadow-[0_0_25px_rgba(234,179,8,0.4)]"
          : "bg-zinc-900/90 border-2 border-emerald-500/40 text-emerald-400 hover:bg-zinc-800 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
        }
      `}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
    </button>
  );
}
