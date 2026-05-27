"use client";
import { useState } from "react";
import { Plus, Edit2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

interface Test {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  labsOffering: number;
  params: number;
  active: boolean;
}

const mockTests: Test[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `TST-${3000 + i}`,
  name: ["Complete Blood Count", "Lipid Profile", "Thyroid Profile", "Vitamin D3", "HbA1c"][i % 5],
  category: ["Hematology", "Biochemistry", "Hormones", "Vitamins", "Diabetes"][i % 5],
  priceRange: "₹300 - ₹500",
  labsOffering: 45 + i,
  params: 12 + i,
  active: i !== 3,
}));

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>(mockTests);
  const [testModal, setTestModal] = useState<{isOpen: boolean, type: 'create' | 'edit', test: Test | null}>({isOpen: false, type: 'create', test: null});
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, testId: string | null}>({isOpen: false, testId: null});

  const columns: Column<Test>[] = [
    { header: "Test ID", accessor: (t) => <span className="font-black text-main-text uppercase tracking-widest text-xs">{t.id}</span> } ,
    { header: "Test Name", accessor: (t) => <span className="font-bold text-main-text uppercase tracking-tight">{t.name}</span> },
    { header: "Category", accessor: (t) => <span className="text-[10px] font-black uppercase tracking-widest bg-surface text-muted px-2.5 py-1.5 rounded-lg border border-border-dim group-hover:border-primary/20 transition-all">{t.category}</span> },
    { header: "Price Range", accessor: (t) => <span className="font-bold text-main-text/80">{t.priceRange}</span> },
    { header: "Labs", accessor: (t) => <span className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline cursor-pointer">{t.labsOffering} Labs</span> },
    { header: "Parameters", accessor: (t) => <span className="font-black text-main-text">{t.params}</span> },
    { header: "Status", accessor: (t) => t.active ? <CheckCircle2 className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.2)]" size={20}/> : <XCircle className="text-muted/40" size={20}/> },
    { 
      header: "Actions", 
      accessor: (t) => (
        <div className="flex items-center justify-end gap-2 text-muted">
          <button onClick={(e) => {e.stopPropagation(); setTestModal({isOpen: true, type: 'edit', test: t});}} className="p-1.5 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"><Edit2 size={16}/></button>
          <button onClick={(e) => {e.stopPropagation(); setDeleteDialog({isOpen: true, testId: t.id});}} className="p-1.5 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6 transition-colors">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase">Global Test Catalog</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Master list of all diagnostic tests available on the platform.</p>
        </div>
        <button onClick={() => setTestModal({isOpen: true, type: 'create', test: null})} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">
          <Plus size={18} /> Add New Test
        </button>
      </div>

      <DataTable data={tests} columns={columns} searchable />

      <Modal isOpen={testModal.isOpen} onClose={() => setTestModal({isOpen: false, type: 'create', test: null})} title={testModal.type === 'create' ? "Test Configuration" : "Edit Test"} footer={
        <div className="flex justify-end gap-3 w-full">
          <button onClick={() => setTestModal({isOpen: false, type: 'create', test: null})} className="px-5 py-2.5 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-main-text transition-all">Cancel</button>
          <button onClick={() => {
            if (testModal.type === 'create') {
               setTests([{id: `TST-${Date.now().toString().slice(-4)}`, name: testModal.test?.name || 'New Test', category: testModal.test?.category || 'Hematology', priceRange: testModal.test?.priceRange || '₹0 - ₹0', labsOffering: 0, params: 10, active: true}, ...tests]);
            } else if (testModal.type === 'edit' && testModal.test) {
               setTests(tests.map(t => t.id === testModal.test?.id ? {...testModal.test} as Test : t));
            }
            setTestModal({isOpen: false, type: 'create', test: null});
          }} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">Save Details</button>
        </div>
      }>
        <div className="space-y-5">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Test Name</label><input type="text" defaultValue={testModal.test?.name} onChange={(e) => setTestModal({...testModal, test: {...(testModal.test as Test), name: e.target.value}})} className="w-full p-3.5 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-black text-main-text transition-all" placeholder="e.g. Complete Blood Count" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Category</label>
              <select value={testModal.test?.category || 'Hematology'} onChange={(e) => setTestModal({...testModal, test: {...(testModal.test as Test), category: e.target.value}})} className="w-full p-3.5 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-[10px] font-black uppercase tracking-widest text-main-text transition-all appearance-none">
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Hormones">Hormones</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Diabetes">Diabetes</option>
              </select>
            </div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Standard MRP (₹)</label><input type="text" defaultValue={testModal.test?.priceRange} onChange={(e) => setTestModal({...testModal, test: {...(testModal.test as Test), priceRange: e.target.value}})} className="w-full p-3.5 bg-input border border-border-dim rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-black text-main-text transition-all" placeholder="₹300 - ₹500" /></div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, testId: null})}
        title="Delete Test Configuration"
        description="Are you sure you want to delete this test? It will be removed from the platform catalog."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
           setTests(tests.filter(t => t.id !== deleteDialog.testId));
           setDeleteDialog({isOpen: false, testId: null});
        }}
      />
    </div>
  );
}
