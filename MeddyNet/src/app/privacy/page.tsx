"use client";

import { motion, Variants } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, Mail, ArrowRight, FileText, Scale, Info, Layers, Share2, Cookie, History, Printer } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  const { t, locale } = useLanguage();
  const isHindi = locale === "hi";

  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: t("privacy.pillars.p1_title"),
      content: t("privacy.pillars.p1_desc"),
      color: "from-emerald-500/10 to-teal-500/10",
      textClassName: "text-emerald-600",
      iconBg: "bg-emerald-50",
      borderHover: "hover:border-emerald-200",
      shadowHover: "hover:shadow-emerald-500/5",
      targetId: "policy-section-1",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: t("privacy.pillars.p2_title"),
      content: t("privacy.pillars.p2_desc"),
      color: "from-blue-500/10 to-indigo-500/10",
      textClassName: "text-blue-600",
      iconBg: "bg-blue-50",
      borderHover: "hover:border-blue-200",
      shadowHover: "hover:shadow-blue-500/5",
      targetId: "policy-section-1",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: t("privacy.pillars.p3_title"),
      content: t("privacy.pillars.p3_desc"),
      color: "from-purple-500/10 to-pink-500/10",
      textClassName: "text-purple-600",
      iconBg: "bg-purple-50",
      borderHover: "hover:border-purple-200",
      shadowHover: "hover:shadow-purple-500/5",
      targetId: "policy-section-2",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: t("privacy.pillars.p4_title"),
      content: t("privacy.pillars.p4_desc"),
      color: "from-orange-500/10 to-amber-500/10",
      textClassName: "text-orange-600",
      iconBg: "bg-orange-50",
      borderHover: "hover:border-orange-200",
      shadowHover: "hover:shadow-orange-500/5",
      targetId: "policy-section-4",
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const privacyDetails = [
    {
      icon: <Info className="w-5 h-5" />,
      title: t("privacy.details.s1_title"),
      desc: t("privacy.details.s1_desc")
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: t("privacy.details.s2_title"),
      desc: t("privacy.details.s2_desc")
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: t("privacy.details.s3_title"),
      desc: t("privacy.details.s3_desc")
    },
    {
      icon: <Cookie className="w-5 h-5" />,
      title: t("privacy.details.s4_title"),
      desc: t("privacy.details.s4_desc")
    },
    {
      icon: <History className="w-5 h-5" />,
      title: t("privacy.details.s5_title"),
      desc: t("privacy.details.s5_desc")
    }
  ];

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div className={cn("bg-white min-h-screen pt-[120px] pb-24", isHindi && "font-hindi")}>
      {/* ─── Hero Section ─── */}
      <section className="relative px-4 sm:px-6 mb-16 sm:mb-24 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-bold tracking-wide mb-6"
          >
            <Shield className="w-3.5 h-3.5" />
            {t("privacy.tag")}
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-6xl font-extrabold text-dark mb-6 tracking-tight leading-tight"
          >
            {t("privacy.subtitle")} <span className="text-primary">{t("privacy.titleHighlight")}</span> {t("privacy.commitment")}
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t("privacy.heroDesc")}
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[90px] pointer-events-none" />
      </section>

      {/* ─── Core Pillars Grid ─── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((sec, i) => (
            <motion.div
              key={sec.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => scrollToSection(sec.targetId)}
              className={`p-10 rounded-[2.5rem] bg-white border border-slate-100 relative group overflow-hidden transition-all duration-500 shadow-sm cursor-pointer ${sec.borderHover} ${sec.shadowHover}`}
            >
              {/* Card Background Gradient */}
              <div className={`absolute inset-0 bg-linear-to-br ${sec.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Glassmorphism Effect on Hover */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/40 backdrop-blur-xl translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out z-0" />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${sec.iconBg} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <div className={sec.textClassName}>
                    {sec.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-dark mb-4 tracking-tight group-hover:text-primary transition-colors">
                  {sec.title}
                </h3>
                <p className="text-slate-600 text-base leading-relaxed font-medium">
                  {sec.content}
                </p>
                
              </div>

              {/* Decorative Corner Element */}
              <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full ${sec.iconBg} opacity-20 scale-0 group-hover:scale-100 transition-transform duration-500`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Detailed Policy Content ─── */}
      <section id="detailed-policy" className="bg-slate-50 py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-16 border border-white/50 shadow-2xl shadow-primary/5"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-dark tracking-tight">{t("privacy.details.title")}</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">{t("privacy.details.docId")}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                <Printer className="w-4 h-4" /> {t("privacy.details.print")}
              </button>
            </div>
            
            <div className="space-y-12">
              {privacyDetails.map((item, i) => (
                <motion.div 
                  key={item.title} 
                  id={`policy-section-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative pl-12 sm:pl-16 scroll-mt-32"
                >
                  {/* Item Icon & Line */}
                  <div className="absolute left-0 top-0 h-full">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                      <div className="text-slate-400 group-hover:text-primary transition-colors">
                        {item.icon}
                      </div>
                    </div>
                    {i !== privacyDetails.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-100 group-hover:bg-primary/20 transition-colors" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-base sm:text-lg font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Compliance Badge Enhanced */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-20 p-8 sm:p-10 rounded-4xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-emerald-900/5 flex items-center justify-center shrink-0 relative z-10">
                <Scale className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="relative z-10 text-center sm:text-left">
                <h4 className="text-emerald-900 font-black text-xl mb-2">{t("privacy.compliance.title")}</h4>
                <p className="text-emerald-700/80 text-base leading-relaxed font-medium">
                  {t("privacy.compliance.desc")}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-emerald-200 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  <Shield className="w-3 h-3" /> {t("privacy.compliance.tag")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Contact Privacy Officer ─── */}
      <section className="max-w-[800px] mx-auto px-4 sm:px-6 mt-24 text-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-10 rounded-[3rem] bg-dark relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">{t("privacy.contact.title")}</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              {t("privacy.contact.desc")}
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all">
              {t("privacy.contact.cta")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
        
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            {t("privacy.contact.backHome")}
          </Link>
        </div>
      </section>
    </div>
  );
}
