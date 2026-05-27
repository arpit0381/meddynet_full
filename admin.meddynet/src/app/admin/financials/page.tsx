"use client";
import { useState } from "react";
import { CreditCard, ArrowUpRight, CheckCircle2, Clock, Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useFinancialLedger, useProcessPayouts } from "@/lib/hooks";
import { toast } from "sonner";

const revData = [
  { name: 'Oct', revenue: 400000, payout: 320000, commission: 80000 },
  { name: 'Nov', revenue: 450000, payout: 360000, commission: 90000 },
  { name: 'Dec', revenue: 420000, payout: 336000, commission: 84000 },
  { name: 'Jan', revenue: 500000, payout: 400000, commission: 100000 },
  { name: 'Feb', revenue: 600000, payout: 480000, commission: 120000 },
  { name: 'Mar', revenue: 480000, payout: 384000, commission: 96000 },
  { name: 'Mar', revenue: 480000, payout: 384000, commission: 96000 },
];

interface Transaction {
  id: string;
  lab: string;
  amount: number;
  type: "Payout" | "Commission";
  date: string;
  status: "Completed" | "Pending";
}

// Transaction data comes from useFinancialLedger() hook below

export default function FinancialsPage() {
  const [selectedTxIds, setSelectedTxIds] = useState<(string | number)[]>([]);
  const [txModal, setTxModal] = useState<{isOpen: boolean, type: 'create' | 'edit', transaction: Transaction | null}>({isOpen: false, type: 'create', transaction: null});
  const [batchModal, setBatchModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, txId: string | null}>({isOpen: false, txId: null});

  const { data: txData, isLoading } = useFinancialLedger();
  const processPayoutsMutation = useProcessPayouts();
  
  interface LedgerEntry {
    id?: string;
    transaction_id?: string;
    lab_name?: string;
    lab?: string;
    amount?: number;
    type?: string;
    date?: string;
    created_at?: string;
    status?: string;
  }

  const tx: Transaction[] = (txData || []).map((t: LedgerEntry, index: number) => ({
    id: t.id || t.transaction_id || `TXN-${index + 1}`,
    lab: t.lab_name || t.lab || 'Unknown',
    amount: (t.amount || 0) / 100, // Scale to Rupees
    type: t.type || 'Payout',
    date: new Date(t.date || t.created_at || Date.now()).toLocaleDateString(),
    status: t.status || 'Pending'
  }));

  const columns: Column<Transaction>[] = [
    { header: "TXN ID", accessor: "id" },
    { header: "Lab Details", accessor: (t) => <span className="font-semibold text-main-text">{t.lab}</span> },
    { header: "Type", accessor: (t) => <span className={`text-xs px-2 py-1 rounded border ${t.type === 'Payout' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{t.type}</span> },
    { header: "Amount", accessor: (t) => <span className="font-medium text-main-text">₹{t.amount.toLocaleString()}</span> },
    { header: "Date", accessor: "date" },
    { header: "Status", accessor: (t) => <StatusBadge status={t.status === 'Completed' ? 'success' : 'warning'} label={t.status}/> },
    {
      header: "Action",
      accessor: (t) => (
        <div className="flex items-center justify-end gap-2 text-gray-400">
          <button onClick={() => setTxModal({isOpen: true, type: 'edit', transaction: t})} className="p-1.5 hover:text-primary hover:bg-gray-50 rounded transition-colors"><Edit2 size={16}/></button>
          <button onClick={() => setDeleteDialog({isOpen: true, txId: t.id})} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  const handleBatchProcess = () => {
    processPayoutsMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(`Processed payouts successfully.`);
        setSelectedTxIds([]);
        setBatchModal(false);
      }
    });
  };

  const pendingSelectedCount = tx.filter(t => selectedTxIds.includes(t.id) && t.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-main-text">Financial Management</h1>
        <div className="flex gap-3">
          {selectedTxIds.length > 0 && (
            <button 
              onClick={() => setBatchModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors shadow-sm"
            >
              Process Selected ({selectedTxIds.length})
            </button>
          )}
          <button onClick={() => setTxModal({isOpen: true, type: 'create', transaction: null})} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={16} /> Process Payout
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Gross Bookings Value" value="₹28.5L" delta={{value: "+15%", trend: "up"}} icon={CreditCard}/>
        <StatCard title="Platform Commission" value="₹4.2L" delta={{value: "+18%", trend: "up"}} icon={ArrowUpRight}/>
        <StatCard title="Net Payouts" value="₹24.3L" icon={CheckCircle2}/>
        <StatCard title="Pending Settlements" value="₹3.1L" icon={Clock}/>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm h-[400px]">
        <h3 className="text-lg font-semibold mb-6 text-main-text">Revenue Breakout (6 Months)</h3>
        <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={0}>
          <BarChart data={revData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} className="dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-400" />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} className="dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-400" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
            <Legend iconType="circle" />
            <Bar dataKey="revenue" name="Gross Revenue" fill="#0F172A" radius={[4,4,0,0]} />
            <Bar dataKey="commission" name="Commission" fill="#00A86B" radius={[4,4,0,0]} />
            <Bar dataKey="payout" name="Net Payouts" fill="#1E88E5" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 pb-0">
         <h2 className="text-lg font-bold text-main-text mb-6">Recent Transactions</h2>
         {isLoading ? (
           <div className="h-64 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"/>
           </div>
         ) : (
           <DataTable 
             data={tx} 
             columns={columns} 
             searchable 
             selectedIds={selectedTxIds}
             onSelectionChange={setSelectedTxIds}
           />
         )}
      </div>

      <Modal isOpen={txModal.isOpen} onClose={() => setTxModal({isOpen: false, type: 'create', transaction: null})} title={txModal.type === 'create' ? "Process New Payout" : "Edit Transaction"} footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={() => setTxModal({isOpen: false, type: 'create', transaction: null})} className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold uppercase tracking-wider">Cancel</button>
          <button onClick={() => {
            if (txModal.type === 'create') {
               toast.success("Transaction created");
            } else if (txModal.type === 'edit') {
               toast.success("Transaction updated");
            }
            setTxModal({isOpen: false, type: 'create', transaction: null});
          }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors uppercase tracking-wider">Submit</button>
        </div>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Lab Name</label><input type="text" defaultValue={txModal.transaction?.lab} onChange={(e) => setTxModal({...txModal, transaction: {...(txModal.transaction as Transaction), lab: e.target.value}})} className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-main-text dark:bg-slate-800" /></div>
            <div><label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Amount (₹)</label><input type="number" defaultValue={txModal.transaction?.amount} onChange={(e) => setTxModal({...txModal, transaction: {...(txModal.transaction as Transaction), amount: Number(e.target.value)}})} className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-main-text dark:bg-slate-800" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Type</label>
              <select value={txModal.transaction?.type || 'Payout'} onChange={(e) => setTxModal({...txModal, transaction: {...(txModal.transaction as Transaction), type: e.target.value as Transaction["type"]}})} className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-main-text bg-white dark:bg-slate-800">
                <option value="Payout">Payout</option>
                <option value="Commission">Commission</option>
              </select>
            </div>
            <div><label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Status</label>
              <select value={txModal.transaction?.status || 'Pending'} onChange={(e) => setTxModal({...txModal, transaction: {...(txModal.transaction as Transaction), status: e.target.value as Transaction["status"]}})} className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-main-text bg-white dark:bg-slate-800">
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        isOpen={batchModal}
        onClose={() => setBatchModal(false)}
        title="Process Batch Payouts"
        description={`Are you sure you want to process ${selectedTxIds.length} selected transactions? ${pendingSelectedCount} of these are currently pending and will be marked as Completed.`}
        confirmText="Confirm & Process"
        onConfirm={handleBatchProcess}
      />

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, txId: null})}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction record? This action cannot be reversed."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
           toast.success("Transaction deleted");
           setDeleteDialog({isOpen: false, txId: null});
        }}
      />
    </div>
  );
}
