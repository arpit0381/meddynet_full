"use client";

import Link from "next/link";
import Image from "next/image";
import AnimatedPartnerLink from "@/components/ui/AnimatedPartnerLink";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import {
  ArrowRight, Activity, Shield, Target, Eye,
  CheckCircle2, Zap, Lightbulb, Linkedin, Search
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";


const team = [
  {
    name: "Arpit Bajpai",
    role: "Founder & CEO",
    bio: "Visionary leader driving innovation in healthcare technology, focused on building scalable and impactful digital health solutions.",
    image: "/arpit1.jpeg",
    socials: [
      { name: "LinkedIn", url: "https://www.linkedin.com/in/arpit-bajpai-6780aa220/", icon: <Linkedin className="w-4 h-4" /> },
      // { name: "Website", url: "#", icon: <Globe2 className="w-4 h-4" /> },
    ]
  },
  {
    name: "Ashwin Jauhary",
    role: "Co-Founder & CTO",
    bio: "Technology architect behind MeddyNet, specializing in building robust, scalable, and intelligent systems.",
    image: "/ashwin.jpeg",
    socials: [
      { name: "LinkedIn", url: "https://www.linkedin.com/in/ashwin-jauhary", icon: <Linkedin className="w-4 h-4" /> },
    ]
  },
  {
    name: "Aviral Mishra",
    role: "Co-Founder & COO",
    bio: "Operations strategist ensuring seamless execution, partnerships, and growth across the MeddyNet ecosystem.",
    image: "/aviral.jpeg",
    socials: [
      { name: "LinkedIn", url: "https://www.linkedin.com/in/ashwin-jauhary", icon: <Linkedin className="w-4 h-4" /> },
    ]
  },
];




/* ─────────────────── animation variants ─────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger: Variants = { visible: { transition: { staggerChildren: 0.1 } } };

export default function AboutPage() {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });

  const missionVision = [
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: t("about.mTitle"),
      desc: t("about.mDesc"),
      gradient: "from-emerald-500/10 to-transparent",
      border: "border-emerald-500/20",
    },
    {
      icon: <Eye className="w-8 h-8 text-accent" />,
      title: t("about.vTitle"),
      desc: t("about.vDesc"),
      gradient: "from-blue-500/10 to-transparent",
      border: "border-blue-500/20",
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-purple-600" />,
      title: t("about.valTitle"),
      desc: t("about.valDesc"),
      gradient: "from-purple-500/10 to-transparent",
      border: "border-purple-500/20",
    },
  ];

  const usps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: t("about.u1t"),
      desc: t("about.u1d"),
      bg: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: t("about.u2t"),
      desc: t("about.u2d"),
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("about.u3t"),
      desc: t("about.u3d"),
      bg: "bg-purple-50 text-purple-600",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t("about.u4t"),
      desc: t("about.u4d"),
      bg: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-primary to-accent z-9999 shadow-sm"
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-[140px] sm:pt-[180px] pb-20 sm:pb-32 overflow-hidden bg-dark text-white">
        {/* Background glow & particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-bold tracking-wide mb-6 sm:mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t("about.tag")}
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white via-white to-white/70 leading-[1.1] tracking-tight mb-6 sm:mb-8">
              {t("about.title")}<br className="hidden sm:block" />
              <span className="bg-linear-to-r from-primary-light to-accent-light bg-clip-text text-transparent">
                {t("about.titleHighlight")}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-base sm:text-xl text-slate-300 leading-relaxed mb-10 sm:mb-12 max-w-[700px] mx-auto font-medium">
              {t("about.desc")}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#our-story"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-dark bg-white hover:bg-slate-100 shadow-xl shadow-white/10 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-sm sm:text-base">
                {t("about.explore")} <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated wave bottom divider could be added here */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* ═══════════════ OUR STORY ═══════════════ */}
      <section id="our-story" className="py-20 sm:py-32 relative bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Story Content */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              


              <motion.div variants={fadeUp} custom={1}>
                <span className="section-label">{t("about.storyLabel")}</span>
              </motion.div>

              <motion.h2 variants={fadeUp} custom={2} className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight mb-6 sm:mb-8 leading-tight">
                {t("about.storyTitle")} <br />
                <span className="text-primary">{t("about.storyTitleHL")}</span>
              </motion.h2>

              <div className="space-y-8 sm:space-y-10 relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

                {/* The Problem */}
                <motion.div variants={fadeUp} custom={3} className="relative pl-10 sm:pl-12">
                  <div className="absolute left-0 top-1 w-[32px] h-[32px] rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{t("about.probTitle")}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {t("about.probDesc")}
                  </p>
                </motion.div>

                {/* The Solution */}
                <motion.div variants={fadeUp} custom={4} className="relative pl-10 sm:pl-12">
                  <div className="absolute left-0 top-1 w-[32px] h-[32px] rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{t("about.solTitle")}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {t("about.solDesc")}
                  </p>
                </motion.div>

                {/* The Vision */}
                <motion.div variants={fadeUp} custom={5} className="relative pl-10 sm:pl-12">
                  <div className="absolute left-0 top-1 w-[32px] h-[32px] rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{t("about.visTitle")}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {t("about.visDesc")}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Abstract Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative rounded-[2.5rem] overflow-hidden bg-slate-50 flex items-center justify-center min-h-[400px] sm:min-h-[600px] border border-slate-100 group shadow-2xl shadow-primary/5"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-50 z-10 transition-opacity group-hover:opacity-100 pointer-events-none" />
              <Image
                src="/dna-premium.png"
                alt="MeddyNet Medical Network Illustration"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════ MISSION & VISION CARDS ═══════════════ */}
      <section className="py-20 sm:py-32 relative bg-slate-50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[-5%] w-[40%] aspect-square bg-primary/3 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[-5%] w-[40%] aspect-square bg-accent/3 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
            className="grid md:grid-cols-3 gap-6 sm:gap-8"
          >
            {missionVision.map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className={`relative bg-white rounded-3xl p-8 sm:p-10 border ${item.border} shadow-2xl shadow-black/2 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-bl ${item.gradient} rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500`} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold text-dark mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ LEADERSHIP TEAM ═══════════════ */}
      <section className="py-20 sm:py-32 relative bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16 sm:mb-20">
            <motion.div variants={fadeUp} custom={0}>
              <span className="section-label">{t("about.leadLabel")}</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight mb-4 sm:mb-6">
              {t("about.leadTitle")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              {t("about.leadDesc")}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          >
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-lg shadow-slate-200/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Placeholder */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full bg-linear-to-br from-slate-100 to-slate-200 mb-8 overflow-hidden relative border-4 border-white shadow-xl group-hover:border-primary/20 transition-all duration-300 flex items-center justify-center text-3xl font-extrabold text-slate-400">
                  <div className="absolute inset-0 z-10 bg-linear-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>

                <div className="text-center relative z-10">
                  <h3 className="text-2xl font-bold text-dark mb-2">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mb-5 uppercase tracking-wider">{member.role}</p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">{member.bio}</p>

                  <div className="flex items-center justify-center gap-4">
                    {member.socials.map((social, idx) => (
                      <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1"
                        aria-label={social.name}>
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ WHY MEDDYNET (USP) ═══════════════ */}
      <section className="py-20 sm:py-32 relative bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-12 sm:mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-4">
              {t("about.uspTitle")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-600 max-w-xl mx-auto text-base sm:text-lg">
              {t("about.uspDesc")}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {usps.map((usp, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${usp.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {usp.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{usp.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{usp.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CALL TO ACTION ═══════════════ */}
      <section className="relative py-24 sm:py-36 overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-dark to-accent/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} custom={0} className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8 tracking-tight">
              {t("about.ctaTitle")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-slate-300 mb-10 sm:mb-12">
              {t("about.ctaDesc")}
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-dark bg-white hover:bg-slate-100 shadow-xl shadow-white/20 hover:shadow-white/30 hover:-translate-y-1 transition-all duration-300 text-base">
                {t("about.cta1")}
              </Link>
              <AnimatedPartnerLink
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-base">
                {t("about.cta2")}
              </AnimatedPartnerLink>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}