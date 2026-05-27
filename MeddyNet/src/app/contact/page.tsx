"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: <Phone className="w-5 h-5 text-emerald-600" />,
      title: t("contact.callUs"),
      value: "+91-9170252358",
      desc: t("contact.callDesc"),
      bg: "bg-emerald-50",
      href: "tel:+919170252358",
    },
    {
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      title: t("contact.emailUs"),
      value: "contact@meddynet.com",
      desc: t("contact.emailDesc"),
      bg: "bg-blue-50",
      href: "mailto:contact@meddynet.com",
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-purple-600" />,
      title: t("contact.liveChat"),
      value: t("contact.chatSupport"),
      desc: t("contact.chatDesc"),
      bg: "bg-purple-50",
      href: "/chat",
    },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-24 pb-20">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#00A86B 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-bold tracking-wide mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t("contact.supportTeam")}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-dark mb-4 tracking-tight">
            {t("contact.howCanWe")} <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">{t("contact.helpYou")}</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Left: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl shadow-black/[0.04] border border-slate-100 relative"
          >
            {submitted ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                  <Send className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-2">{t("contact.messageSent")}</h3>
                <p className="text-slate-500 max-w-sm mb-8 mx-auto">
                  {t("contact.thankYou")}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  {t("contact.sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">{t("contact.fullName")}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-surface border border-slate-200 text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-light"
                      placeholder={t("contact.namePlaceholder")}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">{t("contact.emailAddr")}</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-surface border border-slate-200 text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-light"
                      placeholder={t("contact.emailPlaceholder")}
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t("contact.subject")}</label>
                  <select className="w-full px-4 py-3.5 rounded-xl bg-surface border border-slate-200 text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer" suppressHydrationWarning>
                    <option>{t("contact.subjects.general")}</option>
                    <option>{t("contact.subjects.booking")}</option>
                    <option>{t("contact.subjects.partner")}</option>
                    <option>{t("contact.subjects.report")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t("contact.message")}</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface border border-slate-200 text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-light resize-none"
                    placeholder={t("contact.messagePlaceholder")}
                    suppressHydrationWarning
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? t("contact.sending") : t("contact.sendMessage")} <Send className="w-4 h-4 ml-1" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Right: Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {contactMethods.map((method, idx) => {
              const Content = (
                <div
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-black/[0.02] transition-all group w-full text-left"
                >
                  <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-dark mb-1">{method.title}</h4>
                    <p className="text-sm font-semibold text-primary mb-1">{method.value}</p>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{method.desc}</p>
                  </div>
                </div>
              );

              return method.href ? (
                <Link key={idx} href={method.href} className="block w-full">
                  {Content}
                </Link>
              ) : (
                <div key={idx} className="w-full">
                  {Content}
                </div>
              );
            })}

            {/* HQ Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-dark p-8 text-white mt-8 shadow-xl shadow-black/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col items-start">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5 backdrop-blur-md border border-white/10">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold mb-3">{t("contact.hq")}</h4>
                <p className="text-sm text-text-light leading-relaxed mb-6 whitespace-pre-line">
                  {t("contact.hqAddr")}
                </p>
                <Link href="#" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group">
                  {t("contact.getDirections")} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
