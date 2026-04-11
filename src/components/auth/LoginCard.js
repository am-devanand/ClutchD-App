import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/validators";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { Mail, Lock, LogIn, UserCircle, Wrench, Building2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

import { useRouter } from "next/navigation";

export function LoginCard() {
  const { login, loginWithGoogle, isLoading, error: authError } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("customer");
  const selectedRoleRef = useRef(selectedRole);

  const ROLES = [
    { id: "customer", label: "Customer", icon: UserCircle, desc: "Find mechanics & garages" },
    { id: "mechanic", label: "Mechanic", icon: Wrench, desc: "Get on-demand jobs" },
    { id: "garage", label: "Garage", icon: Building2, desc: "Manage services locally" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password, selectedRole);
      if (user) {
        fetch("/api/login-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            role: selectedRole,
          }),
        }).catch(() => {});

        if (user.role === "admin") router.push("/admin");
        else router.push(`/dashboard/${user.role}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [googleReady, setGoogleReady] = useState(false);
  const googleContainerId = "google-signin-button";

  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!googleClientId) return;

    const scriptId = "google-identity-services";
    const existing = document.getElementById(scriptId);

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (resp) => {
          const credential = resp?.credential;
          if (!credential) return;

          const role = selectedRoleRef.current;
          const user = await loginWithGoogle(credential, role);
          if (!user) return;

          if (user?.email && user?.role) {
            fetch("/api/login-log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email, role: user.role }),
            }).catch(() => {});
          }

          if (user.role === "admin") router.push("/admin");
          else router.push(`/dashboard/${user.role}`);
        },
      });
      setGoogleReady(true);
    };

    if (existing) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => {};
  }, [googleClientId, loginWithGoogle, router, selectedRole]);

  return (
    <GlassCard variant="strong" className="w-full max-w-md p-8 pt-10">
      <div className="mb-8 text-center">
        <h2 className={`text-3xl font-bold mb-2 tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Welcome Back</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/70"}>Sign in to your ClutchD account</p>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`
                flex flex-col items-center p-3 rounded-xl border transition-all text-center group
                ${
                  isSelected
                    ? isLight
                      ? "bg-yellow-500/15 border-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      : "bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : isLight
                      ? "bg-slate-100 border-slate-200 text-slate-500 hover:bg-yellow-50 hover:text-slate-700"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon
                size={24}
                className={`mb-2 ${isSelected ? (isLight ? "text-yellow-600" : "text-emerald-400") : isLight ? "text-slate-400 group-hover:text-slate-600" : "text-white/50 group-hover:text-white/80"}`}
              />
              <span className="text-sm font-medium mb-1">{role.label}</span>
              <span className="text-[10px] opacity-70 leading-tight hidden sm:block">{role.desc}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="name@example.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
          <div className="flex justify-end">
            <a
              href="#"
              className={`text-sm font-medium transition-colors ${isLight ? "text-yellow-600 hover:text-yellow-700" : "text-emerald-400 hover:text-emerald-300"}`}
            >
              Forgot password?
            </a>
          </div>
        </div>

        {authError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {authError}
          </div>
        )}

        <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
          <LogIn size={18} className="mr-2" />
          Sign In
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isLight ? "border-slate-200" : "border-white/10"}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${isLight ? "bg-white text-slate-400" : "bg-[#0d3f2d] text-emerald-100/50"}`}>Or continue with</span>
          </div>
        </div>

        <div className="w-full space-y-3">
          {googleClientId ? (
            <>
              <div className={`w-full rounded-xl border p-3 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"}`}>
                <div
                  id={googleContainerId}
                  ref={(el) => {
                    if (!el) return;
                    if (!googleReady) return;
                    if (el.dataset.rendered) return;
                    window.google.accounts.id.renderButton(el, {
                      theme: "outline",
                      size: "large",
                      type: "standard",
                      shape: "pill",
                      text: "continue_with",
                    });
                    el.dataset.rendered = "1";
                  }}
                />
              </div>
              <p className={`text-xs text-center ${isLight ? "text-slate-400" : "text-white/40"}`}>
                Google login will continue as <span className={`font-medium ${isLight ? "text-yellow-700" : "text-emerald-200/80"}`}>{selectedRole}</span>.
              </p>
            </>
          ) : (
            <div className={`w-full p-3 rounded-xl border text-sm text-center ${isLight ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/10 bg-white/5 text-white/60"}`}>
              Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to enable Google login.
            </div>
          )}
        </div>
      </form>
    </GlassCard>
  );
}
