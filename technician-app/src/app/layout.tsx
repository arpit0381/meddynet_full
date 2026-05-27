import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideNav } from "@/components/layout/SideNav";
import { Toaster } from "@/components/ui/sonner";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#00A86B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Meddy Technician",
  description: "Technician app for MeddyNet",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meddy Technician",
  },
};

import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-screen bg-white md:bg-gray-50 flex overflow-hidden`}>
        <Providers>
          {/* Desktop Sidebar */}
          <nav className="hidden md:flex shrink-0 h-full">
            <SideNav />
          </nav>
  
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden md:pb-0 pb-20">
              {children}
            </div>
            
            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
              <BottomNav />
            </div>
          </main>
          <Toaster position="top-center" richColors />
        </Providers>


        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
