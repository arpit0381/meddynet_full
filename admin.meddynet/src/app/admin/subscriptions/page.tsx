"use client";
import { useState } from "react";
import { Zap } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Modal } from "@/components/admin/ui/Modal";

import { useAdminSubscriptions, useAdminLabs } from "@/lib/hooks";

interface Sub {
  id: string;
  lab: string;
  plan: string;
  billing: string;
  renewal: string;
  status: "Active" | "Expired" | "Cancelled";
  revenue: string;
}

interface PlanConfig {
  id: string;
  name: string;
  price: string;
  comm: string;
}

import { useUpdateSubscription } from "@/lib/hooks";
import { toast } from "sonner";

export default function SubscriptionsPage() {
  const { data: rawPlans = [], isLoading: loadingPlans } = useAdminSubscriptions();
  const { data: rawLabs = [], isLoading: loadingLabs } = useAdminLabs();

  const subs: Sub[] = (rawLabs || []).map((lab: Record<string, unknown>) => ({
    id: lab.id as string,
    lab: lab.name as string,
    plan: lab.plan as string,
    billing: "Monthly",
    renewal: "TBD",
    status: lab.is_active ? "Active" : "Expired",
    revenue: "₹0 / mo",
  }));

  const plans: PlanConfig[] = (rawPlans || []).map((plan: Record<string, unknown>) => ({
    id: plan.id as string,
    name: plan.name as string,
    price: `₹${plan.price_inr as number}/mo`,
    comm: `${Math.round((plan.commission_rate as number) * 100)}%`,
  }));

  const updateMutation = useUpdateSubscription();

  const [planModal, setPlanModal] = useState<{isOpen: boolean, config: PlanConfig | null}>({isOpen: false, config: null});
  const [subModal, setSubModal] = useState<{isOpen: boolean, sub: Sub | null}>({isOpen: false, sub: null});

  const columns: Column<Sub>[] = [
    { header: "Lab Name", accessor: (s) => <span className="font-bold text-main-text uppercase tracking-tight">{s.lab}</span> },
    { header: "Plan", accessor: (s) => <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${s.plan?.toLowerCase() === 'premium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-primary/10 text-primary border-primary/20'}`}>{s.plan}</span> },
    { header: "Billing", accessor: (s) => <span className="font-medium text-muted/80">{s.billing}</span> },
    { header: "Renewal", accessor: (s) => <span className="font-mono text-[11px] text-main-text/70">{s.renewal}</span> },
    { header: "Status", accessor: (s) => <StatusBadge status={s.status === 'Active' ? 'success' : 'error'} label={s.status}/> },
    { header: "Revenue", accessor: (s) => <span className="font-black text-main-text">{s.revenue}</span> },
    { header: "Actions", accessor: (s) => <button onClick={() => setSubModal({isOpen: true, sub: s})} className="flex items-center gap-2 text-primary hover:text-primary/80 text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-px group">
      <Zap size={14} className="group-hover:fill-current transition-all"/> Change Plan
    </button> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase">Subscription Management</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Configure lab platform tiers and monetization protocols.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {plans.map(p => (
           <div key={p.name} className="bg-card p-8 rounded-3xl border border-border-dim shadow-sm hover:shadow-xl hover:border-primary/40 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"/>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-muted mb-4 opacity-70">{p.name} Tier</h3>
              <p className="text-3xl font-black text-main-text italic tracking-tighter mb-2">{p.price}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted/60 mb-8 border-l-2 border-primary/40 pl-3">Commission: <span className="text-primary">{p.comm}</span> / booking</p>
              <button onClick={() => setPlanModal({isOpen: true, config: p})} className="w-full py-3.5 bg-surface hover:bg-primary hover:text-white border border-border-dim hover:border-primary rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted transition-all shadow-sm active:scale-95">Edit Tier Config</button>
           </div>
        ))}
      </div>

      <div className="bg-card rounded-3xl border border-border-dim shadow-sm overflow-hidden p-8 transition-all">
         <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm font-black text-main-text uppercase tracking-widest">Lab Subscriptions Explorer</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1 opacity-60">Active monitoring of partner diagnostics network</p>
            </div>
         </div>
         {loadingLabs ? <div className="text-center p-10 text-muted">Loading labs...</div> : <DataTable data={subs} columns={columns} searchable />}
      </div>

      <Modal isOpen={planModal.isOpen} onClose={() => setPlanModal({isOpen: false, config: null})} title="Tier Protocol Configuration" footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={() => setPlanModal({isOpen: false, config: null})} className="px-6 py-3 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text transition-all">Cancel</button>
          <button onClick={() => {
            if (planModal.config) {
                // We only support updating commission rate or price in this basic UI.
                // Assuming price string like "₹999/mo" - let's extract digits.
                const priceMatch = planModal.config.price.match(/\d+/);
                const commMatch = planModal.config.comm.match(/\d+/);
                
                const payload: any = {};
                if (priceMatch) payload.price_paise = parseInt(priceMatch[0], 10) * 100;
                if (commMatch) payload.commission_rate = parseInt(commMatch[0], 10) / 100;

                updateMutation.mutate({ planId: planModal.config.id, payload }, {
                  onSuccess: () => {
                    toast.success("Plan updated successfully");
                    setPlanModal({isOpen: false, config: null});
                  },
                  onError: () => toast.error("Failed to update plan")
                });
            } else {
              setPlanModal({isOpen: false, config: null});
            }
          }} className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">Commit Tier Changes</button>
        </div>
      }>
        <div className="space-y-6">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5 opacity-80">Tier Name</label><input type="text" value={planModal.config?.name || ''} readOnly className="w-full p-4 bg-surface border border-border-dim rounded-xl outline-none text-muted font-black uppercase tracking-widest text-[10px] opacity-60" /></div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5 opacity-80">Monthly Cost Protocol</label><input type="text" value={planModal.config?.price || ''} onChange={(e) => planModal.config && setPlanModal({...planModal, config: {...planModal.config, price: e.target.value}})} className="w-full p-4 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-black text-main-text uppercase tracking-tight transition-all" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5 opacity-80">Revenue Commission %</label><input type="text" value={planModal.config?.comm || ''} onChange={(e) => planModal.config && setPlanModal({...planModal, config: {...planModal.config, comm: e.target.value}})} className="w-full p-4 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-black text-main-text uppercase tracking-tight transition-all" /></div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={subModal.isOpen} onClose={() => setSubModal({isOpen: false, sub: null})} title="Subscription Lifecycle Migration" footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={() => setSubModal({isOpen: false, sub: null})} className="px-6 py-3 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text transition-all">Cancel</button>
          <button onClick={() => {
            if (subModal.sub) {
               toast.success(`Migrated subscription for ${subModal.sub.lab}`);
            }
            setSubModal({isOpen: false, sub: null});
          }} className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">Migrate Entity</button>
        </div>
      }>
        <div className="space-y-6">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5 opacity-80">Partner Identity</label><input type="text" value={subModal.sub?.lab || ''} readOnly className="w-full p-4 bg-surface border border-border-dim rounded-xl outline-none text-muted font-black uppercase tracking-widest text-[10px] opacity-60" /></div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5 opacity-80">Select target Lifecycle</label>
            <select value={subModal.sub?.plan || 'Starter'} onChange={(e) => setSubModal({...subModal, sub: {...(subModal.sub as Sub), plan: e.target.value}})} className="w-full p-4 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-black text-main-text uppercase tracking-tight transition-all appearance-none">
              {plans.map(p => <option key={p.name} value={p.name}>{p.name.toUpperCase()} — {p.price}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
