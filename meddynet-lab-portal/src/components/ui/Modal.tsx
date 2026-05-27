"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-scrollbar">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark/60 backdrop-blur-md z-0"
          />
          
          {/* Modal Content container */}
          <div className="relative flex min-h-full items-center justify-center w-full z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full ${maxWidth} bg-white rounded-t-5xl sm:rounded-5xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 mt-auto sm:mt-0`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-10 border-b border-border-dark/5">
                <h2 className="text-lg sm:text-2xl font-black text-dark-light tracking-tight">{title}</h2>
                <button 
                  onClick={onClose}
                  className="p-3.5 rounded-full bg-surface hover:bg-border-dark/10 text-text-muted transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[75vh] overflow-y-auto no-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
