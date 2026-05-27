"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  User,
  TestTube2,
  Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import BookingActions from "@/components/dashboard/BookingActions";
import Toast from "@/components/ui/Toast";
import { useLabBookings, useUpdateBookingStatus } from "@/lib/hooks";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);

  const { data: bookingsArray, isLoading } = useLabBookings();
  const updateStatusMutation = useUpdateBookingStatus();

  // Normalize API backend format to expected UI format
  const bookings = useMemo(() => {
    if (!bookingsArray) return [];
    return bookingsArray.map((b: any) => {
        const d = new Date(b.scheduled_at);
        return {
            id: b.id,
            patient: b.patient_name || "Unknown Patient",
            tests: b.items ? b.items.map((i: any) => i.name) : ["Diagnostic Test"],
            date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: b.status,
            type: b.type === "home_collection" ? "Home" : "Lab",
            rawStatus: b.status,
            price: `₹${((b.total_amount || 0) / 100).toLocaleString()}`,
            paymentStatus: b.payment_status || "Pending",
            raw: b
        };
    });
  }, [bookingsArray]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking: any) => {
      const matchesSearch = booking.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            booking.tests.some((t: any) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTab = activeTab === "All Bookings" || 
                         (activeTab === "Today" && booking.date.includes("Today")) ||
                         (activeTab === "Upcoming" && booking.date.includes("Tomorrow")) ||
                         (activeTab === "Home Visits" && booking.type === "Home");
                         
      return matchesSearch && matchesTab;
    });
  }, [bookings, searchTerm, activeTab]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId: id, status: newStatus.toLowerCase().replace(/ /g, '_') });
      setToast({ message: `Status updated successfully`, type: "success" });
    } catch {
      setToast({ message: `Failed to update status`, type: "error" });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId: id, status: "cancelled" });
      setToast({ message: `Booking cancelled successfully`, type: "success" });
    } catch {
      setToast({ message: `Failed to cancel booking`, type: "error" });
    }
  };

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-black text-text-muted uppercase tracking-widest animate-pulse">Syncing Lab Bookings...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark-light tracking-tight mb-2">Bookings Management</h1>
          <p className="text-text-muted font-bold">Track and manage your diagnostic appointments.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
         <div className="flex p-1 sm:p-1.5 bg-white border border-border-dark rounded-full shadow-sm overflow-x-auto no-scrollbar max-w-full sm:max-w-max">
            {["All Bookings", "Today", "Upcoming", "Home Visits"].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab ? "bg-dark text-white shadow-xl shadow-black/10" : "text-text-muted hover:bg-surface"
                 }`}
               >
                  {tab}
               </button>
            ))}
         </div>
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by patient, ID or test..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-border-dark rounded-full pl-14 pr-6 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm"
            />
         </div>
      </div>

      {/* Bookings List */}
      <div className="grid gap-6">
         <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? filteredBookings.map((booking: any) => (
              <motion.div 
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-5xl border border-border-dark/20 shadow-xl shadow-black/2 group hover:border-primary/20 transition-all relative"
              >
                  <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                    <div className="flex items-center gap-4 sm:gap-6">
                       <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-surface flex items-center justify-center text-primary shadow-inner group-hover:bg-primary/5 transition-colors">
                          <User className="w-6 h-6 sm:w-8 sm:h-8" />
                       </div>
                       <div>
                          <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest mb-1">{booking.id.slice(0, 8)}</p>
                          <h3 className="text-lg sm:text-xl font-black text-dark-light tracking-tight">{booking.patient}</h3>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 flex-1 px-0 sm:px-8 border-y sm:border-y-0 border-border-dark/10 py-4 sm:py-0">
                       <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Tests</p>
                          <p className="text-xs sm:text-sm font-black text-dark-light truncate">
                            {booking.tests.join(", ")}
                          </p>
                       </div>
                       <div>
                          <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Schedule</p>
                          <p className="text-xs sm:text-sm font-black text-dark-light">{booking.date}</p>
                          <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase">{booking.time}</p>
                       </div>
                       <div>
                          <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Status</p>
                          <span className={`px-2.5 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest inline-block ${
                            booking.status.toLowerCase() === "sample_collected" || booking.status.toLowerCase() === "sample collected" ? "bg-emerald-100 text-emerald-600 border border-emerald-200" :
                            booking.status.toLowerCase() === "confirmed" ? "bg-blue-100 text-blue-600 border border-blue-200" :
                            booking.status.toLowerCase() === "assigned" ? "bg-indigo-100 text-indigo-600 border border-indigo-200" :
                            "bg-amber-100 text-amber-600 border border-amber-200"
                          }`}>
                            {booking.status.replace(/_/g, ' ')}
                          </span>
                       </div>
                       <div>
                          <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-xs sm:text-sm font-black text-dark-light">{booking.price}</p>
                          <p className={`text-[9px] font-black uppercase tracking-tighter ${booking.paymentStatus.toLowerCase() === 'paid' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                             {booking.paymentStatus.toLowerCase() === 'paid' ? '● PAID' : '○ PENDING'}
                          </p>
                       </div>
                       <div>
                          <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Type</p>
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${booking.type === "Home" ? "bg-orange-500" : "bg-blue-500"}`} />
                             <span className="text-xs sm:text-sm font-black text-dark-light">{booking.type} Visit</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                       <BookingActions 
                         bookingId={booking.id} 
                         patientName={booking.patient} 
                         booking={booking.raw}
                         variant="button"
                         onStatusUpdate={handleStatusUpdate}
                         onCancel={handleCancel}
                       />
                    </div>
                  </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                   <TestTube2 className="w-10 h-10 text-text-muted opacity-20" />
                </div>
                <h3 className="text-xl font-black text-dark-light mb-2">No bookings found</h3>
                <p className="text-text-muted font-bold text-sm">Try adjusting your filters or search term.</p>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
