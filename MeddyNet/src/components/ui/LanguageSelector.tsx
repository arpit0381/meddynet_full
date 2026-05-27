"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Locale } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Short Button */}
      <button
        type="button"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all duration-200 group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
        <span className="text-xs font-bold uppercase text-slate-700">{locale}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 origin-top-right bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl shadow-black/10 z-100 overflow-hidden"
          >
            <div className="py-2">
              <div className="px-4 py-1.5 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("common.select_language")}
                </p>
              </div>
              
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-200 hover:bg-primary/5 ${
                    locale === lang.code ? "bg-primary/5 text-primary font-bold" : "text-slate-600 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {locale === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
