"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MapPin,
  Home,
  Clock,
  ShieldCheck,
  ArrowUpDown,
  Trophy,
  ChevronDown,
  Check,
} from "lucide-react";
import Link from "next/link";
import { labs } from "@/data/labs";

import { useLanguage } from "@/context/LanguageContext";

export default function ComparePage() {
  const { t } = useLanguage();

  const testKeys = ["cbc", "thyroid", "lipid", "vitaminD", "hba1c"] as const;
  type TestKey = (typeof testKeys)[number];
  
  const [selectedTestKey, setSelectedTestKey] = useState<TestKey>("cbc");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "distance">("price");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const testKeyToDataName: Record<TestKey, string> = {
    cbc: "Complete Blood Count (CBC)",
    thyroid: "Thyroid Profile (T3, T4, TSH)",
    lipid: "Lipid Profile",
    vitaminD: "Vitamin D (25-OH)",
    hba1c: "HbA1c (Glycated Hemoglobin)",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get comparison data
  const comparison = labs
    .map((lab) => {
      const test = lab.tests.find((t) => t.name === testKeyToDataName[selectedTestKey]);
      return test ? { lab, test } : null;
    })
    .filter(Boolean) as { lab: (typeof labs)[0]; test: (typeof labs)[0]["tests"][0] }[];

  // Sort
  comparison.sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.test.price - b.test.price;
      case "rating":
        return b.lab.rating - a.lab.rating;
      case "distance":
        return a.lab.distance - b.lab.distance;
    }
  });

  const bestPrice = comparison.length > 0 ? Math.min(...comparison.map((c) => c.test.price)) : 0;

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[2px] text-accent mb-2">
              {t("compare.subtitle")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-light mb-2">
              {t("compare.title")}
            </h1>
            <p className="text-sm text-text-muted">
              {t("compare.desc")}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Test Selector + Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-[320px] flex items-center justify-between bg-white border-2 border-primary rounded-xl px-5 py-3 text-sm font-semibold text-dark-light hover:border-primary-light transition-all text-left shadow-sm"
            >
              <span className="truncate">{t(`compare.tests.${selectedTestKey}`)}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-primary" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-border rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="py-1 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {testKeys.map((tk) => {
                      const isSelected = tk === selectedTestKey;
                      return (
                        <button
                          key={tk}
                          onClick={() => {
                            setSelectedTestKey(tk);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-all hover:bg-surface text-left ${
                            isSelected ? "text-primary bg-primary/5" : "text-text"
                          }`}
                        >
                          {t(`compare.tests.${tk}`)}
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex bg-border rounded-xl p-1">
            {(
              [
                { value: "price", label: t("compare.sortPrice") },
                { value: "rating", label: t("compare.sortRating") },
                { value: "distance", label: t("compare.sortDistance") },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === opt.value
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="space-y-4">
          {comparison.map((item, i) => {
            const isBest = item.test.price === bestPrice;
            const savings = item.test.originalPrice - item.test.price;
            const discountPercent = Math.round(
              (savings / item.test.originalPrice) * 100
            );

            return (
              <motion.div
                key={item.lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl hover:shadow-black/5 ${
                  isBest
                    ? "border-primary shadow-lg shadow-primary/10 relative"
                    : "border-border"
                }`}
              >
                {/* Best Value Badge */}
                {isBest && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-linear-to-r from-primary to-primary-light text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                    <Trophy className="w-3.5 h-3.5" />
                    {t("compare.bestValue")}
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Lab Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`w-14 h-14 rounded-xl bg-linear-to-br ${item.lab.color} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}
                    >
                      {item.lab.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-dark-light">
                        {item.lab.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-star fill-star" />
                          <span className="font-semibold text-star">
                            {item.lab.rating}
                          </span>
                          ({item.lab.reviewCount.toLocaleString()})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.lab.distance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.test.turnaround}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.lab.homeCollection && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                            <Home className="w-3 h-3" /> {t("compare.homeCollection")}
                          </span>
                        )}
                        {item.lab.nabl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-accent/10 text-accent">
                            <ShieldCheck className="w-3 h-3" /> {t("compare.nabl")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-extrabold text-primary">
                          ₹{item.test.price}
                        </span>
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-slate-300 line-through">
                            ₹{item.test.originalPrice}
                          </span>
                          <span className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded">
                            {discountPercent}% {t("compare.off")}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">
                        {t("compare.youSave")} {savings}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/labs/${item.lab.id}`}
                        className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
                      >
                        {t("compare.viewLab")}
                      </Link>
                      <Link
                        href={`/book?lab=${item.lab.id}&type=home`}
                        className={`px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all hover:-translate-y-0.5 ${
                          isBest
                            ? "bg-linear-to-r from-primary to-primary-light text-white shadow-primary/25"
                            : "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-none"
                        }`}
                      >
                        {t("compare.bookNow")}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {comparison.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <p className="text-text-muted">
              {t("compare.noLabsFound")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
