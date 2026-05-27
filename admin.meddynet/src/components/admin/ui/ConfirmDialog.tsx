"use client";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, description, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false
}: ConfirmDialogProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-muted hover:text-main-text bg-card border border-border-dim rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm active:scale-95 ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full shrink-0 flex items-center justify-center w-12 h-12 shadow-sm ${isDestructive ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="text-sm text-muted flex-1 leading-relaxed mt-1 font-medium">{description}</p>
      </div>
    </Modal>
  );
}
