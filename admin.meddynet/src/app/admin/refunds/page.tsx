"use client";
import { useState, useMemo } from "react";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { PermissionGate } from "@/components/admin/ui/PermissionGate";
import { mockRefunds, Refund } from "@/data/financials";
import { RotateCcw, Eye, CheckCircle2, XCircle, Clock, DollarSign } from "lucide-react";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>(mockRefunds);
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected" | "All">("Pending");
  const [reviewModal, setReviewModal] = useState<Refund | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [partialAmount, setPartialAmount] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: "Approved" | "Rejected" | null; id: string | null }>({ isOpen: false, action: null, id: null });

  const filtered = useMemo(() => activeTab === "All" ? refunds : refunds.filter(r => r.status === activeTab), [refunds, activeTab]);
  
  const counts = {
    pending: refunds.filter(r => r.status === "Pending").length,
    approved: refunds.filter(r => r.status === "Approved").length,
    rejected: refunds.filter(r => r.status === "Rejected").length,
    totalAmount: refunds.filter(r => r.status === "Approved").reduce((s, r) => s + (r.partialAmount || r.amount), 0),
  };

  const processRefund = (id: string, action: "Approved" | "Rejected") => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: action, resolvedAt: new Date().toISOString(), adminNotes, partialAmount: action === "Approved" && partialAmount ? +partialAmount : null } : r));
    setReviewModal(null);
    setAdminNotes("");
    setPartialAmount("");
  };

  const columns: Column<Refund>[] = [
    { header: "Protocol ID", accessor: (r) => <span className="font-mono text-[10px] font-black text-muted/50 uppercase tracking-widest">{r.id}</span> },
    { header: "Object Link", accessor: (r) => <span className="font-mono text-[10px] text-primary font-black uppercase tracking-tighter italic border-b border-primary/20">{r.bookingId}</span> },
    { header: "Entity (Patient)", accessor: (r) => <span className="font-black text-main-text text-[13px] uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{r.patientName}</span> },
    { header: "Institutional Source", accessor: (r) => <span className="text-[11px] font-bold text-muted uppercase tracking-tighter opacity-80 italic">{r.labName}</span> },
    { header: "Magnitude", accessor: (r) => <span className="font-black text-main-text text-sm uppercase italic">₹{r.amount.toLocaleString()}</span> },
    { header: "Justification", accessor: (r) => <span className="text-[10px] font-black text-muted/60 max-w-[140px] block truncate uppercase tracking-widest italic" title={r.reason}>{r.reason}</span> },
    { header: "Channel", accessor: (r) => <StatusBadge status="neutral" label={r.paymentMethod.toUpperCase()} /> },
    { header: "Audit Cycle", accessor: (r) => <span className="font-mono text-[10px] text-muted/50 uppercase">{new Date(r.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span> },
    { header: "Operational State", accessor: (r) => <StatusBadge status={r.status === "Approved" ? "success" : r.status === "Rejected" ? "error" : r.status === "Partial" ? "info" : "warning"} label={r.status.toUpperCase()} /> },
    {
      header: "Actions",
      accessor: (r) => (
        <div className="flex items-center justify-end gap-1.5 text-muted">
          <button onClick={(e) => { e.stopPropagation(); setReviewModal(r); setAdminNotes(r.adminNotes); }} className="p-2 hover:text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-95" title="Audit Protocol"><Eye size={16} /></button>
          {r.status === "Pending" && (
            <>
              <PermissionGate permission="can_approve_refund">
                <button onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, action: "Approved", id: r.id }); }} className="p-2 hover:text-green-600 hover:bg-green-500/10 rounded-xl transition-all active:scale-95" title="Authorize Reversal"><CheckCircle2 size={16} /></button>
              </PermissionGate>
              <PermissionGate permission="can_reject_refund">
                <button onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, action: "Rejected", id: r.id }); }} className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95" title="Decline Protocol"><XCircle size={16} /></button>
              </PermissionGate>
            </>
          )}
        </div>
      )
    },
];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border-dim pb-8 transition-all">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tighter uppercase italic">Refund Operations</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-2 opacity-60">Audit and authorize institutional liquidity reversals</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending" value={String(counts.pending)} icon={Clock} />
        <StatCard title="Approved MTD" value={String(counts.approved)} icon={CheckCircle2} />
        <StatCard title="Rejected MTD" value={String(counts.rejected)} icon={XCircle} />
        <StatCard title="Amount Refunded" value={`₹${(counts.totalAmount / 1000).toFixed(1)}k`} icon={DollarSign} />
      </div>

      <div className="flex bg-surface p-1.5 rounded-2xl w-fit border border-border-dim shadow-xl ring-1 ring-black/5 dark:ring-white/5">
        {(["Pending", "Approved", "Rejected", "All"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeTab === tab ? "bg-card shadow-lg text-primary border border-border-dim" : "text-muted hover:text-main-text"}`}>{tab}</button>
        ))}
      </div>

      <DataTable data={filtered} columns={columns} searchable />

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title={`Review Refund: ${reviewModal?.id}`}
        footer={reviewModal?.status === "Pending" ? (
          <div className="flex justify-between w-full gap-4 p-2 bg-surface/50 rounded-3xl border border-border-dim shadow-inner backdrop-blur-md">
            <div className="flex items-center gap-4 flex-1">
              <input type="number" value={partialAmount} onChange={e => setPartialAmount(e.target.value)} className="w-32 p-4 bg-card border border-border-dim rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-primary/10 tracking-widest transition-all" placeholder={`MAX ₹${reviewModal?.amount}`} />
              <span className="text-[9px] font-black text-muted uppercase tracking-tighter opacity-40 italic">ADJUSTABLE REVERSAL MAGNITUDE</span>
            </div>
            <div className="flex gap-3">
              <PermissionGate permission="can_reject_refund">
                <button onClick={() => processRefund(reviewModal!.id, "Rejected")} className="px-6 py-3.5 text-[10px] font-black text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/20 active:scale-95 transition-all uppercase tracking-widest">Reject</button>
              </PermissionGate>
              <PermissionGate permission="can_approve_refund">
                <button onClick={() => processRefund(reviewModal!.id, "Approved")} className="px-6 py-3.5 text-[10px] font-black text-white bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest leading-none">{partialAmount ? `Approve ₹${partialAmount}` : "Release Full"}</button>
              </PermissionGate>
            </div>
          </div>
        ) : undefined}
      >
        {reviewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[["Patient", reviewModal.patientName], ["Lab", reviewModal.labName], ["Booking ID", reviewModal.bookingId], ["Amount", `₹${reviewModal.amount.toLocaleString()}`], ["Payment Method", reviewModal.paymentMethod], ["Requested", new Date(reviewModal.requestedAt).toLocaleString("en-IN")]].map(([k, v]) => (
                <div key={k} className="bg-surface rounded-2xl p-4 border border-border-dim shadow-inner relative overflow-hidden group hover:border-primary/20 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full translate-x-5 -translate-y-5" />
                  <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-2 opacity-60 decoration-primary/20 underline-offset-4">{k}</p>
                  <p className="text-[11px] font-black text-main-text uppercase tracking-tighter italic">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-2xl shadow-amber-500/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-widest opacity-60 italic underline decoration-amber-500/20 underline-offset-4">Patient&apos;s Declaration</p>
              <p className="text-sm font-black text-amber-900/80 dark:text-amber-200/80 tracking-tight leading-relaxed italic uppercase truncate-3-lines">&quot;{reviewModal.reason}&quot;</p>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60 flex items-center gap-2"><RotateCcw size={14} className="text-primary"/> Administrative Assessment</label>
              <textarea rows={4} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full p-5 bg-surface border border-border-dim rounded-2xl text-xs font-black uppercase tracking-tighter italic text-main-text outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner resize-none scrollbar-none" placeholder="APPEND INSTITUTIONAL CONTEXT TO THIS FINANCIAL MODIFICATION..." />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, action: null, id: null })} title={`${confirmDialog.action} Refund`} description={`Are you sure you want to ${confirmDialog.action?.toLowerCase()} this refund request?`} confirmText={confirmDialog.action || "Confirm"} isDestructive={confirmDialog.action === "Rejected"} onConfirm={() => { if (confirmDialog.action && confirmDialog.id) processRefund(confirmDialog.id, confirmDialog.action); setConfirmDialog({ isOpen: false, action: null, id: null }); }} />
    </div>
  );
}
