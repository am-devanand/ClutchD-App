"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

/**
 * Invisible component that validates the session on every app mount / page reload.
 * Place this inside the root layout so it runs once on startup.
 */
export function AuthInit() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null; // renders nothing
}
