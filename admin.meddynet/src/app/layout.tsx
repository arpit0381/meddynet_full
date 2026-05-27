import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeddyNet Admin Dashboard",
  description: "Platform management for MeddyNet",
};

import { Providers } from "./providers";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-main-text bg-surface">
        <Providers>
          <AdminAuthGuard>
            {children}
          </AdminAuthGuard>
        </Providers>
      </body>
    </html>
  );
}

