import { useState } from "react";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { MultiSelect } from "../ui/MultiSelect";
import { FileUpload } from "../ui/FileUpload";
import { EXPERTISE_OPTIONS } from "../../lib/constants";

export function MechanicFields({ register, errors, setValue, watch }) {
  const watchExpertise = watch("expertise") || [];

  const handleExpertiseChange = (val) => {
    setValue("expertise", val, { shouldValidate: true });
  };

  const handleFileChange = (file) => {
    setValue("profileImage", file);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          icon={User}
          placeholder="e.g. Vijay Kumar"
          {...register("fullName")}
          error={errors.fullName?.message}
        />
        <Input
          label="Phone Number"
          icon={Phone}
          placeholder="10-digit number"
          {...register("phone")}
          error={errors.phone?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="name@example.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <Select
          label="Experience"
          placeholder="Select years..."
          options={[
            { value: "0-2", label: "0-2 years" },
            { value: "3-5", label: "3-5 years" },
            { value: "5-10", label: "5-10 years" },
            { value: "10+", label: "10+ years" },
          ]}
          {...register("experience")}
          error={errors.experience?.message}
        />
      </div>

      <MultiSelect
        label="Expertise / Skills"
        options={EXPERTISE_OPTIONS}
        value={watchExpertise}
        onChange={handleExpertiseChange}
        error={errors.expertise?.message}
        placeholder="Select areas of expertise..."
      />

      {/* Location */}
      <Input
        label="Location"
        icon={MapPin}
        placeholder="e.g. RS Puram or Click icon for GPS"
        {...register("location")}
        error={errors.location?.message}
      />

      {/* Passwords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Min 6 characters"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Confirm Password"
          type="password"
          icon={Lock}
          placeholder="Repeat password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </div>

      {/* Profile Image */}
      <FileUpload
        label="Profile / ID Proof"
        onChange={handleFileChange}
        value={watch("profileImage")}
        error={errors.profileImage?.message}
      />
    </div>
  );
}
