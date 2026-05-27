"use client";


import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Activity,
  Shield,
  CheckCircle2,
  PieChart,
  Globe,
  Settings
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger: Variants = { visible: { transition: { staggerChildren: 0.1 } } };

export default function PartnershipPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });

  const benefits = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: t("partnership.benefits.b1_title"),
      description: t("partnership.benefits.b1_desc"),
      bg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t("partnership.benefits.b2_title"),
      description: t("partnership.benefits.b2_desc"),
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: t("partnership.benefits.b3_title"),
      description: t("partnership.benefits.b3_desc"),
      bg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: t("partnership.benefits.b4_title"),
      description: t("partnership.benefits.b4_desc"),
      bg: "bg-orange-50 text-orange-600 border-orange-100",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("partnership.benefits.b5_title"),
      description: t("partnership.benefits.b5_desc"),
      bg: "bg-sky-50 text-sky-600 border-sky-100",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: t("partnership.benefits.b6_title"),
      description: t("partnership.benefits.b6_desc"),
      bg: "bg-rose-50 text-rose-600 border-rose-100",
    },
  ];

  const steps = [
    { num: 1, title: t("partnership.cta.s1"), desc: t("partnership.cta.s1_desc") },
    { num: 2, title: t("partnership.cta.s2"), desc: t("partnership.cta.s2_desc") },
    { num: 3, title: t("partnership.cta.s3"), desc: t("partnership.cta.s3_desc") },
  ];

  return (
    <>
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-linear-to-r from-primary to-accent z-50"
      />

      <main className="min-h-screen bg-white pt-[72px] sm:pt-[84px] pb-16">
        {/* Top Navigation / Back Button Area */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => router.back()}
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 transition-all duration-300 font-bold text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t("partnership.back")}
          </motion.button>
        </div>

        {/* ─── Hero Section ─── */}
        <section className="relative pt-2 sm:pt-6 pb-20 sm:pb-32 overflow-hidden">
          {/* Enhanced Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] rounded-full bg-accent/8 blur-[100px]" />
          </div>
          
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{ 
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              maskImage: "radial-gradient(circle at center, black, transparent)",
              WebkitMaskImage: "radial-gradient(circle at center, black, transparent)"
            }}
          />

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-[1000px] mx-auto text-center">
              <motion.div variants={fadeUp} custom={0} className="mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-primary text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {t("partnership.hero.tag")}
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-dark leading-[1.1] mb-6 sm:mb-8 tracking-tight">
                {t("partnership.hero.title1")} <br className="hidden sm:block" />
                <span className="bg-linear-to-r from-primary via-emerald-500 to-accent bg-clip-text text-transparent drop-shadow-sm">
                  {t("partnership.hero.titleHighlight")}
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-base sm:text-xl text-slate-600 mb-8 sm:mb-12 leading-relaxed max-w-[750px] mx-auto font-medium">
                {t("partnership.hero.desc")}
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <a
                  href="https://labs.meddynet.com/register"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4.5 rounded-2xl font-bold text-white bg-primary hover:bg-primary-dark shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 text-lg">
                  {t("partnership.hero.cta")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 ml-1 transition-transform" />
                </a>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-sm sm:text-base font-bold text-slate-600 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t("partnership.hero.noFees")}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── Benefits Section ─── */}
        <section className="py-24 sm:py-32 bg-slate-50 relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-20">
              <motion.div variants={fadeUp} custom={0} className="mb-4">
                <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs sm:text-sm">
                  {t("partnership.benefits.title")}
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-black text-dark tracking-tight mb-6">
                {t("partnership.benefits.desc")}
              </motion.h2>
              <div className="w-20 h-1.5 bg-linear-to-r from-primary to-accent mx-auto rounded-full" />
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {benefits.map((b, i) => (
                <motion.div key={b.title} variants={fadeUp} custom={i}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${b.bg} group-hover:scale-110 transition-transform duration-300`}>
                    {b.icon}
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-3">{b.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{b.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Onboarding CTA Section ─── */}
        <section className="py-20 sm:py-28 bg-white overflow-hidden relative">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="bg-dark rounded-[2.5rem] p-10 sm:p-16 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
                    {t("partnership.cta.title")}
                  </h2>
                  <p className="text-slate-400 mb-8 max-w-sm">
                    {t("partnership.cta.desc")}
                  </p>
                  <a
                    href="https://labs.meddynet.com/register"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-dark bg-white hover:bg-slate-50 shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {t("partnership.cta.btn")} <ArrowRight className="w-5 h-5" />
                  </a>
                </div>

                <div className="flex flex-col gap-4">
                  {steps.map((step) => (
                    <div key={step.num} className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black shrink-0">
                        {step.num}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">{step.title}</h4>
                        <p className="text-white/60 text-xs">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
