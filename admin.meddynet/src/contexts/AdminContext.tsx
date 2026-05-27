"use client";
import React, { createContext, useContext, useState } from "react";
import type { AdminRole } from "@/lib/permissions";
import { hasPermission, canAccessRoute } from "@/lib/permissions";

interface AdminContextType {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
  name: string;
  email: string;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  can: (action: string) => boolean;
  canVisit: (route: string) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AdminRole>("superadmin");
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  // Load from local storage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as "light" | "dark";
    if (saved) setThemeState(saved);
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    localStorage.setItem("admin-theme", newTheme);
  };

  const value: AdminContextType = {
    role,
    setRole,
    name: "Super Admin",
    email: "admin@meddynet.com",
    theme,
    setTheme,
    can: (action) => hasPermission(role, action),
    canVisit: (route) => canAccessRoute(role, route),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
