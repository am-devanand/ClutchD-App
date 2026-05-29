"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceRequestSchema } from "../../lib/validators";
import { ISSUE_TAGS } from "../../lib/constants";
import { estimatePrice } from "../../lib/utils";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { FileUpload } from "../ui/FileUpload";
import { Navigation, CheckCircle2, CarFront, PlusCircle, MapPin, Loader2, LocateFixed } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { useTrackingStore } from "../../store/trackingStore";
import { cn } from "../../lib/utils";
import api from "../../lib/api";
import { VehicleManagerModal } from "./VehicleManagerModal";

function LocationIndicator({ isLight }) {
  const { userLocation, gpsStatus, requestGPSLocation } = useTrackingStore();
  const [manualInput, setManualInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualInput)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        useTrackingStore.getState().setUserLocation(coords);
        setShowManual(false);
      } else {
        alert("Location not found. Try a more specific address.");
      }
    } catch {
      alert("Failed to search location. Check your internet connection.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={`p-3 rounded-xl border ${isLight ? "bg-yellow-50/50 border-yellow-200" : "bg-emerald-500/5 border-emerald-500/20"}`}>
      <div className="flex items-center justify-between mb-1">
        <label className={`text-sm font-medium flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-emerald-100/80"}`}>
          <MapPin size={14} className={isLight ? "text-yellow-600" : "text-emerald-400"} />
          Your Location
        </label>
        <div className="flex items-center gap-2">
          {gpsStatus === "granted" && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isLight ? "bg-green-100 text-green-700" : "bg-emerald-500/20 text-emerald-300"}`}>
              GPS Active
            </span>
          )}
          {(gpsStatus === "denied" || gpsStatus === "unavailable") && (
            <button
              type="button"
              onClick={requestGPSLocation}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isLight ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"}`}
            >
              <LocateFixed size={10} className="inline mr-1" />
              Retry GPS
            </button>
          )}
        </div>
      </div>

      {gpsStatus === "requesting" && (
        <div className="flex items-center gap-2 mt-1">
          <Loader2 size={12} className={`animate-spin ${isLight ? "text-yellow-500" : "text-emerald-400"}`} />
          <span className={`text-xs ${isLight ? "text-slate-500" : "text-white/40"}`}>Detecting your location...</span>
        </div>
      )}

      {gpsStatus === "granted" && (
        <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-emerald-100/50"}`}>
          📍 {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
        </p>
      )}

      {(gpsStatus === "denied" || gpsStatus === "unavailable") && (
        <div className="mt-2">
          <p className={`text-xs mb-2 ${isLight ? "text-red-500" : "text-red-400/80"}`}>
            {gpsStatus === "denied" ? "Location access was denied." : "GPS not available on this device."}
          </p>
          {!showManual ? (
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className={`text-xs font-medium underline ${isLight ? "text-yellow-600" : "text-emerald-400"}`}
            >
              Enter location manually
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter your address or city..."
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-xs transition-all",
                  isLight
                    ? "bg-white border-slate-200 text-slate-900 focus:border-yellow-500 focus:outline-none"
                    : "bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none"
                )}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleManualSearch())}
              />
              <button
                type="button"
                onClick={handleManualSearch}
                disabled={searching}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-white ${isLight ? "bg-yellow-500 hover:bg-yellow-600" : "bg-emerald-600 hover:bg-emerald-500"} disabled:opacity-50`}
              >
                {searching ? <Loader2 size={12} className="animate-spin" /> : "Find"}
              </button>
            </div>
          )}
        </div>
      )}

      {gpsStatus === "idle" && (
        <div className="mt-1">
          <button
            type="button"
            onClick={requestGPSLocation}
            className={`text-xs font-medium flex items-center gap-1 ${isLight ? "text-yellow-600 hover:text-yellow-700" : "text-emerald-400 hover:text-emerald-300"}`}
          >
            <LocateFixed size={12} />
            Detect my location
          </button>
        </div>
      )}
    </div>
  );
}

export function ServiceRequestPanel({ onSubmit, isLoading }) {
  const [estimatedPrice, setEstimatedPrice] = useState({ min: 500, max: 2000 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      requestType: "auto",
    }
  });

  const issueTag = watch("issueTag");
  const requestType = watch("requestType");
  const selectedVehicleId = watch("vehicleId");

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
      if (res.data.length > 0 && !selectedVehicleId) {
        setValue("vehicleId", res.data[0].id, { shouldValidate: true });
      }
    } catch(e) {
      // best effort
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleIssueChange = (e) => {
    const value = e.target.value;
    setValue("issueTag", value, { shouldValidate: true });
    if (value) {
      setEstimatedPrice(estimatePrice(value));
    }
  };

  const submitHandler = async (data) => {
    await onSubmit({
      ...data,
      priceEstimate: estimatedPrice,
    });
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <GlassCard variant="strong" className="w-full h-full p-6 flex flex-col items-center justify-center text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isLight ? "bg-yellow-500/20" : "bg-emerald-500/20"}`}>
          <CheckCircle2 size={40} className={isLight ? "text-yellow-500" : "text-emerald-400"} />
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Request Sent!</h3>
        <p className={`mb-8 max-w-xs ${isLight ? "text-slate-500" : "text-emerald-100/70"}`}>
          We&apos;re locating the nearest professionals for your issue. Please wait a moment.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="strong" className="w-full p-6 flex flex-col relative flex-shrink-0">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>Request Service</h2>
        <p className={`text-sm ${isLight ? "text-slate-500" : "text-emerald-100/70"}`}>Tell us what&apos;s wrong with your vehicle</p>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 flex-col">
        <div className="space-y-4">

          {/* GPS Location */}
          <LocationIndicator isLight={isLight} />
          
          {/* Vehicle Selection */}
          <div className="w-full">
             <div className="flex justify-between items-center mb-2">
               <label className={`text-sm font-medium ${isLight ? "text-slate-700" : "text-emerald-100/80"}`}>
                 Select Vehicle
               </label>
               <button 
                 type="button" 
                 onClick={() => setIsVehicleModalOpen(true)}
                 className={`text-xs flex items-center hover:underline ${isLight ? "text-yellow-600" : "text-emerald-400"}`}
               >
                 <PlusCircle size={12} className="mr-1" /> Manage
               </button>
             </div>
             
             {vehicles.length === 0 ? (
               <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? "bg-yellow-50 border-yellow-200" : "bg-emerald-500/10 border-emerald-500/30"}`}>
                 <span className={`text-sm font-medium ${isLight ? "text-yellow-700" : "text-emerald-300"}`}>No vehicles added</span>
                 <Button type="button" size="sm" onClick={() => setIsVehicleModalOpen(true)}>Add Vehicle</Button>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-2">
                 {vehicles.map(v => (
                   <label 
                     key={v.id}
                     className={cn(
                       "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                       selectedVehicleId === v.id 
                         ? (isLight ? "bg-yellow-500/15 border-yellow-500 text-yellow-700 shadow-[0_0_10px_rgba(234,179,8,0.15)]" : "bg-emerald-500/20 border-emerald-400 text-white")
                         : (isLight ? "bg-white border-slate-200 text-slate-500 hover:bg-slate-50" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10")
                     )}
                   >
                     <input type="radio" value={v.id} {...register("vehicleId")} className="sr-only" />
                     <CarFront size={18} className={selectedVehicleId === v.id ? (isLight ? "text-yellow-600" : "text-emerald-400") : "opacity-50"} />
                     <span className="font-medium text-sm">{v.year} {v.make} {v.model}</span>
                     {v.license_plate && <span className="text-xs opacity-60 ml-auto">{v.license_plate}</span>}
                   </label>
                 ))}
               </div>
             )}
          </div>

          <Select
            label="What seems to be the issue?"
            placeholder="Select a category..."
            options={ISSUE_TAGS}
            {...register("issueTag")}
            onChange={handleIssueChange}
            error={errors.issueTag?.message}
          />
          
          <div className="w-full">
            <label className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-emerald-100/80"}`}>
              Describe the problem
            </label>
            <textarea
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-sm transition-all min-h-[100px] resize-none",
                isLight 
                  ? "bg-white border-slate-200 text-slate-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none placeholder:text-slate-400"
                  : "bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-white/30"
              )}
              placeholder="E.g. My car started making a knocking sound and then stalled..."
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-400">{errors.description.message}</p>
            )}
          </div>

          <FileUpload
            label="Upload Photo/Video (Optional)"
            accept="image/*,video/*"
            onChange={(file) => setValue("media", file)}
          />

          <div className="w-full">
            <label className={`mb-3 block text-sm font-medium ${isLight ? "text-slate-700" : "text-emerald-100/80"}`}>
              Provider Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['auto', 'mechanic', 'garage'].map((type) => (
                <label 
                  key={type} 
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all",
                    requestType === type 
                      ? (isLight ? "bg-yellow-500/15 border-yellow-500 text-yellow-700 shadow-[0_0_10px_rgba(234,179,8,0.15)]" : "bg-emerald-500/20 border-emerald-400 text-emerald-300")
                      : (isLight ? "bg-slate-50 border-slate-200 text-slate-500 hover:bg-yellow-50" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80")
                  )}
                >
                  <input
                    type="radio"
                    value={type}
                    className="sr-only"
                    {...register("requestType")}
                  />
                  <span className="text-xs font-semibold capitalize">
                    {type === 'auto' ? 'Fastest' : type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4 items-center justify-between ${isLight ? "border-slate-200" : "border-white/10"}`}>
          <div>
            <p className={`text-xs mb-1 ${isLight ? "text-slate-500" : "text-emerald-100/60"}`}>Estimated Cost Range</p>
            <p className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              ₹{estimatedPrice.min} - ₹{estimatedPrice.max}
            </p>
          </div>
          
          <Button 
            type="submit" 
            size="lg" 
            isLoading={isLoading} 
            className="w-full sm:w-auto"
            disabled={vehicles.length > 0 && !selectedVehicleId}
          >
            <Navigation size={18} className="mr-2" />
            Find Help Now
          </Button>
        </div>
      </form>
      
      <VehicleManagerModal 
        isOpen={isVehicleModalOpen} 
        onClose={() => setIsVehicleModalOpen(false)} 
        onVehiclesChanged={fetchVehicles}
      />
    </GlassCard>
  );
}
