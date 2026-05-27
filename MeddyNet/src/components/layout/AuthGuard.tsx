"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldAlert, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;

    // Determine if the current route is protected
      const isPublicRoute = 
          pathname === "/" || 
          pathname.startsWith("/auth") || 
          pathname.startsWith("/tests") || 
          pathname.startsWith("/labs") ||
          pathname.startsWith("/partnership") ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname.startsWith("/search");

      if (!isAuthenticated && !isPublicRoute) {
        // Not logged in and trying to access protected route (Dashboard/Vault/etc)
        router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && user) {
        // Handle login/register paths when already logged in
        if (pathname === "/login" || pathname === "/register") {
            router.replace("/dashboard");
            return;
        }

        // Role-Aware Universal Redirection (Deep Analysis Protection)
        // Protect Patient Portal from Merchant/Admin interference
        if (user.role === 'lab_admin' || user.role === 'lab_staff' || user.role === 'lab') {
          const target = process.env.NEXT_PUBLIC_LAB_PORTAL_URL || "http://localhost:3001";
          window.location.href = `${target}/dashboard`;
        } else if (user.role === 'admin' || user.role === 'superadmin') {
          const target = process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || "http://localhost:3002";
          window.location.href = `${target}/admin/dashboard`;
        } else {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
  }, [isAuthenticated, user, pathname, router, _hasHydrated]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white z-99999 flex flex-col items-center justify-center gap-10">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="flex flex-col items-center gap-10"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-[32px] bg-primary/5 border-2 border-primary/20 flex items-center justify-center p-6 shadow-2xl shadow-primary/10">
               <Skeleton className="absolute inset-0 rounded-[30px]" />
               <ShieldAlert className="w-16 h-16 text-primary animate-pulse relative z-10" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-dark rounded-xl flex items-center justify-center border-2 border-white shadow-xl">
               <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4 text-center">
             <div className="inline-flex items-center gap-3 px-6 py-2 bg-dark rounded-full shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">AUTHENTICATING</span>
             </div>
             <p className="text-sm font-medium text-text-muted italic max-w-xs text-center opacity-70">
                Establishing a secure connection to your health records...
             </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
