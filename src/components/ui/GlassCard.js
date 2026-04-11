import { cn } from "../../lib/utils";
import { useThemeStore } from "../../store/themeStore";

export function GlassCard({ children, className, variant = "normal", ...props }) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div
      className={cn(
        "relative rounded-2xl backdrop-blur-xl transition-colors",
        isLight
          ? cn(
              "border border-slate-200/60 bg-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.06)]",
              variant === "strong" && "bg-white/85 border-slate-200 shadow-[0_20px_70px_rgba(0,0,0,0.08)]",
              variant === "interactive" && "bg-white/70 hover:bg-white/85 hover:border-yellow-400/40 hover:shadow-[0_18px_55px_rgba(234,179,8,0.1)] transition-all"
            )
          : cn(
              "border border-white/10 bg-gradient-to-b from-white/08 to-white/0 shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
              variant === "strong" && "bg-gradient-to-b from-white/12 to-white/0 border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.55)]",
              variant === "interactive" && "bg-gradient-to-b from-white/08 to-white/0 hover:bg-white/10 hover:border-emerald-400/30 hover:shadow-[0_18px_55px_rgba(16,185,129,0.12)] hover:shadow-emerald-500/10 transition-all"
            ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
