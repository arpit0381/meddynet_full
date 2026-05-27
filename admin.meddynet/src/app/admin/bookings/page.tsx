"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, RefreshCw } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useAdminBookings } from "@/lib/hooks";
import { toast } from "sonner";

interface Booking {
  id: string;
  patient: string;
  phone: string;
  lab: string;
  city: string;
  tests: string;
  dateTime: string;
  type: "Home" | "Lab";
  amount: string;
  status: "Pending" | "Confirmed" | "Sample Collected" | "Processing" | "Completed" | "Cancelled" | "Refunded";
}

interface RawBooking {
  id: string;
  patient_name: string;
  phone?: string;
  lab_name: string;
  city?: string;
  scheduled_at: string;
  type: string;
  total_amount: number;
  status: string;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingModal, setBookingModal] = useState<{isOpen: boolean, type: 'create' | 'edit', booking: Booking | null}>({isOpen: false, type: 'create', booking: null});
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, bookingId: string | null}>({isOpen: false, bookingId: null});
  const [refundModal, setRefundModal] = useState<{isOpen: boolean, booking: Booking | null}>({isOpen: false, booking: null});

  const { data: rawBookings, isLoading } = useAdminBookings();
  
  const bookings: Booking[] = (rawBookings || []).map((b: RawBooking) => {
    const dateObj = new Date(b.scheduled_at);
    return {
      id: b.id,
      patient: b.patient_name,
      phone: b.phone || "N/A",
      lab: b.lab_name,
      city: b.city || "N/A",
      tests: "Diagnostic Package",
      dateTime: `${dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      type: b.type === "home_collection" ? "Home" : "Lab",
      amount: `₹${(b.total_amount / 100).toLocaleString()}`,
      status: (b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('_', ' ')) as Booking["status"]
    };
  });

  const columns: Column<Booking>[] = [
    { header: "Booking ID", accessor: (b) => <span className="font-black text-main-text uppercase tracking-widest text-xs">{b.id}</span> },
    { header: "Patient", accessor: (b) => <div><p className="font-bold text-main-text uppercase tracking-tight">{b.patient}</p><p className="text-[10px] text-muted font-black uppercase tracking-widest mt-0.5">{b.phone}</p></div> },
    { header: "Lab", accessor: (b) => <div><p className="font-bold text-main-text uppercase tracking-tight">{b.lab}</p><p className="text-[10px] text-muted font-black uppercase tracking-widest mt-0.5">{b.city}</p></div> },
    { header: "Tests", accessor: "tests" },
    { header: "Date & Time", accessor: (b) => <span className="text-xs font-bold text-main-text/80">{b.dateTime}</span> },
    { header: "Type", accessor: (b) => <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${b.type === 'Home' ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'bg-accent/10 text-accent border-accent/20'}`}>{b.type} Visit</span> },
    { header: "Amount", accessor: "amount" },
    { header: "Status", accessor: (b) => <StatusBadge status={b.status === 'Completed' ? 'success' : b.status === 'Cancelled' ? 'error' : b.status === 'Refunded' ? 'error' : 'warning'} label={b.status} /> },
    {
      header: "Action",
      accessor: (b) => (
        <div className="flex items-center justify-end gap-2 text-muted">
          <button onClick={(e) => { e.stopPropagation(); setBookingModal({isOpen: true, type: 'edit', booking: b}); }} title="Edit Booking" className="p-1.5 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"><Edit2 size={16}/></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteDialog({isOpen: true, bookingId: b.id}); }} title="Delete Booking" className="p-1.5 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-dim pb-4 transition-colors">
        <h1 className="text-2xl font-black text-main-text tracking-tight uppercase">All Bookings</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 border-b border-transparent">
            {["All", "Today", "Home Visits", "Lab Visits", "Escalated"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? "border-b-4 border-primary text-primary" : "text-muted hover:text-main-text"} hidden md:inline-block`}>
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => setBookingModal({isOpen: true, type: 'create', booking: null})} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">
            <Plus size={16} /> Add Booking
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <DataTable data={bookings.filter(b => activeTab === 'All' || (activeTab === 'Today') || (activeTab === 'Home Visits' && b.type === 'Home') || (activeTab === 'Lab Visits' && b.type === 'Lab') || activeTab === 'Escalated')} columns={columns} onRowClick={setSelectedBooking} searchable />
      )}

      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title={`Booking Details - ${selectedBooking?.id}`}>
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div><p className="text-[10px] text-muted mb-1.5 font-black uppercase tracking-widest">Patient</p><p className="font-black text-main-text uppercase tracking-tight">{selectedBooking.patient}</p><p className="text-xs text-muted font-bold tracking-widest">{selectedBooking.phone}</p></div>
               <div><p className="text-[10px] text-muted mb-1.5 font-black uppercase tracking-widest">Status</p><StatusBadge status={selectedBooking.status === 'Completed' ? 'success' : selectedBooking.status === 'Cancelled' ? 'error' : selectedBooking.status === 'Refunded' ? 'error' : 'warning'} label={selectedBooking.status} /></div>
            </div>
             <div className="bg-surface border border-primary/20 p-5 rounded-2xl shadow-sm">
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Payment Breakdown</p>
               <div className="flex justify-between items-center py-2 border-b border-primary/10"><span className="text-xs font-bold text-muted uppercase tracking-tight">Total Charged</span><span className="font-black text-main-text text-lg">{selectedBooking.amount}</span></div>
               <div className="mt-6 flex gap-3">
                  {selectedBooking.status !== 'Refunded' && selectedBooking.status !== 'Completed' && (
                    <button 
                      onClick={() => setRefundModal({isOpen: true, booking: selectedBooking})}
                      className="flex-1 px-4 py-2.5 bg-card border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
                    >
                      Initiate Refund
                    </button>
                  )}
                  <button className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md active:scale-95">Reschedule</button>
               </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={refundModal.isOpen} 
        onClose={() => setRefundModal({isOpen: false, booking: null})} 
        title="Initiate Refund"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button onClick={() => setRefundModal({isOpen: false, booking: null})} className="px-5 py-2.5 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
            <button 
              onClick={() => {
                if (refundModal.booking) {
                  toast.success(`Refund initiated for ${refundModal.booking.id}`);
                  setRefundModal({isOpen: false, booking: null});
                  setSelectedBooking(null);
                }
              }}
              className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95"
            >
              Process Refund
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-muted uppercase tracking-tight">You are initiating a refund for <b className="text-main-text tracking-widest">{refundModal.booking?.id}</b>.</p>
          <div>
            <label className="text-[10px] font-black text-muted uppercase block mb-1.5 tracking-widest">Refund Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-black">₹</span>
              <input type="text" defaultValue={refundModal.booking?.amount.replace('₹', '')} className="w-full pl-8 pr-4 py-3 bg-input border border-border-dim rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none font-black text-main-text transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-muted uppercase block mb-1.5 tracking-widest">Reason for Refund</label>
            <select className="w-full p-3 bg-input border border-border-dim rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-[10px] font-black uppercase tracking-widest text-main-text appearance-none transition-all">
              <option>Patient cancelled - within policy</option>
              <option>Lab unavailable</option>
              <option>Technician didn&apos;t arrive</option>
              <option>Test results delayed</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal isOpen={bookingModal.isOpen} onClose={() => setBookingModal({isOpen: false, type: 'create', booking: null})} title={bookingModal.type === 'create' ? "Create Booking" : "Edit Booking Details"} footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={() => setBookingModal({isOpen: false, type: 'create', booking: null})} className="px-5 py-2.5 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text transition-all">Cancel</button>
          <button onClick={() => {
            if (bookingModal.type === 'create') {
               toast.success("Booking created successfully.");
            } else if (bookingModal.type === 'edit' && bookingModal.booking) {
               toast.success("Booking updated successfully.");
            }
            setBookingModal({isOpen: false, type: 'create', booking: null});
          }} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">Save Booking</button>
        </div>
      }>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block">Patient Name</label><input type="text" defaultValue={bookingModal.booking?.patient} onChange={(e) => setBookingModal({...bookingModal, booking: {...(bookingModal.booking as Booking), patient: e.target.value}})} className="w-full p-3 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block">Status</label>
              <select value={bookingModal.booking?.status || 'Pending'} onChange={(e) => setBookingModal({...bookingModal, booking: {...(bookingModal.booking as Booking), status: e.target.value as Booking["status"]}})} className="w-full p-3 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-[10px] font-black uppercase tracking-widest text-main-text appearance-none transition-all">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Sample Collected">Sample Collected</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block">Lab Partner</label><input type="text" defaultValue={bookingModal.booking?.lab} onChange={(e) => setBookingModal({...bookingModal, booking: {...(bookingModal.booking as Booking), lab: e.target.value}})} className="w-full p-3 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block">Amount</label><input type="text" defaultValue={bookingModal.booking?.amount} onChange={(e) => setBookingModal({...bookingModal, booking: {...(bookingModal.booking as Booking), amount: e.target.value}})} className="w-full p-3 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all" /></div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, bookingId: null})}
        title="Delete Booking"
        description="Are you sure you want to delete this booking record? It will be removed from the lab&apos;s interface as well."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
           toast.success("Booking deleted successfully.");
           setDeleteDialog({isOpen: false, bookingId: null});
        }}
      />
    </div>
  );
}
