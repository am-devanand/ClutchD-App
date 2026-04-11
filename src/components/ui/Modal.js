import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useThemeStore } from "../../store/themeStore";

export function Modal({ isOpen, onClose, title, children, className, maxWidth = "max-w-md" }) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 z-40 backdrop-blur-sm ${isLight ? "bg-black/30" : "bg-black/60"}`}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-12 px-4 sm:px-6 overflow-y-auto w-full h-full pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className={cn(
                "relative w-full rounded-2xl border",
                "p-6 backdrop-blur-3xl pointer-events-auto",
                isLight
                  ? "border-slate-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.1)] ring-1 ring-yellow-400/10"
                  : "border-white/15 bg-gradient-to-b from-emerald-900/35 to-black/65 shadow-[0_30px_80px_rgba(0,0,0,0.65)] ring-1 ring-emerald-400/10",
                maxWidth,
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{title}</h2>
                <button
                  onClick={onClose}
                  className={`rounded-full p-1.5 transition-colors focus:outline-none ${isLight ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  <X size={20} />
                </button>
              </div>

               {/* Content */}
               <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                {children}
               </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
