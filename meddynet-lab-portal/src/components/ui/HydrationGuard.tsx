"use client";

/**
 * HydrationGuard — renders children immediately.
 * suppressHydrationWarning handles browser-extension-caused mismatches
 * without blocking the initial render with a null/spinner flash.
 */
export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  return <div suppressHydrationWarning>{children}</div>;
}
