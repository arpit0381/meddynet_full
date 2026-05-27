"use client";

import Link from "next/link";
import Image from "next/image";
import AnimatedPartnerLink from "@/components/ui/AnimatedPartnerLink";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import {
  Search, MapPin, ArrowRight, Building2, Home, FileText,
  Shield, Clock, Star, Users, TestTube2, Microscope,
  ChevronRight, Zap, CheckCircle2, Activity, Award,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { haptics } from "@/lib/haptics";
import { useAuthStore } from "@/store/authStore";

/* ─────────────────────────── data ─────────────────────────── */
/* ─────────────────── animation variants ─────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger: Variants = { visible: { transition: { staggerChildren: 0.07 } } };

/* ─────────────────── CountUp component ─────────────────── */
function CountUp({ end, suffix = "", decimals = 0, duration = 1600 }: {
  end: number; suffix?: string; decimals?: number; duration?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(parseFloat((end * eased).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, decimals, duration]);

  return <span ref={ref}>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}</span>;
}

/* ══════════════════════════ PAGE ══════════════════════════ */
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const { t, tArray } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
        router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const searchTags = tArray("search.tags");

  const features = [
    {
      icon: <Microscope className="w-6 h-6" />,
      title: t("features.f1_title"),
      description: t("features.f1_desc"),
      iconBg: "bg-emerald-50 text-emerald-600",
      accent: "#00A86B",
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: t("features.f2_title"),
      description: t("features.f2_desc"),
      iconBg: "bg-blue-50 text-blue-600",
      accent: "#1E88E5",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t("features.f3_title"),
      description: t("features.f3_desc"),
      iconBg: "bg-orange-50 text-orange-600",
      accent: "#f97316",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("features.f4_title"),
      description: t("features.f4_desc"),
      iconBg: "bg-purple-50 text-purple-600",
      accent: "#9333ea",
    },
  ];

  const steps = [
    { num: 1, icon: <Search className="w-5 h-5" />, title: t("howItWorks.step1_title"), desc: t("howItWorks.step1_desc") },
    { num: 2, icon: <Building2 className="w-5 h-5" />, title: t("howItWorks.step2_title"), desc: t("howItWorks.step2_desc") },
    { num: 3, icon: <Clock className="w-5 h-5" />, title: t("howItWorks.step3_title"), desc: t("howItWorks.step3_desc") },
    { num: 4, icon: <FileText className="w-5 h-5" />, title: t("howItWorks.step4_title"), desc: t("howItWorks.step4_desc") },
  ];

  const testimonials = [
    {
      name: "Priya Sharma", city: "Delhi", role: "Early User", rating: 5,
      text: t("testimonials.t1_text"),
      avatar: "PS", color: "from-pink-500 to-rose-500",
    },
    {
      name: "Arjun Mehta", city: "Mumbai", role: "Beta Tester", rating: 5,
      text: t("testimonials.t2_text"),
      avatar: "AM", color: "from-blue-500 to-indigo-500",
    },
    {
      name: "Dr. Kavita Rao", city: "Bangalore", role: "Healthcare Professional", rating: 5,
      text: t("testimonials.t3_text"),
      avatar: "KR", color: "from-emerald-500 to-teal-500",
    },
    {
      name: "Rahul Verma", city: "Pune", role: "Early Adopter", rating: 5,
      text: t("testimonials.t4_text"),
      avatar: "RV", color: "from-orange-500 to-amber-500",
    },
  ];

  const handleSearch = (query?: string) => {
    const q = query ?? searchQuery;
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    else router.push("/search");
  };

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-linear-to-r from-primary to-accent z-9999"
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative flex items-center pt-[120px] sm:pt-[160px] pb-12 sm:pb-24 overflow-hidden bg-white">
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(#00A86B 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* soft blobs */}
        <div className="absolute top-0 right-0 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-primary/6 blur-[80px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-accent/5 blur-[60px] sm:blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* ── Left copy ── */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold tracking-wide mb-4 sm:mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {t("hero.tag")}
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-dark leading-[1.1] tracking-tight mb-4 sm:mb-5">
                {t("hero.title1")}<br />
                <span className="relative inline-block">
                  <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">{t("hero.titleHighlight")}</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                    <path d="M2 6C60 2 150 2 298 5" stroke="url(#hug)" strokeWidth="2.5" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="hug" x1="0" y1="0" x2="300" y2="0">
                        <stop stopColor="#00A86B" /><stop offset="1" stopColor="#1E88E5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                {" "}{t("hero.title2")}
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-sm sm:text-lg text-slate-500 leading-relaxed mb-6 sm:mb-8 max-w-[500px]">
                {t("hero.description")}
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mb-6 sm:mb-10">
                <button onClick={() => { haptics.medium(); handleSearch(); }}
                  className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 min-h-[44px] rounded-2xl font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 text-sm"
                  suppressHydrationWarning
                >
                  <Search className="w-4 h-4" /> {t("hero.findTests")}
                </button>
                <AnimatedPartnerLink
                  className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 min-h-[44px] rounded-2xl font-bold text-dark bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 text-sm"
                  onClick={() => haptics.medium()}>
                  <Users className="w-4 h-4 text-primary" /> {t("hero.partnerBtn")}
                </AnimatedPartnerLink>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-3 sm:gap-5">
                {[
                  { icon: <Shield className="w-3.5 h-3.5" />, text: t("hero.nabl") },
                  { icon: <Zap className="w-3.5 h-3.5" />, text: t("hero.sameDay") },
                  { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: t("hero.verified") },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500">
                    <span className="text-primary">{badge.icon}</span>{badge.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Right illustration ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center items-center relative mt-8 lg:mt-0"
            >
              <div className="relative w-full max-w-[340px] sm:max-w-[480px]">
                {/* glow behind image */}
                <div className="absolute inset-8 bg-linear-to-br from-primary/15 to-accent/10 rounded-full blur-2xl sm:blur-3xl" />
                <Image
                  src="/hero-illustration.png"
                  alt="MeddyNet — find diagnostic labs near you"
                  width={480}
                  height={480}
                  priority
                  className="relative z-10 w-full h-auto drop-shadow-2xl rounded-4xl"
                  style={{ height: 'auto' }}
                />
                {/* floating badge — top left */}
                <div className="absolute top-4 sm:top-8 -left-2 sm:-left-6 z-20 bg-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-xl border border-slate-100 animate-float sm:scale-100 scale-90 origin-top-left">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center">
                      <TestTube2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-dark">{t("heroBadges.nablCertified")}</p>
                      <p className="text-[9px] sm:text-[10px] text-primary font-semibold">{t("heroBadges.verifiedLabs")}</p>
                    </div>
                  </div>
                </div>
                {/* floating badge — bottom right */}
                <div className="absolute bottom-6 sm:bottom-10 -right-2 sm:-right-4 z-20 bg-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-xl border border-slate-100 sm:scale-100 scale-90 origin-bottom-right"
                  style={{ animation: "float 5s ease-in-out 1s infinite" }}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-star fill-star" />
                    <span className="text-xs sm:text-sm font-extrabold text-dark">4.9</span>
                    <span className="text-[9px] sm:text-[10px] text-text-light">{t("heroBadges.betaRating")}</span>
                  </div>
                </div>
                {/* floating badge — middle right */}
                <div className="absolute top-1/2 -right-4 sm:-right-8 z-20 bg-primary rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-xl sm:scale-100 scale-90 origin-right"
                  style={{ animation: "float 6s ease-in-out 0.5s infinite" }}>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    <p className="text-[10px] sm:text-[11px] font-bold text-white">{t("heroBadges.homeCollection")}</p>
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-white/80 mt-0.5">{t("heroBadges.certifiedPhlebotomists")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-10 sm:py-14 border-y border-slate-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8"
          >
            {[
              { end: 50, suffix: "+", decimals: 0, label: t("stats.partner_labs"), sub: t("stats.sub_growing"), icon: <Building2 className="w-4 h-4" /> },
              { end: 500, suffix: "+", decimals: 0, label: t("stats.tests_listed"), sub: t("stats.sub_all"), icon: <TestTube2 className="w-4 h-4" /> },
              { end: 100, suffix: "%", decimals: 0, label: t("stats.verified_labs"), sub: t("stats.sub_audited"), icon: <Shield className="w-4 h-4" /> },
              { end: 4.9, suffix: "★", decimals: 1, label: t("stats.early_rating"), sub: t("stats.sub_beta"), icon: <Star className="w-4 h-4" /> },
            ].map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i}
                className="flex flex-col items-center text-center group cursor-default p-3 sm:p-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-emerald-100 flex items-center justify-center text-primary mb-2 sm:mb-3 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                  {s.icon}
                </div>
                <div className="text-xl sm:text-3xl font-extrabold text-dark tracking-tight">
                  <CountUp end={s.end} suffix={s.suffix} decimals={s.decimals} />
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-600 mt-1">{s.label}</div>
                <div className="text-[10px] text-text-light mt-0.5 hidden sm:block">{s.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SEARCH SECTION ═══════════════ */}
      <section className="py-12 sm:py-16 bg-white" id="search">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center mb-7 sm:mb-10">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary bg-primary/8 border border-primary/15 px-3 py-1.5 rounded-full mb-3 sm:mb-4">
                <Activity className="w-3 h-3" /> {t("search.subtitle")}
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1}
              className="text-2xl sm:text-3xl font-extrabold text-dark mb-2 sm:mb-3 tracking-tight">
              {t("search.title")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
              {t("search.desc")}
            </motion.p>
          </motion.div>

          {/* search bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="mb-4 sm:mb-6">
            <div className={`flex items-center bg-white border-2 rounded-2xl px-3 sm:px-5 py-1 sm:py-1.5 gap-2 sm:gap-3 transition-all duration-300 ${searchFocused ? "border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/6" : "border-slate-200 shadow-sm"}`}>
              <Search className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-colors ${searchFocused ? "text-primary" : "text-text-light"}`} />
              <input
                type="text"
                placeholder={t("faq.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-transparent border-none outline-none py-3 sm:py-3.5 text-base text-dark placeholder:text-slate-300 font-medium"
                suppressHydrationWarning
              />
              {searchQuery && (
                <button onClick={() => { haptics.light(); setSearchQuery(""); }} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-text-light hover:text-slate-600">
                  ✕
                </button>
              )}
              <button onClick={() => { haptics.medium(); handleSearch(); }}
                className="shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 min-h-[44px] rounded-xl bg-dark text-white font-bold text-xs sm:text-sm hover:bg-slate-800 active:scale-[0.97] transition-all"
                suppressHydrationWarning
              >
                {t("common.search")}
              </button>
            </div>
          </motion.div>

          {/* tag chips — horizontal scroll on mobile */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mb-7 sm:mb-10">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:justify-center">
              {searchTags.map((tag: string) => (
                <button key={tag} onClick={() => { haptics.selection(); handleSearch(tag); }}
                  className="px-3 sm:px-4 py-2 min-h-[36px] shrink-0 rounded-full text-[11px] sm:text-xs font-semibold bg-surface text-slate-600 border border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/10 active:scale-[0.97] transition-all duration-200"
                  suppressHydrationWarning
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-center">
            <Link href="/search" onClick={() => haptics.medium()}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 min-h-[44px] rounded-2xl bg-dark text-white font-bold text-sm hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 active:scale-[0.97] transition-all duration-150">
              {t("search.all_labs")} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-12 sm:py-16 bg-surface" id="features">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center mb-8 sm:mb-12">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary bg-primary/8 border border-primary/15 px-3 py-1.5 rounded-full mb-3 sm:mb-4">
                <Award className="w-3 h-3" /> {t("features.subtitle")}
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl font-extrabold text-dark mb-2 sm:mb-3 tracking-tight">
              {t("features.title")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              {t("features.desc")}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}
                className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-primary/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-250`}>
                  {f.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-dark mb-1.5 sm:mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-12 sm:py-16 bg-white" id="how-it-works">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-12">

          {/* header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="mb-8 sm:mb-12">
            <motion.div variants={fadeUp} custom={0} className="mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary bg-primary/8 border border-primary/15 px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3" /> {t("howItWorks.subtitle")}
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl font-extrabold text-dark tracking-tight mb-2 sm:mb-3">
              {t("howItWorks.title")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-sm max-w-xs">
              {t("howItWorks.desc")}
            </motion.p>
          </motion.div>

          {/* Steps — horizontal grid on mobile */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} custom={i}
                className="relative flex gap-4 group bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-primary/20 hover:bg-white hover:shadow-lg hover:shadow-black/4 transition-all duration-300">

                {/* step number */}
                <div className="shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-slate-200 group-hover:border-primary flex items-center justify-center transition-colors duration-300 shadow-sm">
                    <span className="text-sm sm:text-base font-extrabold text-dark group-hover:text-primary transition-colors">{step.num}</span>
                  </div>
                </div>

                {/* content */}
                <div className="flex-1 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm shrink-0 group-hover:border-primary/30 transition-colors">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark mb-0.5">{step.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-12 sm:py-16 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(#00A86B 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-primary/6 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-accent/6 rounded-full blur-[60px] sm:blur-[80px]" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center mb-8 sm:mb-12">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary bg-primary/15 border border-primary/25 px-3 py-1.5 rounded-full mb-3 sm:mb-4">
                <Star className="w-3 h-3 fill-primary" /> {t("testimonials.subtitle")}
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl font-extrabold text-white mb-2 sm:mb-3 tracking-tight">
              {t("testimonials.title")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-md mx-auto text-sm">
              {t("testimonials.desc")}
            </motion.p>
          </motion.div>

          {/* Mobile: snap-scroll cards | Desktop: grid */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:hidden pb-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name + "-mobile"}
                className="snap-start shrink-0 w-[85vw] bg-white/4 border border-white/8 rounded-2xl p-4">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-star fill-star" />
                  ))}
                </div>
                <p className="text-sm text-text-light leading-relaxed mb-4">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-linear-to-br ${testimonial.color} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{testimonial.name}</p>
                    <p className="text-[10px] text-slate-600">{testimonial.role} · {testimonial.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((testimonial, i) => (
              <motion.div key={testimonial.name} variants={fadeUp} custom={i}
                className="bg-white/4 border border-white/8 rounded-2xl p-4 sm:p-5 hover:bg-white/[0.07] transition-all duration-300">
                <div className="flex gap-0.5 mb-2 sm:mb-3">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-star fill-star" />
                  ))}
                </div>
                <p className="text-sm text-text-light leading-relaxed mb-4">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-linear-to-br ${testimonial.color} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{testimonial.name}</p>
                    <p className="text-[10px] text-slate-600">{testimonial.role} · {testimonial.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ PARTNER WITH US ═══════════════ */}
      <section className="py-12 sm:py-16" id="partner">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {/* top label */}
            <motion.div variants={fadeUp} custom={0} className="mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent bg-accent/8 border border-accent/15 px-3 py-1.5 rounded-full">
                <Building2 className="w-3 h-3" /> {t("partnerCard.label")}
              </span>
            </motion.div>

            {/* main card */}
            <motion.div variants={fadeUp} custom={1}
              className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg shadow-black/4">

              {/* gradient header band */}
              <div className="bg-linear-to-br from-primary/10 via-accent/10 to-accent/10 px-5 sm:px-12 py-8 sm:py-12 relative overflow-hidden">
                {/* decorative circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/8 blur-2xl" />
                <div className="absolute -bottom-8 left-8 w-36 h-36 rounded-full bg-accent/8 blur-2xl" />

                <div className="relative z-10 grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                  {/* left: copy */}
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-dark tracking-tight mb-3 sm:mb-4 leading-tight">
                      {t("partnerCard.title")}<br />
                      <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                        {t("partnerCard.subtitle")}
                      </span>
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5 sm:mb-8 max-w-sm">
                      {t("partnerCard.desc")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <AnimatedPartnerLink
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark hover:-translate-y-0.5 active:scale-[0.97] shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-150"
                        onClick={() => haptics.medium()}>
                        <Shield className="w-4 h-4" /> {t("partnerCard.cta")}
                      </AnimatedPartnerLink>
                      <Link href="/partnership" onClick={() => haptics.light()}
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:border-primary/30 hover:text-primary active:scale-[0.97] transition-all duration-150">
                        {t("partnerCard.learnMore")} <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* right: mini quote card */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                    <div className="flex gap-0.5 mb-2 sm:mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-star fill-star" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic mb-3 sm:mb-4">
                      &ldquo;{t("partnerCard.trust")}&rdquo;
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-black">DR</div>
                      <div>
                        <p className="text-xs font-bold text-dark">{t("partnerCard.author")}</p>
                        <p className="text-[10px] text-text-light">{t("partnerCard.authorSub")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* features strip */}
              <div className="bg-white px-5 sm:px-12 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {[
                  { icon: <CheckCircle2 className="w-4 h-4" />, title: t("hero.verified"), desc: t("partnerCard.freeListing") },
                  { icon: <Users className="w-4 h-4" />, title: t("stats.tests_listed"), desc: t("partnerCard.patientLeads") },
                  { icon: <Zap className="w-4 h-4" />, title: t("howItWorks.subtitle"), desc: t("partnerCard.instantAlerts") },
                  { icon: <Activity className="w-4 h-4" />, title: t("trustStrip.digital"), desc: t("partnerCard.analytics") },
                  { icon: <Shield className="w-4 h-4" />, title: t("hero.nabl"), desc: t("partnerCard.verifiedBadge") },
                ].map((item) => (
                  <div key={item.title} className="flex flex-col items-start gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-success/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-250">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark">{item.title}</p>
                      <p className="text-[10px] text-text-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ TRUST STRIP ═══════════════ */}
      <section className="py-8 sm:py-10 bg-surface border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-4 sm:gap-10">
            {[
              { icon: <Shield className="w-4 h-4" />, text: t("trustStrip.nabl") },
              { icon: <Clock className="w-4 h-4" />, text: t("trustStrip.sameDay") },
              { icon: <Home className="w-4 h-4" />, text: t("trustStrip.home") },
              { icon: <Star className="w-4 h-4" />, text: t("trustStrip.verified") },
              { icon: <Activity className="w-4 h-4" />, text: t("trustStrip.digital") },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500 group">
                <span className="text-primary group-hover:scale-110 transition-transform">{b.icon}</span>
                {b.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
