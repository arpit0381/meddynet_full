"use client";

import { ReactNode, useState, useEffect } from "react";
import LabSidebar from "@/components/dashboard/LabSidebar";
import LabTopbar from "@/components/dashboard/LabTopbar";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import HydrationGuard from "@/components/ui/HydrationGuard";

export default function PortalLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Suppress MetaMask extension unhandled rejections that clutter the logs during development
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && 
          (event.reason.message?.includes('MetaMask') || 
           event.reason.toString().includes('MetaMask') ||
           event.reason.stack?.includes('nkbihfbeogaeaoehlefnkodbefgpgknn'))) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  const noLayoutPaths = ['/', '/login', '/register', '/subscription', '/launch'];
  
  if (noLayoutPaths.includes(pathname)) {
    return <HydrationGuard>{children}</HydrationGuard>;
  }

  return (
    <HydrationGuard>
      <div className="min-h-screen bg-surface pt-[72px] flex">
        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar - fixed on desktop, drawer on mobile */}
        <LabSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-72px)] overflow-hidden">
          <LabTopbar onMenuClick={() => setIsMobileMenuOpen(true)} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-6 lg:p-10 relative scroll-smooth">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </HydrationGuard>
  );
}
