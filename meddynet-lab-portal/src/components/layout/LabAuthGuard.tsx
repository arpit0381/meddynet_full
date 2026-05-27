"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function LabAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    if (!_hasHydrated) return;

    const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/auth") ||
      pathname === "/login" ||
      pathname === "/register";

    if (isAuthenticated && user && isPublicRoute) {
      router.replace("/dashboard");
    } else if (!isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (
      isAuthenticated &&
      user &&
      !["lab", "lab_admin", "lab_staff", "admin"].includes(user.role)
    ) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, user, pathname, router]);

  // ✅ No spinner — just render children immediately.
  // Zustand hydrates synchronously from localStorage so any redirect
  // happens in the same tick as the first paint.
  return <>{children}</>;
}

