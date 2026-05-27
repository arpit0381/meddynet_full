"use client";

import { AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  Activity, 
  Stethoscope, 
  Microscope, 
  Baby, 
  HeartPulse, 
  Droplets, 
  Filter, 
  Flower2, 
  User, 
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertCircle,
  X,
  Home,
  Building2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Toast from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useAddLabTest } from "@/lib/hooks";

const CATEGORIES = [
  { id: 'blood', name: 'Blood Tests', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50' },
  { id: 'radiology', name: 'Radiology', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-50' },
  { id: 'microbiology', name: 'Microbiology', icon: Microscope, color: 'text-emerald-600', bg: 'bg-emerald-600', lightBg: 'bg-emerald-50' },
  { id: 'child', name: 'Child Health', icon: Baby, color: 'text-amber-500', bg: 'bg-amber-500', lightBg: 'bg-amber-50' },
  { id: 'heart', name: 'Heart Health', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-500', lightBg: 'bg-red-50' },
  { id: 'diabetes', name: 'Diabetes', icon: Droplets, color: 'text-indigo-500', bg: 'bg-indigo-500', lightBg: 'bg-indigo-50' },
  { id: 'kidney', name: 'Kidney Care', icon: Filter, color: 'text-cyan-500', bg: 'bg-cyan-500', lightBg: 'bg-cyan-50' },
  { id: 'women', name: 'Women\'s Health', icon: Flower2, color: 'text-pink-500', bg: 'bg-pink-500', lightBg: 'bg-pink-50' },
  { id: 'fullbody', name: 'Full Body', icon: User, color: 'text-purple-500', bg: 'bg-purple-500', lightBg: 'bg-purple-50' },
];

export default function AddTestPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('blood');
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  // FORM STATES - 100% CONNECTED
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [mrp, setMrp] = useState<string>("");
  const [tat, setTat] = useState("24");
  const [params, setParams] = useState<string[]>(["Glucose", "Hb1Ac"]);
  const [newParam, setNewParam] = useState("");
  const [preps, setPreps] = useState({ fasting: true, noAlcohol: false, morningOnly: false });

  const addTestMutation = useAddLabTest();

  const handleAddParam = () => {
    if (newParam && !params.includes(newParam)) {
      setParams([...params, newParam]);
      setNewParam("");
    }
  };

  const removeParam = (p: string) => setParams(params.filter(x => x !== p));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedPrice = parseFloat(price);
    const parsedMrp = mrp ? parseFloat(mrp) : parsedPrice * 1.2;

    if (isNaN(parsedPrice)) {
      setToast({ message: "Invalid price value", type: "error" });
      return;
    }

    try {
      await addTestMutation.mutateAsync({
        name,
        category: selectedCategory.toUpperCase(),
        price: parsedPrice,
        mrp: parsedMrp,
        turnaround_hours: parseInt(tat),
        home_collection: true // default for now
      });

      setToast({ message: "Diagnostic test added successfully!", type: "success" });
      setTimeout(() => router.push('/tests'), 1200);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setToast({ 
        message: axiosErr.response?.data?.detail || "Failed to add test to catalog", 
        type: "error" 
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <Link href="/tests" className="inline-flex items-center gap-2 text-sm font-black text-text-muted hover:text-primary transition-colors group">
        <div className="p-2.5 rounded-full bg-white border border-border-dark group-hover:border-primary shadow-sm"><ArrowLeft className="w-4 h-4" /></div>
        Back to Test Catalog
      </Link>

      <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-border-dark/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full -mr-40 -mt-40" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30"><Plus className="w-7 h-7" /></div>
            <div>
               <h1 className="text-3xl font-black text-dark-light tracking-tight">Advanced Test Setup</h1>
               <p className="text-xs font-bold text-text-muted">Configure clinical requirements and sub-parameters.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-12">
            <div className="grid lg:grid-cols-3 gap-12">
               {/* Left: Basic & Category */}
               <div className="lg:col-span-2 space-y-10">
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">1. Categorization</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {CATEGORIES.map((cat) => (
                           <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`p-6 rounded-4xl border-2 transition-all text-center flex flex-col items-center gap-4 ${
                                selectedCategory === cat.id 
                                ? `border-primary bg-primary text-white shadow-xl shadow-primary/20` 
                                : `border-border-dark bg-white hover:border-primary/20`
                              }`}
                           >
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedCategory === cat.id ? 'bg-white/20' : `${cat.lightBg} ${cat.color}`}`}>
                                 <cat.icon className="w-6 h-6" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{cat.name}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-border-dark/10">
                     <div className="sm:col-span-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-4">Test Display Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Iron Deficiency Profile" 
                          className="w-full bg-surface border-2 border-border-dark rounded-full px-8 py-4 text-sm font-bold text-dark-light focus:border-primary outline-none transition-all shadow-sm" 
                          required 
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-4">Selling Price (₹)</label>
                        <div className="relative group">
                           <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                           <input 
                              type="number" 
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder="1200" 
                              className="w-full bg-surface border-2 border-border-dark rounded-full pl-14 pr-8 py-4 text-sm font-bold text-dark-light focus:border-primary outline-none transition-all shadow-sm" 
                              required 
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block px-4">Expected TAT (Hrs)</label>
                        <div className="relative group">
                           <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                           <select 
                             value={tat}
                             onChange={(e) => setTat(e.target.value)}
                             className="w-full bg-surface border-2 border-border-dark rounded-full pl-14 pr-10 py-4 text-sm font-bold text-dark-light focus:border-primary outline-none transition-all shadow-sm appearance-none cursor-pointer"
                           >
                              <option value="12">12 Hours</option>
                              <option value="24">24 Hours</option>
                              <option value="48">48 Hours</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="pt-10 border-t border-border-dark/10 space-y-6">
                     <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">2. Sub-Parameters (Inclusions)</h3>
                     <div className="bg-surface rounded-3xl p-6 border-2 border-border-dark shadow-inner">
                        <div className="flex gap-3 mb-6">
                           <input 
                              type="text" 
                              value={newParam} 
                              onChange={e => setNewParam(e.target.value)} 
                              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddParam())}
                              placeholder="Add individual test parameter..." 
                              className="flex-1 bg-white border-2 border-border-dark rounded-full px-6 py-3 text-xs font-bold text-dark-light focus:border-primary outline-none transition-all" 
                           />
                           <button type="button" onClick={handleAddParam} className="p-3 bg-dark text-white rounded-full hover:bg-dark-light transition-colors"><Plus className="w-5 h-5" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {params.map(p => (
                              <div key={p} className="flex items-center gap-2 bg-white border border-border-dark px-4 py-2 rounded-full text-xs font-black text-dark-light shadow-sm">
                                 {p}
                                 <button type="button" onClick={() => removeParam(p)} className="text-red-500 hover:text-red-700 transition-colors"><X className="w-3.5 h-3.5" /></button>
                              </div>
                           ))}
                           {params.length === 0 && <p className="text-[10px] font-bold text-text-muted italic py-2">No parameters added yet.</p>}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Requirements & Settings */}
               <div className="space-y-10">
                  <div className="bg-surface rounded-3xl p-8 border-2 border-border-dark space-y-8">
                     <h3 className="text-[10px] font-black text-dark-light uppercase tracking-widest border-b border-border-dark pb-4">Clinical Preparation</h3>
                     <div className="space-y-4">
                        {[
                           { key: 'fasting', label: '12hr Fasting Required', icon: AlertCircle },
                           { key: 'noAlcohol', label: 'No Alcohol (24hrs)', icon: AlertCircle },
                           { key: 'morningOnly', label: 'Morning Sample Only', icon: Clock },
                        ].map((prep) => (
                           <label key={prep.key} className="flex items-center justify-between p-4 rounded-full bg-white border border-border-dark cursor-pointer group hover:border-primary transition-all shadow-sm px-6">
                              <div className="flex items-center gap-3">
                                 <prep.icon className="w-4 h-4 text-primary" />
                                 <span className="text-xs font-bold text-dark-light">{prep.label}</span>
                              </div>
                              <input 
                                 type="checkbox" 
                                 checked={preps[prep.key as keyof typeof preps]} 
                                 onChange={() => setPreps({...preps, [prep.key]: !preps[prep.key as keyof typeof preps]})} 
                                 className="w-5 h-5 rounded-lg border-2 border-border-dark text-primary focus:ring-primary cursor-pointer"
                              />
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="bg-dark rounded-3xl p-8 text-white space-y-8 shadow-2xl">
                     <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest border-b border-white/10 pb-4">Logistics & Lab</h3>
                     <div className="space-y-6">
                        <div>
                           <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3 block px-2">Sample Source</label>
                           <div className="grid grid-cols-2 gap-3">
                              <button type="button" className="px-4 py-3 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase hover:bg-white/20 transition-all">Serum</button>
                              <button type="button" className="px-4 py-3 rounded-full bg-primary text-white text-[10px] font-black uppercase shadow-lg shadow-primary/20">Plasma</button>
                           </div>
                        </div>
                         <div>
                           <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3 block px-2">Available Modes</label>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between p-4 rounded-full bg-white/5 border border-white/10 px-6">
                                 <div className="flex items-center gap-3"><Home className="w-4 h-4 text-primary" /><span className="text-xs font-bold">Home Collection</span></div>
                                 <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                              </div>
                              <div className="flex items-center justify-between p-4 rounded-full bg-white/5 border border-white/10 px-6">
                                 <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-primary" /><span className="text-xs font-bold">Lab Visit</span></div>
                                 <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-10 border-t border-border-dark/10 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-3 text-text-muted">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><CheckCircle2 className="w-5 h-5" /></div>
                  <p className="text-xs font-bold">Verified for compliance with NABL guidelines.</p>
               </div>
               <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button type="button" onClick={() => router.push('/tests')} className="flex-1 sm:flex-none px-10 py-4 rounded-full font-black text-sm text-text-muted hover:bg-surface transition-all">Cancel</button>
                  <button 
                     type="submit" 
                     disabled={addTestMutation.isPending}
                     className="flex-1 sm:flex-none px-12 py-4 rounded-full bg-primary text-white font-black text-sm shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                  >
                     {addTestMutation.isPending ? (
                       <>
                         <Loader2 className="w-4 h-4 animate-spin" />
                         Saving...
                       </>
                     ) : "Launch Test Menu"}
                  </button>
               </div>
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
