import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { MultiSelect } from "../ui/MultiSelect";
import { EXPERTISE_OPTIONS } from "../../lib/constants";
import { User, MapPin, Phone } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function ProfileEditor() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [expertise, setExpertise] = useState(user?.expertise || ["engine", "brakes"]);

  return (
    <GlassCard variant="strong" className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Your Profile</h2>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center relative group">
          {user?.image ? (
             <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-emerald-300">
               {user?.name?.substring(0, 2).toUpperCase() || "ME"}
            </span>
          )}
          {isEditing && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer">
                <span className="text-xs text-white">Change</span>
             </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{user?.name || "Vijay Kumar"}</h3>
          <p className="text-emerald-100/60 text-sm">Independent Mechanic</p>
          <div className="flex items-center text-xs text-amber-400 mt-1">
            ⭐ 4.8 Rating <span className="text-emerald-100/40 ml-2">(124 jobs)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <Input 
          label="Full Name" 
          icon={User} 
          defaultValue={user?.name || "Vijay Kumar"} 
          disabled={!isEditing} 
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Phone" 
            icon={Phone} 
            defaultValue={user?.phone || "9876543210"} 
            disabled={!isEditing} 
          />
          <Input 
            label="Location" 
            icon={MapPin} 
            defaultValue={user?.location || "RS Puram, Coimbatore"} 
            disabled={!isEditing} 
          />
        </div>
        
        {isEditing ? (
          <MultiSelect 
            label="Expertise" 
            options={EXPERTISE_OPTIONS} 
            value={expertise} 
            onChange={setExpertise} 
          />
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-100/80">Expertise</label>
            <div className="flex flex-wrap gap-2">
               {expertise.map(exp => {
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
          <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
        </div>
      )}
    </GlassCard>
  );
}
