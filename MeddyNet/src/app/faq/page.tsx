"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Search, 
  HelpCircle, 
  Plus, 
  Minus, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  LayoutGrid,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

function FAQItem({ question, answer, i, t }: { question: string; answer: string; i: number; t: (key: string) => string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<null | 'up' | 'down'>(null);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={i}
      variants={fadeUp}
      className={`group border border-slate-100 rounded-4xl bg-white transition-all duration-300 mb-4 overflow-hidden ${isOpen ? "ring-2 ring-primary/20 shadow-xl shadow-primary/5" : "hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/50"}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 sm:p-8 text-left flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary"}`}>
                <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-dark group-hover:text-primary transition-colors">
            {question}
            </span>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-all ${isOpen ? "rotate-180 bg-primary border-primary text-white" : ""}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 sm:px-8 pb-8 pt-2">
              <div className="w-full h-px bg-slate-100 mb-6" />
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
                {answer}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                <span className="text-sm font-bold text-slate-400">{t("faq.helpful")}</span>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setFeedback('up')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${feedback === 'up' ? "bg-primary text-white" : "bg-white text-slate-500 hover:text-primary border border-slate-200"}`}
                    >
                        <ThumbsUp className="w-4 h-4" /> {t("faq.yes")}
                    </button>
                    <button 
                        onClick={() => setFeedback('down')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${feedback === 'down' ? "bg-rose-500 text-white" : "bg-white text-slate-500 hover:text-rose-500 border border-slate-200"}`}
                    >
                        <ThumbsDown className="w-4 h-4" /> {t("faq.no")}
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { t } = useLanguage();

  const categories = [
    { id: "all", label: t("faq.cat_all"), icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "general", label: t("faq.cat_general"), icon: <HelpCircle className="w-4 h-4" /> },
    { id: "booking", label: t("faq.cat_booking"), icon: <BookOpen className="w-4 h-4" /> },
    { id: "reports", label: t("faq.cat_reports"), icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "payments", label: t("faq.cat_payments"), icon: <CreditCard className="w-4 h-4" /> },
    { id: "collection", label: t("faq.cat_collection"), icon: <Truck className="w-4 h-4" /> },
  ];

  const filteredFaqs = useMemo(() => {
    const faqs = [
      {
        category: "general",
        question: t("faqs.q1_q"),
        answer: t("faqs.q1_a"),
      },
      {
        category: "booking",
        question: t("faqs.q2_q"),
        answer: t("faqs.q2_a"),
      },
      {
        category: "reports",
        question: t("faqs.q3_q"),
        answer: t("faqs.q3_a"),
      },
      {
        category: "payments",
        question: t("faqs.q4_q"),
        answer: t("faqs.q4_a"),
      },
      {
        category: "collection",
        question: t("faqs.q5_q"),
        answer: t("faqs.q5_a"),
      },
    ];

    return faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, t]);

  return (
    <div className="bg-[#FDFDFD] min-h-screen pt-[120px] pb-24 relative overflow-hidden">
      {/* ─── Background Elements ─── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ─── Header Section ─── */}
        <div className="text-center mb-16 sm:mb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("faq.subtitle")}
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-dark mb-8 tracking-tight leading-tight px-4"
          >
            {t("faq.title")}
          </motion.h1>
          
          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="max-w-2xl mx-auto relative group px-2 sm:px-0"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-xl border-2 border-slate-100 rounded-3xl p-2 sm:p-2 pr-4 shadow-2xl shadow-slate-200/50 focus-within:border-primary/50 transition-all duration-500">
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <input 
                    type="text" 
                    placeholder={t("faq.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent py-3 sm:py-4 text-dark font-bold placeholder:text-slate-300 outline-none text-base sm:text-lg"
                    suppressHydrationWarning
                />
            </div>
          </motion.div>
        </div>

        {/* ─── Main Content Layout ─── */}
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar / Categories */}
            <aside className="w-full lg:w-72 shrink-0">
                <div className="sticky top-[140px]">
                    <div className="flex items-center gap-3 mb-6 px-4">
                        <Filter className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("faq.categories")}</h3>
                    </div>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-4 lg:pb-0 px-2 lg:px-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all shrink-0 lg:shrink
                                    ${activeCategory === cat.id 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                                        : "bg-white text-slate-500 hover:bg-slate-50 hover:text-primary border border-slate-100"}
                                `}
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Questions Container */}
            <div className="flex-1">
                <div className="mb-8 flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black text-dark tracking-tight">
                        {activeCategory === "all" ? t("faq.cat_all") : categories.find(c => c.id === activeCategory)?.label}
                    </h2>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        {filteredFaqs.length} {t("faq.results")}
                    </span>
                </div>

                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <FAQItem key={faq.question} {...faq} i={index} t={t} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-dark mb-2">{t("faq.no_results")}</h3>
                            <p className="text-slate-400 font-bold text-sm">{t("faq.try_adjusting")}</p>
                        </div>
                    )}
                </div>

                {/* ─── Contact Banner ─── */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 p-8 sm:p-12 rounded-[3.5rem] bg-dark relative overflow-hidden group"
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-md text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                                {t("faq.contact_title")}
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                {t("faq.contact_desc")}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <Link href="/chat" className="px-10 py-5 bg-primary text-white font-black rounded-3xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 group">
                                <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" /> {t("faq.chat")}
                            </Link>
                             <Link href="/contact" className="px-10 py-5 bg-white/10 text-white font-black rounded-3xl hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
                                {t("faq.contact_support")} <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* ─── Navigation ─── */}
        <div className="mt-24 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-primary transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t("common.home")}
            </Link>
        </div>
      </div>
    </div>
  );
}
