import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import PortalLayoutWrapper from "@/components/layout/PortalLayoutWrapper";
import { LabAuthGuard } from "@/components/layout/LabAuthGuard";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MeddyNet | Lab Partner Portal",
  description: "Advanced Diagnostic Management Console",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased bg-surface text-text" suppressHydrationWarning>
        <Providers>
          <LabAuthGuard>
            <PortalLayoutWrapper>
              {children}
            </PortalLayoutWrapper>
          </LabAuthGuard>
        </Providers>
      </body>
    </html>
  );
}

