"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return <div className="min-h-screen bg-surface flex items-center justify-center font-sans">
    <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 relative">
            <Image src="/icon.png" alt="MeddyNet" width={48} height={48} className="w-full h-full object-contain" />
        </div>
        <div className="text-xl font-black text-dark-light tracking-tight">Meddy<span className="text-primary">Net</span></div>
    </div>
  </div>;
}