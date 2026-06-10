"use client";
import { useState, useMemo } from "react";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { PermissionGate } from "@/components/admin/ui/PermissionGate";
import { useAdminReviews } from "@/lib/hooks";
import { useEffect } from "react";
import { Star, Flag, Eye, Trash2, MessageSquare, TrendingUp, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={14} className={s <= rating ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" : "text-muted/20 fill-muted/10"} />
      ))}
    </div>
  );
}

export interface Review {
  id: string;
  patientName: string;
  labName: string;
  testName: string;
  rating: number;
  text: string;
  date: string;
  status: "Published" | "Flagged" | "Removed";
  sentiment: "Positive" | "Neutral" | "Negative";
}

export default function ReviewsPage() {
  const { data: rawReviews = [], isLoading } = useAdminReviews();
  const reviews: Review[] = rawReviews.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    patientName: "Patient (Hidden)", // Not returned by API yet
    labName: r.lab_name as string,
    testName: "Lab Booking", // General fallback
    rating: r.rating as number,
    text: (r.comment as string) || "No comment provided.",
    date: r.created_at as string,
    status: "Published",
    sentiment: (r.rating as number) >= 4 ? "Positive" : (r.rating as number) <= 2 ? "Negative" : "Neutral"
  }));
  const [previewModal, setPreviewModal] = useState<Review | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterSentiment, setFilterSentiment] = useState<string>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => reviews.filter(r => {
    if (filterRating && r.rating !== filterRating) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterSentiment !== "All" && r.sentiment !== filterSentiment) return false;
    return true;
  }), [reviews, filterRating, filterStatus, filterSentiment]);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const flaggedCount = reviews.filter(r => r.status === "Flagged").length;
  const todayCount = reviews.filter(r => r.date.startsWith("2026-03-23")).length;

  const updateStatus = (id: string, status: Review["status"]) => {
    toast.info("Status update pending API integration.");
    setPreviewModal(null);
  };

  const bulkAction = (action: "Published" | "Removed") => {
    toast.info("Bulk action pending API integration.");
    setSelected(new Set());
  };

  const columns: Column<Review>[] = [
    {
      header: "",
      accessor: (r) => (
        <input type="checkbox" checked={selected.has(r.id)} onChange={e => {
          const next = new Set(selected);
          if (e.target.checked) next.add(r.id); else next.delete(r.id);
          setSelected(next);
        }} className="w-4 h-4 rounded accent-primary" onClick={e => e.stopPropagation()} />
      )
    },
    {
      header: "Patient Identity",
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0 shadow-sm uppercase tracking-widest">
            {r.patientName.split(" ").map(n => n[0]).join("").slice(0,2)}
          </div>
          <span className="font-bold text-main-text text-[13px] uppercase tracking-tight">{r.patientName}</span>
        </div>
      )
    },
    { header: "Entity (Lab)", accessor: (r) => <span className="text-[11px] font-bold text-muted uppercase tracking-tighter opacity-80">{r.labName}</span> },
    { header: "Sentiment Score", accessor: (r) => <StarDisplay rating={r.rating} /> },
    { header: "Observation Content", accessor: (r) => <span className="text-xs font-medium text-main-text/70 max-w-[200px] block truncate italic px-3 py-1.5 bg-surface/50 rounded-lg border border-border-dim border-dashed" title={r.text}>&quot;{r.text}&quot;</span> },
    { header: "Service Cluster", accessor: (r) => <span className="text-[10px] font-black uppercase tracking-widest text-muted/60 bg-surface px-2 py-0.5 rounded-lg border border-border-dim">{r.testName}</span> },
    { header: "Sequence", accessor: (r) => <span className="font-mono text-[10px] text-muted/80">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }).toUpperCase()}</span> },
    { header: "Moderation Status", accessor: (r) => <StatusBadge status={r.status === "Published" ? "success" : r.status === "Flagged" ? "warning" : "error"} label={r.status.toUpperCase()} /> },
    {
      header: "Actions",
      accessor: (r) => (
        <div className="flex items-center justify-end gap-1 text-muted">
          <button onClick={(e) => { e.stopPropagation(); setPreviewModal(r); }} className="p-2 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="View Audit"><Eye size={16} /></button>
          <PermissionGate permission="can_flag_review">
            <button onClick={(e) => { e.stopPropagation(); updateStatus(r.id, "Flagged"); }} className="p-2 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all" title="Flag Logic"><Flag size={16} /></button>
          </PermissionGate>
          <PermissionGate permission="can_remove_review">
            <button onClick={(e) => { e.stopPropagation(); setDeleteDialog({ isOpen: true, id: r.id }); }} className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Terminate"><Trash2 size={16} /></button>
          </PermissionGate>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Review Moderation Logic</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Audit and Moderate Patient Perceptions and Service Quality Metrics</p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-2xl shadow-lg ring-4 ring-primary/5">
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">{selected.size} ENTITIES SELECTED</span>
            <div className="flex gap-4 border-l border-primary/20 pl-4">
              <button onClick={() => bulkAction("Published")} className="text-[10px] text-green-500 font-black uppercase tracking-widest hover:text-green-400 transition-all">Publish Batch</button>
              <button onClick={() => bulkAction("Removed")} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:text-red-400 transition-all">Decommission</button>
              <button onClick={() => setSelected(new Set())} className="text-muted hover:text-main-text transition-all ml-2"><X size={16}/></button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reviews" value={String(reviews.length)} icon={MessageSquare} />
        <StatCard title="Avg Rating" value={`${avgRating} ★`} icon={Star} />
        <StatCard title="Flagged" value={String(flaggedCount)} icon={AlertCircle} />
        <StatCard title="Today" value={String(todayCount)} icon={TrendingUp} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-surface/30 p-4 rounded-2xl border border-border-dim shadow-inner">
        <div className="flex gap-2">
          {[null, 1, 2, 3, 4, 5].map(r => (
            <button key={String(r)} onClick={() => setFilterRating(r)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm active:scale-95 ${filterRating === r ? "bg-primary text-white border-primary shadow-primary/20" : "bg-card border-border-dim text-muted hover:text-main-text hover:border-primary/30"}`}>
              {r === null ? "ALL" : `${r}★`}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-border-dim mx-2"/>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 bg-card border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest outline-none text-muted hover:text-main-text focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
          <option value="All">ALL LIFECYCLES</option>
          <option value="Published">PUBLISHED</option>
          <option value="Flagged">FLAGGED LOGIC</option>
          <option value="Removed">DECOMMISSIONED</option>
        </select>
        <select value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)} className="px-4 py-2 bg-card border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest outline-none text-muted hover:text-main-text focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
          <option value="All">ALL DIMENSIONS</option>
          <option value="Positive">POSITIVE FEEDBACK</option>
          <option value="Neutral">NEUTRAL SCOPE</option>
          <option value="Negative">NEGATIVE ANOMALY</option>
        </select>
      </div>

      {isLoading ? <div className="text-center p-10 text-muted">Loading reviews...</div> : <DataTable data={filtered} columns={columns} searchable />}

      {/* Preview Modal */}
      <Modal isOpen={!!previewModal} onClose={() => setPreviewModal(null)} title={`Review ${previewModal?.id}`}>
        {previewModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-5 p-6 bg-surface/50 rounded-3xl border border-border-dim shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-2xl flex items-center justify-center uppercase tracking-widest">{previewModal.patientName.split(" ").map(n => n[0]).join("").slice(0,2)}</div>
              <div>
                <p className="font-black text-main-text text-lg uppercase tracking-tight leading-none mb-2">{previewModal.patientName}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60 leading-none">{previewModal.labName} <span className="opacity-30 mx-1">/</span> {previewModal.testName}</p>
              </div>
              <div className="ml-auto"><StarDisplay rating={previewModal.rating} /></div>
            </div>
            <div className="bg-input p-6 rounded-3xl border border-border-dim border-dashed relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare size={64}/>
               </div>
               <p className="text-[14px] font-medium text-main-text/90 italic leading-relaxed relative z-10">&quot;{previewModal.text}&quot;</p>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-4 pt-4 border-t border-border-dim">
              <PermissionGate permission="can_flag_review">
                <button onClick={() => updateStatus(previewModal.id, "Flagged")} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white rounded-2xl border border-amber-500/20 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-amber-500/5"><Flag size={16}/> Flag Content Logic</button>
              </PermissionGate>
              <div className="flex gap-3">
                <PermissionGate permission="can_publish_review">
                  <button onClick={() => updateStatus(previewModal.id, "Published")} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white rounded-2xl border border-green-500/20 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-green-500/5"><CheckCircle2 size={16}/> Publish Unit</button>
                </PermissionGate>
                <PermissionGate permission="can_remove_review">
                  <button onClick={() => { setDeleteDialog({ isOpen: true, id: previewModal.id }); setPreviewModal(null); }} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-2xl border border-red-500/20 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-red-500/5"><Trash2 size={16}/> Decommission</button>
                </PermissionGate>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })} title="Remove Review" description={`Are you sure you want to remove this review? This will trigger a rating recalculation for the lab.`} confirmText="Remove" isDestructive onConfirm={() => { toast.info("Review deletion pending API integration."); setDeleteDialog({ isOpen: false, id: null }); }} />
    </div>
  );
}
