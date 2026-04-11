import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { MultiSelect } from "../ui/MultiSelect";
import { EXPERTISE_OPTIONS } from "../../lib/constants";
import { Building2, MapPin, Phone, Clock, Users } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function GarageProfile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [services, setServices] = useState(user?.services || ["engine", "brakes", "ac", "electrical", "tires"]);

  return (
    <GlassCard variant="strong" className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Garage Profile</h2>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Details"}
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center">
          {user?.image ? (
             <img src={user.image} alt="Garage" className="w-full h-full object-cover" />
          ) : (
            <Building2 size={32} className="text-emerald-400" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{user?.name || "SpeedFix Auto Garage"}</h3>
          <p className="text-emerald-100/60 text-sm">Managed by {user?.ownerName || "Suresh Patel"}</p>
          <div className="flex items-center gap-3 mt-2">
             <div className="flex items-center text-xs text-amber-400">
               ⭐ 4.5 <span className="text-emerald-100/40 ml-1">(850+ jobs)</span>
             </div>
             <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
               Verified Partner
             </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Garage Name" 
            icon={Building2} 
            defaultValue={user?.name || "SpeedFix Auto Garage"} 
            disabled={!isEditing} 
          />
          <Input 
            label="Contact Phone" 
            icon={Phone} 
            defaultValue={user?.phone || "9876543211"} 
            disabled={!isEditing} 
          />
        </div>
        
        <Input 
          label="Location Address" 
          icon={MapPin} 
          defaultValue={user?.location || "Saibaba Colony, Coimbatore, 641011"} 
          disabled={!isEditing} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Operating Hours" 
            icon={Clock} 
            defaultValue={user?.operatingHours || "8:00 AM - 9:00 PM"} 
            disabled={!isEditing} 
          />
          <Input 
            label="Staff Capacity" 
            icon={Users} 
            type="number"
            defaultValue={user?.mechanicCount || "8"} 
            disabled={!isEditing} 
          />
        </div>
        
        {isEditing ? (
          <MultiSelect 
            label="Services Offered" 
            options={EXPERTISE_OPTIONS} 
            value={services} 
            onChange={setServices} 
          />
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-100/80">Services Offered</label>
            <div className="flex flex-wrap gap-2">
               {services.map(exp => {
                 const label = EXPERTISE_OPTIONS.find(o => o.value === exp)?.label || exp;
                 return (
                   <span key={exp} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-emerald-100">
                     {label}
                   </span>
                 )
               })}
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
          <Button onClick={() => setIsEditing(false)}>Save Garage Details</Button>
        </div>
      )}
    </GlassCard>
  );
}
