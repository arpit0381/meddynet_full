"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight, Briefcase, Heart, Cpu, Globe2, Sparkles,
  MapPin, Clock, ChevronRight,
  Coffee, Shield, Zap, X, CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/* ─────────────────── animation variants ─────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger: Variants = { visible: { transition: { staggerChildren: 0.1 } } };

export default function CareersPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedRole) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedRole]);

  /* ─────────────────── data ─────────────────── */
  const perks = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: t("careers.perks.0.title"),
      desc: t("careers.perks.0.desc"),
      bg: "bg-red-50 text-red-500",
    },
    {
      icon: <Globe2 className="w-6 h-6" />,
      title: t("careers.perks.1.title"),
      desc: t("careers.perks.1.desc"),
      bg: "bg-blue-50 text-blue-500",
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: t("careers.perks.2.title"),
      desc: t("careers.perks.2.desc"),
      bg: "bg-purple-50 text-purple-600",
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      title: t("careers.perks.3.title"),
      desc: t("careers.perks.3.desc"),
      bg: "bg-orange-50 text-orange-500",
    },
  ];

  const openRoles = [
    {
      department: t("careers.departments.engineering"),
      roles: [
        {
          title: t("careers.roles.fe"),
          location: t("careers.locations.remoteIndia"),
          type: t("careers.types.fullTime"),
          experience: t("careers.experience.y1"),
        },
        {
          title: t("careers.roles.be"),
          location: t("Remote-India"),
          type: t("careers.types.fullTime"),
          experience: t("careers.experience.y1"),
        },
        {
          title: t("careers.roles.ds"),
          location: t("Remote-India"),
          type: t("careers.types.fullTime"),
          experience: t("careers.experience.y1"),
        }
      ]
    },
    {
      department: t("careers.departments.operations"),
      roles: [
        {
          title: t("careers.roles.mom"),
          location: t("Remote-India"),
          type: t("careers.types.fullTime"),
          experience: t("careers.experience.y1"),
        },
        {
          title: t("careers.roles.nes"),
          location: t("Remote-India"),
          type: t("careers.types.fullTime"),
          experience: t("careers.experience.y1"),
        }
      ]
    },
    {
      department: t("careers.departments.design"),
      roles: [
        {
          title: t("careers.roles.pd"),
          location: t("Remote-India"),
          type: t("careers.types.fullTime"),
          experience: t("careers.experience.y1"),
        }
      ]
    }
  ];

  const values = [
    {
      title: t("careers.values.0.title"),
      desc: t("careers.values.0.desc"),
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: t("careers.values.1.title"),
      desc: t("careers.values.1.desc"),
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      title: t("careers.values.2.title"),
      desc: t("careers.values.2.desc"),
      icon: <Zap className="w-5 h-5" />
    }
  ];

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-linear-to-r from-primary to-accent z-9999"
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-[140px] sm:pt-[180px] pb-20 sm:pb-32 overflow-hidden bg-surface">
        {/* Decorative mesh gradient blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold tracking-wide mb-6 sm:mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t("careers.tag")}
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              className="text-4xl sm:text-6xl lg:text-[5.5rem] font-extrabold text-dark leading-[1.05] tracking-tight mb-6 sm:mb-8">
              {t("careers.title")} <br className="hidden sm:block" />
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("careers.titleHighlight")}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-base sm:text-xl text-slate-600 leading-relaxed mb-10 sm:mb-12 max-w-[650px] mx-auto font-medium">
              {t("careers.desc")}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#open-roles"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-sm sm:text-base">
                {t("careers.viewRoles")} <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ OUR CULTURE & VALUES ═══════════════ */}
      <section className="py-20 sm:py-32 relative bg-white border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left: Values Content */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.div variants={fadeUp} custom={0}>
                <span className="section-label">{t("careers.cultureLabel")}</span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight mb-8">
                {t("careers.cultureTitle")} <span className="text-primary">{t("careers.cultureHighlight")}</span>
              </motion.h2>

              <div className="space-y-8">
                {values.map((val, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 2} className="flex gap-4 group">
                    <div className="mt-1 w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-dark group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shrink-0 shadow-sm">
                      {val.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark mb-2">{val.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{val.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Images/Gallery Collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative rounded-[2.5rem] bg-linear-to-br from-slate-50 to-slate-100 h-[500px] sm:h-[650px] overflow-hidden border border-slate-200 shadow-2xl flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-primary/5 pattern-dots pattern-slate-200 pattern-bg-transparent pattern-size-4 pattern-opacity-100" />

              {/* Dynamic decorative elements representing "Culture" */}
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <Heart className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-2">{t("careers.peopleOverProcess")}</h3>
                <p className="text-slate-500 text-sm font-medium">{t("careers.meddyNetWay")}</p>
              </div>

              {/* Floating aesthetic blocks */}
              <div className="absolute top-10 left-10 p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg transform -rotate-12 skeleton border border-white/50">
                <div className="w-20 h-4 bg-slate-200 rounded-full mb-2" />
                <div className="w-12 h-4 bg-slate-200 rounded-full" />
              </div>
              <div className="absolute bottom-10 right-10 p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg transform rotate-6 skeleton border border-white/50">
                <div className="w-16 h-4 bg-slate-200 rounded-full mb-2" />
                <div className="w-24 h-4 bg-slate-200 rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PERKS & BENEFITS ═══════════════ */}
      <section className="py-20 sm:py-32 relative bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-4">
              {t("careers.perksTitle")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-600 max-w-xl mx-auto text-base sm:text-lg">
              {t("careers.perksDesc")}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 tracking-wide"
          >
            {perks.map((perk, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${perk.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  {perk.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{perk.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ OPEN ROLES ═══════════════ */}
      <section id="open-roles" className="py-20 sm:py-32 relative bg-white">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="mb-12">
            <motion.div variants={fadeUp} custom={0}>
              <span className="section-label">{t("careers.jobsLabel")}</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight mb-4">
              {t("careers.jobsTitle")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-600 text-base sm:text-lg">
              {t("careers.jobsDesc")}
            </motion.p>
          </motion.div>

          <div className="space-y-12">
            {openRoles.map((dept, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <h3 className="text-2xl font-bold text-dark border-b-2 border-slate-100 pb-4 mb-6 sticky top-0 bg-white/90 backdrop-blur-md z-10 pt-4">
                  {dept.department}
                </h3>

                <div className="space-y-4">
                  {dept.roles.map((role, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => setSelectedRole({ ...role, department: dept.department })}
                      className="cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 hover:border-primary shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="mb-4 sm:mb-0">
                        <h4 className="text-lg font-bold text-dark group-hover:text-primary transition-colors mb-2">
                          {role.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <MapPin className="w-3.5 h-3.5" /> {role.location}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <Clock className="w-3.5 h-3.5" /> {role.type}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <Briefcase className="w-3.5 h-3.5" /> {role.experience}
                          </span>
                        </div>
                      </div>

                      <div className="inline-flex items-center justify-center shrink-0 w-12 h-12 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-6 h-6 transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 bg-linear-to-br from-primary/5 to-accent/5 rounded-3xl p-8 sm:p-12 text-center border border-primary/10"
          >
            <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg shadow-primary/10 mb-6">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-4">{t("careers.noFitTitle")}</h3>
            <p className="text-slate-600 max-w-lg mx-auto mb-8">
              {t("careers.noFitDesc")}
            </p>
            <button
              onClick={() => setSelectedRole({
                title: t("careers.sendApp") || "Open Application",
                department: "Any Department",
                location: "Flexible Location",
                type: "Flexible Type",
                experience: "Any Experience",
                isOpenApplication: true
              })}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-dark bg-white border border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              {t("careers.sendApp")}
            </button>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════ CLOSING CTA ═══════════════ */}
      <section className="relative py-20 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-linear-to-br from-transparent to-black/20" />
        <div className="relative z-10 max-w-[800px] mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">{t("careers.readyTitle")}</h2>
          <p className="text-primary-light mb-8 max-w-md mx-auto text-lg">
            {t("careers.readyDesc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#open-roles"
              className="px-8 py-4 rounded-2xl font-extrabold text-primary bg-white shadow-xl hover:scale-105 transition-transform duration-300 text-base">
              {t("careers.exploreJobs")}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ APPLICATION MODAL ═══════════════ */}
      <AnimatePresence>
        {selectedRole && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]"
              onClick={() => { setSelectedRole(null); setFormStatus("idle"); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-full border border-slate-100"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-surface shrink-0">
                <button
                  onClick={() => { setSelectedRole(null); setFormStatus("idle"); }}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors bg-white/50 backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide mb-4">
                  Apply Now
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-4 pr-10">{selectedRole.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] px-3 py-1.5 rounded-full text-slate-600 border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedRole.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] px-3 py-1.5 rounded-full text-slate-600 border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {selectedRole.type}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] px-3 py-1.5 rounded-full text-slate-600 border border-slate-100">
                    <Briefcase className="w-3.5 h-3.5 text-primary" /> {selectedRole.experience}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto">
                {formStatus === 'success' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-green-100 shadow-xl">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-dark mb-3">Application Submitted!</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">Thank you for applying to the <strong>{selectedRole.title}</strong> position. Our recruiting team will review your profile and get back to you shortly.</p>
                    <button
                      onClick={() => { setSelectedRole(null); setTimeout(() => setFormStatus("idle"), 300); }}
                      className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Close Window
                    </button>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setFormStatus('submitting');
                      setTimeout(() => setFormStatus('success'), 2000);
                    }}
                    className="space-y-8"
                  >
                    <div>
                      {!selectedRole.isOpenApplication ? (
                        <>
                          <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" /> Role Requirements
                          </h3>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <ul className="list-disc pl-5 text-slate-600 space-y-2.5 text-sm sm:text-base leading-relaxed">
                              <li>Proven track record working in a similar role with relevant technologies ({selectedRole.department}).</li>
                              <li>Deep understanding of modern architecture, best practices, and scalable systems.</li>
                              <li>Strong problem-solving skills and ability to take ownership of complex tasks.</li>
                              <li>Excellent communication and collaboration skills with cross-functional teams.</li>
                              <li>Ability to thrive in a fast-paced, healthcare-focused dynamic environment.</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" /> What We're Looking For
                          </h3>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                              We are always on the lookout for exceptional talent. If you have unique skills or experiences that align with MeddyNet's mission to revolutionize healthcare, we want to hear from you.
                            </p>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-semibold">
                              Please tell us in your cover letter how you envision your role and the impact you aim to create at MeddyNet.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Submit Your Application
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Full Name <span className="text-red-500">*</span></label>
                          <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-slate-50/50 focus:bg-white" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Email <span className="text-red-500">*</span></label>
                          <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-slate-50/50 focus:bg-white" placeholder="john@example.com" />
                        </div>
                      </div>

                      <div className="space-y-2 mb-5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Phone <span className="text-red-500">*</span></label>
                        <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-slate-50/50 focus:bg-white" placeholder="+91 99999 99999" />
                      </div>

                      <div className="space-y-2 mb-5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Resume Link (Drive, Dropbox) <span className="text-red-500">*</span></label>
                        <input required type="url" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-slate-50/50 focus:bg-white" placeholder="https://..." />
                      </div>

                      <div className="space-y-2 mb-8">
                        <label className="text-sm font-bold text-slate-700 ml-1">Cover Letter (Optional)</label>
                        <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-slate-50/50 focus:bg-white resize-y" placeholder="Tell us why you're a perfect fit for this role..."></textarea>
                      </div>

                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mb-6 font-medium text-sm text-slate-600 leading-relaxed">
                        By submitting this application, you acknowledge that your information will be securely stored and used exclusively for MeddyNet recruiting purposes.
                      </div>

                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="w-full py-4 rounded-xl bg-primary text-white font-extrabold text-lg shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-3 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></span>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {formStatus === 'submitting' ? (
                            <><span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></span> Submitting Application...</>
                          ) : "Submit Application"}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}