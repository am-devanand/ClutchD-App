import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

export function StarRating({ rating = 0, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            className={cn(
              "focus:outline-none transition-transform",
              interactive ? "hover:scale-125 cursor-pointer" : "cursor-default",
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                isFilled 
                  ? "fill-amber-400 text-amber-400" 
                  : "fill-white/10 text-white/30",
                interactive && "hover:fill-amber-300 hover:text-amber-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
