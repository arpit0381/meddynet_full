"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Command } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, _hasHydrated } = useAdminStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === "/login" || pathname === "/";
  const shouldRedirectLogin = !isAuthenticated && !isPublicRoute;
  const shouldRedirectUnauthorized = !!(isAuthenticated && user && !['admin', 'superadmin', 'moderator'].includes(user.role));

  useEffect(() => {
    if (!_hasHydrated) return;
    
    if (shouldRedirectLogin) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (shouldRedirectUnauthorized) {
      router.replace("/unauthorized"); 
    }
  }, [_hasHydrated, shouldRedirectLogin, shouldRedirectUnauthorized, pathname, router]);

  if (!_hasHydrated || shouldRedirectLogin || shouldRedirectUnauthorized) {
    return (
      <div className="fixed inset-0 bg-surface z-9999 flex flex-col items-center justify-center gap-8">
        {/* Futuristic Command HUD */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-10 border-primary/5 border-t-primary animate-[spin_1s_ease-in-out_infinite]" />
          <div className="absolute inset-0 m-auto w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-3xl shadow-primary/20 -rotate-12">
             <Command className="w-7 h-7 text-white" />
          </div>
          
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 blur-sm animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-3xl font-black text-main-text tracking-tight uppercase italic flex items-center gap-4">
            Command <span className="not-italic text-primary px-4 py-1.5 bg-primary/10 rounded-2xl border border-primary/20 text-xl font-black">Auth</span>
          </h3>
          <p className="text-[11px] font-black text-muted uppercase tracking-[0.5em] animate-pulse">
            Establishing Secure Command Pulse...
          </p>
        </div>

        {/* Global Matrix Overlay */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-40" />
      </div>
    );
  }

  return <>{children}</>;
}
