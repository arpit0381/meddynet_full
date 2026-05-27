"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Home,
  ChevronRight,
  Award,
  Users,
  TestTube2,
  Search,
  Filter,
  ThumbsUp,
  CheckCircle2,
  Zap,
  Globe,
  Calendar,
  FlaskConical,
  ArrowRight,
  TrendingUp,
  Activity,
  Heart,
  Cpu,
  Headphones,
  FileText,
  UserCheck,
  Baby,
  Stethoscope,
  Accessibility,
  Shield,
  X,
  BadgeCheck,
  ListTree,
  Map as MapIcon,
} from "lucide-react";
import Link from "next/link";
import { getLabById, submitReview, markReviewHelpful, type Lab, type LabReview } from "@/lib/labs";
import { useLanguage } from "@/context/LanguageContext";
import { haptics } from "@/lib/haptics";
import MapModal from "@/components/modals/MapModal";
import { Skeleton } from "@/components/ui/Skeleton";

const FACILITY_ICON_MAP: Record<string, React.ReactNode> = {
  award: <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner"><Award className="w-5 h-5" /></div>,
  shield: <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-inner"><Shield className="w-5 h-5" /></div>,
  home: <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner"><Home className="w-5 h-5" /></div>,
  "file-text": <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner"><FileText className="w-5 h-5" /></div>,
  "user-check": <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><UserCheck className="w-5 h-5" /></div>,
  headphones: <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shadow-inner"><Headphones className="w-5 h-5" /></div>,
  cpu: <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500 shadow-inner"><Cpu className="w-5 h-5" /></div>,
  accessibility: <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shadow-inner"><Accessibility className="w-5 h-5" /></div>,
  baby: <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner"><Baby className="w-5 h-5" /></div>,
  stethoscope: <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner"><Stethoscope className="w-5 h-5" /></div>,
};

const TEST_CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Hematology: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  Thyroid: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
  Cardiology: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400" },
  Vitamins: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400" },
  Diabetes: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
  Liver: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  Kidney: { bg: "bg-cyan-50", text: "text-cyan-600", dot: "bg-cyan-400" },
  Packages: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  Blood: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
  BLOOD: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
  Hormones: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
  Urology: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-400" },
  "Infectious Disease": { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400" },
  General: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
};

const TABS = ["Tests", "Reviews", "Facilities"] as const;
type Tab = typeof TABS[number];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as const } },
};

import Toast from "@/components/ui/Toast";

