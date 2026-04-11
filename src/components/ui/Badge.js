import { cn } from "../../lib/utils";

export function Badge({ children, className, variant = "default" }) {
  const variants = {
    default:
      "bg-gradient-to-b from-emerald-500/25 to-emerald-500/10 text-emerald-300 border-emerald-500/35",
    success:
      "bg-gradient-to-b from-green-500/25 to-green-500/10 text-green-300 border-green-500/35",
    warning:
      "bg-gradient-to-b from-amber-500/25 to-amber-500/10 text-amber-300 border-amber-500/35",
    danger:
      "bg-gradient-to-b from-red-500/25 to-red-500/10 text-red-300 border-red-500/35",
    info:
      "bg-gradient-to-b from-blue-500/25 to-blue-500/10 text-blue-300 border-blue-500/35",
    glass: "bg-gradient-to-b from-white/15 to-white/5 text-white/90 border-white/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        "backdrop-blur-xl shadow-[0_10px_30px_rgba(var(--color-black-rgb),0.25)]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
