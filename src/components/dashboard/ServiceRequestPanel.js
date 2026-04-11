"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceRequestSchema } from "../../lib/validators";
import { ISSUE_TAGS } from "../../lib/constants";
import { estimatePrice } from "../../lib/utils";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { FileUpload } from "../ui/FileUpload";
import { Wrench, Navigation, CheckCircle2 } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { cn } from "../../lib/utils";

export function ServiceRequestPanel({ onSubmit, isLoading }) {
  const [estimatedPrice, setEstimatedPrice] = useState({ min: 500, max: 2000 });
  const [isSuccess, setIsSuccess] = useState(false);
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
    <GlassCard variant="strong" className="w-full h-full p-6 flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>Request Service</h2>
        <p className={`text-sm ${isLight ? "text-slate-500" : "text-emerald-100/70"}`}>Tell us what&apos;s wrong with your vehicle</p>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 flex-grow flex flex-col">
        <div className="space-y-4">
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
          >
            <Navigation size={18} className="mr-2" />
            Find Help Now
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
