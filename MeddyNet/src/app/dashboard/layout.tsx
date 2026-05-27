"use client";

import { ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserProvider } from "@/context/UserContext";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - fixed on desktop */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DashboardTopbar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-8 relative scroll-smooth no-scrollbar md:scrollbar">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1600px] mx-auto w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
