"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-emerald-50 border-emerald-100",
    error: "bg-red-50 border-red-100",
    info: "bg-blue-50 border-blue-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-10001 flex items-center gap-3 px-6 py-4 rounded-full border shadow-[0_20px_50px_rgba(0,0,0,0.4)] min-w-[320px] ${bgColors[type]}`}
    >
      <div className="shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-black text-dark-light">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <X className="w-4 h-4 text-text-muted" />
      </button>
    </motion.div>
  );
}
