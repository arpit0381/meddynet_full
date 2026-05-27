"use client";

import { useState, useRef, useEffect } from "react";
import { 
  MoreVertical, 
  Eye, 
  RefreshCcw, 
  XCircle, 
  ChevronRight,
  Clock,
  User,
  TestTube2,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useLabTechnicians, useAssignTechnician } from "@/lib/hooks";

interface BookingActionsProps {
  bookingId: string;
  variant?: "icon" | "button";
  patientName?: string;
  booking?: {
    scheduled_at?: string;
    type?: string;
    total_amount?: number;
    items?: { id: string; name: string; price: number }[];
  };
  onStatusUpdate?: (id: string, newStatus: string) => void;
  onCancel?: (id: string) => void;
}

export default function BookingActions({ 
  bookingId, 
  variant = "icon", 
  patientName = "Patient",
  booking,
  onStatusUpdate,
  onCancel 
}: BookingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"view" | "status" | "cancel" | "tech" | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showTechConfirm, setShowTechConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: technicians } = useLabTechnicians();
  const assignTechMutation = useAssignTechnician();

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
    { id: "tech", label: "Assign Technician", icon: User, color: "text-indigo-600", bg: "hover:bg-indigo-50" },
    { id: "status", label: "Update Status", icon: RefreshCcw, color: "text-amber-600", bg: "hover:bg-amber-50" },
    { id: "cancel", label: "Cancel Booking", icon: XCircle, color: "text-red-600", bg: "hover:bg-red-50" },
  ];

  const handleAction = (actionId: "view" | "status" | "cancel" | "tech") => {
    setActiveModal(actionId);
    setIsOpen(false);
  };

  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
    // Don't close the status picker modal yet, so user can see what they picked
  };

  const handleConfirmStatusChange = () => {
    if (onStatusUpdate && pendingStatus) {
      onStatusUpdate(bookingId, pendingStatus);
    }
    setPendingStatus(null);
    setShowStatusConfirm(false);
    setActiveModal(null);
  };

  const handleTechAssign = (techId: string) => {
    setSelectedTechId(techId);
    setShowTechConfirm(true);
  };

  const handleConfirmTechAssign = async () => {
    if (selectedTechId) {
      try {
        await assignTechMutation.mutateAsync({ bookingId, techId: selectedTechId });
      } catch (err) {
        console.error("Failed to assign tech", err);
      }
    }
    setSelectedTechId(null);
    setShowTechConfirm(false);
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
          suppressHydrationWarning
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full transition-all ${
            isOpen ? "bg-surface text-primary" : "hover:bg-surface text-text-muted"
          }`}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      ) : (
        <button 
          suppressHydrationWarning
          onClick={() => setIsOpen(!isOpen)}
          className={`px-8 py-3.5 rounded-full bg-dark text-white text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-dark-light transition-all flex items-center gap-3 border border-white/10 ${
            isOpen ? "ring-4 ring-primary/20 scale-95" : "hover:-translate-y-0.5"
          }`}
        >
          Actions
          <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute right-0 top-full mt-4 w-60 bg-white rounded-4xl border border-border-dark/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border-dark/10 bg-surface/30 px-6">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                {bookingId}
              </p>
            </div>
            <div className="p-3 space-y-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id as "view" | "status" | "cancel" | "tech")}
                  className={`w-full flex items-center justify-between p-4 rounded-full transition-all ${action.bg} group border border-transparent hover:border-border-dark/10`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl ${action.bg} flex items-center justify-center`}>
                       <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <span className="text-xs font-black text-dark-light uppercase tracking-wider">{action.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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
                 <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-primary shadow-inner">
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

           <div className="grid grid-cols-2 gap-6 p-6 rounded-4xl bg-surface border border-border-dark/10">
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Appointment Date</span>
                 <p className="text-sm font-bold text-dark-light">{booking?.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : "N/A"}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Time Slot</span>
                 <p className="text-sm font-bold text-dark-light">{booking?.scheduled_at ? new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Booking Type</span>
                 <p className="text-sm font-bold text-dark-light">{booking?.type || "Standard"}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Amount</span>
                 <p className="text-sm font-bold text-primary">₹{((booking?.total_amount || 0) / 100).toLocaleString()}</p>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-sm font-black text-dark-light tracking-tight">Prescribed Tests</h4>
              <div className="space-y-3">
                 {booking?.items ? booking.items.map((test: { id: string; name: string; price: number }) => (
                    <div key={test.id} className="flex items-center justify-between p-4 rounded-full border border-border-dark/20 bg-white px-6">
                       <div className="flex items-center gap-3">
                        <TestTube2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-dark-light">{test.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-text-muted">₹{(test.price / 100).toLocaleString()}</span>
                    </div>
                 )) : (
                    <div className="text-sm text-text-muted font-bold italic">No tests specified</div>
                 )}
              </div>
           </div>

           <div className="pt-4 flex gap-3">
              <button className="flex-1 py-4 rounded-full bg-dark text-white font-black text-sm shadow-xl hover:shadow-primary/20 transition-all">
                 Download Prescription
              </button>
              <button 
                onClick={() => setActiveModal(null)}
                className="px-8 py-4 rounded-full bg-surface text-text-muted font-black text-sm hover:bg-border-dark/10 transition-all"
              >
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
           <div className="p-4 rounded-4xl bg-amber-50 border border-amber-200 flex items-start gap-4 px-6 text-center">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-1 shrink-0" />
              <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-widest">
                 Updating the status will notify the patient via SMS and Email.
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
                   className="w-full flex items-center justify-between p-4 rounded-full border-2 border-transparent hover:border-primary/20 hover:bg-surface transition-all group px-6"
                 >
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-full ${status.color}`}>
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

      {/* Assign Technician Modal */}
      <Modal
        isOpen={activeModal === "tech"}
        onClose={() => setActiveModal(null)}
        title="Assign Technician"
        maxWidth="max-w-md"
      >
        <div className="p-8 space-y-6">
           <div className="flex flex-col gap-3">
              {technicians?.map((tech: { id: string; name: string; status: string }) => (
                 <button 
                   key={tech.id}
                   onClick={() => handleTechAssign(tech.id)}
                   className="w-full flex items-center justify-between p-4 rounded-3xl border border-border-dark/20 hover:border-primary hover:bg-primary/5 transition-all group px-6"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary">
                          <User className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-dark-light">{tech.name}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tech.status}</p>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                 </button>
              ))}
              {(!technicians || technicians.length === 0) && (
                <div className="text-center py-6">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No technicians found in your fleet</p>
                </div>
              )}
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

      <ConfirmationModal
        isOpen={showStatusConfirm}
        onClose={() => {
          setShowStatusConfirm(false);
          setPendingStatus(null);
        }}
        onConfirm={handleConfirmStatusChange}
        title="Update Booking Status"
        message={`Are you sure you want to change the status of booking ${bookingId} to "${pendingStatus}"? The patient will be notified immediately.`}
        confirmText="Confirm Status Update"
        type="warning"
      />

      <ConfirmationModal
        isOpen={showTechConfirm}
        onClose={() => {
          setShowTechConfirm(false);
          setSelectedTechId(null);
        }}
        onConfirm={handleConfirmTechAssign}
        title="Confirm Assignment"
        message={`Assign ${technicians?.find((t: { id: string; name: string }) => t.id === selectedTechId)?.name} to this booking? They will be notified to start the collection process.`}
        confirmText="Assign Now"
        type="info"
      />
    </div>
  );
}
