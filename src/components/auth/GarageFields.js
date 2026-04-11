import { Building, User, Mail, Phone, MapPin, Clock, Users, Lock } from "lucide-react";
import { Input } from "../ui/Input";
import { MultiSelect } from "../ui/MultiSelect";
import { FileUpload } from "../ui/FileUpload";
import { EXPERTISE_OPTIONS } from "../../lib/constants";

export function GarageFields({ register, errors, setValue, watch }) {
  const watchServices = watch("services") || [];

  const handleServicesChange = (val) => {
    setValue("services", val, { shouldValidate: true });
  };

  const handleFileChange = (files) => {
    setValue("garageImages", files);
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Garage Name"
          icon={Building}
          placeholder="e.g. SpeedFix Auto"
          {...register("garageName")}
          error={errors.garageName?.message}
        />
        <Input
          label="Owner Name"
          icon={User}
          placeholder="Owner name"
          {...register("ownerName")}
          error={errors.ownerName?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="garage@example.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Phone Number"
          icon={Phone}
          placeholder="10-digit number"
          {...register("phone")}
          error={errors.phone?.message}
        />
      </div>

      <Input
        label="Location"
        icon={MapPin}
        placeholder="Full address of garage"
        {...register("location")}
        error={errors.location?.message}
      />

      {/* Garage details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Operating Hours"
          icon={Clock}
          placeholder="e.g. 9:00 AM - 8:00 PM"
          {...register("operatingHours")}
          error={errors.operatingHours?.message}
        />
        <Input
          label="Number of Mechanics"
          type="number"
          icon={Users}
          placeholder="e.g. 5"
          {...register("mechanicCount")}
          error={errors.mechanicCount?.message}
        />
      </div>

      <MultiSelect
        label="Services Offered"
        options={EXPERTISE_OPTIONS}
        value={watchServices}
        onChange={handleServicesChange}
        error={errors.services?.message}
        placeholder="Select available services..."
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

      {/* Images */}
      <FileUpload
        label="Garage Images"
        multiple={true}
        onChange={handleFileChange}
        value={watch("garageImages")}
        error={errors.garageImages?.message}
      />
    </div>
  );
}
