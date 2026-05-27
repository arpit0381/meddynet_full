"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  RefreshCcw,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  User,
  TestTube2,
  XCircle,
  AlertCircle,
  CheckCircle2,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";

interface BookingActionsProps {
  bookingId: string;
  variant?: "icon" | "button";
  patientName?: string;
  onStatusUpdate?: (id: string, newStatus: string) => void;
  onCancel?: (id: string) => void;
}

export default function BookingActions({
  bookingId,
  variant = "icon",
  patientName = "Amit Roy",
  onStatusUpdate,
  onCancel
}: BookingActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"view" | "status" | "cancel" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions = [
    { id: "view", label: "View Details", icon: Eye, color: "text-blue-600", bg: "hover:bg-blue-50" },
    { id: "chat", label: "Chat with Lab", icon: MessageCircle, color: "text-primary", bg: "hover:bg-primary/5" },
    { id: "status", label: "Update Status", icon: RefreshCcw, color: "text-amber-600", bg: "hover:bg-amber-50" },
    { id: "cancel", label: "Cancel Booking", icon: ShieldAlert, color: "text-red-600", bg: "hover:bg-red-50" },
  ];

  const handleAction = (actionId: "view" | "status" | "cancel" | "chat") => {
    if (actionId === "chat") {
      router.push(`/dashboard/chat/${bookingId}`);
    } else {
      setActiveModal(actionId);
    }
    setIsOpen(false);
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(bookingId, newStatus);
    }
    setActiveModal(null);
  };

  const handleConfirmCancel = () => {
    if (onCancel) {
      onCancel(bookingId);
    }
    setActiveModal(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === "icon" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-xl transition-all ${isOpen ? "bg-surface text-primary" : "hover:bg-surface text-text-muted"
            }`}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-8 py-3.5 rounded-full bg-dark text-white text-xs font-black shadow-lg hover:bg-dark-light transition-all flex items-center gap-2 ${isOpen ? "ring-4 ring-primary/20" : ""
            }`}
        >
          Actions
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-border-dark shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-border-dark/50 bg-surface/50">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-3">
                Booking Ref: {bookingId}
              </span>
            </div>
            <div className="p-1.5">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id as "view" | "status" | "cancel" | "chat")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${action.bg} group`}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="text-xs font-bold text-dark-light">{action.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals --- */}

      {/* View Details Modal */}
      <Modal
        isOpen={activeModal === "view"}
        onClose={() => setActiveModal(null)}
        title="Booking Information"
      >
        <div className="p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-surface flex items-center justify-center text-primary shadow-inner">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-light">{patientName}</h3>
                <p className="text-text-muted font-bold">Patient ID: PR-22045</p>
              </div>
            </div>
            <div className="px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-100">
              PAID
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 p-6 rounded-3xl bg-surface border border-border-dark/10">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Appointment Date</span>
              <p className="text-sm font-bold text-dark-light">Today, 18 March 2026</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Time Slot</span>
              <p className="text-sm font-bold text-dark-light">08:30 AM - 09:00 AM</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Test Type</span>
              <p className="text-sm font-bold text-dark-light">Home Collection</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Amount</span>
              <p className="text-sm font-bold text-primary">₹1,450.00</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-dark-light tracking-tight">Prescribed Tests</h4>
            <div className="space-y-3">
              {["Lipid Profile", "CBC (Complete Blood Count)"].map((test) => (
                <div key={test} className="flex items-center gap-3 p-4 rounded-2xl border border-border-dark/20 bg-white">
                  <TestTube2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-dark-light">{test}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button className="flex-1 py-4 rounded-full bg-dark text-white font-black text-sm shadow-xl hover:shadow-primary/20 transition-all">
              Download Prescription
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="px-8 py-4 rounded-full bg-surface text-text-muted font-black text-sm hover:bg-border-dark/10 transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={activeModal === "status"}
        onClose={() => setActiveModal(null)}
        title="Change Booking Status"
        maxWidth="max-w-md"
      >
        <div className="p-8 space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-1 shrink-0" />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              Updating the status will notify the patient via SMS and Email. Make sure the action is confirmed.
            </p>
          </div>

          <div className="space-y-2">
            {[
              { label: "Pending", color: "bg-surface text-text-muted", icon: Clock },
              { label: "Confirmed", color: "bg-amber-100 text-amber-600", icon: Clock },
              { label: "On Route", color: "bg-blue-100 text-blue-600", icon: RefreshCcw },
              { label: "Arrived", color: "bg-emerald-100 text-emerald-600", icon: CheckCircle2 },
              { label: "Sample Collected", color: "bg-blue-100 text-blue-600", icon: TestTube2 },
              { label: "Completed", color: "bg-emerald-100 text-emerald-600", icon: CheckCircle2 },
            ].map((status) => (
              <button
                key={status.label}
                onClick={() => handleStatusChange(status.label)}
                className="w-full flex items-center justify-between p-4 rounded-full border-2 border-transparent hover:border-primary/20 hover:bg-surface transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${status.color}`}>
                    <status.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-dark-light">{status.label}</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-border-dark group-hover:border-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={activeModal === "cancel"}
        onClose={() => setActiveModal(null)}
        title="Cancel Booking"
        maxWidth="max-w-md"
      >
        <div className="p-8 text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-xl shadow-red-500/10">
            <XCircle className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-dark-light mb-2">Are you absolutely sure?</h3>
            <p className="text-text-muted font-bold text-sm px-4">
              This action will cancel the booking <span className="text-red-500 font-black">{bookingId}</span> for <span className="text-dark font-black">{patientName}</span>. This cannot be undone.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirmCancel}
              className="py-4 rounded-full bg-red-500 text-white font-black text-sm shadow-xl shadow-red-500/20 hover:bg-red-600 hover:-translate-y-1 transition-all"
            >
              Confirm Cancellation
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="py-4 rounded-full bg-surface text-text-muted font-black text-sm hover:bg-border-dark/10 transition-all"
            >
              Keep Booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
////////////////