import { z } from "zod";

// ── Auth ────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerSignupSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const mechanicSignupSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Enter your full name"),
    phone: z.string().min(10, "Enter a valid phone number"),
    experience: z.string().min(1, "Select experience"),
    expertise: z.array(z.string()).min(1, "Select at least one expertise"),
    location: z.string().min(2, "Enter your location"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const garageSignupSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
    garageName: z.string().min(2, "Enter garage name"),
    ownerName: z.string().min(2, "Enter owner name"),
    phone: z.string().min(10, "Enter a valid phone number"),
    location: z.string().min(2, "Enter location"),
    services: z.array(z.string()).min(1, "Select at least one service"),
    mechanicCount: z.string().min(1, "Enter number of mechanics"),
    operatingHours: z.string().min(1, "Enter operating hours"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Service Request ─────────────────────────────
export const serviceRequestSchema = z.object({
  issueTag: z.string().min(1, "Select an issue"),
  description: z.string().min(10, "Describe the issue (min 10 chars)"),
  requestType: z.enum(["mechanic", "garage", "auto"]),
});

// ── Review ──────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});
