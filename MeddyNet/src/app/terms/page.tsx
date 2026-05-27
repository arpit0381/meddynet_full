"use client";

import { motion, Variants } from "framer-motion";
import { 
  FileText, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Globe, 
  Shield, 
  ArrowRight, 
  Gavel,
  CheckCircle2,
  HelpCircle,
  Printer,
  CheckSquare,
  Activity,
  UserPlus,
  Calendar,
  Copyright,
  AlertTriangle
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

export default function TermsPage() {
  const { t } = useLanguage();

  const corePillars = [
    {
      icon: <Users className="w-6 h-6" />,
      title: t("terms.corePillars.p1_title"),
      content: t("terms.corePillars.p1_desc"),
      color: "from-blue-500/10 to-indigo-500/10",
      textClassName: "text-blue-600",
      iconBg: "bg-blue-50",
      borderHover: "hover:border-blue-200",
      shadowHover: "hover:shadow-blue-500/5",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t("terms.corePillars.p2_title"),
      content: t("terms.corePillars.p2_desc"),
      color: "from-emerald-500/10 to-teal-500/10",
      textClassName: "text-emerald-600",
      iconBg: "bg-emerald-50",
      borderHover: "hover:border-emerald-200",
      shadowHover: "hover:shadow-emerald-500/5",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: t("terms.corePillars.p3_title"),
      content: t("terms.corePillars.p3_desc"),
      color: "from-purple-500/10 to-pink-500/10",
      textClassName: "text-purple-600",
      iconBg: "bg-purple-50",
      borderHover: "hover:border-purple-200",
      shadowHover: "hover:shadow-purple-500/5",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: t("terms.corePillars.p4_title"),
      content: t("terms.corePillars.p4_desc"),
      color: "from-orange-500/10 to-amber-500/10",
      textClassName: "text-orange-600",
      iconBg: "bg-orange-50",
      borderHover: "hover:border-orange-200",
      shadowHover: "hover:shadow-orange-500/5",
    },
  ];

  const termDetails = [
    {
      icon: <CheckSquare className="w-5 h-5" />,
      title: t("terms.details.d1_title"),
      desc: t("terms.details.d1_desc")
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: t("terms.details.d2_title"),
      desc: t("terms.details.d2_desc")
    },
    {
      icon: <UserPlus className="w-5 h-5" />,
      title: t("terms.details.d3_title"),
      desc: t("terms.details.d3_desc")
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: t("terms.details.d4_title"),
      desc: t("terms.details.d4_desc")
    },
    {
      icon: <Copyright className="w-5 h-5" />,
      title: t("terms.details.d5_title"),
      desc: t("terms.details.d5_desc")
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: t("terms.details.d6_title"),
      desc: t("terms.details.d6_desc")
    },
    {
      icon: <Gavel className="w-5 h-5" />,
      title: t("terms.details.d7_title"),
      desc: t("terms.details.d7_desc")
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-[120px] pb-24">
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
            <Gavel className="w-3.5 h-3.5" />
            {t("terms.lastUpdated")}
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-6xl font-extrabold text-dark mb-6 tracking-tight leading-tight"
          >
            {t("terms.title")} <span className="text-primary">{t("terms.titleHighlight")}</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t("terms.desc")}
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[90px] pointer-events-none" />
      </section>

      {/* ─── Core Pillars Grid ─── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {corePillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`p-10 rounded-[2.5rem] bg-white border border-slate-100 relative group overflow-hidden transition-all duration-500 shadow-sm ${pillar.borderHover} ${pillar.shadowHover}`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/40 backdrop-blur-xl translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out z-0" />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${pillar.iconBg} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <div className={pillar.textClassName}>
                    {pillar.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-dark mb-4 tracking-tight group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-slate-600 text-base leading-relaxed font-medium">
                  {pillar.content}
                </p>
                
                <div className="mt-8 flex items-center gap-2 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  {t("common.learnMore")} <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full ${pillar.iconBg} opacity-20 scale-0 group-hover:scale-100 transition-transform duration-500`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Detailed Terms Content ─── */}
      <section className="bg-slate-50 py-24 px-4 sm:px-6 relative overflow-hidden">
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
                  <h2 className="text-3xl font-black text-dark tracking-tight">{t("terms.details.fullDoc")}</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">{t("terms.details.docId")}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                <Printer className="w-4 h-4" /> {t("terms.details.print")}
              </button>
            </div>
            
            <div className="space-y-12">
              {termDetails.map((item, i) => (
                <motion.div 
                  key={item.title} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative pl-12 sm:pl-16"
                >
                  <div className="absolute left-0 top-0 h-full">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                      <div className="text-slate-400 group-hover:text-primary transition-colors">
                        {item.icon}
                      </div>
                    </div>
                    {i !== termDetails.length - 1 && (
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

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-20 p-8 sm:p-10 rounded-4xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-blue-900/5 flex items-center justify-center shrink-0 relative z-10">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </div>
              <div className="relative z-10 text-center sm:text-left">
                <h4 className="text-blue-900 font-black text-xl mb-2">{t("terms.commitment.title")}</h4>
                <p className="text-blue-700/80 text-base leading-relaxed font-medium">
                  {t("terms.commitment.desc")}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-blue-200 text-[10px] font-black uppercase tracking-wider text-blue-600">
                  <Shield className="w-3 h-3" /> {t("terms.commitment.badge")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Help & Support Section ─── */}
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
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">{t("terms.support.title")}</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              {t("terms.support.desc")}
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all">
              {t("terms.support.cta")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
        
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            {t("terms.support.back")}
          </Link>
        </div>
      </section>
    </div>
  );
}
