import { useState } from "react";
import { cn } from "../../lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export function MultiSelect({ options = [], value = [], onChange, label, error, placeholder = "Select options..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (e, optionValue) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = value.map(
    (v) => options.find((opt) => opt.value === v)?.label || v
  );

  return (
    <div className="w-full relative">
      {label && (
        <label className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
          {label}
        </label>
      )}
      
      <div
        className={cn(
          "min-h-[48px] w-full rounded-xl border px-4 py-2 text-sm",
          "transition-all cursor-pointer flex flex-wrap gap-2 items-center",
          isLight
            ? "border-slate-200 bg-white text-slate-900 focus-within:border-yellow-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-500/20"
            : "border-white/10 bg-white/5 text-white focus-within:border-emerald-500 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-emerald-500/20",
          error && "border-red-500/50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className={isLight ? "text-slate-400 truncate" : "text-white/30 truncate"}>{placeholder}</span>
        ) : (
          selectedLabels.map((lbl, idx) => (
            <span 
              key={idx} 
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${isLight ? "bg-yellow-500/15 text-yellow-700 border-yellow-500/25" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}
            >
              {lbl}
              <button
                type="button"
                onClick={(e) => removeOption(e, value[idx])}
                className={`focus:outline-none ${isLight ? "hover:text-yellow-900" : "hover:text-emerald-100"}`}
              >
                <X size={14} />
              </button>
            </span>
          ))
        )}
        
        <div className={`ml-auto ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className={`absolute z-20 mt-2 w-full rounded-xl border shadow-xl max-h-60 overflow-auto ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-[#064e3b]"}`}>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors ${isLight ? "text-slate-700 hover:bg-yellow-50" : "text-white hover:bg-white/10"}`}
              >
                <span>{option.label}</span>
                {value.includes(option.value) && (
                  <Check size={16} className={isLight ? "text-yellow-600" : "text-emerald-400"} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
      
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
