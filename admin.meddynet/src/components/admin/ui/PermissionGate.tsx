"use client";
import React from "react";
import { useAdmin } from "@/contexts/AdminContext";

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { can } = useAdmin();

  if (can(permission)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  // Render disabled version of first child with tooltip
  return (
    <div className="relative group inline-block cursor-not-allowed">
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-lg">
        Insufficient permissions
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}
