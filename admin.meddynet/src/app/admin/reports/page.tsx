"use client";
import { useState } from "react";
import { ShieldAlert, CheckCircle2, FileText, AlertTriangle, Trash2 } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Modal } from "@/components/admin/ui/Modal";
import { StatCard } from "@/components/admin/ui/StatCard";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useEffect } from "react";
import api from "@/lib/api";
import { RefreshCw } from "lucide-react";

interface Report {
  id: string;
  patient: string;
  lab: string;
  test: string;
  date: string;
  size: string;
  status: "Clean" | "Flagged";
}

const mockReports: Report[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `RPT-${9000 + i}`,
  patient: `Patient ${i}`,
  lab: `CityLab ${i % 3}`,
  test: i % 2 === 0 ? "Complete Blood Count" : "Lipid Profile",
  date: "14 Mar 2026",
  size: "1.2 MB",
  status: i === 2 || i === 7 ? "Flagged" : "Clean",
}));

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState<Report | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, reportId: string | null}>({isOpen: false, reportId: null});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/admin/reports-audit");
        setReports(response.data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const columns: Column<Report>[] = [
    { header: "Document ID", accessor: (r) => <span className="font-mono text-[10px] font-black text-muted/60 uppercase tracking-widest">{r.id}</span> },
    { header: "Subject (Patient)", accessor: (r) => <span className="font-black text-main-text text-[13px] uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{r.patient}</span> },
    { header: "Origin Entity (Lab)", accessor: (r) => <span className="text-[11px] font-bold text-muted uppercase tracking-tighter opacity-80 italic">{r.lab}</span> },
    { header: "Service Protocol", accessor: (r) => <span className="text-[10px] font-black uppercase tracking-widest text-muted/60 bg-surface px-2.5 py-1.5 rounded-lg border border-border-dim shadow-inner italic">{r.test}</span> },
    { header: "Upload Cycle", accessor: (r) => <span className="font-mono text-[10px] text-muted/50 uppercase">{r.date}</span> },
    { header: "Compliance", accessor: (r) => <StatusBadge status={r.status === "Clean" ? "success" : "error"} label={r.status.toUpperCase()} /> },
    { 
      header: "Actions", 
      accessor: (r) => (
        <div className="flex items-center justify-end gap-2 text-muted">
           <button onClick={() => setPreviewModal(r)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl border border-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/5">Audit Source</button>
           <button onClick={() => setDeleteDialog({isOpen: true, reportId: r.id})} className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Purge Document"><Trash2 size={16}/></button>
        </div>
      )
    }
];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reports" value="1.2M" icon={FileText}/>
        <StatCard title="Reports Today" value="4,500" icon={CheckCircle2}/>
        <StatCard title="Flagged Reports" value="12" icon={AlertTriangle}/>
        <StatCard title="Storage Used" value="4.5 TB" icon={ShieldAlert}/>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Diagnostic Document Auditor</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Compliance tracking & integrity audit for medical record streams</p>
        </div>
      </div>
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <DataTable data={reports} columns={columns} searchable />
      )}
      
      <Modal isOpen={!!previewModal} onClose={() => setPreviewModal(null)} title={`Compliance Audit: ${previewModal?.id}`}>
        <div className="bg-input rounded-4xl h-[550px] flex flex-col items-center justify-center border border-border-dim shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={400} className="absolute -bottom-20 -right-20 rotate-12"/>
          </div>
          <FileText size={48} className="text-muted opacity-20 mb-4 animate-bounce duration-3000"/>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-40 relative z-10">Secure PDF stream rendering... [MOCK]</p>
          <div className="mt-8 flex gap-3 relative z-10">
             <div className="px-4 py-2 bg-card border border-border-dim rounded-xl text-[9px] font-black uppercase tracking-widest text-muted">ID: {previewModal?.id}</div>
             <div className="px-4 py-2 bg-card border border-border-dim rounded-xl text-[9px] font-black uppercase tracking-widest text-muted">SIZE: {previewModal?.size}</div>
          </div>
        </div>
        <div className="mt-8 flex flex-col md:flex-row justify-between gap-4 border-t border-border-dim pt-6">
          <button onClick={() => {
            setReports(reports.map(r => r.id === previewModal?.id ? {...r, status: "Flagged"} : r));
            setPreviewModal(null);
          }} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-2xl border border-red-500/20 transition-all shadow-lg active:scale-95 shadow-red-500/5">Flag Non-Compliance Logic</button>
          
          <div className="flex gap-4">
            <button onClick={() => {
              setReports(reports.map(r => r.id === previewModal?.id ? {...r, status: "Clean"} : r));
              setPreviewModal(null);
            }} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white rounded-2xl border border-green-500/20 transition-all shadow-lg active:scale-95 shadow-green-500/5">Verify Document Integrity</button>
            <button onClick={() => setPreviewModal(null)} className="px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">Download Binary</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, reportId: null})}
        title="Delete Document"
        description="Are you sure you want to delete this report? It will no longer be available to the patient or lab."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
           setReports(reports.filter(r => r.id !== deleteDialog.reportId));
           setDeleteDialog({isOpen: false, reportId: null});
        }}
      />
    </div>
  );
}
