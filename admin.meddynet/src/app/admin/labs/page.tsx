"use client";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, AlertCircle, FileCheck, Users, 
  Activity, Banknote, Edit2, Trash2, Plus, CheckCircle2 
} from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { SlideOverDrawer } from "@/components/admin/ui/SlideOverDrawer";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useAdminLabs, useVerifyLab } from "@/lib/hooks";
import { RefreshCw } from "lucide-react";

type LabStatus = "Active" | "Pending" | "Suspended" | "Banned";
type Plan = "Starter" | "Basic" | "Advanced" | "Premium";

interface Lab {
  id: string;
  name: string;
  city: string;
  plan: Plan;
  nabl: boolean;
  iso: boolean;
  verified: boolean;
  bookings: number;
  revenue: string;
  joined: string;
  status: LabStatus;
}

// Mock data removed — now using live API via useAdminLabs() hook

export default function LabsPage() {
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [verifyModal, setVerifyModal] = useState<Lab | null>(null);
  const [verifyStep, setVerifyStep] = useState(1);
  const [labModal, setLabModal] = useState<{isOpen: boolean, type: 'create' | 'edit', lab: Lab | null}>({isOpen: false, type: 'create', lab: null});
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, labId: string | null}>({isOpen: false, labId: null});

  const { data: rawLabs, isLoading } = useAdminLabs();
  const verifyMutation = useVerifyLab();

  interface RawLab {
    id: string;
    name: string;
    city?: string;
    is_verified: boolean;
    created_at: string;
  }

  const labs: Lab[] = (rawLabs || []).map((l: RawLab) => ({
    id: l.id,
    name: l.name,
    city: l.city || "Unknown",
    plan: "Premium" as Plan,
    nabl: true,
    iso: true,
    verified: l.is_verified,
    bookings: 0,
    revenue: "₹0",
    joined: new Date(l.created_at).toLocaleDateString(),
    status: (l.is_verified ? "Active" : "Pending") as LabStatus
  }));

  const columns: Column<Lab>[] = [
    { header: "Lab Details", accessor: (l) => <div className="font-bold text-main-text uppercase tracking-tight">{l.name}</div> },
    { header: "City", accessor: "city" },
    { header: "Plan", accessor: (l) => <span className="bg-primary/10 text-primary px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest">{l.plan}</span> },
    { header: "Badges", accessor: (l) => <div className="flex gap-1 text-[10px] font-black uppercase tracking-tighter">{l.nabl && <span className="bg-blue-500/10 text-blue-500 px-1.5 border border-blue-500/20 rounded">NABL</span>}{l.iso && <span className="bg-muted/10 px-1.5 border border-muted/20 rounded text-muted">ISO</span>}</div> },
    { header: "Bookings", accessor: "bookings" },
    { header: "Revenue", accessor: "revenue" },
    { header: "Status", accessor: (l) => <StatusBadge status={l.status === 'Active' ? 'success' : l.status === 'Pending' ? 'warning' : 'error'} label={l.status} /> },
    { 
      header: "Action", 
      accessor: (l) => (
        <div className="flex items-center justify-end gap-2">
           {l.status === 'Pending' && <button onClick={(e) => { e.stopPropagation(); setVerifyModal(l); }} className="text-xs font-black text-primary hover:underline whitespace-nowrap uppercase tracking-widest">Verify Now</button>}
           <div className="flex gap-1 ml-2 border-l pl-2 border-border-dim/50">
             <button onClick={(e) => { e.stopPropagation(); setLabModal({isOpen: true, type: 'edit', lab: l}); }} className="p-1.5 text-muted hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><Edit2 size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); setDeleteDialog({isOpen: true, labId: l.id}); }} className="p-1.5 text-muted hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"><Trash2 size={16}/></button>
           </div>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-full"><AlertCircle size={20} /></div>
          <div><h3 className="font-black text-amber-600 dark:text-amber-500 uppercase tracking-tight text-sm">{labs.filter(l => l.status === 'Pending').length} Labs Pending Verification</h3><p className="text-xs text-amber-700 dark:text-amber-500/70 font-medium">Review documents and approve new partners to expand coverage.</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black text-main-text tracking-tight uppercase">Lab Partners</h1></div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border-dim text-muted rounded-lg text-xs font-black uppercase tracking-widest hover:text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"><Download size={16} /> Export CSV</button>
          <button onClick={() => setLabModal({isOpen: true, type: 'create', lab: null})} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95"><Plus size={16} /> Add Lab</button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <DataTable data={labs} columns={columns} onRowClick={(l) => { setSelectedLab(l); setDrawerOpen(true); }} searchable />
      )}

      <SlideOverDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selectedLab && (
            <div className="flex flex-col min-h-dvh bg-surface">
            <div className="p-6 bg-card border-b border-border-dim shrink-0">
              <h2 className="text-xl font-black text-main-text tracking-tight mb-3 uppercase">{selectedLab.name}</h2>
              <div className="flex gap-2 mb-2"><StatusBadge status="success" label={selectedLab.status} /><span className="text-[10px] bg-surface border border-border-dim/50 px-2.5 py-1 rounded-full text-muted font-black uppercase tracking-widest">{selectedLab.plan} Plan</span></div>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 bg-surface">
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-card p-5 rounded-2xl border border-border-dim shadow-sm hover:border-primary/30 transition-all"><FileCheck className="text-primary mb-3" size={24}/><p className="text-[10px] text-muted font-black uppercase tracking-widest">Total Tests</p><p className="font-black text-2xl text-main-text mt-1 tracking-tighter">145</p></div>
                 <div className="bg-card p-5 rounded-2xl border border-border-dim shadow-sm hover:border-accent/30 transition-all"><Users className="text-accent mb-3" size={24}/><p className="text-[10px] text-muted font-black uppercase tracking-widest">Technicians</p><p className="font-black text-2xl text-main-text mt-1 tracking-tighter">8</p></div>
                 <div className="bg-card p-5 rounded-2xl border border-border-dim shadow-sm hover:border-green-500/30 transition-all"><Activity className="text-green-500 mb-3" size={24}/><p className="text-[10px] text-muted font-black uppercase tracking-widest">Bookings</p><p className="font-black text-2xl text-main-text mt-1 tracking-tighter">{selectedLab.bookings}</p></div>
                 <div className="bg-card p-5 rounded-2xl border border-border-dim shadow-sm hover:border-amber-500/30 transition-all"><Banknote className="text-amber-500 mb-3" size={24}/><p className="text-[10px] text-muted font-black uppercase tracking-widest">Revenue</p><p className="font-black text-2xl text-main-text mt-1 tracking-tighter">{selectedLab.revenue}</p></div>
               </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      <Modal 
        isOpen={!!verifyModal} 
        onClose={() => { setVerifyModal(null); setVerifyStep(1); }} 
        title="Verify Lab Registration" 
        footer={
          <div className="flex gap-3 justify-end w-full">
            <button 
              onClick={() => verifyStep > 1 ? setVerifyStep(prev => prev - 1) : setVerifyModal(null)} 
              className="px-4 py-2.5 border border-border-dim rounded-lg text-xs font-black uppercase tracking-widest text-muted hover:text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            >
              {verifyStep === 1 ? "Cancel" : "Back"}
            </button>
            <button 
              onClick={() => {
                if (verifyStep < 3) {
                  setVerifyStep(prev => prev + 1);
                } else {
                  if (verifyModal) {
                      verifyMutation.mutate(verifyModal.id);
                  }
                  setVerifyModal(null);
                  setVerifyStep(1);
                }
              }} 
              disabled={verifyMutation.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {verifyStep === 3 ? "Complete Verification" : "Next Step"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${verifyStep >= s ? "bg-primary text-white shadow-glow" : "bg-surface border border-border-dim text-muted"}`}>
                  {s}
                </div>
                {s < 3 && <div className={`h-0.5 flex-1 mx-2 transition-colors ${verifyStep > s ? "bg-primary" : "bg-border-dim"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {verifyStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xs font-black text-main-text uppercase tracking-widest mb-2">Step 1: Document Review</h4>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-tight mb-4">Review the following compliance documents for <b className="text-primary tracking-normal">{verifyModal?.name}</b>.</p>
                </div>
                <div className="p-4 border border-dashed border-border-dim rounded-2xl bg-surface flex justify-between items-center group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border-dim flex items-center justify-center text-red-500"><FileCheck size={16}/></div>
                    <p className="text-sm font-bold text-main-text text-left">NABL Certificate (PDF)</p>
                  </div>
                  <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline decoration-primary/30 underline-offset-4">Download</button>
                </div>
                <div className="p-4 border border-dashed border-border-dim rounded-2xl bg-surface flex justify-between items-center group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border-dim flex items-center justify-center text-blue-500"><FileCheck size={16}/></div>
                    <p className="text-sm font-bold text-main-text text-left">ISO 9001:2015 (PDF)</p>
                  </div>
                  <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline decoration-primary/30 underline-offset-4">Download</button>
                </div>
              </motion.div>
            )}

            {verifyStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xs font-black text-main-text uppercase tracking-widest mb-2">Step 2: Facilities</h4>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-tight mb-4">Confirm that the lab meets platform infrastructure standards.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface border border-border-dim rounded-2xl flex items-center gap-3 transition-colors hover:border-primary/30">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded-lg bg-card border-border-dim text-primary focus:ring-primary shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-main-text/80">Dedicated Collection</span>
                  </div>
                  <div className="p-3 bg-surface border border-border-dim rounded-2xl flex items-center gap-3 transition-colors hover:border-primary/30">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded-lg bg-card border-border-dim text-primary focus:ring-primary shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-main-text/80">Cold Chain Management</span>
                  </div>
                  <div className="p-3 bg-surface border border-border-dim rounded-2xl flex items-center gap-3 transition-colors hover:border-primary/30">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded-lg bg-card border-border-dim text-primary focus:ring-primary shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-main-text/80">Waste Disposal</span>
                  </div>
                  <div className="p-3 bg-surface border border-border-dim rounded-2xl flex items-center gap-3 transition-colors hover:border-primary/30">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded-lg bg-card border-border-dim text-primary focus:ring-primary shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-main-text/80">Qualified Pathologist</span>
                  </div>
                </div>
              </motion.div>
            )}

            {verifyStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 text-center py-4"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6 border-8 border-green-500/5 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                   <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-black text-main-text tracking-tight uppercase">Ready for Final Approval</h4>
                <p className="text-[10px] text-muted font-bold uppercase tracking-tight px-4 leading-relaxed mt-2">All documents and facility requirements have been reviewed. Approving will notify <b className="text-primary tracking-normal">{verifyModal?.name}</b> and make them live on the platform.</p>
                <div className="mt-8 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] p-4 bg-surface border border-border-dim rounded-2xl">
                    <span className="text-muted font-black uppercase tracking-widest">Service Fee Tier</span>
                    <span className="font-black text-main-text uppercase">Basic (15%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] p-4 bg-surface border border-border-dim rounded-2xl">
                    <span className="text-muted font-black uppercase tracking-widest">Payment Terms</span>
                    <span className="font-black text-main-text uppercase">T+3 Cycles</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      <Modal isOpen={labModal.isOpen} onClose={() => setLabModal({isOpen: false, type: 'create', lab: null})} title={labModal.type === 'create' ? "Add New Lab Partner" : "Edit Lab Details"} footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={() => setLabModal({isOpen: false, type: 'create', lab: null})} className="px-4 py-2 border border-border-dim rounded-lg text-xs font-black uppercase tracking-widest text-muted hover:text-main-text transition-all">Cancel</button>
          <button onClick={() => {
            if (labModal.type === 'create') {
              toast.success("Lab created successfully");
            } else {
              toast.success("Lab updated successfully");
            }
            setLabModal({isOpen: false, type: 'create', lab: null});
          }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Save Details</button>
        </div>
      }>
        <div className="space-y-4">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block">Lab Name</label><input type="text" defaultValue={labModal.lab?.name} className="w-full p-3 bg-input border border-border-dim rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-main-text font-bold transition-all" placeholder="e.g. Apex Diagnostics" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block">City</label><input type="text" defaultValue={labModal.lab?.city} className="w-full p-3 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all" placeholder="e.g. Delhi" /></div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5 block">Status</label>
              <select defaultValue={labModal.lab?.status || 'Active'} className="w-full p-3 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-main-text font-bold transition-all appearance-none">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex gap-6 mt-2 p-5 bg-surface rounded-2xl border border-border-dim">
            <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-main-text/80 cursor-pointer group"><input type="checkbox" defaultChecked={labModal.lab?.nabl} className="w-5 h-5 rounded-lg border-border-dim bg-card text-primary focus:ring-primary transition-all group-hover:scale-110 shadow-sm" /> NABL Certified</label>
            <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-main-text/80 cursor-pointer group"><input type="checkbox" defaultChecked={labModal.lab?.iso} className="w-5 h-5 rounded-lg border-border-dim bg-card text-primary focus:ring-primary transition-all group-hover:scale-110 shadow-sm" /> ISO Certified</label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, labId: null})}
        title="Remove Lab Partner"
        description="Are you sure you want to remove this lab? They will lose access to the platform and all pending bookings will be cancelled."
        confirmText="Remove Lab"
        isDestructive={true}
        onConfirm={() => {
           toast.success("Lab removed");
           setDeleteDialog({isOpen: false, labId: null});
        }}
      />
    </div>
  );
}
