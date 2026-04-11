import { Mail, Lock, User } from "lucide-react";
import { Input } from "../ui/Input";

export function CustomerFields({ register, errors }) {
  return (
    <div className="space-y-4">
      {/* Name Input */}
      <Input
        label="Full Name"
        icon={User}
        placeholder="e.g. Rahul Sharma"
        {...register("fullName")}
        error={errors.fullName?.message}
      />

      {/* Email Input */}
      <Input
        label="Email Address"
        type="email"
        icon={Mail}
        placeholder="name@example.com"
        {...register("email")}
        error={errors.email?.message}
      />

      {/* Password block */}
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
    </div>
  );
}
