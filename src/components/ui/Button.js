import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export const Button = forwardRef(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const { theme } = useThemeStore();
    const isLight = theme === "light";
    const baseClass = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const darkVariants = {
      primary:
        "bg-gradient-to-b from-emerald-500 via-emerald-500 to-emerald-600 text-white " +
        "shadow-[0_10px_26px_rgba(16,185,129,0.25)] " +
        "ring-1 ring-emerald-300/25 hover:ring-emerald-200/35 " +
        "hover:shadow-[0_16px_40px_rgba(16,185,129,0.22)] hover:-translate-y-[1px]",
      secondary:
        "bg-gradient-to-b from-white/10 to-white/5 text-emerald-50 " +
        "border border-white/15 ring-1 ring-white/10 hover:bg-white/15 hover:border-white/25",
      outline:
        "border-2 border-emerald-500/70 text-emerald-50 " +
        "bg-white/0 hover:bg-emerald-500/10 hover:border-emerald-400/80 " +
        "shadow-[0_0_0_1px_rgba(16,185,129,0.18)]",
      ghost: "hover:bg-white/10 text-emerald-50 border border-transparent hover:border-white/10",
      danger:
        "bg-gradient-to-b from-red-500 via-red-500 to-red-600 text-white " +
        "shadow-[0_10px_26px_rgba(239,68,68,0.22)] ring-1 ring-red-300/20 " +
        "hover:shadow-[0_16px_40px_rgba(239,68,68,0.20)] hover:-translate-y-[1px]",
    };

    const lightVariants = {
      primary:
        "bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-white " +
        "shadow-[0_10px_26px_rgba(234,179,8,0.3)] " +
        "ring-1 ring-yellow-300/30 hover:ring-yellow-200/50 " +
        "hover:shadow-[0_16px_40px_rgba(234,179,8,0.25)] hover:-translate-y-[1px]",
      secondary:
        "bg-gradient-to-b from-slate-100 to-slate-50 text-slate-700 " +
        "border border-slate-200 ring-1 ring-slate-200/50 hover:bg-slate-100 hover:border-slate-300",
      outline:
        "border-2 border-yellow-500/70 text-yellow-700 " +
        "bg-transparent hover:bg-yellow-500/10 hover:border-yellow-500 " +
        "shadow-[0_0_0_1px_rgba(234,179,8,0.18)]",
      ghost: "hover:bg-yellow-50 text-slate-700 border border-transparent hover:border-yellow-200",
      danger:
        "bg-gradient-to-b from-red-500 via-red-500 to-red-600 text-white " +
        "shadow-[0_10px_26px_rgba(239,68,68,0.22)] ring-1 ring-red-300/20 " +
        "hover:shadow-[0_16px_40px_rgba(239,68,68,0.20)] hover:-translate-y-[1px]",
    };

    const variants = isLight ? lightVariants : darkVariants;

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClass, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
