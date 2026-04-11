import { SERVICE_STATUS } from "../../lib/constants";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Search, UserCheck, Navigation, Wrench, CheckCircle2, Phone, MessageSquare, MapPin } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export function ServiceStatusTracker({ request, onComplete, onCancel }) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  if (!request) return null;

  const steps = [
    { id: SERVICE_STATUS.SEARCHING, label: "Finding Mechanic", icon: Search },
    { id: SERVICE_STATUS.ASSIGNED, label: "Assigned", icon: UserCheck },
    { id: SERVICE_STATUS.EN_ROUTE, label: "En Route", icon: Navigation },
    { id: SERVICE_STATUS.IN_PROGRESS, label: "Fixing Vehicle", icon: Wrench },
    { id: SERVICE_STATUS.COMPLETED, label: "Completed", icon: CheckCircle2 },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === request.status);

  // Status-specific content
  const renderStatusCard = () => {
    switch (request.status) {
      case SERVICE_STATUS.SEARCHING:
        return (
          <div className="text-center py-6">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 relative ${isLight ? "bg-yellow-500/15 text-yellow-600" : "bg-amber-500/20 text-amber-400"}`}>
              <div className={`absolute inset-0 rounded-full border-2 animate-ping ${isLight ? "border-yellow-400/30" : "border-amber-400/30"}`}></div>
              <Search size={28} />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Locating Providers Nearby</h3>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-emerald-100/70"}`}>We&apos;re pinging the closest available mechanics to your location.</p>
          </div>
        );

      case SERVICE_STATUS.ASSIGNED:
      case SERVICE_STATUS.EN_ROUTE:
      case SERVICE_STATUS.IN_PROGRESS:
        return (
          <div className={`rounded-xl p-4 border mb-6 mt-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/20 border-white/5"}`}>
            <div className={`flex items-center gap-4 border-b pb-4 mb-4 ${isLight ? "border-slate-200" : "border-white/5"}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border ${isLight ? "bg-yellow-500/15 border-yellow-500/30" : "bg-emerald-500/20 border-emerald-500/30"}`}>
                {request.mechanic?.image ? (
                  <img src={request.mechanic.image} alt={request.mechanic.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className={isLight ? "text-yellow-600" : "text-emerald-400"} />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{request.mechanic?.name || "Assigning..."}</h4>
                <div className={`flex items-center text-xs mt-0.5 ${isLight ? "text-yellow-600" : "text-amber-400"}`}>
                  ⭐ {request.mechanic?.rating || "—"} <span className={`ml-2 ${isLight ? "text-slate-500" : "text-emerald-100/50"}`}>• Verified Provider</span>
                </div>
              </div>
              <div className={`flex gap-2 ${isLight ? "text-slate-600" : "text-white"}`}>
                 <button type="button" className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${isLight ? "bg-slate-200 hover:bg-yellow-500 hover:text-white" : "bg-white/10 hover:bg-emerald-500 hover:text-white"}`}>
                  <Phone size={16} />
                 </button>
                 <button type="button" className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${isLight ? "bg-slate-200 hover:bg-yellow-500 hover:text-white" : "bg-white/10 hover:bg-emerald-500 hover:text-white"}`}>
                  <MessageSquare size={16} />
                 </button>
              </div>
            </div>
            <div className={`flex items-start gap-3 text-sm ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
              <MapPin size={16} className={`shrink-0 mt-0.5 ${isLight ? "text-yellow-600" : "text-emerald-400"}`} />
              <div>
                <p className={`font-medium mb-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>Estimated Arrival</p>
                <p>{request.mechanic?.distance ? `${request.mechanic.distance} away` : "Calculating..."}</p>
              </div>
            </div>
          </div>
        );
      
      case SERVICE_STATUS.COMPLETED:
        return (
          <div className="text-center py-6 mt-4">
            <div className="inline-flex flex-col gap-4">
               <div>
                 <p className={`text-sm mb-1 ${isLight ? "text-slate-500" : "text-emerald-100/70"}`}>Estimated Amount</p>
                 <p className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                   ₹{request.priceEstimate?.min || "—"} – ₹{request.priceEstimate?.max || "—"}
                 </p>
                 <p className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>Final amount confirmed after review</p>
               </div>
               <Button onClick={() => onComplete(request)}>Pay & Review</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GlassCard variant="strong" className="w-full h-full p-6 flex flex-col">
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>Service Status</h2>
        <p className={`text-sm ${isLight ? "text-slate-500" : "text-emerald-100/70"}`}>Track your request in real-time</p>
      </div>

      {/* Progress Timeline */}
      <div className="relative mb-6 pb-2">
        <div className={`absolute top-5 left-[10%] right-[10%] h-1 rounded-full ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
          <div 
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isLight ? "bg-yellow-500" : "bg-emerald-500"}`}
            style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between relative z-10 w-full">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx && request.status !== SERVICE_STATUS.COMPLETED;
            
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center">
                <div 
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent 
                      ? (isLight ? "bg-white border-yellow-500 text-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "bg-[#064e3b] border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]")
                      : isCompleted
                        ? (isLight ? "bg-yellow-500 border-yellow-500 text-white" : "bg-emerald-500 border-emerald-500 text-white")
                        : (isLight ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-black/50 border-white/20 text-white/30")
                  }`}
                >
                  <Icon size={18} />
                </div>
                {/* Text label */}
                <span className={`text-[10px] font-medium mt-2 w-full text-center leading-tight ${isCompleted ? (isLight ? 'text-slate-800' : 'text-emerald-100') : (isLight ? 'text-slate-400' : 'text-white/30')} ${idx > 0 && idx < steps.length - 1 ? 'hidden sm:block' : ''}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {renderStatusCard()}
      </div>

      {request.status !== SERVICE_STATUS.COMPLETED && (
         <div className={`mt-4 pt-4 border-t text-center ${isLight ? "border-slate-200" : "border-white/5"}`}>
           <button 
             type="button"
             onClick={onCancel}
             className="text-sm text-red-400 hover:text-red-300 transition-colors"
           >
              Cancel Request
           </button>
         </div>
      )}
    </GlassCard>
  );
}
