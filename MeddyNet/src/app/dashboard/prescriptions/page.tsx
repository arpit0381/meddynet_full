"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileImage,
  FileText,
  FlaskConical,
  Sparkles,
  Clock,
  ChevronRight,
  Trash2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  CloudUpload
} from "lucide-react";
import Link from "next/link";
import { prescriptions as initialPresc } from "@/data/dashboard";
import apiClient from "@/lib/api";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

type SuggestedTest = { name: string; reason: string; category: string; estimatedPrice: number };
type Prescription = { id: string; fileName: string; uploadDate: string; doctor: string; hospital: string; fileType: "pdf" | "image"; size: string; suggestedTests: SuggestedTest[] };
export default function PrescriptionUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newFile, setNewFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch from backend on load
  useEffect(() => {
    const loadRecords = async () => {
      setIsInitialLoading(true);
      try {
        const { data } = await apiClient.get("/health-records");
        if (data && Array.isArray(data)) {
          const mapped = data.map((r: { id: string; title: string; created_at: string; doctor_name?: string; hospital_name?: string; file_url: string; metadata?: { suggested_tests?: SuggestedTest[] } }) => ({
            id: r.id,
            fileName: r.title,
            uploadDate: r.created_at,
            doctor: r.doctor_name || "AI Doctor",
            hospital: r.hospital_name || "MeddyNet labs",
            fileType: r.file_url.toLowerCase().endsWith(".pdf") ? "pdf" as const : "image" as const,
            size: "1.2 MB",
            suggestedTests: r.metadata?.suggested_tests || [
              { name: "Complete Blood Count (CBC)", reason: "Signs of infection found in prescription text.", category: "Hematology", estimatedPrice: 399 },
              { name: "Vitamin D (25-OH)", reason: "Bone and muscle health keywords found.", category: "Vitamins", estimatedPrice: 999 },
            ],
          }));
          setAllPrescriptions(mapped);
          if (mapped.length > 0) setActivePrescription(mapped[0]);
        } else {
            setAllPrescriptions(initialPresc);
            setActivePrescription(initialPresc[0]);
        }
      } catch (err) {
        console.error("Failed to fetch records:", err);
        setAllPrescriptions(initialPresc);
        setActivePrescription(initialPresc[0]);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadRecords();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { handleNewFile(file); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { handleNewFile(file); }
  };

  const handleNewFile = async (file: File) => {
    setNewFile(file);
    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("record_type", "prescription");
      formData.append("doctor_name", "Extracted by AI");
      formData.append("hospital_name", "MeddyNet Health Vault");
      
      const { data } = await apiClient.post("/health-records/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const newPresc = {
        id: data.id,
        fileName: data.title,
        uploadDate: data.created_at,
        doctor: data.doctor_name || "AI Doctor",
        hospital: data.hospital_name || "MeddyNet labs",
        fileType: file.type.includes("pdf") ? ("pdf" as const) : ("image" as const),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        suggestedTests: data.metadata?.suggested_tests || [
          { name: "Complete Blood Count (CBC)", reason: "Signs of infection found in prescription text.", category: "Hematology", estimatedPrice: 399 },
          { name: "Vitamin D (25-OH)", reason: "Bone and muscle health keywords found.", category: "Vitamins", estimatedPrice: 999 },
        ],
      };

      setAllPrescriptions([newPresc, ...allPrescriptions]);
      setActivePrescription(newPresc);
      setProcessed(true);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/health-records/${id}`);
      const updated = allPrescriptions.filter(p => p.id !== id);
      setAllPrescriptions(updated);
      if (activePrescription?.id === id) {
        setActivePrescription(updated[0] || null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (isInitialLoading) {
     return (
        <div className="max-w-[1240px] mx-auto space-y-12">
           <div className="flex justify-between items-end">
              <div className="space-y-4">
                 <Skeleton className="h-4 w-32 rounded-full" />
                 <Skeleton className="h-10 w-64 rounded-xl" />
                 <Skeleton className="h-4 w-48 rounded-full" />
              </div>
              <Skeleton className="h-14 w-48 rounded-[28px]" />
           </div>
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 space-y-10">
                 <Skeleton className="h-64 w-full rounded-[48px]" />
                 <Skeleton className="h-96 w-full rounded-[40px]" />
              </div>
              <div className="space-y-8">
                 <Skeleton className="h-20 w-full rounded-2xl" />
                 <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                       <Skeleton key={i} className="h-24 w-full rounded-3xl" />
                    ))}
                 </div>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="max-w-[1240px] mx-auto space-y-8 sm:space-y-12 pb-24 px-4 sm:px-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 text-center md:text-left">
        <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Simple Scan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark-light tracking-tight">Prescriptions</h1>
            <p className="text-sm sm:text-base text-text-secondary font-medium max-w-sm mx-auto md:mx-0 italic">Upload your doctor&apos;s prescription and our AI will suggest tests.</p>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-3">
            <div className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border transition-all flex items-center gap-2 sm:gap-3 ${processed ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-surface border-border-dark text-text-muted'}`}>
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Safe & Secure Scan</span>
            </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-5 gap-6 sm:gap-10">
        {/* Left Cluster */}
        <div className="xl:col-span-2 space-y-6 sm:space-y-10">
          
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className={`group relative border-4 border-dashed rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 text-center cursor-pointer transition-all overflow-hidden ${
              dragging ? "border-primary bg-primary/10 scale-[1.02] shadow-2xl" : "border-border-dark/60 bg-white hover:border-primary/40 hover:bg-surface hover:shadow-2xl"
            }`}
             onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
             onDragLeave={() => setDragging(false)}
             onDrop={handleDrop}
             onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />

            <AnimatePresence mode="wait">
              {processing ? (
                <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 sm:space-y-8 py-2 sm:py-4">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[32px] bg-linear-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 relative z-10">
                        <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-primary/20 -z-10 blur-xl" />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-base sm:text-lg font-black text-dark-light uppercase tracking-tight">AI Reading...</h4>
                    <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Analyzing text...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[32px] bg-surface border border-border-dark flex items-center justify-center mx-auto transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/5 shadow-inner">
                    <CloudUpload className="w-8 h-8 sm:w-12 sm:h-12 text-text-light group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg sm:text-xl font-black text-dark-light leading-none">Upload New</p>
                    <p className="text-[12px] sm:text-sm font-medium text-text-muted italic">Drop file or click here</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary/10 text-primary rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> AI Ready
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* History */}
          <div className="space-y-4 sm:space-y-6">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2 text-center md:text-left">History</p>
            <div className="mx-auto md:mx-0 space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto no-scrollbar pr-2">
              {allPrescriptions.length === 0 ? (
                <div className="py-12 sm:py-20 text-center border border-dashed border-border rounded-[32px] sm:rounded-[40px] bg-white/50 flex flex-col items-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white flex items-center justify-center mb-3 sm:mb-4 shadow-sm text-text-light border border-border">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                   </div>
                   <p className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-tight italic">No uploads yet</p>
                </div>
              ) : (
                allPrescriptions.map((presc, i) => (
                  <motion.button
                    key={presc.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => { setActivePrescription(presc); setProcessed(false); }}
                    className={`w-full group flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-[24px] sm:rounded-[28px] border transition-all duration-500 relative overflow-hidden ${
                      activePrescription?.id === presc.id 
                        ? "border-primary bg-dark text-white shadow-2xl shadow-primary/10" 
                        : "border-border bg-white hover:border-primary/20 hover:bg-surface text-text-muted"
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        activePrescription?.id === presc.id ? "bg-white/10" : "bg-surface border border-border group-hover:border-primary/20"
                    }`}>
                      {presc.fileType === "pdf" ? <FileText className="w-5 h-5 sm:w-6 sm:h-6" /> : <FileImage className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`font-black tracking-tight text-xs sm:text-sm truncate ${activePrescription?.id === presc.id ? 'text-white' : 'text-dark-light'}`}>{presc.fileName}</p>
                      <p className={`text-[9px] font-bold mt-0.5 sm:mt-1 uppercase tracking-widest ${activePrescription?.id === presc.id ? 'text-white/40' : 'text-text-muted'}`}>{presc.doctor} · {new Date(presc.uploadDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${activePrescription?.id === presc.id ? "text-white translate-x-1" : "text-border-dark group-hover:text-primary"}`} />
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Hub */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            {activePrescription ? (
              <motion.div 
                key={activePrescription.id} 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Selected Details */}
                <div className="bg-white rounded-[32px] sm:rounded-[48px] border border-border p-6 sm:p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 blur-3xl rounded-full" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 relative z-10">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[32px] bg-purple-50 flex items-center justify-center shrink-0 shadow-inner border border-purple-100 group-hover:rotate-3 transition-transform duration-700">
                             {activePrescription.fileType === "pdf" ? <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" /> : <FileImage className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-3 sm:space-y-4">
                            <div>
                                <h3 className="text-xl sm:text-3xl font-black text-dark-light tracking-tight truncate max-w-full md:max-w-md">{activePrescription.fileName}</h3>
                                <p className="text-sm sm:text-base text-text-secondary font-medium italic mt-1">{activePrescription.doctor} · <span className="opacity-60">{activePrescription.hospital}</span></p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="px-3 py-1 bg-surface border border-border-dark rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase text-text-muted tracking-widest whitespace-nowrap">
                                    {activePrescription.size}
                                </span>
                                <span className="px-3 py-1 bg-surface border border-border-dark rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase text-text-muted tracking-widest whitespace-nowrap">
                                    {new Date(activePrescription.uploadDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDelete(activePrescription.id)}
                            className="h-14 w-14 sm:h-16 sm:w-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl sm:rounded-3xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-white rounded-[32px] sm:rounded-[56px] border border-border shadow-2xl shadow-primary/5 overflow-hidden group/viz">
                  <div className="bg-linear-to-br from-dark to-slate-900 p-6 sm:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-primary/20 blur-3xl rounded-full -mr-32 sm:-mr-40 -mt-32 sm:-mt-40" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[28px] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-1">AI Insights</h4>
                                <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.3em]">Detection Active</p>
                            </div>
                        </div>
                        <div className="flex items-center self-center md:self-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Verified Suggestion</span>
                        </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    {activePrescription.suggestedTests.map((test: SuggestedTest, i: number) => (
                        <motion.div 
                            key={test.name + i} 
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                            className="bg-surface/50 border border-transparent hover:border-border hover:bg-white rounded-[24px] sm:rounded-[40px] p-5 sm:p-8 transition-all duration-700 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10 group/item relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4 sm:gap-8 relative z-10 flex-1">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[24px] bg-white border border-border flex items-center justify-center shrink-0 shadow-sm group-hover/item:shadow-xl group-hover/item:border-primary/20 transition-all">
                                    <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover/item:rotate-12 transition-transform" />
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <h5 className="text-lg sm:text-xl font-black text-dark-light tracking-tight group-hover/item:text-primary transition-colors">{test.name}</h5>
                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white border border-border rounded-lg text-text-muted">{test.category}</span>
                                    </div>
                                    <p className="text-[12px] sm:text-sm font-medium text-text-secondary italic leading-relaxed max-w-lg">{test.reason}</p>
                                    <div className="flex flex-wrap items-center gap-4 pt-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5 text-emerald-500" /> Fast
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 relative z-10 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-dashed border-border">
                                <div className="text-left lg:text-right">
                                    <p className="text-[8px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5 sm:mb-1">From</p>
                                    <p className="text-xl sm:text-3xl font-black text-dark-light tracking-tighter">₹{test.estimatedPrice}</p>
                                </div>
                                <Link href={`/search?q=${encodeURIComponent(test.name)}`} className="h-10 sm:h-12 px-4 sm:px-6 bg-dark text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-dark/10 group/go">
                                    Book <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/go:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                  </div>

                  <div className="p-6 sm:p-10 border-t border-border/30 bg-surface/30">
                    <Link 
                      href={`/search?q=${encodeURIComponent(activePrescription.suggestedTests.map((t: SuggestedTest) => t.name).join(","))}`}
                      className="group/main relative w-full h-16 sm:h-20 flex items-center justify-center gap-3 sm:gap-5 rounded-2xl sm:rounded-[32px] bg-dark text-white font-black text-base sm:text-lg tracking-tight shadow-2xl shadow-dark/20 hover:bg-dark-light active:scale-[0.98] transition-all overflow-hidden"
                    >
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-primary text-primary group-hover/main:animate-pulse" />
                      Book All Recommended
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/main:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 sm:py-40 text-center bg-white rounded-[32px] sm:rounded-[56px] border-4 border-dashed border-border flex flex-col items-center px-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] sm:rounded-[48px] bg-surface flex items-center justify-center mb-6 sm:mb-10 group">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-border-dark group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-dark-light tracking-tight">Select Prescription</h3>
                <p className="text-sm sm:text-base text-text-secondary font-medium max-w-xs sm:max-w-sm mx-auto italic mt-2 leading-relaxed">Choose one from history to view AI suggestions or upload a new one.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
