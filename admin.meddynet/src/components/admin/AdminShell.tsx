"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { useAdmin } from "@/contexts/AdminContext";
import { CommandPalette } from "@/components/admin/ui/CommandPalette";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { useAdminStore } from "@/store/adminStore";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-surface overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} onCmdOpen={() => {}} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Breadcrumbs />
            {children}
          </main>
        </div>
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        <CommandPalette />
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, _hasHydrated } = useAdminStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    // Avoid redirecting when already at login
    if (pathname === "/admin/login") {
      setIsInitializing(false);
      return;
    }

    if (!isAuthenticated) {
      router.replace("/admin/login");
    } else {
      setIsInitializing(false);
    }
  }, [pathname, router, isAuthenticated, _hasHydrated]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
