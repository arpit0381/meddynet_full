"use client";
import { Download, Filter, Loader2, Database } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useState } from "react";
import { useAuditLogs } from "@/lib/hooks";
import { motion, AnimatePresence } from "framer-motion";

interface LogEvent {
  id: string;
  time: string;
  admin: string;
  email: string;
  action: string;
  entityType: string;
  entityId: string;
  ip: string;
  severity: "Normal" | "Warning" | "Critical";
}

export default function AuditLogPage() {
  const { data: logsData, isLoading } = useAuditLogs();
  const [clearDialog, setClearDialog] = useState(false);

  const columns: Column<LogEvent>[] = [
    { header: "Sequence Timestamp", accessor: (l) => <span className="font-mono text-[10px] text-muted/60 uppercase tracking-tighter">{l.time}</span> },
    { 
      header: "Administrative Actor", 
      accessor: (l) => (
        <div className="flex flex-col gap-1 py-1">
          <p className="font-black text-main-text text-[13px] uppercase tracking-tight leading-none group-hover:text-primary transition-colors italic">{l.admin}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60 leading-none">{l.email}</p>
        </div>
      ) 
    },
    { header: "Protocol Action", accessor: (l) => <span className="font-black text-main-text text-xs uppercase tracking-tight italic opacity-90">{l.action}</span> },
    { 
      header: "Object Reference", 
      accessor: (l) => (
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest bg-surface border border-border-dim text-muted px-2.5 py-1.5 rounded-lg group-hover:border-primary/20 transition-all">{l.entityType}</span> 
          <span className="text-primary hover:text-primary/80 cursor-pointer text-xs font-black uppercase tracking-widest italic border-b border-primary/20">{l.entityId}</span>
        </div>
      ) 
    },
    { header: "Network Identity (IP)", accessor: (l) => <span className="font-mono text-[10px] text-muted font-black border border-border-dim bg-input px-2.5 py-1.5 rounded-lg shadow-inner">{l.ip}</span> },
    { header: "Severity Tier", accessor: (l) => (l.severity === "Normal" ? <span className="text-[9px] font-black text-muted/40 uppercase tracking-widest italic group-hover:text-muted/60 transition-colors">Standard</span> : <StatusBadge status={l.severity === "Critical" ? "error" : "warning"} label={l.severity.toUpperCase()} />) },
];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Immutable Ledger (Audit Log)</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Full cryptographic record of administrative state mutations</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setClearDialog(true)} className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 active:scale-95">Purge Records</button>
          <button className="flex items-center gap-2.5 px-6 py-3 bg-surface border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-main-text hover:border-primary/30 text-muted shadow-sm transition-all active:scale-95"><Filter size={16}/> Protocol Filters</button>
          <button className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"><Download size={16}/> Export Binary (CSV)</button>
        </div>
      </div>

      <div className="bg-card rounded-5xl border border-border-dim shadow-sm overflow-hidden p-8 transition-all hover:border-primary/10 min-h-[400px] relative">
         <AnimatePresence>
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted animate-pulse">Synchronizing Cryptographic Chain...</span>
                    </div>
                </div>
            ) : logsData?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted/30">
                    <Database size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Protocol Entries Found</p>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <DataTable data={logsData || []} columns={columns} searchable />
                </motion.div>
            )
            }
         </AnimatePresence>
      </div>

      <ConfirmDialog 
        isOpen={clearDialog}
        onClose={() => setClearDialog(false)}
        title="Clear Audit Logs"
        description="Are you absolutely sure you want to clear all audit logs? This action is heavily audited and cannot be undone."
        confirmText="Clear History"
        isDestructive={true}
        onConfirm={() => {
           setClearDialog(false);
        }}
      />
    </div>
  );
}
