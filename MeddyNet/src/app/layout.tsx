import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
export const metadata: Metadata = {
  title: "MeddyNet – Find, Compare & Book Diagnostic Tests Near You",
  description:
    "MeddyNet is India's trusted diagnostics discovery and booking platform. Find nearby pathology labs, compare test prices, book home sample collection, and store digital health records.",
  keywords: [
    "diagnostics",
    "pathology lab",
    "blood test",
    "book lab test",
    "home sample collection",
    "health checkup",
    "MeddyNet",
  ],
  openGraph: {
    title: "MeddyNet – India’s Smart Health Network",
    description:
      "Find, compare, and book medical tests near you. Home sample collection, digital reports, and more.",
    type: "website",
    locale: "en_IN",
    url: "https://meddynet.com",
    siteName: "MeddyNet",
  },
};

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Providers } from "./providers";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased selection:bg-teal-100 selection:text-teal-900" suppressHydrationWarning>
        <Providers>
          <AuthGuard>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthGuard>
          <Script
             id="razorpay-checkout"
             src="https://checkout.razorpay.com/v1/checkout.js"
             strategy="lazyOnload"
          />
        </Providers>
      </body>
    </html>
  );
}

