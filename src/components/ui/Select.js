import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export const Select = forwardRef(
  ({ className, options = [], error, label, placeholder, ...props }, ref) => {
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
          <select
            className={cn(
              "appearance-none w-full rounded-xl border pl-4 pr-10 py-3 text-sm transition-all",
              isLight
                ? "border-slate-200 bg-white text-slate-900 focus:border-yellow-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                : "border-white/10 bg-white/5 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className={isLight ? "bg-white text-gray-400" : "bg-[#064e3b] text-gray-400"}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className={isLight ? "bg-white text-slate-900" : "bg-[#064e3b] text-white"}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>
            <ChevronDown size={18} />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
