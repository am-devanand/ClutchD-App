import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Power } from "lucide-react";
import { cn } from "../../lib/utils";

export function AvailabilityToggle() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <GlassCard variant="strong" className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Status</h3>
          <p className="text-sm text-emerald-100/60">
            {isOnline ? "You are receiving job requests" : "You are currently hidden"}
          </p>
        </div>
        
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg border-2",
            isOnline 
              ? "bg-emerald-500 border-emerald-400 text-white pulse-online" 
              : "bg-white/10 border-white/20 text-white/50 hover:bg-white/20"
          )}
        >
          <Power size={24} />
        </button>
      </div>
      
      <div className="mt-6 pt-5 border-t border-white/10 flex gap-4">
         <div className="flex-1 bg-black/20 rounded-xl p-3 text-center border border-white/5">
            <p className="text-xs text-white/50 mb-1">Status</p>
            <p className={cn("font-bold", isOnline ? "text-emerald-400" : "text-white/40")}>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </p>
         </div>
         <div className="flex-1 bg-black/20 rounded-xl p-3 text-center border border-white/5">
            <p className="text-xs text-white/50 mb-1">Hours Today</p>
            <p className="font-bold text-white">4.5 hrs</p>
         </div>
      </div>
    </GlassCard>
  );
}
