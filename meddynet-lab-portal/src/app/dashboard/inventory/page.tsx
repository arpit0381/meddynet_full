"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, MoreVertical, 
  Beaker, Clock, IndianRupee, CheckCircle2, 
  XCircle, Loader2, AlertCircle, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  turnaround_hours: number;
  home_collection: boolean;
  is_active: boolean;
}

export default function InventoryPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [newTest, setNewTest] = useState({
    name: "",
    category: "General",
    price: "",
    mrp: "",
    turnaround_hours: 24,
    home_collection: true
  });

  const fetchTests = async () => {
    try {
      const response = await api.get("/labs/me/tests");
      setTests(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleToggle = async (testId: string) => {
    try {
      const response = await api.patch(`/labs/me/tests/${testId}/toggle`);
      setTests(prev => prev.map(t => 
        t.id === testId ? { ...t, is_active: response.data.is_active } : t
      ));
      toast.success(`Test ${response.data.is_active ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/labs/me/tests", {
        ...newTest,
        price: parseFloat(newTest.price),
        mrp: parseFloat(newTest.mrp)
      });
      toast.success("New test added to catalog");
      setIsAdding(false);
      setNewTest({ name: "", category: "General", price: "", mrp: "", turnaround_hours: 24, home_collection: true });
      fetchTests();
    } catch (error) {
      toast.error("Failed to add test");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTests = tests.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Beaker className="text-primary" />
            Test Inventory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 italic">Manage your laboratory's diagnostic offerings and pricing.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add New Test
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search catalog by test name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
            <Filter size={18} />
            Category
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      {isLoading && tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-slate-500 font-medium">Synchronizing catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTests.map((test) => (
              <motion.div 
                key={test.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${test.is_active ? 'border-slate-200 dark:border-slate-800' : 'border-red-100 dark:border-red-900/30 opacity-75'} p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
              >
                {!test.is_active && (
                  <div className="absolute top-0 right-0 py-1 px-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl shadow-sm z-10">
                    Inactive
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${test.is_active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                    <Beaker size={24} />
                  </div>
                  <button 
                    onClick={() => handleToggle(test.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${test.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    {test.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{test.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-6">{test.category}</p>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Pricing (₹)</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">₹{(test.price / 100).toLocaleString()}</span>
                       <span className="text-xs text-slate-400 line-through">₹{(test.mrp / 100).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">TAT</p>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                       <Clock size={16} className="text-primary" />
                       <span>{test.turnaround_hours}h</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  {test.home_collection ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                      <CheckCircle2 size={14} /> Home Service
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <XCircle size={14} /> Center Only
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Test Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Plus size={24} />
                  </div>
                  Add New Test
                </h2>
              </div>

              <form onSubmit={handleAddTest} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Test Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Complete Blood Count (CBC)"
                      value={newTest.name}
                      onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Offer Price (₹)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="0.00"
                        value={newTest.price}
                        onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">MRP (₹)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="0.00"
                        value={newTest.mrp}
                        onChange={(e) => setNewTest({ ...newTest, mrp: e.target.value })}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <input 
                      type="checkbox"
                      id="home_coll"
                      checked={newTest.home_collection}
                      onChange={(e) => setNewTest({ ...newTest, home_collection: e.target.checked })}
                      className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="home_coll" className="text-sm font-bold text-slate-600 dark:text-slate-400 select-none">
                      Enable Home Sample Collection
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 dark:bg-primary py-4 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-400"
                  >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    Confirm & Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
