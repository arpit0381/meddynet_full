"use client";
import { useState } from "react";
import { Modal } from "@/components/admin/ui/Modal";
import { Users, FlaskConical, Calendar, Activity, CreditCard, Truck, Star, History, Download, Clock, CheckCircle2, FileText } from "lucide-react";

interface DataSet {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  description: string;
  estimatedRecords: number;
  lastExported: string | null;
  lastExportedBy: string | null;
  columns: string[];
}

const datasets: DataSet[] = [
  { id: "users", name: "Users", icon: Users, iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20", description: "All registered patient accounts", estimatedRecords: 4850, lastExported: "2026-03-20T10:00:00Z", lastExportedBy: "Super Admin", columns: ["ID", "Name", "Email", "Phone", "City", "Status", "Joined At", "Total Bookings", "Total Spent"] },
  { id: "labs", name: "Labs", icon: FlaskConical, iconColor: "text-green-500 bg-green-500/10 border-green-500/20", description: "All registered lab partners", estimatedRecords: 220, lastExported: "2026-03-22T09:00:00Z", lastExportedBy: "Super Admin", columns: ["ID", "Name", "Owner", "City", "Plan", "NABL", "Status", "Total Bookings", "Rating", "Revenue"] },
  { id: "bookings", name: "Bookings", icon: Calendar, iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20", description: "All patient bookings", estimatedRecords: 18400, lastExported: "2026-03-21T08:30:00Z", lastExportedBy: "Finance Admin", columns: ["ID", "Patient", "Lab", "Tests", "Date", "Type", "Amount", "Commission", "Status", "Technician"] },
  { id: "reports", name: "Reports", icon: Activity, iconColor: "text-orange-500 bg-orange-500/10 border-orange-500/20", description: "Diagnostic reports flagged and reviewed", estimatedRecords: 8200, lastExported: null, lastExportedBy: null, columns: ["ID", "Booking ID", "Lab", "Test", "Status", "Uploaded At", "Flagged"] },
  { id: "financials", name: "Financials", icon: CreditCard, iconColor: "text-teal-500 bg-teal-500/10 border-teal-500/20", description: "All transactions, payouts and commissions", estimatedRecords: 6500, lastExported: "2026-03-23T07:00:00Z", lastExportedBy: "Finance Admin", columns: ["ID", "Lab", "Type", "Amount", "Date", "Status", "Payment Method", "Notes"] },
  { id: "technicians", name: "Technicians", icon: Truck, iconColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", description: "All field technicians", estimatedRecords: 340, lastExported: null, lastExportedBy: null, columns: ["ID", "Name", "Phone", "City", "Lab", "Status", "Rating", "Collections"] },
  { id: "reviews", name: "Reviews", icon: Star, iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20", description: "Patient reviews and ratings", estimatedRecords: 12600, lastExported: "2026-03-18T14:00:00Z", lastExportedBy: "Operations Admin", columns: ["ID", "Patient", "Lab", "Rating", "NPS Score", "Review Text", "Date", "Sentiment", "Status"] },
  { id: "audit-log", name: "Audit Log", icon: History, iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20", description: "All admin action history", estimatedRecords: 24000, lastExported: null, lastExportedBy: null, columns: ["ID", "Admin", "Action", "Entity", "Timestamp", "IP Address", "Details"] },
];

interface ExportHistory {
  id: string;
  filename: string;
  dataset: string;
  exportedBy: string;
  date: string;
  records: number;
  format: string;
}

const mockHistory: ExportHistory[] = [
  { id: "EXP-001", filename: "bookings_2026-03-21.csv", dataset: "Bookings", exportedBy: "Finance Admin", date: "2026-03-21T08:30:00Z", records: 18340, format: "CSV" },
  { id: "EXP-002", filename: "financials_2026-03-23.xlsx", dataset: "Financials", exportedBy: "Finance Admin", date: "2026-03-23T07:00:00Z", records: 6480, format: "Excel" },
  { id: "EXP-003", filename: "labs_2026-03-22.csv", dataset: "Labs", exportedBy: "Super Admin", date: "2026-03-22T09:00:00Z", records: 218, format: "CSV" },
  { id: "EXP-004", filename: "reviews_2026-03-18.json", dataset: "Reviews", exportedBy: "Operations Admin", date: "2026-03-18T14:00:00Z", records: 12520, format: "JSON" },
  { id: "EXP-005", filename: "users_2026-03-20.csv", dataset: "Users", exportedBy: "Super Admin", date: "2026-03-20T10:00:00Z", records: 4790, format: "CSV" },
];

export default function DataExportPage() {
  const [selected, setSelected] = useState<DataSet | null>(null);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ dateFrom: "", dateTo: "", format: "CSV", columns: new Set<string>() });

  const openModal = (ds: DataSet) => {
    setSelected(ds);
    setDone(false);
    setForm({ dateFrom: "", dateTo: "", format: "CSV", columns: new Set(ds.columns) });
  };

  const toggleColumn = (col: string) => {
    const next = new Set(form.columns);
    if (next.has(col)) {
      next.delete(col);
    } else {
      next.add(col);
    }
    setForm({ ...form, columns: next });
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-main-text tracking-tight uppercase">Data Export Center</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Export any platform dataset in your preferred format.</p>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {datasets.map(ds => (
          <div key={ds.id} className="bg-card rounded-2xl border border-border-dim shadow-sm p-6 hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col items-start ring-1 ring-black/5 dark:ring-white/5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${ds.iconColor}`}><ds.icon size={24} /></div>
            <h3 className="font-black text-main-text text-sm uppercase tracking-tight">{ds.name}</h3>
            <p className="text-xs text-muted font-bold mt-2 mb-4 leading-relaxed line-clamp-2">{ds.description}</p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted/60 mb-4 w-full">
              <span>~{ds.estimatedRecords.toLocaleString()} records</span>
            </div>
            <div className="flex-1"></div>
            {ds.lastExported ? (
              <p className="text-[10px] text-muted font-black uppercase tracking-tight mb-5 opacity-60">Last: {new Date(ds.lastExported).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} by <span className="text-main-text">{ds.lastExportedBy}</span></p>
            ) : (
              <p className="text-[10px] text-muted font-black uppercase tracking-tight mb-5 italic opacity-40">Never exported</p>
            )}
            <button onClick={() => openModal(ds)} className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2.5"><Download size={16}/> Export Now</button>
          </div>
        ))}
      </div>

      {/* Export History */}
      <div className="bg-card rounded-2xl border border-border-dim shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-border-dim bg-surface/50 flex justify-between items-center">
          <div>
            <h3 className="font-black text-main-text uppercase tracking-tight">Export History</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1 opacity-60">Downloads active for 7 days</p>
          </div>
        </div>
        <div className="divide-y divide-border-dim">
          {mockHistory.map(h => (
            <div key={h.id} className="px-6 py-5 flex items-center gap-5 hover:bg-surface/50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border-dim text-muted group-hover:text-primary transition-colors"><FileText size={20} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-black text-main-text uppercase tracking-tight truncate">{h.filename}</p>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1 opacity-60">{h.dataset} · {h.records.toLocaleString()} records · <span className="text-main-text/80">{h.exportedBy}</span></p>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted shrink-0 text-right">
                <p>{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <span className="text-[9px] font-black px-2.5 py-1 bg-surface border border-border-dim rounded-lg text-muted uppercase tracking-widest shrink-0">{h.format}</span>
              <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:translate-y-[-1px] transition-all flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20"><Download size={14}/> Download</button>
            </div>
          ))}
        </div>
      </div>

      {/* Export Config Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Export: ${selected?.name}`}
        footer={done ? (
          <div className="flex items-center gap-4 w-full">
            <CheckCircle2 size={24} className="text-green-500 shrink-0" />
            <span className="text-xs text-green-600 font-black uppercase tracking-widest">Export generated successfully!</span>
            <button onClick={() => setSelected(null)} className="ml-auto px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-primary rounded-xl shadow-lg active:scale-95 transition-all">Done</button>
          </div>
        ) : (
          <div className="flex justify-end gap-3 w-full">
            <button onClick={() => setSelected(null)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border border-border-dim rounded-xl text-muted hover:text-main-text hover:bg-surface transition-all">Cancel</button>
            <button onClick={handleExport} disabled={exporting} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-primary rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2.5">{exporting ? <><Clock size={16} className="animate-spin"/> Generating...</> : <><Download size={16}/> Start Export</>}</button>
          </div>
        )}
      >
        {selected && !done && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {(["CSV", "Excel", "JSON"] as const).map(f => (
                <label key={f} className={`text-center py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border cursor-pointer transition-all ${form.format === f ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border-dim text-muted hover:bg-surface"}`}>
                  <input type="radio" className="sr-only" checked={form.format === f} onChange={() => setForm({ ...form, format: f })} /> {f}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2">Date From</label><input type="date" value={form.dateFrom} onChange={e => setForm({ ...form, dateFrom: e.target.value })} className="w-full p-3 bg-card border border-border-dim rounded-xl text-xs font-bold text-main-text outline-none focus:ring-2 focus:ring-primary/50 transition-all" /></div>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2">Date To</label><input type="date" value={form.dateTo} onChange={e => setForm({ ...form, dateTo: e.target.value })} className="w-full p-3 bg-card border border-border-dim rounded-xl text-xs font-bold text-main-text outline-none focus:ring-2 focus:ring-primary/50 transition-all" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Columns to Include</label>
                <button onClick={() => setForm({ ...form, columns: new Set(selected.columns) })} className="text-[10px] font-black uppercase tracking-widest text-primary hover:translate-y-[-1px] transition-all">Select All</button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-3 scrollbar-custom">
                {selected.columns.map(col => (
                  <label key={col} className="flex items-center gap-3 cursor-pointer text-xs font-bold text-main-text/70 py-2.5 px-3 rounded-xl hover:bg-surface border border-transparent hover:border-border-dim transition-all">
                    <input type="checkbox" checked={form.columns.has(col)} onChange={() => toggleColumn(col)} className="w-4 h-4 rounded-md accent-primary border-border-dim bg-card" /> {col}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
