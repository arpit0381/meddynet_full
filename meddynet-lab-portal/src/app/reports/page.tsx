"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileBox
} from "lucide-react";
import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Modal from "@/components/ui/Modal";
import HydrationGuard from "@/components/ui/HydrationGuard";
import { useLabReports, useUploadReport } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

interface Report {
  id: string;
  name: string;
  size: string;
  date: string;
  timestamp: string;
  patient: string;
  status: string;
  method: string;
  technician: string;
  category: string;
}

export default function ReportUploadPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermHistory, setSearchTermHistory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: rawPendingReports, isLoading } = useLabReports();
  const uploadReportMutation = useUploadReport();

  const pendingReports = useMemo(() => {
    if (!rawPendingReports) return [];
    return rawPendingReports.map((b: any) => ({
      id: b.id,
      patient: b.patient_name || "Unknown Patient",
      test: b.test_name || "General Test",
      requested: new Date(b.created_at).toLocaleDateString(),
      status: String(b.status).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      reportId: b.report_id
    })).filter((b: any) => !b.reportId && ["pending", "confirmed", "assigned", "sample_collected", "in_progress", "lab_processing"].includes(b.status.toLowerCase().replace(/ /g, '_')));
  }, [rawPendingReports]);

  const recentUploads = useMemo(() => {
    if (!rawPendingReports) return [];
    return rawPendingReports.filter((b: any) => b.report_id).map((b: any) => ({
       id: b.report_id,
       name: `Report_${b.id.slice(0,8)}.pdf`,
       size: "1.2 MB",
       date: new Date().toLocaleDateString(),
       timestamp: new Date().toLocaleString(),
       patient: b.patient_name || "Unknown Patient",
       status: "Delivered",
       method: "Platform Content",
       technician: "Lab Admin",
       category: b.test_name || "General"
    }));
  }, [rawPendingReports]);

  const selectedReport = pendingReports.find((r: any) => r.id === selectedReportId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!selectedReportId) {
        setToast({ message: "Please select a patient first", type: "error" });
        return;
      }
      setPendingFile(file);
      setShowConfirmUpload(true);
    }
  };

  const handleConfirmUpload = async () => {
    if (pendingFile && selectedReportId) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const formData = new FormData();
        formData.append("report_file", pendingFile);
        formData.append("booking_id", selectedReportId);
        
        // fake progress
        const interval = setInterval(() => setUploadProgress(p => p < 90 ? p + 10 : p), 100);
        
        await uploadReportMutation.mutateAsync(formData);
        
        clearInterval(interval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setToast({ message: `Report for ${selectedReport?.patient} uploaded successfully!`, type: "success" });
          setPendingFile(null);
          setSelectedReportId(null);
        }, 500);

      } catch (err) {
        setIsUploading(false);
        setToast({ message: "Failed to upload report. Please try again.", type: "error" });
      }
    }
    setShowConfirmUpload(false);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-black text-text-muted uppercase tracking-widest animate-pulse">Loading Reports...</p>
        </div>
    );
  }

  const filteredPending = pendingReports.filter((r: any) => 
    r.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = recentUploads.filter((r: any) => 
    r.patient.toLowerCase().includes(searchTermHistory.toLowerCase()) || 
    r.name.toLowerCase().includes(searchTermHistory.toLowerCase()) ||
    r.id?.toLowerCase().includes(searchTermHistory.toLowerCase())
  );

  return (
    <HydrationGuard>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark-light tracking-tight mb-2">Report Upload Center</h1>
          <p className="text-text-muted font-bold">Securely upload and deliver diagnostic results to your patients.</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[10px] uppercase tracking-widest">
           <ShieldCheck className="w-4 h-4" /> HIPAA Compliant Storage
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="group relative">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative p-12 border-4 border-dashed border-border-dark rounded-[3.5rem] bg-white hover:border-primary transition-all text-center cursor-pointer group/zone"
              >
                 {isUploading ? (
                   <div className="py-10 space-y-8">
                      <div className="relative w-24 h-24 mx-auto">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center"><FileBox className="w-8 h-8 text-primary" /></div>
                      </div>
                      <div className="max-w-xs mx-auto space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                            <span>Uploading for {selectedReport?.patient}...</span>
                            <span className="text-primary">{uploadProgress}%</span>
                         </div>
                         <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                            <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
                         </div>
                      </div>
                   </div>
                 ) : (
                   <>
                     <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8 group-hover/zone:scale-110 group-hover/zone:rotate-12 transition-transform duration-500">
                        <UploadCloud className="w-12 h-12" />
                     </div>
                     <h2 className="text-2xl font-black text-dark-light tracking-tight mb-2">Drop your medical reports here</h2>
                     <p className="text-text-muted font-bold mb-8 max-w-sm mx-auto">Click to browse or drag and drop. Max file size 10MB. Supports PDF, JPG, PNG.</p>
                     
                     <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-10 bg-border-dark" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest text-glow-primary">
                          {selectedReport ? `New Report for ${selectedReport.patient}` : 'Select a patient to start'}
                        </span>
                        <div className="h-px w-10 bg-border-dark" />
                     </div>

                     <button 
                        suppressHydrationWarning
                        className="mt-8 px-10 py-4 rounded-full bg-dark text-white font-black text-sm shadow-xl hover:bg-dark-light transition-all"
                      >
                        Browse Files
                     </button>
                   </>
                 )}
              </div>
           </div>

           <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                 <h2 className="text-xl font-black text-dark-light tracking-tight">Recent Uploads</h2>
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input 
                      suppressHydrationWarning
                      type="text" 
                      placeholder="Search history..." 
                      value={searchTermHistory} 
                      onChange={e => setSearchTermHistory(e.target.value)} 
                      className="w-full bg-surface border border-border-dark rounded-full pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-primary transition-all" 
                    />
                 </div>
              </div>
              <div className="space-y-4">
                 <AnimatePresence mode="popLayout">
                   {filteredHistory.map((file: any) => (
                     <motion.div key={file.id || file.name} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between p-4 rounded-2xl border border-border-dark/20 hover:bg-surface transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                           <div>
                              <p className="text-sm font-black text-dark-light line-clamp-1">{file.name}</p>
                              <p className="text-[10px] font-bold text-text-muted uppercase">{file.size} • {file.method}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="hidden sm:block text-right">
                              <p className="text-xs font-black text-dark-light">Patient: {file.patient}</p>
                              <div className="flex items-center justify-end gap-2">
                                 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                   file.status === "Delivered" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                 }`}>
                                    {file.status}
                                 </span>
                                 <p className="text-[9px] font-bold text-text-muted uppercase">{file.date}</p>
                              </div>
                           </div>
                           <button 
                             suppressHydrationWarning
                             onClick={() => setViewingReport(file)}
                             className="px-4 py-2 rounded-full bg-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-black/5"
                           >
                              View
                           </button>
                        </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
                 {filteredHistory.length === 0 && (
                   <div className="py-12 text-center">
                      <FileText className="w-12 h-12 text-text-muted opacity-20 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No matching records found</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Status / Pending */}
        <div className="space-y-8">
           <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-dark-light uppercase text-[10px] tracking-widest">Pending ({filteredPending.length})</h3>
                 <div className="relative w-48">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                    <input 
                        suppressHydrationWarning
                        type="text" placeholder="Find patient..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-surface border border-border-dark rounded-full pl-10 pr-4 py-2 text-[10px] font-bold outline-none focus:border-primary transition-all" />
                 </div>
              </div>
              <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                 <AnimatePresence mode="popLayout">
                   {filteredPending.map((report: any) => (
                     <motion.div 
                       key={report.id} 
                       layout
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       onClick={() => setSelectedReportId(report.id)}
                       className={`flex gap-4 items-start group cursor-pointer p-2 rounded-2xl transition-all ${
                         selectedReportId === report.id ? 'bg-primary/5 shadow-inner' : ''
                       }`}
                     >
                        <div className={`w-1.5 h-12 rounded-full transition-all ${
                          selectedReportId === report.id ? 'bg-primary shadow-[0_0_10px_var(--color-primary)]' : 'bg-border-dark group-hover:bg-primary/40'
                        }`} />
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{report.id}</p>
                           <h4 className={`text-sm font-black transition-colors ${
                             selectedReportId === report.id ? 'text-primary' : 'text-dark-light group-hover:text-primary'
                           }`}>{report.patient}</h4>
                           <p className="text-xs text-text-muted font-bold truncate">{report.test}</p>
                        </div>
                        <button 
                          suppressHydrationWarning
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportId(report.id);
                            setTimeout(() => fileInputRef.current?.click(), 10);
                          }}
                          className={`w-10 h-10 flex items-center justify-center rounded-full self-center transition-all ${
                            selectedReportId === report.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-surface hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                           <ArrowRight className="w-5 h-5" />
                        </button>
                     </motion.div>
                   ))}
                 </AnimatePresence>
                 {filteredPending.length === 0 && (
                   <div className="py-8 text-center"><p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No matches found</p></div>
                 )}
              </div>
              <Link href="/bookings" className="block w-full mt-8 py-4 text-center rounded-full bg-surface border-2 border-border-dark text-xs font-black text-dark-light hover:border-primary hover:text-primary transition-all">
                 Manage All Orders
              </Link>
           </div>

           <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl" />
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4"><AlertCircle className="w-6 h-6 text-indigo-200" /><h3 className="text-sm font-black uppercase tracking-widest">TAT Reminder</h3></div>
                 <p className="text-xs font-bold text-indigo-50 leading-relaxed mb-6">You have <span className="font-black">4 reports</span> currently exceeding the assigned turnaround time. Deliver them soon to maintain your lab rating.</p>
                 <button className="w-full py-4 rounded-full bg-white/10 border border-white/20 text-xs font-black hover:bg-white/20 transition-all uppercase tracking-widest">View Delayed Orders</button>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showConfirmUpload}
        onClose={() => {
          setShowConfirmUpload(false);
          setPendingFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onConfirm={handleConfirmUpload}
        title="Confirm Report Delivery"
        message={`Are you sure you want to upload and deliver "${pendingFile?.name}" for ${selectedReport?.patient}? This will immediately sync the report to the patient's dashboard and notify them.`}
        confirmText="Sync to Patient Dashboard"
        type="info"
      />

      <Modal
        isOpen={!!viewingReport}
        onClose={() => setViewingReport(null)}
        title="Diagnostic Report Audit"
        maxWidth="max-w-xl"
      >
        {viewingReport && (
          <div className="p-8 space-y-8">
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <FileBox className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-dark-light tracking-tight">{viewingReport.name}</h3>
                      <p className="text-text-muted font-bold text-sm">Ref: {viewingReport.id} • {viewingReport.size}</p>
                   </div>
                </div>
                <div className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                   <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface rounded-3xl p-6 border border-border-dark/10">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Recipient Information</p>
                   <p className="text-sm font-black text-dark-light">{viewingReport.patient}</p>
                   <p className="text-xs text-text-muted font-bold mt-1">Patient Portal & App</p>
                </div>
                <div className="bg-surface rounded-3xl p-6 border border-border-dark/10">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Delivery Status</p>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-sm font-black text-emerald-600">Synced to Patient Dashboard</p>
                   </div>
                   <p className="text-xs text-text-muted font-bold mt-1">via {viewingReport.method}</p>
                </div>
                <div className="bg-surface rounded-3xl p-6 border border-border-dark/10">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Assigned Technician</p>
                   <p className="text-sm font-black text-dark-light">{viewingReport.technician}</p>
                   <p className="text-xs text-text-muted font-bold mt-1">Verified Expert</p>
                </div>
                <div className="bg-surface rounded-3xl p-6 border border-border-dark/10">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Test Category</p>
                   <p className="text-sm font-black text-dark-light">{viewingReport.category}</p>
                   <p className="text-xs text-text-muted font-bold mt-1">Standard Lab Test</p>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black text-dark-light uppercase tracking-widest">Audit Trail</p>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-dark/20">
                   <div className="flex gap-6 relative">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white z-10 shadow-lg shadow-primary/20"><CheckCircle2 className="w-3 h-3" /></div>
                      <div>
                         <p className="text-xs font-black text-dark-light">Report uploaded successfully</p>
                         <p className="text-[10px] text-text-muted font-bold uppercase">{viewingReport.timestamp}</p>
                      </div>
                   </div>
                   <div className="flex gap-6 relative">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white z-10 shadow-lg shadow-primary/20"><CheckCircle2 className="w-3 h-3" /></div>
                      <div>
                         <p className="text-xs font-black text-dark-light">Encrypted and synced to secure storage</p>
                         <p className="text-[10px] text-text-muted font-bold uppercase">{viewingReport.timestamp}</p>
                      </div>
                   </div>
                   <div className="flex gap-6 relative">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white z-10 shadow-lg shadow-emerald-500/20"><CheckCircle2 className="w-3 h-3" /></div>
                      <div>
                         <p className="text-xs font-black text-dark-light">Visible on Patient Dashboard</p>
                         <p className="text-[10px] text-text-muted font-bold uppercase">Real-time Sync Active</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-4 flex gap-3">
                <button className="flex-1 py-4 rounded-full bg-dark text-white font-black text-sm shadow-xl hover:bg-primary transition-all">
                   Preview Report File
                </button>
                <button 
                  onClick={() => setViewingReport(null)}
                  className="px-8 py-4 rounded-full bg-surface text-text-muted text-sm hover:bg-border-dark/10 transition-all font-bold"
                >
                   Close Audit
                </button>
             </div>
          </div>
        )}
      </Modal>
      </div>
    </HydrationGuard>
  );
}
