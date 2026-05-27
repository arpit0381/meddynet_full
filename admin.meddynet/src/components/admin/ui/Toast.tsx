"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const icons = {
  success: <CheckCircle2 className="text-green-500" size={20} />,
  error: <XCircle className="text-red-500" size={20} />,
  warning: <AlertCircle className="text-amber-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />
};

export function Toast({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-4 min-w-[320px] max-w-sm flex items-start gap-4 pointer-events-auto"
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-main-text">{toast.title}</p>
        {toast.message && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{toast.message}</p>}
      </div>
      <button onClick={() => onClose(toast.id)} className="text-gray-400 hover:text-gray-600 shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastMessage[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
