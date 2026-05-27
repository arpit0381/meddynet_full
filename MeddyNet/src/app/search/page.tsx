"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Home,
  ShieldCheck,
  X,
  ChevronDown,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { getLabs, type Lab } from "@/lib/labs";
import { testCategories } from "@/data/tests";
import { haptics } from "@/lib/haptics";
import { useLanguage } from "@/context/LanguageContext";
import MapModal from "@/components/modals/MapModal";
import { useSearchStore } from "@/store/searchStore";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/Skeleton";

function SortDropdown({ sort, setSort, options, t }: { sort: string; setSort: (s: string) => void; options: {value: string, label: string}[], t: (key: string) => string }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeLabel = options.find(o => o.value === sort)?.label;

  return (
    <div className="relative shrink-0 z-40">
      <button
        onClick={() => { haptics.light(); setIsOpen(!isOpen); }}
        className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-5 sm:px-6 py-3 sm:py-3.5 min-h-[44px] text-[13px] sm:text-sm font-black transition-all shadow-sm outline-none focus:ring-8 focus:ring-primary/5 ${isOpen ? 'border-primary ring-4 ring-primary/10' : 'border-border-dark text-dark-light hover:border-primary/50'}`}
      >
        <span className="truncate">{t("search.sortBy")} <span className={isOpen ? 'text-primary' : 'text-text-muted transition-colors'}>{activeLabel}</span></span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ${isOpen ? 'text-primary' : 'text-text-muted'}`} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click outside */}
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[1.25rem] overflow-hidden z-40 p-1.5"
            >
              <div className="flex flex-col gap-1">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      haptics.selection();
                      setSort(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 min-h-[44px] text-sm font-black transition-all rounded-xl ${
                      sort === opt.value
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-transparent text-text-secondary hover:bg-surface hover:text-dark-light"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { query, setQuery, category, setCategory, showFilters, setShowFilters } = useSearchStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (initialQuery && !query) {
       setQuery(initialQuery);
    }
  }, []);

  const sortOptions = [
    { value: "relevance", label: t("search.sortOptions.relevance") },
    { value: "price-low", label: t("search.sortOptions.priceLow") },
    { value: "price-high", label: t("search.sortOptions.priceHigh") },
    { value: "rating", label: t("search.sortOptions.rating") },
    { value: "distance", label: t("search.sortOptions.distance") },
  ];
  const [sort, setSort] = useState("relevance");
  const [homeOnly, setHomeOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [nablOnly, setNablOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedMapLab, setSelectedMapLab] = useState<Lab | null>(null);

  const isSearchActive = query.trim() !== "" || category !== "All" || homeOnly || nablOnly || openNow || priceRange[0] !== 0 || priceRange[1] !== 5000 || minRating > 0;

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    // Check if location prompt should be shown
    const savedLocation = localStorage.getItem("meddynet_user_location");
    const locPrompted = localStorage.getItem("meddynet_location_prompted");
    
    if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
    } else if (!locPrompted) {
        setShowLocationPrompt(true);
    }

    const fetchLabs = async (lat?: number, lng?: number) => {
        try {
            const data = await getLabs({ lat, lng });
            if (!cancelled) {
                setLabs(data);
                setLoading(false);
            }
        } catch (e) {
            if (!cancelled) {
                setError(true);
                setLoading(false);
            }
        }
    };

    if (savedLocation) {
        const { lat, lng } = JSON.parse(savedLocation);
        fetchLabs(lat, lng);
    } else {
        fetchLabs();
    }

    return () => { cancelled = true; };
  }, []);

  const requestLocation = () => {
      localStorage.setItem("meddynet_location_prompted", "true");
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                  setUserLocation(loc);
                  localStorage.setItem("meddynet_user_location", JSON.stringify(loc));
                  setShowLocationPrompt(false);
                  setLoading(true);
                  getLabs(loc).then(setLabs).finally(() => setLoading(false));
              },
              (err) => {
                  console.warn("Location access denied", err);
                  setShowLocationPrompt(false);
              }
          );
      } else {
          setShowLocationPrompt(false);
      }
  };



  const results = useMemo(() => {
    let filteredLabs = labs.map((lab) => {
      const matchingTests = lab.tests.filter((test) => {
        const queries = query.split(",").map(q => q.trim().toLowerCase()).filter(q => q !== "");
        const matchesQuery =
          queries.length === 0 ||
          queries.some(q => 
            test.name.toLowerCase().includes(q) ||
            test.category.toLowerCase().includes(q)
          );
        const matchesCategory =
          category === "All" || test.category === category;
        const matchesPrice =
          test.price >= priceRange[0] && test.price <= priceRange[1];
        return matchesQuery && matchesCategory && matchesPrice;
      });

      return { ...lab, matchingTests };
    });

    // Filters
    filteredLabs = filteredLabs.filter((lab) => {
      if (homeOnly && !lab.homeCollection) return false;
      if (nablOnly && !lab.nabl) return false;
      if (openNow) {
        const now = new Date();
        const hour = now.getHours();
        // Consider labs open between 7 AM and 9 PM
        if (hour < 7 || hour >= 21) return false;
      }
      if (lab.rating < minRating) return false;
      return true;
    });

    // Final Filter based on active search
    if (isSearchActive) {
        filteredLabs = filteredLabs.filter(lab => lab.matchingTests.length > 0);
    }

    // Sort
    switch (sort) {
      case "price-low":
        filteredLabs.sort(
          (a, b) =>
            (a.matchingTests[0]?.price || 0) - (b.matchingTests[0]?.price || 0)
        );
        break;
      case "price-high":
        filteredLabs.sort(
          (a, b) =>
            (b.matchingTests[0]?.price || 0) - (a.matchingTests[0]?.price || 0)
        );
        break;
      case "rating":
        filteredLabs.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        filteredLabs.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
        break;
    }

    return filteredLabs;
  }, [labs, query, category, sort, homeOnly, openNow, nablOnly, priceRange, minRating]);


  return (
    <div className={`min-h-screen ${isAuthenticated ? 'pt-4' : 'pt-[72px]'} bg-surface`}>
      {/* Header Search - Only show if NOT authenticated (on public landing layout) */}
      {!isAuthenticated && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-border sticky top-[72px] z-30">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-5">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center bg-surface border-2 border-border-dark rounded-2xl p-1.5 pl-6 focus-within:border-primary focus-within:ring-8 focus-within:ring-primary/5 transition-all duration-300 group">
                <Search className="w-5 h-5 text-text-muted group-focus-within:text-primary group-focus-within:scale-110 transition-all shrink-0" />
                <input
                  type="text"
                  placeholder={t("search.inputPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-base text-dark-light placeholder:text-text-muted/60 font-bold"
                  suppressHydrationWarning
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-2 rounded-xl hover:bg-surface-dark transition-colors mr-1"
                  >
                    <X className="w-4 h-4 text-text-muted" />
                  </button>
                )}
              </div>
              
              <div className="hidden sm:flex bg-surface rounded-2xl p-1.5 border border-border">
                 {testCategories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      category === cat
                        ? "bg-white text-primary shadow-sm"
                        : "text-text-secondary hover:text-primary"
                    }`}
                  >
                    {t(`search.categories.${cat}`)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { haptics.medium(); setShowFilters(!showFilters); }}
                className={`p-3.5 min-h-[44px] min-w-[44px] rounded-2xl border-2 transition-all duration-300 relative group ${
                  showFilters
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border-dark text-text-secondary bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/10 ml-auto"
                }`}
              >
                <SlidersHorizontal className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                { (homeOnly || minRating > 0 || category !== "All") && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Filter are now in the Topbar for Authenticated users */}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex gap-6">
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Mobile Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 lg:hidden"
                />
                
                {/* Filters Sidebar */}
                <motion.aside
                  initial={{ x: -400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, width: 320 }}
                  exit={{ x: -400, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="fixed inset-y-0 left-0 z-60 lg:z-10 lg:static bg-white lg:bg-transparent p-6 lg:p-0 w-[320px] lg:w-auto h-full lg:h-auto overflow-y-auto lg:overflow-visible shrink-0 lg:block border-r border-border lg:border-none"
                >
                  <div className="bg-white rounded-3xl lg:border lg:border-border p-4 sm:p-8 lg:sticky lg:top-6 shadow-none lg:shadow-sm h-full lg:h-auto">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-dark-light tracking-tight">{t("search.filterSearch")}</h3>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            haptics.medium();
                            setQuery("");
                            setCategory("All");
                            setSort("relevance");
                            setHomeOnly(false);
                            setPriceRange([0, 5000]);
                            setMinRating(0);
                            // Clear URL without page reload
                            window.history.pushState({}, '', window.location.pathname);
                          }}
                          className="text-xs font-black text-primary hover:underline min-h-[44px] px-3 active:scale-95 transition-all"
                        >
                          {t("search.reset")}
                        </button>
                        <button 
                          onClick={() => { haptics.light(); setShowFilters(false); }}
                          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-surface text-text-muted"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Service Type */}
                    <div className="mb-8">
                      <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest mb-4">{t("search.serviceType")}</p>
                      <button
                        onClick={() => { haptics.selection(); setHomeOnly(!homeOnly); }}
                        className={`w-full flex items-center justify-between p-4 min-h-[52px] rounded-2xl border-2 transition-all ${
                          homeOnly 
                            ? "bg-primary/5 border-primary shadow-inner" 
                            : "bg-surface border-transparent hover:border-border-dark"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${homeOnly ? "bg-primary text-white" : "bg-white text-text-secondary shadow-sm"}`}>
                            <Home className="w-5 h-5" />
                          </div>
                          <span className={`text-[14px] font-bold ${homeOnly ? "text-primary" : "text-text"}`}>{t("search.homeTestAvail")}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${homeOnly ? "border-primary bg-primary" : "border-border-dark"}`}>
                          {homeOnly && <div className="w-2 h-2 rounded-full bg-white animate-scale-in" />}
                        </div>
                      </button>
                    </div>

                    {/* Price Range */}
                    <div className="mb-8">
                      <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest mb-4">{t("search.priceRange")}</p>
                      <div className="flex items-center justify-between mb-5 bg-surface p-3.5 rounded-2xl border border-border-dark/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted/60 uppercase">{t("search.min")}</span>
                          <span className="text-base font-black text-dark-light">₹0</span>
                        </div>
                        <div className="w-px h-8 bg-border-dark" />
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold text-text-muted/60 uppercase">{t("search.max")}</span>
                          <span className="text-base font-black text-primary">₹{priceRange[1]}</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5000}
                        step={100}
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="w-full accent-primary cursor-pointer mt-2"
                        suppressHydrationWarning
                      />
                    </div>

                    {/* Rating */}
                    <div className="mb-8">
                      <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest mb-4">{t("search.minRating")}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[0, 3, 4, 4.5].map((r) => (
                          <button
                            key={r}
                            onClick={() => { haptics.selection(); setMinRating(r); }}
                            className={`flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-sm font-black transition-all border-2 ${
                              minRating === r
                                ? "bg-dark text-white border-dark"
                                : "bg-white text-text-secondary border-border-dark hover:border-primary hover:text-primary"
                            }`}
                          >
                            {r === 0 ? t("search.allRatings") : (
                              <div className="flex items-center gap-1.5">
                                <Star className={`w-3.5 h-3.5 ${minRating === r ? "text-star fill-star" : "text-star"}`} />
                                <span>{r}+</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Toggles: Open Now & NABL */}
                    <div className="mb-8">
                      <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest mb-4">Quick Filters</p>
                      <div className="space-y-3">
                        <button
                          onClick={() => { haptics.selection(); setOpenNow(!openNow); }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                            openNow
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-white border-border-dark text-text-secondary hover:border-emerald-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={`w-4 h-4 ${openNow ? 'text-emerald-600' : 'text-text-muted'}`} />
                            <span className="text-xs font-black">Open Now</span>
                          </div>
                          <div className={`w-10 h-6 rounded-full transition-all relative ${
                            openNow ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                              openNow ? 'left-5' : 'left-1'
                            }`} />
                          </div>
                        </button>
                        <button
                          onClick={() => { haptics.selection(); setNablOnly(!nablOnly); }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                            nablOnly
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-border-dark text-text-secondary hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className={`w-4 h-4 ${nablOnly ? 'text-blue-600' : 'text-text-muted'}`} />
                            <span className="text-xs font-black">NABL Accredited</span>
                          </div>
                          <div className={`w-10 h-6 rounded-full transition-all relative ${
                            nablOnly ? 'bg-blue-500' : 'bg-slate-200'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                              nablOnly ? 'left-5' : 'left-1'
                            }`} />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Verification Info */}
                    <div className="p-5 rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-tight">{t("search.verifiedLabs")}</span>
                      </div>
                      <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                        {t("search.verifiedDesc")}
                      </p>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <motion.h1 
                  layout
                  className="text-2xl sm:text-3xl font-black text-dark-light tracking-tight mb-1"
                >
                  {query ? `${t("search.resultsFor")} "${query}"` : t("search.findAll")}
                </motion.h1>
                <p className="text-[14px] font-heavy text-text-muted">
                  {t("search.showing")} <span className="text-primary">{results.length} {t("search.bestLabs")}</span> {t("search.nearYou")}
                </p>
              </div>
              <SortDropdown sort={sort} setSort={setSort} options={sortOptions} t={t} />
            </div>

            {loading ? (
              <div className="space-y-6 md:space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white border border-border rounded-[2.5rem] p-6 sm:p-8 flex flex-col xl:flex-row gap-8 relative overflow-hidden">
                     {/* 1. Main Info Skeleton */}
                     <div className="flex-1 space-y-6">
                        <div className="flex gap-5 sm:gap-6 items-center">
                           <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shrink-0" />
                           <div className="flex-1 space-y-3">
                              <Skeleton className="h-6 w-1/2 max-w-[200px]" />
                              <div className="flex gap-2">
                                 <Skeleton className="h-4 w-24 rounded-lg bg-slate-50" />
                                 <Skeleton className="h-4 w-20 rounded-lg bg-slate-50" />
                              </div>
                           </div>
                        </div>
                        <div className="space-y-3 pl-0 sm:pl-[104px]">
                           <Skeleton className="h-3 w-full max-w-[400px] bg-slate-50" />
                           <div className="flex gap-3">
                              <Skeleton className="h-8 w-24 rounded-xl bg-slate-50" />
                              <Skeleton className="h-8 w-24 rounded-xl bg-slate-50" />
                           </div>
                        </div>
                     </div>
                     
                     {/* 2. Matches Col Skeleton (Hidden on Mobile) */}
                     <div className="hidden xl:flex xl:col-span-4 flex-col gap-4 px-8 border-x border-border/40 h-full justify-center">
                        <Skeleton className="h-3 w-20 uppercase tracking-widest bg-slate-50" />
                        <div className="space-y-3">
                           <Skeleton className="h-14 w-full rounded-2xl bg-slate-50" />
                           <Skeleton className="h-14 w-full rounded-2xl bg-slate-50" />
                        </div>
                     </div>

                     {/* 3. Action Col Skeleton */}
                     <div className="w-full xl:w-72 flex flex-col sm:flex-row xl:flex-col justify-center items-center gap-4 xl:pl-6 border-t xl:border-t-0 border-border border-dashed pt-6 xl:pt-0">
                        <div className="w-full sm:w-auto xl:w-full space-y-2">
                           <Skeleton className="h-3 w-20 mx-auto xl:ml-auto xl:mr-0 bg-slate-50" />
                           <Skeleton className="h-12 w-32 mx-auto xl:ml-auto xl:mr-0 rounded-xl" />
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto xl:w-full">
                           <Skeleton className="h-14 flex-1 rounded-2xl bg-slate-50" />
                           <Skeleton className="h-14 flex-1 rounded-2xl" />
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-[2.5rem] border border-border p-12 text-center shadow-xl shadow-dark/5">
                <div className="w-20 h-20 rounded-3xl bg-surface mx-auto mb-6 flex items-center justify-center">
                  <X className="w-10 h-10 text-rose-500/40" />
                </div>
                <h3 className="text-2xl font-black text-dark-light mb-2">Failed to load labs</h3>
                <p className="text-text-muted font-medium mb-8 max-w-sm mx-auto">There was an error connecting to our diagnostic network. Please check your connection and try again.</p>
                <button onClick={() => window.location.reload()} className="px-10 py-4 rounded-2xl bg-dark text-white font-black text-sm transition-all hover:-translate-y-1">Retry Fetch</button>
              </div>
            ) : results.length > 0 ? (
              <motion.div 
                layout
                className="space-y-6"
              >
                {results.map((lab, i) => (
                  <motion.div
                    key={lab.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group bg-white border border-border rounded-[2.5rem] p-4 sm:p-7 hover:shadow-2xl hover:shadow-dark/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
                  >
                    {/* Background glow */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-bl ${lab.color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-700 pointer-events-none`} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-stretch">
                      {/* 1. Main Info Col (Icon + Details) */}
                      <div className="lg:col-span-5 flex flex-col justify-center min-w-0">
                        <div className="flex items-start gap-4 mb-4">
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: -3 }}
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br ${lab.color} flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg ring-4 ring-white group-hover:ring-primary/10 transition-all relative overflow-hidden shrink-0 mt-1`}
                          >
                            <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-50" />
                            <span className="relative z-10 drop-shadow-md">{lab.initials}</span>
                          </motion.div>
                          
                          <div className="min-w-0 pt-0.5">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl sm:text-2xl font-black text-dark-light tracking-tight truncate group-hover:text-primary transition-colors">
                                {lab.name}
                              </h3>
                              {lab.verified && (
                                <div className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/5 text-primary border border-primary/20">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-wider">{t("search.verified")}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-border">
                                <Star className="w-4 h-4 text-star fill-star" />
                                <span className="font-black text-dark-light text-sm">{lab.rating}</span>
                                <span className="text-text-muted font-bold text-[10px] sm:text-[11px]">({lab.reviewCount.toLocaleString()})</span>
                              </div>
                              <button 
                                onClick={() => { haptics.light(); setSelectedMapLab(lab); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all group/pin"
                              >
                                <MapPin className="w-4 h-4 group-hover/pin:animate-bounce" />
                                <span className="font-black text-xs sm:text-sm">{lab.distance} km {t("search.away")}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-y-3 gap-x-6 items-center pl-0 sm:pl-[76px]">
                          <div className="flex items-center gap-1.5 text-text-muted font-bold text-xs">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[280px]">{lab.address}</span>
                          </div>
                          <div className="flex gap-2">
                             {lab.homeCollection && (
                               <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                 <Home className="w-3.5 h-3.5" /> Home
                               </span>
                             )}
                             {lab.nabl && (
                               <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                 <ShieldCheck className="w-3.5 h-3.5" /> NABL
                               </span>
                             )}
                          </div>
                        </div>
                      </div>

                      {/* 2. Matches Col */}
                      <div className="hidden xl:flex xl:col-span-4 flex-col gap-2 px-6 border-x border-border/50 h-full justify-center">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{t("search.bestMatches")}</p>
                        <div className="space-y-3">
                          {lab.matchingTests.slice(0, 2).map((test) => (
                            <div key={test.id} className="group/test flex items-center justify-between gap-4 p-3.5 rounded-[22px] bg-surface hover:bg-white border border-border/40 hover:border-border transition-all w-full">
                              <span className="text-xs font-bold text-text truncate min-w-0 flex-1">{test.name}</span>
                              <div className="shrink-0 flex items-center justify-center h-8 px-3 rounded-xl bg-primary/10 text-primary border border-primary/5 group-hover/test:bg-primary group-hover/test:text-white transition-all">
                                <span className="text-[11px] font-black tracking-tight">₹{test.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Pricing Col */}
                      <div className="lg:col-span-12 xl:col-span-3 flex flex-col sm:flex-row xl:flex-col items-center sm:items-center xl:items-end justify-between xl:justify-center gap-6 xl:pl-8 mt-6 xl:mt-0 pt-6 xl:pt-0 border-t xl:border-t-0 border-border border-dashed">
                        <div className="xl:text-right w-full sm:w-auto">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-2 lg:mb-3">{t("search.bestPrice")}</p>
                          <div className="flex items-baseline xl:justify-end gap-2.5">
                            <span className="text-3xl sm:text-5xl font-black text-primary tracking-tighter">
                              ₹{lab.matchingTests[0]?.price || "—"}
                            </span>
                            {lab.matchingTests[0] && (
                              <span className="text-[15px] text-text-muted/60 font-black line-through">
                                ₹{lab.matchingTests[0].originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row xl:flex-col gap-3 w-full sm:w-auto">
                          <Link
                            href={`/labs/${lab.id}${query ? `?q=${encodeURIComponent(query)}` : ''}`}
                            onClick={() => haptics.light()}
                            className="flex-1 sm:flex-initial px-6 h-14 rounded-2xl bg-surface border-2 border-border-dark text-dark-light font-black text-xs sm:text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2.5 group/visit whitespace-nowrap"
                          >
                            <MapPin className="w-4 h-4 group-hover/visit:translate-y-[-2px] transition-transform" />
                            {t("search.goToLab")}
                          </Link>
                          <Link
                            href={`/book?lab=${lab.id}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            onClick={() => haptics.medium()}
                            className="flex-1 sm:flex-initial px-8 h-14 rounded-2xl bg-dark hover:bg-dark-light text-white font-black text-xs sm:text-sm shadow-xl shadow-dark/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3.5 whitespace-nowrap group/book"
                          >
                            {t("search.bookNow")}
                            <ArrowRight className="w-4 h-4 group-hover/book:translate-x-1.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Tests Summary */}
                    <div className="mt-6 flex lg:hidden flex-wrap gap-2 pt-5 border-t border-border border-dashed">
                      {lab.matchingTests.slice(0, 3).map((test) => (
                        <span key={test.id} className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-surface text-text-secondary border border-border-dark">
                          {test.name}: <span className="text-primary">₹{test.price}</span>
                        </span>
                      ))}
                      {lab.matchingTests.length > 3 && (
                        <span className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-primary/5 text-primary">
                          +{lab.matchingTests.length - 3} {t("search.more")}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-border p-12 text-center shadow-2xl shadow-dark/5">
                <div className="w-20 h-20 rounded-3xl bg-surface mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-10 h-10 text-text-muted/40" />
                </div>
                <h3 className="text-2xl font-black text-dark-light mb-2">
                  {t("search.noLabsFound")}
                </h3>
                <p className="text-text-muted font-medium mb-8 max-w-sm mx-auto">
                  {t("search.noLabsDesc")}
                </p>
                <button
                  id="reset-filters-btn"
                  onClick={() => {
                    haptics.medium();
                    if (isSearchActive) {
                      // Reset all filters
                      setQuery("");
                      setCategory("All");
                      setSort("relevance");
                      setHomeOnly(false);
                      setNablOnly(false);
                      setOpenNow(false);
                      setPriceRange([0, 5000]);
                      setMinRating(0);
                      // Clear search params
                      if (typeof window !== 'undefined') {
                          const url = new URL(window.location.href);
                          url.search = '';
                          window.history.pushState({}, '', url.toString());
                      }
                    } else {
                      // Just refresh labs or navigate to a default state
                      window.location.href = '/search';
                    }
                  }}
                  className="relative z-10 inline-flex items-center justify-center gap-3 px-12 py-4 rounded-2xl bg-dark text-white font-black text-sm hover:bg-dark-light active:scale-95 transition-all shadow-lg cursor-pointer"
                >
                  {isSearchActive ? t("search.resetFilters") : "Explore All Labs"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedMapLab && (
        <MapModal 
          isOpen={!!selectedMapLab} 
          onClose={() => setSelectedMapLab(null)} 
          lab={selectedMapLab} 
        />
      )}

      {/* Geolocation Prompt Modal */}
      <AnimatePresence>
          {showLocationPrompt && (
              <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-100" />
                  <div className="fixed inset-0 flex items-center justify-center p-4 z-101">
                      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl relative">
                          <button onClick={() => setShowLocationPrompt(false)} className="absolute top-6 right-6 p-2 rounded-xl text-text-muted hover:bg-surface-dark transition-all">
                              <X className="w-5 h-5" />
                          </button>
                          
                          <div className="w-16 h-16 rounded-[24px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20 mb-6 mx-auto">
                              <MapPin className="w-8 h-8" />
                          </div>
                          
                          <h3 className="text-2xl font-black text-dark-light text-center mb-3">Better Search Results</h3>
                          <p className="text-text-secondary font-medium text-center mb-8">Allow MeddyNet to use your location to show labs nearby and calculate precise distances.</p>
                          
                          <div className="space-y-3">
                              <button onClick={requestLocation} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                  Allow Location
                              </button>
                              <button onClick={() => setShowLocationPrompt(false)} className="w-full py-4 text-text-muted rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-surface-dark active:scale-95 transition-all">
                                  Maybe Later
                              </button>
                          </div>
                      </motion.div>
                  </div>
              </>
          )}
      </AnimatePresence>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <div className="bg-white/80 backdrop-blur-xl border-b border-border sticky top-[72px] z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-5">
          <div className="flex items-center gap-4">
            <Skeleton className="flex-1 h-14 rounded-2xl" />
            <div className="hidden sm:flex gap-2">
              <Skeleton className="w-24 h-10 rounded-xl" />
              <Skeleton className="w-24 h-10 rounded-xl" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex gap-10">
          <div className="hidden lg:block w-80 shrink-0">
             <Skeleton className="h-[600px] w-full rounded-[40px]" />
          </div>
          <div className="flex-1 space-y-8">
             <div className="space-y-4">
                <Skeleton className="h-10 w-64 rounded-2xl" />
                <Skeleton className="h-4 w-48 rounded-lg" />
             </div>
             <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-border rounded-[40px] p-8 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 flex gap-5">
                       <Skeleton className="w-20 h-20 rounded-3xl shrink-0" />
                       <div className="flex-1 space-y-4">
                          <Skeleton className="h-8 w-3/4 rounded-xl" />
                          <Skeleton className="h-4 w-1/2 rounded-lg" />
                          <div className="flex gap-3">
                             <Skeleton className="h-10 w-24 rounded-2xl" />
                             <Skeleton className="h-10 w-24 rounded-2xl" />
                          </div>
                       </div>
                    </div>
                    <div className="w-full lg:w-56 space-y-3">
                       <Skeleton className="h-14 w-full rounded-2xl" />
                       <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