export default function LabDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const urlTestId = searchParams.get("test") || "";

  // ── Live data state ──
  const [lab, setLab] = useState<Lab | null>(null);
  const [labLoading, setLabLoading] = useState(true);
  const [labError, setLabError] = useState(false);
  const [reviews, setReviews] = useState<LabReview[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLabLoading(true);
    setLabError(false);
    getLabById(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) { setLabError(true); }
        else { setLab(data); setReviews(data.reviews ?? []); }
      })
      .catch(() => { if (!cancelled) setLabError(true); })
      .finally(() => { if (!cancelled) setLabLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const [activeTab, setActiveTab] = useState<Tab>("Tests");
  const [testSearch, setTestSearch] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (urlQuery && !testSearch) {
      Promise.resolve().then(() => { setTestSearch(urlQuery); });
    }
  }, [urlQuery, testSearch]);

  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  if (labLoading) {
    return (
      <div className="min-h-screen pt-[72px] bg-surface">
        {/* Skeleton Hero */}
        <div className="bg-dark py-12 relative overflow-hidden">
           <div className="max-w-[1400px] mx-auto px-10 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                 <div className="flex-1 space-y-6">
                    <Skeleton className="h-4 w-48 bg-white/10" />
                    <div className="flex items-center gap-6">
                        <Skeleton className="w-24 h-24 rounded-3xl bg-white/10 shrink-0" />
                        <div className="space-y-4 flex-1">
                            <Skeleton className="h-10 w-3/4 bg-white/10" />
                            <Skeleton className="h-4 w-1/2 bg-white/10" />
                        </div>
                    </div>
                 </div>
                 <div className="w-full lg:w-80 h-16 rounded-2xl bg-white/10" />
              </div>
           </div>
        </div>
        {/* Skeleton Content */}
        <div className="max-w-[1400px] mx-auto px-10 py-12 grid grid-cols-12 gap-10">
           <div className="col-span-12 lg:col-span-8 space-y-6">
              <Skeleton className="h-64 w-full rounded-[40px]" />
              <div className="grid grid-cols-2 gap-4">
                 <Skeleton className="h-32 rounded-3xl" />
                 <Skeleton className="h-32 rounded-3xl" />
              </div>
           </div>
           <div className="col-span-12 lg:col-span-4 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-[40px]" />
           </div>
        </div>
      </div>
    );
  }

  if (labError || !lab) return notFound();

  const categories = ["All", ...Array.from(new Set(lab.tests.map((t) => t.category)))];

  const filteredTests = lab.tests
    .filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(testSearch.toLowerCase()) || 
                          t.category.toLowerCase().includes(testSearch.toLowerCase());
      const matchCat = selectedCategory === "All" || t.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (!testSearch) return 0;
      const s = testSearch.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aCat = a.category.toLowerCase();
      const bCat = b.category.toLowerCase();

      // Exact match gets absolute priority
      if (aName === s && bName !== s) return -1;
      if (bName === s && aName !== s) return 1;

      // Starts with gets next priority
      const aStarts = aName.startsWith(s);
      const bStarts = bName.startsWith(s);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Category match boost
      const aCatMatch = aCat.includes(s);
      const bCatMatch = bCat.includes(s);
      if (aCatMatch && !bCatMatch) return -1;
      if (!aCatMatch && bCatMatch) return 1;

      return 0;
    });

  const totalRatingVotes = lab.ratingBreakdown?.reduce((s, r) => s + r.count, 0) ?? lab.reviewCount;
  // const avgDiscount = lab.tests.length
  //   ? Math.round(
  //       (lab.tests.reduce((s, t) => s + ((t.originalPrice - t.price) / t.originalPrice) * 100, 0) /
  //         lab.tests.length)
  //     )
  //   : 0;

  const popularTests = lab.tests.filter((t) => t.popular);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setIsSubmitting(true);
    try {
      const created = await submitReview(id, {
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setReviews([created, ...reviews]);
      setIsReviewModalOpen(false);
      setNewReview({ name: "", rating: 5, comment: "" });
      setToast({ message: "Thank you! Your review has been published successfully.", type: "success" });
    } catch {
      setToast({ message: "Failed to submit review. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHelpful = async (reviewId: string) => {
    setHelpfulClicked((prev) => {
      const next = new Set(prev);
      const isAdding = !next.has(reviewId);
      if (isAdding) {
        next.add(reviewId);
        setToast({ message: "Marked as helpful. Thanks for your feedback!", type: "info" });
      } else {
        next.delete(reviewId);
      }
      return next;
    });
    try { await markReviewHelpful(id, reviewId); } catch { /* silently fail */ }
  };

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      {/* ─── PREMIUM HERO HEADER ──────────────────────────────────────────── */}
      <div className="relative bg-dark pb-6 lg:pb-12 pt-6 lg:pt-12 overflow-hidden border-b border-white/5">
        {/* Deep, Premium Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        {/* Artistic Glowing Auroras */}
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-dark/50 to-dark pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 py-4 sm:py-6 lg:py-0">
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] font-bold text-white/40 mb-6 sm:mb-12 overflow-x-auto scrollbar-none whitespace-nowrap"
            >
              <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <Link href="/search" className="hover:text-white transition-colors shrink-0">Labs</Link>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="text-white/80 shrink-0 truncate max-w-[150px] sm:max-w-none">{lab.name}</span>
            </motion.nav>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center">
            {/* Lab Avatar - Made much more prominent and premium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
              className="relative shrink-0 group mx-auto lg:mx-0"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-4xl sm:rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div
                className={`relative w-24 sm:w-32 lg:w-40 h-24 sm:h-32 lg:h-40 rounded-4xl sm:rounded-[2.5rem] bg-linear-to-br ${lab.color} flex items-center justify-center text-white text-3xl sm:text-5xl lg:text-6xl font-black shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden ring-4 ring-dark`}
              >
                <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-50" />
                <span className="relative z-10 drop-shadow-lg">{lab.initials}</span>
              </div>
              {lab.verified && (
                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-emerald-400 to-primary flex items-center justify-center shadow-xl ring-4 ring-dark">
                  <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-sm" />
                </div>
              )}
            </motion.div>

            {/* Main Lab Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 min-w-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6 text-center lg:text-left">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight drop-shadow-md">
                  {lab.name}
                </h1>
                {lab.verified && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-linear-to-r from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 backdrop-blur-md self-center sm:self-auto shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)]">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-emerald-300 tracking-widest uppercase">Verified Lab</span>
                  </div>
                )}
              </div>

              {/* Lab Meta Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-10 text-sm sm:text-base text-white/70 mb-10 max-w-3xl">
                <div className="flex items-start gap-3.5 group/loc text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/loc:bg-primary/20 group-hover/loc:border-primary/30 transition-all duration-300 shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span className="leading-snug pt-0.5 sm:pt-1">
                    <span className="text-white font-bold block text-sm sm:text-base">{lab.address}, {lab.city}</span>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{lab.distance} km from your location</span>
                      <button 
                        onClick={() => { haptics.light(); setIsMapOpen(true); }}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Locate
                      </button>
                    </div>
                  </span>
                </div>
                <div className="flex items-center gap-3.5 group/time">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/time:bg-accent/20 group-hover/time:border-accent/30 transition-all duration-300 shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-white font-bold tracking-tight text-sm sm:text-base">{lab.operatingHours}</span>
                </div>
              </div>

              {/* Interactive Badges / Stats row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4">
                {/* Rating - Heroic style */}
                <div className="group flex items-center gap-2.5 sm:gap-3 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-[1.25rem] px-3.5 sm:px-5 py-2 sm:py-3 cursor-pointer">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-star/20 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-star fill-star drop-shadow-[0_0_12px_rgba(249,168,37,0.7)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black text-white leading-none">{lab.rating}</span>
                    <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">{lab.reviewCount.toLocaleString()} Reviews</span>
                  </div>
                </div>

                {lab.nabl && (
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md rounded-2xl sm:rounded-[1.25rem] px-3.5 sm:px-5 py-2 sm:py-3 text-blue-300 group hover:bg-blue-500/20 transition-all">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest">NABL</span>
                  </div>
                )}

                {lab.iso && (
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-purple-500/10 border border-purple-500/20 backdrop-blur-md rounded-2xl sm:rounded-[1.25rem] px-3.5 sm:px-5 py-2 sm:py-3 text-purple-300 group hover:bg-purple-500/20 transition-all">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">ISO Certified</span>
                  </div>
                )}
                
                {lab.homeCollection && (
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-primary/10 border border-primary/20 backdrop-blur-md rounded-2xl sm:rounded-[1.25rem] px-3.5 sm:px-5 py-2 sm:py-3 text-emerald-400 group hover:bg-primary/20 transition-all">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Home Collection</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Prominent CTAs on the right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-[240px] mt-6 lg:mt-0"
            >
              <Link
                href={`/book?lab=${lab.id}&type=home`}
                onClick={() => haptics.medium()}
                className="group relative flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[52px] rounded-2xl bg-white text-dark font-black text-[15px] overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110 shrink-0">
                  <Home className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                </div>
                <span className="relative z-10">Book Home Visit</span>
              </Link>

              <Link
                href={`/book?lab=${lab.id}&type=visit`}
                onClick={() => haptics.medium()}
                className="group flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[52px] rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-black text-[15px] hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-dark transition-all duration-300 group-hover:scale-110 shrink-0">
                  <MapPin className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                </div>
                <span>Visit Lab Clinic</span>
              </Link>

              <button
                onClick={() => { haptics.medium(); setIsMapOpen(true); }}
                className="group flex items-center justify-center gap-3 px-6 py-4 min-h-[52px] rounded-2xl bg-primary/20 border border-primary/30 text-emerald-400 font-black text-[12px] uppercase tracking-widest hover:bg-primary/30 transition-all duration-300"
              >
                <MapIcon className="w-4 h-4" />
                Locate Lab
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Tab Bar */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-border shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { haptics.light(); setActiveTab(tab); }}
                  className={`relative py-4 px-6 min-h-[48px] text-[15px] font-bold shrink-0 transition-colors duration-200 ${
                    activeTab === tab ? "text-primary" : "text-text-secondary hover:text-dark"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBar"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary to-accent rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* ─── BODY ─────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Premium About Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl sm:rounded-4xl border border-border p-6 sm:p-8 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-dark tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  About this Lab
                </h2>
              </div>
              
              <p className="text-[15px] text-text-secondary leading-relaxed font-medium mb-8">
                {lab.about}
              </p>

              {lab.specialties && lab.specialties.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Key Specialties</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {lab.specialties.map((sp) => {
                      const color = TEST_CATEGORY_COLORS[sp] ?? { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
                      return (
                        <span key={sp} className={`inline-flex items-center gap-2 text-[13px] font-bold px-4 py-2 rounded-xl ${color.bg} ${color.text} border border-current/10 transition-transform hover:scale-105 cursor-default`}>
                          <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${color.dot}`} />
                          {t(`search.categories.${sp}`)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-8 border-t border-border border-dashed text-center sm:text-left">
                {[
                  { icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Timing", value: lab.operatingHours, color: "text-accent", bg: "bg-accent/10" },
                  { icon: <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Test Menu", value: `${lab.tests.length} items`, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Patients", value: lab.reviewCount.toLocaleString(), color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((s) => (
                  <div key={s.label} className="group/stat flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0 rounded-2xl sm:rounded-3xl bg-surface hover:bg-white border border-border hover:border-border-dark p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-dark/5">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[1.25rem] ${s.bg} flex items-center justify-center sm:mb-4 ${s.color} group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-500 shadow-inner shrink-0`}>
                      {s.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[10px] sm:text-[11px] font-black text-text-muted uppercase tracking-widest mb-0.5 sm:mb-1.5">{s.label}</p>
                      <p className="text-[13px] sm:text-[14px] font-black text-dark tracking-tight truncate">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ─── TAB CONTENT ─── */}
            <AnimatePresence mode="wait">
              {activeTab === "Tests" && (
                <motion.div
                  key="tests"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-3xl sm:rounded-4xl border border-border p-5 lg:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
                      <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search for tests..."
                          value={testSearch}
                          onChange={(e) => setTestSearch(e.target.value)}
                          className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-surface border border-border text-[14px] sm:text-[15px] font-medium text-dark-light placeholder:text-text-muted transition-all shadow-inner"
                        />
                        {testSearch && (
                          <button
                            onClick={() => setTestSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-border transition-colors text-text-muted hover:text-dark"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => { haptics.medium(); setShowFilters(!showFilters); }}
                        className={`flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 min-h-[44px] rounded-xl sm:rounded-2xl text-[14px] sm:text-[15px] font-bold border transition-all ${showFilters ? "bg-dark text-white border-dark shadow-md" : "bg-white border-border text-dark hover:border-dark/30 hover:bg-surface"}`}
                      >
                        <Filter className="w-4 h-4" />
                        Categories
                      </button>
                    </div>

                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2.5 pt-2 pb-2">
                            {categories.map((cat) => {
                              const color = cat === "All" ? null : TEST_CATEGORY_COLORS[cat];
                              return (
                                <button
                                  key={cat}
                                  onClick={() => { haptics.selection(); setSelectedCategory(cat); }}
                                  className={`text-[13px] font-bold px-4 py-2 min-h-[36px] rounded-xl transition-all ${
                                    selectedCategory === cat
                                      ? cat === "All"
                                        ? "bg-dark text-white border-2 border-dark shadow-md"
                                        : `${color?.bg} ${color?.text} border-2 border-[currentColor] shadow-md`
                                      : "bg-surface border-2 border-transparent text-text-secondary hover:border-border-dark hover:text-dark"
                                  }`}
                                >
                                  {t(`search.categories.${cat}`)}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Premium Test List */}
                  <motion.div
                    key={`${testSearch}-${selectedCategory}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                  >
                    {filteredTests.length === 0 ? (
                      <div className="bg-white rounded-[2xl] border border-border p-12 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                          <FlaskConical className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-lg font-bold text-dark mb-1">No tests found</p>
                        <p className="text-[15px] text-text-secondary">Try a different search term or category filter.</p>
                      </div>
                    ) : (
                      filteredTests.map((test) => {
                        const disc = Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100);
                        const catColor = TEST_CATEGORY_COLORS[test.category] ?? { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
                        return (
                          <motion.div
                            key={test.id}
                            variants={itemVariants}
                            className={`group relative bg-white rounded-2xl sm:rounded-3xl border p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 hover:shadow-[0_8px_30px_-12px_rgba(0,168,107,0.2)] transition-all duration-300 overflow-hidden ${
                              test.id === urlTestId 
                                ? "border-primary ring-4 ring-primary/10 bg-primary/5" 
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            {test.id === urlTestId && (
                               <motion.div 
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: [0, 1, 0] }}
                                 transition={{ repeat: Infinity, duration: 2 }}
                                 className="absolute inset-0 bg-primary/5 pointer-events-none"
                               />
                            )}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -translate-y-1/2 translate-x-1/2" />
                            
                            {/* Category Icon */}
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${catColor.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}>
                              <div className={`absolute inset-0 bg-linear-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                              <TestTube2 className={`w-6 h-6 sm:w-7 sm:h-7 ${catColor.text} relative z-10 shrink-0 group-hover:rotate-12 transition-transform`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-2">
                                <h3 className="text-lg sm:text-xl font-black text-dark tracking-tight group-hover:text-primary transition-colors">
                                  {test.name}
                                </h3>
                                {test.popular && (
                                  <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white uppercase tracking-widest shadow-sm">
                                    <Star className="w-3 h-3 fill-white" /> Popular
                                  </span>
                                )}
                              </div>
                              {test.description && (
                                <p className="text-[13px] sm:text-[14px] text-text-secondary mb-3 sm:mb-4 leading-relaxed line-clamp-2 max-w-3xl">{test.description}</p>
                              )}
                              
                              <div className="flex items-center gap-2.5 sm:gap-4 text-[12px] sm:text-[13px] font-black text-text-muted flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl ${catColor.bg} ${catColor.text} border border-current/10 whitespace-nowrap`}>
                                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-[0_0_6px_currentColor] ${catColor.dot}`} />
                                  {t(`search.categories.${test.category}`)}
                                </span>
                                <span className="flex items-center gap-1.5 sm:gap-2 bg-surface px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-dark-light border border-border/50 group-hover:border-accent/30 transition-colors whitespace-nowrap">
                                  <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-accent animate-pulse" />
                                  {test.turnaround}
                                </span>
                                {test.parameters && (
                                  <span className="flex items-center gap-1.5 sm:gap-2 bg-surface px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors whitespace-nowrap">
                                    <ListTree className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                                    {test.parameters} Parameters
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border shrink-0 gap-4">
                              <div className="text-left sm:text-right">
                                <div className="flex items-baseline gap-2 justify-start sm:justify-end mb-1">
                                  <span className="text-2xl font-black text-dark">₹{test.price}</span>
                                  {disc > 0 && <span className="text-[15px] font-medium text-text-muted line-through">₹{test.originalPrice}</span>}
                                </div>
                                {disc > 0 && (
                                  <span className="inline-block text-[11px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                    SAVE {disc}%
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <Link
                                  href={`/book?lab=${lab.id}&test=${test.id}&type=visit`}
                                  className="group/visit relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-[13px] font-bold text-dark-light hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                                >
                                  <MapPin className="w-3.5 h-3.5 group-hover/visit:animate-bounce" />
                                  Lab Visit
                                </Link>
                                <Link
                                  href={`/book?lab=${lab.id}&test=${test.id}&type=home`}
                                  onClick={() => haptics.medium()}
                                  className="group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-primary text-white text-[14px] font-bold hover:shadow-[0_0_20px_-5px_rgba(0,168,107,0.5)] active:scale-[0.97] transition-all"
                                >
                                  <span className="relative z-10 flex items-center gap-2">
                                    Book Now
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                  </span>
                                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "Reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-3xl sm:rounded-4xl border border-border p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-8 items-center">
                      {/* Big rating */}
                      <div className="text-center lg:text-left flex flex-col items-center lg:items-start shrink-0">
                        <div className="text-[4rem] sm:text-[5rem] font-black text-dark tracking-tighter leading-none mb-1 sm:mb-2">{lab.rating}</div>
                        <div className="flex items-center justify-center lg:justify-start gap-1 sm:gap-1.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 sm:w-7 sm:h-7 ${i < Math.round(lab.rating) ? "text-star fill-star drop-shadow-[0_0_10px_rgba(249,168,37,0.5)]" : "text-border-dark"}`}
                            />
                          ))}
                        </div>
                        <p className="text-[12px] sm:text-[14px] font-black text-text-muted uppercase tracking-widest">{lab.reviewCount.toLocaleString()} Verified Patients</p>
                      </div>

                      <div className="hidden lg:block w-px h-32 bg-border shrink-0" />

                      {/* Rating Breakdown */}
                      <div className="flex-1 w-full space-y-3">
                        {(lab.ratingBreakdown ?? [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: 0 }))).sort((a, b) => b.stars - a.stars).map((row) => {
                          const pct = totalRatingVotes > 0 ? (row.count / totalRatingVotes) * 100 : 0;
                          return (
                            <div key={row.stars} className="flex items-center gap-4">
                              <div className="flex items-center gap-1 w-12 justify-end shrink-0">
                                <span className="text-[14px] font-bold text-dark">{row.stars}</span>
                                <Star className="w-4 h-4 text-star fill-star" />
                              </div>
                              <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.2 }}
                                  className={`h-full rounded-full ${row.stars >= 4 ? "bg-linear-to-r from-primary to-emerald-400" : row.stars === 3 ? "bg-amber-400" : "bg-rose-400"}`}
                                />
                              </div>
                              <span className="text-[13px] font-bold text-text-muted w-10 shrink-0 text-right">{Math.round(pct)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Premium Review Cards */}
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
                    {reviews.map((review) => (
                        <motion.div
                          key={review.id}
                          variants={itemVariants}
                          className="bg-white rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 hover:shadow-lg hover:shadow-dark/5 hover:border-dark/20 transition-all duration-300 relative group overflow-hidden"
                        >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-bl from-primary to-accent flex items-center justify-center text-white font-black text-base sm:text-lg shrink-0 shadow-inner">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                <p className="text-[14px] sm:text-[15px] font-bold text-dark">{review.name}</p>
                                {review.verified && (
                                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? "text-star fill-star drop-shadow-sm" : "text-border-dark"}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[12px] font-black text-text-muted/60 uppercase tracking-widest">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          
                          {review.testName && (
                            <span className="text-[12px] font-bold text-dark-light bg-surface px-3 py-1.5 rounded-lg shrink-0 sm:self-start">
                              {review.testName}
                            </span>
                          )}
                        </div>

                        <p className="text-[14px] text-text-secondary leading-relaxed mb-5">&quot;{review.comment}&quot;</p>

                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-border">
                          <button
                            onClick={() => { haptics.light(); toggleHelpful(review.id); }}
                            className={`flex items-center gap-2.5 text-[13px] font-black transition-all group/helpful min-h-[40px] ${
                              helpfulClicked.has(review.id)
                                ? "text-primary bg-primary/10 px-4 py-2 rounded-xl shadow-inner"
                                : "text-text-muted hover:text-dark px-4 py-2 rounded-xl hover:bg-surface border border-transparent hover:border-border"
                            }`}
                          >
                            <ThumbsUp className={`w-4.5 h-4.5 transition-transform group-hover/helpful:-translate-y-0.5 ${helpfulClicked.has(review.id) ? "fill-primary" : ""}`} />
                            <span className="tracking-tight">Helpful ({((review.helpful ?? 0) + (helpfulClicked.has(review.id) ? 1 : 0)).toLocaleString()})</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Write Review CTA */}
                  <div className="bg-linear-to-br from-primary/10 to-accent/10 rounded-3xl sm:rounded-4xl p-6 sm:p-8 text-center border border-emerald-100 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-500" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-emerald-500">
                        <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-emerald-500" />
                      </div>
                      <p className="text-lg sm:text-xl font-black text-dark mb-2">Share Your Experience</p>
                      <p className="text-[14px] sm:text-[15px] font-medium text-text-secondary mb-6 max-w-md mx-auto leading-relaxed">Visited {lab.name} recently? Help thousands of other patients make better medical decisions.</p>
                      <button
                        onClick={() => { haptics.medium(); setIsReviewModalOpen(true); }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[48px] rounded-xl bg-dark hover:bg-dark-light text-white text-[15px] font-bold shadow-xl shadow-dark/20 hover:-translate-y-1 active:scale-[0.97] transition-all duration-300"
                      >
                        Write a Review
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "Facilities" && (
                <motion.div
                  key="facilities"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl sm:rounded-4xl border border-border p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-black text-dark mb-6 flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Globe className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-accent" />
                      </div>
                      Contact & Location
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: <MapPin className="w-5 h-5" />, label: "Address", value: `${lab.address}, ${lab.city}`, color: "text-rose-500", bg: "bg-rose-50" },
                        { icon: <Clock className="w-5 h-5" />, label: "Hours", value: lab.operatingHours, color: "text-orange-500", bg: "bg-orange-50" },
                        ...(lab.established ? [{ icon: <Calendar className="w-5 h-5" />, label: "Established", value: `Since ${lab.established}`, color: "text-teal-500", bg: "bg-teal-50" }] : []),
                      ].map((info) => (
                        <div key={info.label} className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-transparent hover:border-border hover:bg-white transition-colors duration-300 group">
                          <div className={`w-12 h-12 rounded-xl ${info.bg} ${info.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            {info.icon}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{info.label}</p>
                            <p className="text-[14px] font-bold text-dark">{info.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl sm:rounded-4xl border border-border p-6 sm:p-8 shadow-sm relative overflow-hidden group/fac">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl opacity-0 group-hover/fac:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <h3 className="text-lg sm:text-xl font-black text-dark mb-2 flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                        <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-rose-500" />
                      </div>
                      Amenities & Services
                    </h3>
                    <p className="text-[13px] sm:text-[14px] font-medium text-text-secondary mb-8">Comprehensive facilities provided for a seamless patient experience.</p>

                    {lab.facilities && lab.facilities.length > 0 ? (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {lab.facilities.map((fac) => (
                           <motion.div
                             key={fac.id}
                             variants={itemVariants}
                             className={`flex flex-col gap-4 p-6 rounded-3xl transition-all border ${
                               fac.available
                                 ? "bg-white border-border hover:border-primary/40 hover:shadow-xl hover:shadow-dark/5"
                                 : "bg-surface border-border border-dashed opacity-50"
                             }`}
                           >
                             <div className="flex items-center justify-between">
                               <div className="group-hover:scale-110 transition-transform duration-500">
                                 {FACILITY_ICON_MAP[fac.icon] ?? (
                                   <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                     <CheckCircle2 className="w-5 h-5" />
                                   </div>
                                 )}
                               </div>
                               {fac.available ? (
                                 <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 italic font-black text-[10px] uppercase tracking-tighter">
                                   Active
                                 </div>
                               ) : (
                                 <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 border border-gray-100">
                                   <X className="w-4 h-4" />
                                 </div>
                               )}
                             </div>
                             <div>
                               <p className={`text-[17px] font-black mb-1.5 tracking-tight ${fac.available ? "text-dark" : "text-text-muted"}`}>
                                 {fac.name}
                               </p>
                               <p className="text-[13px] text-text-secondary leading-relaxed font-medium">{fac.description}</p>
                             </div>
                           </motion.div>
                         ))}
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-10 h-10 text-border-dark mx-auto mb-3" />
                        <p className="text-sm text-text-muted">Facility info not yet available.</p>
                      </div>
                    )}
                  </div>

                  {/* Quality badges */}
                  <div className="bg-linear-to-br from-dark to-dark-light rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                    <h3 className="text-base font-bold text-white mb-4 relative">Quality Certifications</h3>
                    <div className="flex flex-wrap gap-3 relative">
                      {lab.nabl && (
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-300" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">NABL Accredited</p>
                            <p className="text-[10px] text-white/40">National Standard</p>
                          </div>
                        </div>
                      )}
                      {lab.iso && (
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-300" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">ISO 9001:2015</p>
                            <p className="text-[10px] text-white/40">International Quality</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                          <BadgeCheck className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">MeddyNet Verified</p>
                          <p className="text-[10px] text-white/40">Platform Certified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── PREMIUM SIDEBAR ── */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Quick Book Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="bg-white rounded-3xl sm:rounded-4xl border-2 border-border p-6 sm:p-8 shadow-xl shadow-dark/5 relative overflow-hidden group/card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <h3 className="text-xl font-black text-dark tracking-tight mb-1">Book an Appointment</h3>
              <p className="text-[14px] font-medium text-text-secondary mb-6 leading-relaxed">Choose your preferred testing method</p>

              <div className="space-y-4 mb-6">
                <Link
                  href={`/book?lab=${lab.id}&type=home`}
                  className="flex items-center justify-between p-5 rounded-2xl bg-surface border-2 border-transparent hover:border-primary hover:bg-emerald-50 transition-all group/btn cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[15px] font-heavy text-dark group-hover/btn:text-primary transition-colors">Home Collection</p>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-tight">Phlebotomist visits you</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/50 group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>

                <Link
                  href={`/book?lab=${lab.id}&type=visit`}
                  className="flex items-center justify-between p-5 rounded-2xl bg-surface border-2 border-transparent hover:border-accent hover:bg-blue-50 transition-all group/btn visit cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-[15px] font-heavy text-dark group-hover/btn:text-accent transition-colors">Visit Lab Clinic</p>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-tight">Direct walk-in access</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/50 group-hover/btn:bg-accent group-hover/btn:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              {/* Popular Test highlight */}
              {lab.tests[0] && (() => {
                const feat = popularTests[0] ?? lab.tests[0];
                const d = Math.round(((feat.originalPrice - feat.price) / feat.originalPrice) * 100);
                return (
                  <div className="bg-dark rounded-2xl p-5 relative overflow-hidden group/deal">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl opacity-50 group-hover/deal:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-md uppercase tracking-wider">Most Booked</span>
                        {d > 0 && <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md uppercase tracking-wider">Save {d}%</span>}
                      </div>
                      <p className="text-[14px] font-bold text-white mb-4 line-clamp-1">{feat.name}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">₹{feat.price}</span>
                          <span className="text-[13px] font-medium text-white/30 line-through">₹{feat.originalPrice}</span>
                        </div>
                        <Link href={`/book?lab=${lab.id}&test=${feat.id}`} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>

            {/* Premium Lab Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="bg-white rounded-3xl sm:rounded-4xl border-2 border-border p-6 sm:p-8 shadow-sm"
            >
              <h3 className="text-lg font-black text-dark tracking-tight mb-6">Lab Reliability</h3>
              <div className="space-y-5">
                {[
                  { label: "Report Accuracy", value: 99, color: "bg-linear-to-r from-emerald-500 to-teal-400", icon: <BadgeCheck className="w-4 h-4" /> },
                  { label: "On-Time Delivery", value: 97, color: "bg-linear-to-r from-blue-500 to-indigo-400", icon: <Clock className="w-4 h-4" /> },
                  { label: "Patient Trust Score", value: Math.round(lab.rating * 20), color: "bg-linear-to-r from-purple-500 to-pink-500", icon: <Users className="w-4 h-4" /> },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted">{stat.icon}</span>
                        <span className="text-[13px] font-bold text-dark">{stat.label}</span>
                      </div>
                      <span className="text-[13px] font-black text-dark">{stat.value}%</span>
                    </div>
                    <div className="h-2.5 bg-surface rounded-full overflow-hidden p-0.5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${stat.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Premium Comparison CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-3xl sm:rounded-4xl p-6 sm:p-8 text-center relative overflow-hidden group/compare"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/compare:scale-110 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-black text-white mb-2">Compare Savings</h4>
                <p className="text-[14px] text-white/70 mb-6 leading-relaxed">
                  Join 50,000+ users who saved up to 70% by comparing labs on MeddyNet.
                </p>
                <Link
                  href="/compare"
                  className="w-full py-4 rounded-xl bg-white text-dark text-[15px] font-black hover:bg-primary hover:text-white hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2 group-hover/compare:scale-[1.02]"
                >
                  Compare Prices Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── REVIEW MODAL ─── */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-dark tracking-tight">Write a Review</h3>
                  <button 
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={isSubmitting}
                    className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-dark hover:bg-border transition-all disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-3">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          onMouseEnter={() => !isSubmitting && setNewReview({ ...newReview, rating: star })}
                          className="group focus:outline-none transition-transform active:scale-95"
                          disabled={isSubmitting}
                        >
                          <Star 
                            className={`w-10 h-10 transition-all dropdown-shadow-sm ${
                              star <= newReview.rating 
                                ? "text-star fill-star group-hover:scale-110" 
                                : "text-border-dark group-hover:text-star/40"
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="ml-4 text-lg font-black text-dark">
                        {newReview.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      placeholder="e.g. Rahul Sharma"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-surface border border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-dark placeholder:font-normal placeholder:text-text-muted"
                    />
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2">Your Experience</label>
                    <textarea
                      required
                      disabled={isSubmitting}
                      rows={4}
                      placeholder="Tell us about the lab service, phlebotomist behavior, or report punctuality..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-surface border border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-dark placeholder:font-normal placeholder:text-text-muted resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-4 rounded-2xl border-2 border-border text-dark text-[15px] font-black hover:bg-surface transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newReview.name || !newReview.comment}
                      className="flex-2 px-6 py-4 rounded-2xl bg-dark text-white text-[15px] font-black hover:bg-dark-light shadow-xl shadow-dark/20 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          Post Review
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ─── MAP MODAL ─────────────────────────────────────────────────── */}
      {lab && (
        <MapModal 
          isOpen={isMapOpen} 
          onClose={() => setIsMapOpen(false)} 
          lab={lab} 
        />
      )}
    </div>
  );
}
