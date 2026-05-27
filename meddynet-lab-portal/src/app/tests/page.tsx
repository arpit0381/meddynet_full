"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  TestTube2,
  Clock,
  Edit2,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { useLabTestsList, useAddLabTest, useToggleTestStatus } from "@/lib/hooks";
import { Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { MASTER_TEST_CATALOGUE, MASTER_CATEGORIES, type MasterTest } from "@/data/masterTests";

export default function TestManagementPage() {
  const { data: testsArray, isLoading } = useLabTestsList();
  const addTestMutation = useAddLabTest();
  const toggleStatusMutation = useToggleTestStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal state
  const [modalTab, setModalTab] = useState<"catalogue" | "manual">("catalogue");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [catalogueCategory, setCatalogueCategory] = useState("All");
  const [selectedMasterTest, setSelectedMasterTest] = useState<MasterTest | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get("add_new") === "true") {
      setIsAddModalOpen(true);
      router.replace("/tests");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (isAddModalOpen && modalTab === "catalogue") {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isAddModalOpen, modalTab]);

  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    price: "",
    mrp: "",
    turnaround_hours: 24,
    home_collection: true,
  });

  const handleSelectMasterTest = (test: MasterTest) => {
    setSelectedMasterTest(test);
    setFormData({
      name: test.name,
      category: test.category,
      price: String(test.suggested_price),
      mrp: String(test.suggested_mrp),
      turnaround_hours: test.turnaround_hours,
      home_collection: test.home_collection,
    });
  };

  const filteredMasterTests = useMemo(() => {
    return MASTER_TEST_CATALOGUE.filter((t) => {
      const matchSearch =
        !catalogueSearch || t.name.toLowerCase().includes(catalogueSearch.toLowerCase());
      const matchCat = catalogueCategory === "All" || t.category === catalogueCategory;
      return matchSearch && matchCat;
    });
  }, [catalogueSearch, catalogueCategory]);

  interface MappedTest {
    id: string;
    name: string;
    category: string;
    price: number;
    mrp: number;
    turnaround: string;
    status: string;
  }

  const tests = useMemo((): MappedTest[] => {
    if (!testsArray) return [];
    return testsArray.map((t: any) => ({
      id: String(t.id),
      name: String(t.name),
      category: String(t.category || "General"),
      price: Number(t.price || 0) / 100,
      mrp: Number(t.mrp || 0) / 100,
      turnaround: `${t.turnaround_hours || 24} Hours`,
      status: t.is_active ? "Active" : "Inactive",
    }));
  }, [testsArray]);

  const categories = useMemo((): string[] => {
    return ["All Categories", ...Array.from(new Set(tests.map((t) => t.category)))];
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" || test.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tests, searchTerm, selectedCategory]);

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
      setToast({ message: "Test status updated successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to update status", type: "error" });
    }
  };

  const resetModal = () => {
    setModalTab("catalogue");
    setCatalogueSearch("");
    setCatalogueCategory("All");
    setSelectedMasterTest(null);
    setFormData({ name: "", category: "General", price: "", mrp: "", turnaround_hours: 24, home_collection: true });
  };

  const handleSaveAdd = async () => {
    if (!formData.name || !formData.price || !formData.mrp) {
      setToast({ message: "Please fill all required fields", type: "error" });
      return;
    }
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        mrp: parseFloat(formData.mrp),
      };
      await addTestMutation.mutateAsync(payload);
      setIsAddModalOpen(false);
      resetModal();
      setToast({ message: "New test added to catalog! 🎉", type: "success" });
    } catch {
      setToast({ message: "Failed to add test", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-black text-text-muted uppercase tracking-widest animate-pulse">
          Syncing Test Catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark-light tracking-tight mb-2">Test Catalog</h1>
          <p className="text-text-muted font-bold">
            Manage your laboratory&apos;s test menu, pricing and availability.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">
            <FileSpreadsheet className="w-4 h-4" /> Bulk Protocol (CSV)
          </button>
          <Link
            href="/tests/add"
            className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-primary text-white font-black text-[10px] shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/30 transition-all uppercase tracking-widest active:scale-95 border border-primary/50"
          >
            <Plus className="w-4 h-4" /> Add New Test
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[3rem] border border-border-dark/20 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-border-dark/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface/30">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by test name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-border-dark rounded-full pl-12 pr-6 py-3.5 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border-2 border-border-dark text-[10px] font-black uppercase tracking-widest text-dark-light hover:border-primary transition-all shadow-sm"
            >
              <Filter className="w-4 h-4 text-primary" /> {selectedCategory}
            </button>
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-52 bg-white rounded-2xl border border-border-dark shadow-2xl z-50 overflow-hidden p-1.5 max-h-64 overflow-y-auto"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedCategory === cat ? "bg-primary text-white" : "hover:bg-surface text-text-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface/50 text-text-muted text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Diagnostic Test</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Net Price</th>
                <th className="px-8 py-5">TAT</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/10">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-surface rounded-3xl flex items-center justify-center">
                        <TestTube2 className="w-8 h-8 text-primary/30" />
                      </div>
                      <p className="text-sm font-black text-text-muted">No tests in catalog yet</p>
                      <Link
                        href="/tests/add"
                        className="px-6 py-3 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                      >
                        + Add Your First Test
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test, i) => (
                  <motion.tr
                    key={test.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-primary/2 transition-colors border-b border-border-dark/5"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-dark-light mb-0.5 group-hover:text-primary transition-colors">
                          {test.name}
                        </span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none truncate max-w-[150px]">
                          ID: {test.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-surface text-text-muted text-[10px] font-black uppercase tracking-widest">
                        {test.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-dark-light tracking-tight">
                          ₹{test.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted line-through">
                          ₹{test.mrp.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {test.turnaround}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => handleToggleStatus(test.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                          test.status === "Active"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            test.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {test.status}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end">
                        <button className="p-2.5 bg-surface rounded-xl text-text-muted hover:bg-primary/10 hover:text-primary transition-all border border-border-dark/10">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ ADD TEST MODAL ============ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetModal(); }}
        title="Add Test to Catalog"
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col" style={{ maxHeight: "75vh" }}>
          {/* Tabs */}
          <div className="px-8 pt-2 pb-0 flex gap-2 border-b border-border-dark/20 shrink-0">
            <button
              onClick={() => setModalTab("catalogue")}
              className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${
                modalTab === "catalogue"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-dark-light"
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Browse Catalogue
              </span>
            </button>
            <button
              onClick={() => setModalTab("manual")}
              className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${
                modalTab === "manual"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-dark-light"
              }`}
            >
              <span className="flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5" /> Manual Entry
              </span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {modalTab === "catalogue" ? (
              <motion.div
                key="catalogue"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col overflow-hidden flex-1"
              >
                {/* Search & Category Filter */}
                <div className="px-8 pt-5 pb-3 space-y-3 shrink-0">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search CBC, Vitamin D, Lipid Profile..."
                      value={catalogueSearch}
                      onChange={(e) => setCatalogueSearch(e.target.value)}
                      className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-11 pr-10 py-3.5 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                    {catalogueSearch && (
                      <button
                        onClick={() => setCatalogueSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-text-muted" />
                      </button>
                    )}
                  </div>
                  {/* Category pills */}
                  <div className="flex gap-2 flex-wrap">
                    {["All", ...MASTER_CATEGORIES].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCatalogueCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                          catalogueCategory === cat
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-surface text-text-muted border-border-dark hover:border-primary/30"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test List */}
                <div className="overflow-y-auto px-8 pb-3 space-y-2 flex-1 no-scrollbar">
                  {filteredMasterTests.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm font-black text-text-muted">
                        No tests found. Try manual entry.
                      </p>
                    </div>
                  ) : (
                    filteredMasterTests.map((test) => {
                      const isSelected = selectedMasterTest?.name === test.name;
                      return (
                        <motion.button
                          key={test.name}
                          onClick={() => handleSelectMasterTest(test)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                              : "border-border-dark bg-surface/50 hover:border-primary/30 hover:bg-white"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-white border border-border-dark text-text-muted"
                            }`}
                          >
                            <TestTube2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-black tracking-tight truncate ${
                                isSelected ? "text-primary" : "text-dark-light"
                              }`}
                            >
                              {test.name}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                                {test.category}
                              </span>
                              <span className="text-[9px] text-text-muted">·</span>
                              <span className="text-[9px] font-bold text-text-muted flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {test.turnaround_hours}h TAT
                              </span>
                              <span className="text-[9px] text-text-muted">·</span>
                              <span className="text-[9px] font-black text-emerald-600">
                                ₹{test.suggested_price}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>

                {/* Selected test bottom panel */}
                {selectedMasterTest ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-8 pb-6 pt-4 border-t border-border-dark/20 bg-surface/50 shrink-0"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <p className="text-[11px] font-black text-primary uppercase tracking-widest truncate">
                        Selected: {selectedMasterTest.name}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                          Selling Price (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full bg-white border-2 border-border-dark rounded-xl px-3 py-2.5 text-sm font-black outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.mrp}
                          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          className="w-full bg-white border-2 border-border-dark rounded-xl px-3 py-2.5 text-sm font-black outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                          TAT (Hours)
                        </label>
                        <input
                          type="number"
                          value={formData.turnaround_hours}
                          onChange={(e) =>
                            setFormData({ ...formData, turnaround_hours: parseInt(e.target.value) })
                          }
                          className="w-full bg-white border-2 border-border-dark rounded-xl px-3 py-2.5 text-sm font-black outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white border border-border-dark hover:border-primary/20 transition-all mb-3">
                      <input
                        type="checkbox"
                        checked={formData.home_collection}
                        onChange={(e) =>
                          setFormData({ ...formData, home_collection: e.target.checked })
                        }
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-[10px] font-black text-dark-light uppercase tracking-widest">
                        Available for Home Collection
                      </span>
                    </label>
                    <button
                      onClick={handleSaveAdd}
                      disabled={addTestMutation.isPending}
                      className="w-full py-4 rounded-full bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {addTestMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Add to My Catalog
                    </button>
                  </motion.div>
                ) : (
                  <div className="px-8 pb-5 pt-2 shrink-0 text-center">
                    <p className="text-[10px] font-bold text-text-muted">
                      ☝️ Select a test above to set pricing and add it
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Manual Entry Tab */
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="p-8 space-y-6 overflow-y-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                      Official Test Name *
                    </label>
                    <input
                      type="text"
                      placeholder="E.g. Lipid Profile, CBC"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface border-2 border-border-dark rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-surface border-2 border-border-dark rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      {MASTER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                      TAT (In Hours)
                    </label>
                    <input
                      type="number"
                      value={formData.turnaround_hours}
                      onChange={(e) =>
                        setFormData({ ...formData, turnaround_hours: parseInt(e.target.value) })
                      }
                      className="w-full bg-surface border-2 border-border-dark rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="1200"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-surface border-2 border-border-dark rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                      MRP (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      className="w-full bg-surface border-2 border-border-dark rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-3xl bg-surface border-2 border-border-dark hover:border-primary/20 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.home_collection}
                        onChange={(e) =>
                          setFormData({ ...formData, home_collection: e.target.checked })
                        }
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-[10px] font-black text-dark-light uppercase tracking-widest">
                        Available for Home Collection
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
                  <ShieldCheck className="w-7 h-7 text-primary shrink-0" />
                  <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase">
                    Tests visible to patients immediately after cataloging. Ensure pricing accuracy.
                  </p>
                </div>

                <button
                  onClick={handleSaveAdd}
                  disabled={addTestMutation.isPending}
                  className="w-full py-5 rounded-full bg-primary text-white font-black text-sm shadow-xl hover:-translate-y-1 transition-all uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {addTestMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add to Catalog
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
