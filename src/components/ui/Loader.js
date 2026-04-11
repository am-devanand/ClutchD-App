import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useThemeStore } from "../../store/themeStore";

export function Loader({ size = 24, className }) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 
        size={size} 
        className={`animate-spin ${isLight ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"}`}
      />
    </div>
  );
}

export function FullPageLoader() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${isLight ? "bg-yellow-50/80" : "bg-[#021a0f]/80"}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader size={48} />
        <p className={`text-sm font-medium ${isLight ? "text-yellow-700" : "text-emerald-300"}`}>Loading ClutchD...</p>
      </div>
    </div>
  );
}
