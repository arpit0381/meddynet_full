"use client";

import { motion } from "framer-motion";
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Info,
  ArrowRight
} from "lucide-react";
import Modal from "./Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger" | "success";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isLoading = false
}: ConfirmationModalProps) {
  
  const getConfig = () => {
    switch (type) {
      case "danger":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          iconBg: "bg-red-50",
          buttonBg: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
          borderColor: "border-red-100"
        };
      case "warning":
        return {
          icon: AlertCircle,
          iconColor: "text-amber-500",
          iconBg: "bg-amber-50",
          buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
          borderColor: "border-amber-100"
        };
      case "success":
        return {
          icon: CheckCircle2,
          iconColor: "text-emerald-500",
          iconBg: "bg-emerald-50",
          buttonBg: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
          borderColor: "border-emerald-100"
        };
      default:
        return {
          icon: Info,
          iconColor: "text-primary",
          iconBg: "bg-primary/10",
          buttonBg: "bg-dark hover:bg-dark-light shadow-primary/20",
          borderColor: "border-primary/10"
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      maxWidth="max-w-md"
    >
      <div className="p-8 text-center space-y-8">
        <div className={`w-24 h-24 rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center mx-auto shadow-2xl transition-transform duration-500 animate-in zoom-in-50`}>
          <Icon className="w-12 h-12" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-dark-light tracking-tight">{title}</h3>
          <p className="text-text-muted font-bold text-sm px-4 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            disabled={isLoading}
            onClick={onConfirm}
            className={`group relative overflow-hidden py-4 rounded-full ${config.buttonBg} text-white font-black text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                />
              ) : (
                <>
                  {confirmText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
          
          <button 
            disabled={isLoading}
            onClick={onClose}
            className="py-4 rounded-full bg-surface text-text-muted font-black text-sm hover:bg-border-dark/10 transition-all active:scale-95"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
