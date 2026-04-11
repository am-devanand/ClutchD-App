import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { useThemeStore } from "../../store/themeStore";

export const Input = forwardRef(
  ({ className, type = "text", error, label, icon: Icon, ...props }, ref) => {
    const { theme } = useThemeStore();
    const isLight = theme === "light";

    return (
      <div className="w-full">
        {label && (
          <label className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>
              <Icon size={18} />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full rounded-2xl border",
              "px-4 py-3 text-sm transition-all",
              isLight
                ? cn(
                    "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
                    "shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]",
                    "focus:border-yellow-500 focus:bg-white focus:outline-none",
                    "focus:ring-1 focus:ring-yellow-500/30"
                  )
                : cn(
                    "border-white/10 bg-gradient-to-b from-white/08 to-white/03",
                    "text-white placeholder:text-white/30",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                    "focus:border-emerald-500 focus:bg-white/08 focus:outline-none",
                    "focus:ring-1 focus:ring-emerald-500/30"
                  ),
              Icon && "pl-10",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
