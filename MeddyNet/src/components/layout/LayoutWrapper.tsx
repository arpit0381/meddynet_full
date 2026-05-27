"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuthStore } from "@/store/authStore";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { UserProvider } from "@/context/UserContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/super-admin");
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/maintenance" || pathname === "/partnership";
  const hideFooter = pathname?.startsWith("/book");
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated && 'serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
        })
        .catch(() => { /* SW registration failed silently */ });
    }
  }, [isAuthenticated]);

  const showPortalShell = isAuthenticated && !isDashboard && !isAuthPage;

  if (showPortalShell) {
    return (
        <UserProvider>
            <div className="min-h-screen bg-surface flex">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <DashboardTopbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-8 relative scroll-smooth no-scrollbar md:scrollbar">
                        <div className="max-w-[1600px] mx-auto w-full h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </UserProvider>
    );
  }

  return (
    <>
      {isDashboard || isAuthPage ? (
        <main className="min-h-screen">{children}</main>
      ) : (
        <>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          {!hideFooter && <Footer />}
        </>
      )}
    </>
  );
}
/////////////////////