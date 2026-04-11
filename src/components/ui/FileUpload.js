import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { UploadCloud, X } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export const FileUpload = forwardRef(
  ({ className, error, label, value, onChange, accept = "image/*", multiple = false, maxSizeMB = 5, ...props }, ref) => {
    const { theme } = useThemeStore();
    const isLight = theme === "light";
    
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        const files = Array.from(e.target.files);
        
        const oversized = files.find(f => f.size > maxBytes);
        if (oversized) {
          e.target.value = "";
          onChange(multiple ? [] : null);
          if (typeof window !== "undefined") {
            console.warn(`File "${oversized.name}" exceeds ${maxSizeMB}MB limit`);
          }
          return;
        }

        if (multiple) {
          onChange(files);
        } else {
          onChange(e.target.files[0]);
        }
      }
    };

    const clearFile = (e) => {
      e.preventDefault();
      onChange(multiple ? [] : null);
    };

    const getDisplayNames = () => {
      if (!value) return null;
      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return value.map(v => v.name || 'File').join(', ');
      }
      return value.name || 'File attached';
    };

    const hasFile = Array.isArray(value) ? value.length > 0 : !!value;

    return (
      <div className="w-full">
        {label && (
          <label className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
            {label}
          </label>
        )}
        
        {!hasFile ? (
          <div 
            className={cn(
              "relative flex flex-col items-center justify-center w-full min-h-[120px] rounded-xl border border-dashed px-4 py-6 text-center transition-all cursor-pointer",
              isLight
                ? "border-slate-300 bg-slate-50 hover:bg-yellow-50 hover:border-yellow-400"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50",
              error && "border-red-500/50 bg-red-500/5",
              className
            )}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept={accept}
              multiple={multiple}
              ref={ref}
              {...props}
            />
            <UploadCloud size={32} className={`mb-3 opacity-80 ${isLight ? "text-slate-400" : "text-emerald-400"}`} />
            <p className={`text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-white"}`}>Click to upload or drag & drop</p>
            <p className={`text-xs ${isLight ? "text-slate-400" : "text-white/50"}`}>PNG, JPG up to {maxSizeMB}MB</p>
          </div>
        ) : (
          <div className={`flex items-center justify-between w-full rounded-xl border px-4 py-3 ${isLight ? "border-yellow-200 bg-yellow-50" : "border-emerald-500/30 bg-emerald-500/10"}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <UploadCloud size={20} className={`shrink-0 ${isLight ? "text-yellow-600" : "text-emerald-400"}`} />
              <span className={`text-sm truncate ${isLight ? "text-yellow-800" : "text-emerald-100"}`}>
                {getDisplayNames()}
              </span>
            </div>
            <button
              onClick={clearFile}
              className={`p-1 rounded-md transition-colors shrink-0 ml-2 ${isLight ? "hover:bg-yellow-100 text-yellow-600 hover:text-yellow-800" : "hover:bg-white/10 text-white/70 hover:text-white"}`}
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
