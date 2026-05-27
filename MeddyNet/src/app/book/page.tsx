"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MapPin,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Phone,
  Check,
  ArrowLeft,
  ArrowRight,
  Navigation,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getLabById, type Lab } from "@/lib/labs";
import { haptics } from "@/lib/haptics";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProfile } from "@/lib/hooks";

const timeSlots = [
  "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1] as const
    }
  },
};

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const labId = searchParams.get("lab") || "1";
  const bookingTypeParam = searchParams.get("type") || "home_collection";

  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    getLabById(labId)
      .then((data) => {
        if (data) {
          setLab(data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [labId]);

  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<"home_collection" | "lab_visit">(
    bookingTypeParam as "home_collection" | "lab_visit"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const urlTestId = searchParams.get("test");
  const urlQuery = searchParams.get("q");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (lab && !init) {
      if (urlTestId) {
        setSelectedTests([urlTestId]);
      } else if (urlQuery) {
        const match = lab.tests.find(t => t.name.toLowerCase().includes(urlQuery.toLowerCase()));
        if (match) setSelectedTests([match.id]);
        else if (lab.tests[0]) setSelectedTests([lab.tests[0].id]);
      } else if (lab.tests[0]) {
        setSelectedTests([lab.tests[0].id]);
      }
      setInit(true);
    }
  }, [lab, urlTestId, urlQuery, init]);
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    symptoms: "",
    address: "",
  });

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string, discount: number, type: 'percent' | 'flat' } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // Auto-populate patient details from logged-in user's profile
  const { data: profile } = useProfile();
  useEffect(() => {
    if (profile && !patientDetails.name) {
      setPatientDetails(prev => ({
        ...prev,
        name: prev.name || profile.name || "",
        phone: prev.phone || (profile.phone ? profile.phone.replace(/^\+91/, "") : ""),
        age: prev.age || profile.age || "",
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen pt-[72px] bg-surface">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-[40px] p-8 border border-border space-y-6">
                     <Skeleton className="h-4 w-48" />
                     <Skeleton className="h-10 w-3/4" />
                     <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 rounded-3xl" />
                        <Skeleton className="h-24 rounded-3xl" />
                     </div>
                  </div>
                  <div className="bg-white rounded-[40px] p-8 border border-border space-y-6">
                     <Skeleton className="h-4 w-48" />
                     <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                           <Skeleton key={i} className="h-20 rounded-2xl" />
                        ))}
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-4">
                  <Skeleton className="h-[600px] w-full rounded-[40px]" />
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="min-h-screen pt-[72px] bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
           <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-dark mb-2">Laboratory Disconnected</h2>
        <p className="text-text-muted font-medium mb-8 max-w-xs">We couldn't reach the selected lab. It might be undergoing maintenance or no longer available in this region.</p>
        <Link href="/search" className="px-10 py-4 rounded-2xl bg-dark text-white font-black text-sm transition-all hover:-translate-y-1">Return to Search</Link>
      </div>
    );
  }

  const selectedTestDetails = lab.tests.filter((t) =>
    selectedTests.includes(t.id)
  );
  const totalPrice = selectedTestDetails.reduce((sum, t) => sum + t.price, 0);
  const totalOriginal = selectedTestDetails.reduce(
    (sum, t) => sum + t.originalPrice,
    0
  );

  const discountAmount = appliedPromo
    ? (appliedPromo.type === 'percent' ? (totalPrice * appliedPromo.discount) / 100 : appliedPromo.discount)
    : 0;

  const netAmount = Math.max(0, totalPrice - discountAmount);

  // Generate next 7 days starting from today
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isToday = i === 0;
    return {
      value: d.toLocaleDateString("en-CA"), // YYYY-MM-DD local
      day: isToday ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      isToday
    };
  });

  // Real-time slot validation
  const isSlotAvailable = (slot: string, selectedDateValue: string) => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    if (selectedDateValue !== todayStr) return true;

    const match = slot.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) return true;

    let hours = parseInt(match[1]);
    const mins = parseInt(match[2]);
    const period = match[3];

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    // 1 hour buffer
    const slotTimeMinutes = hours * 60 + mins;
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes() + 60;

    return slotTimeMinutes > currentTimeMinutes;
  };

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess("");
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "WELCOME50") {
      setAppliedPromo({ code, discount: 50, type: 'flat' });
      setPromoSuccess("₹50 flat discount applied!");
    } else if (code === "HEALTH20") {
      setAppliedPromo({ code, discount: 20, type: 'percent' });
      setPromoSuccess("20% discount applied!");
    } else {
      setPromoError("Invalid promo code");
      setAppliedPromo(null);
    }
  };

  const steps = [
    { num: 1, label: "Type & Tests" },
    { num: 2, label: "Date & Time" },
    { num: 3, label: "Details" },
    { num: 4, label: "Review" },
  ];

  const handleConfirm = () => {
    const params = new URLSearchParams({
      lab: lab.id,
      type: bookingType,
      date: selectedDate,
      time: selectedTime,
      amount: netAmount.toString(),
      tests: selectedTests.map(t => typeof t === 'string' ? t : (t as any).id).join(","),
      name: patientDetails.name,
      email: patientDetails.email,
      phone: patientDetails.phone,
      age: patientDetails.age,
      gender: patientDetails.gender,
      address: patientDetails.address,
      promo: appliedPromo?.code || "",
      notes: patientDetails.symptoms,
      subtotal: totalPrice.toString(),
      discount: discountAmount.toString(),
    });
    router.push(`/book/confirmation?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/labs/${lab.id}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary transition-all mb-10 group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to {lab.name}
          </Link>
        </motion.div>

        {/* Premium Progress Stepper */}
        <div className="relative mb-16 px-4">
          <div className="absolute top-6 left-0 right-0 h-1.5 bg-border rounded-full" />
          <motion.div
            className="absolute top-6 left-0 h-1.5 bg-linear-to-r from-primary to-accent rounded-full shadow-[0_0_15px_rgba(0,168,107,0.3)]"
            initial={{ width: "0%" }}
            animate={{ width: `${((step - 1) / 3) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />

          <div className="relative flex justify-between">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-4 group cursor-default">
                <motion.div
                  initial={false}
                  animate={{
                    scale: s.num === step ? 1.2 : 1,
                    backgroundColor: s.num <= step ? "#00A86B" : "#FFFFFF",
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black transition-shadow duration-300 relative ${s.num <= step
                    ? "text-white shadow-[0_10px_25px_-5px_rgba(0,168,107,0.4)] border-none"
                    : "text-text-muted border-2 border-border shadow-sm group-hover:border-primary/50"
                    }`}
                >
                  {s.num < step ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-6 h-6 stroke-3" />
                    </motion.div>
                  ) : (
                    <span>{s.num}</span>
                  )}
                  {s.num === step && (
                    <span className="absolute -inset-1 rounded-[1.25rem] border-2 border-primary/20 animate-pulse pointer-events-none" />
                  )}
                </motion.div>
                <div className="flex flex-col items-center">
                  <span
                    className={`text-[12px] font-black uppercase tracking-widest hidden sm:block transition-colors duration-300 ${s.num <= step ? "text-primary" : "text-text-muted"
                      }`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Type & Tests */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-4xl border border-border p-8 sm:p-12 shadow-2xl shadow-dark/5"
            >
              <motion.h2 variants={itemVariants} className="text-3xl font-black text-dark tracking-tight mb-10">
                Choose Booking Type & Tests
              </motion.h2>

              {/* Booking Type */}
              <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-6 mb-12">
                <button
                  onClick={() => { haptics.selection(); setBookingType("home_collection"); }}
                  className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative group overflow-hidden ${bookingType === "home_collection"
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                    : "border-border hover:border-primary/30 hover:bg-surface"
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${bookingType === "home_collection" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/10 text-primary"
                    }`}>
                    <Home className="w-7 h-7" />
                  </div>
                  <p className="font-black text-dark text-lg mb-1 tracking-tight">
                    Home Collection
                  </p>
                  <p className="text-[13px] font-medium text-text-muted leading-relaxed">
                    Qualified phlebotomist will visit your home for sample collection
                  </p>
                  {bookingType === "home_collection" && (
                    <motion.div layoutId="type-active" className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </motion.div>
                  )}
                </button>

                <button
                  onClick={() => { haptics.selection(); setBookingType("lab_visit"); }}
                  className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative group overflow-hidden ${bookingType === "lab_visit"
                    ? "border-accent bg-accent/5 shadow-xl shadow-accent/10"
                    : "border-border hover:border-accent/30 hover:bg-surface"
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${bookingType === "lab_visit" ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-accent/10 text-accent"
                    }`}>
                    <MapPin className="w-7 h-7" />
                  </div>
                  <p className="font-black text-dark text-lg mb-1 tracking-tight">
                    Visit Lab
                  </p>
                  <p className="text-[13px] font-medium text-text-muted leading-relaxed mb-4">
                    Visit the nearest {lab.name} center at your preferred time
                  </p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${bookingType === "lab_visit"
                    ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                    : "bg-surface text-text-muted border-border group-hover:border-accent/30 group-hover:text-accent"
                    }`}>
                    <Navigation className="w-3 h-3" /> Includes Live Map
                  </div>
                  {bookingType === "lab_visit" && (
                    <motion.div layoutId="type-active" className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </motion.div>
                  )}
                </button>
              </motion.div>

              {/* Test Selection */}
              <motion.div variants={itemVariants}>
                <h3 className="text-xs font-black text-dark uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-border" />
                  Select Required Tests
                </h3>
                <div className="space-y-3 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {lab.tests.map((test) => (
                    <label
                      key={test.id}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${selectedTests.includes(test.id)
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                        : "border-border hover:border-primary/20 hover:bg-surface"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                haptics.selection();
                                setSelectedTests([...selectedTests, test.id]);
                              } else {
                                haptics.light();
                                setSelectedTests(selectedTests.filter((id) => id !== test.id));
                              }
                            }}
                            className="peer sr-only"
                          />
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedTests.includes(test.id) ? "bg-primary border-primary scale-110" : "bg-white border-border"
                            }`}>
                            <Check className={`w-4 h-4 text-white transition-all ${selectedTests.includes(test.id) ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-dark mb-0.5">
                            {test.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-text-muted">
                            <span className="bg-white border border-border px-1.5 py-0.5 rounded-md">{test.category}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.turnaround}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary tracking-tight">₹{test.price}</p>
                        {test.originalPrice > test.price && (
                          <p className="text-[11px] font-bold text-text-muted line-through">₹{test.originalPrice}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Cart Summary */}
              {selectedTests.length > 0 && (
                <motion.div variants={itemVariants} className="mb-8 p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-1">Cart Summary</h3>
                    <p className="text-lg font-black text-dark">{selectedTests.length} Tests Selected</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="text-2xl font-black text-primary">₹{totalPrice}</span>
                      {totalOriginal > totalPrice && (
                        <span className="text-sm font-bold text-text-muted line-through">₹{totalOriginal}</span>
                      )}
                    </div>
                    {totalOriginal > totalPrice && (
                      <p className="text-[12px] font-bold text-emerald-500 mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">
                        Total Savings: ₹{Math.round(totalOriginal - totalPrice)}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { if (selectedTests.length > 0) { haptics.medium(); setStep(2); } }}
                disabled={selectedTests.length === 0}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-dark text-white font-black text-lg shadow-2xl shadow-dark/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all relative overflow-hidden group/btn"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Continue {selectedTests.length > 0 ? `• ₹${totalPrice}` : ""}
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-4xl border border-border p-8 sm:p-12 shadow-2xl shadow-dark/5"
            >
              <motion.h2 variants={itemVariants} className="text-3xl font-black text-dark tracking-tight mb-10">
                Choose Date & Time
              </motion.h2>

              {/* Date Picker */}
              <motion.div variants={itemVariants} className="mb-12">
                <h3 className="text-xs font-black text-dark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-8 h-px bg-border" />
                  <Calendar className="w-4 h-4 text-primary" />
                  Select Collection Date
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-6 px-2 -mx-2 custom-scrollbar">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => { haptics.selection(); setSelectedDate(d.value); }}
                      className={`shrink-0 w-24 min-h-[80px] py-4 rounded-2xl text-center transition-all duration-300 relative group ${selectedDate === d.value
                        ? "bg-dark text-white shadow-xl shadow-dark/30 scale-105"
                        : "bg-surface text-text-muted hover:bg-border/50 border border-border"
                        }`}
                    >
                      <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${selectedDate === d.value ? "text-primary-light" : "text-text-muted"}`}>
                        {d.day}
                      </p>
                      <p className="text-2xl font-black tracking-tighter">{d.date}</p>
                      <p className="text-[11px] font-bold opacity-60">{d.month}</p>
                      {selectedDate === d.value && (
                        <motion.div layoutId="date-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Time Slots */}
              <motion.div variants={itemVariants} className="mb-12">
                <h3 className="text-xs font-black text-dark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-8 h-px bg-border" />
                  <Clock className="w-4 h-4 text-accent" />
                  Available Time Slots
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {timeSlots.map((slot) => {
                    const available = selectedDate ? isSlotAvailable(slot, selectedDate) : true;
                    return (
                      <button
                        key={slot}
                        disabled={!available}
                        onClick={() => { haptics.selection(); setSelectedTime(slot); }}
                        className={`py-3.5 min-h-[44px] rounded-xl text-[13px] font-black tracking-tight transition-all duration-300 border-2 ${!available
                          ? "bg-surface border-border/50 text-text-muted/30 cursor-not-allowed opacity-60"
                          : selectedTime === slot
                            ? "bg-accent border-accent text-white shadow-lg shadow-accent/30 scale-[1.03]"
                            : "bg-white border-border text-text-muted hover:border-accent/40 hover:text-dark hover:bg-surface"
                          }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-4 pt-4 border-t border-dashed border-border mt-10">
                <button
                  onClick={() => { haptics.light(); setStep(1); }}
                  className="px-10 py-5 min-h-[56px] rounded-2xl border-2 border-border text-dark text-[15px] font-black hover:bg-surface transition-all flex items-center gap-2 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <button
                  onClick={() => { if (selectedDate && selectedTime && selectedTests.length > 0) { haptics.medium(); setStep(3); } }}
                  disabled={!selectedDate || !selectedTime || selectedTests.length === 0}
                  className="flex-1 flex items-center justify-center gap-3 py-5 min-h-[56px] rounded-2xl bg-dark text-white font-black text-lg shadow-2xl shadow-dark/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all group/btn active:scale-[0.98]"
                >
                  Continue to Schedule
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-4xl border border-border p-8 sm:p-12 shadow-2xl shadow-dark/5"
            >
              <motion.h2 variants={itemVariants} className="text-3xl font-black text-dark tracking-tight mb-10">
                Patient Details
              </motion.h2>

              <div className="grid sm:grid-cols-2 gap-8 mb-10">
                <motion.div variants={itemVariants}>
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block px-1">
                    Patient Name *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={patientDetails.name}
                      onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value.replace(/[^a-zA-Z\s.-]/g, '').replace(/\s{2,}/g, ' ').trimStart() })}
                      className="w-full bg-surface border-2 border-border rounded-2xl py-5 pl-14 pr-6 text-base text-dark font-bold focus:border-primary focus:bg-white transition-all outline-none placeholder:text-text-muted/50"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block px-1">
                    Phone Number *
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={patientDetails.phone}
                      onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-surface border-2 border-border rounded-2xl py-5 pl-14 pr-6 text-base text-dark font-bold focus:border-primary focus:bg-white transition-all outline-none placeholder:text-text-muted/50"
                      maxLength={10}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block px-1">
                    Age *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Years"
                      value={patientDetails.age}
                      onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-surface border-2 border-border rounded-2xl py-5 pl-14 pr-6 text-base text-dark font-bold focus:border-primary focus:bg-white transition-all outline-none placeholder:text-text-muted/50"
                      maxLength={3}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block px-1">
                    Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map(g => (
                      <button
                        key={g}
                        onClick={() => setPatientDetails({ ...patientDetails, gender: g })}
                        className={`py-4 sm:py-5 rounded-2xl border-2 text-[14px] sm:text-[15px] font-bold transition-all ${patientDetails.gender === g
                          ? "border-primary bg-primary/10 text-dark border-b-4 border-b-primary"
                          : "border-border bg-surface text-text-muted hover:border-border-dark hover:bg-white"
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="sm:col-span-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block px-1">
                    Relevant Symptoms/Reason (Optional)
                  </label>
                  <div className="relative group">
                    <textarea
                      placeholder="Any specific reason for taking this test?"
                      rows={2}
                      value={patientDetails.symptoms}
                      onChange={(e) => setPatientDetails({ ...patientDetails, symptoms: e.target.value })}
                      className="w-full bg-surface border-2 border-border rounded-2xl pt-4 pb-4 px-6 text-base text-dark font-bold focus:border-primary focus:bg-white transition-all outline-none placeholder:text-text-muted/50 resize-none"
                    />
                  </div>
                </motion.div>

                {bookingType === "home_collection" && (
                  <motion.div variants={itemVariants} className="sm:col-span-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block px-1">
                      Collection Address *
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-6 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                      <textarea
                        placeholder="House No, Area, Landmark, Pincode"
                        rows={3}
                        value={patientDetails.address}
                        onChange={(e) => setPatientDetails({ ...patientDetails, address: e.target.value.replace(/\s{2,}/g, ' ').trimStart() })}
                        className="w-full bg-surface border-2 border-border rounded-2xl py-5 pl-14 pr-6 text-base text-dark font-bold focus:border-primary focus:bg-white transition-all outline-none placeholder:text-text-muted/50 resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.div variants={itemVariants} className="flex gap-4 pt-4 border-t border-dashed border-border mt-10">
                <button
                  onClick={() => { haptics.light(); setStep(2); }}
                  className="px-10 py-5 min-h-[56px] rounded-2xl border-2 border-border text-dark text-[15px] font-black hover:bg-surface transition-all flex items-center gap-2 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <button
                  onClick={() => { if (patientDetails.name && patientDetails.age && patientDetails.gender && selectedTests.length > 0) { haptics.medium(); setStep(4); } }}
                  disabled={!patientDetails.name || !patientDetails.age || !patientDetails.gender || selectedTests.length === 0 || (bookingType === "home_collection" && !patientDetails.address)}
                  className="flex-1 flex items-center justify-center gap-3 py-5 min-h-[56px] rounded-2xl bg-dark text-white font-black text-lg shadow-2xl shadow-dark/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all group/btn active:scale-[0.98]"
                >
                  Review Summary
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-4xl border border-border p-8 sm:p-12 shadow-2xl shadow-dark/5"
            >
              <motion.h2 variants={itemVariants} className="text-3xl font-black text-dark tracking-tight mb-10">
                Review & Confirm
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-10 mb-10">
                {/* Details Summary */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="p-6 rounded-3xl bg-surface border border-border">
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Laboratory
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${lab.color} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                        {lab.initials}
                      </div>
                      <div>
                        <p className="font-black text-dark text-lg leading-tight">{lab.name}</p>
                        <p className="text-[13px] font-medium text-text-muted">{lab.address}, {lab.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-surface border border-border">
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Patient & Schedule
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[11px] font-black text-text-muted uppercase">Patient</p>
                        <p className="font-bold text-dark">{patientDetails.name}</p>
                        <p className="text-[13px] font-medium text-text-muted mt-0.5">{patientDetails.age} yrs • {patientDetails.gender}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[11px] font-black text-text-muted uppercase">Type</p>
                        <p className="font-bold text-dark capitalize">{bookingType}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] font-black text-text-muted uppercase">Date & Time</p>
                        <p className="font-bold text-dark">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} · {selectedTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Billing Summary */}
                <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-4xl bg-dark text-white relative overflow-hidden shadow-2xl shadow-dark/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -ml-16 -mb-16" />

                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 relative z-10">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6 relative z-10">
                    {selectedTestDetails.map(test => (
                      <div key={test.id} className="flex justify-between items-center group gap-2 sm:gap-4">
                        <span className="text-xs sm:text-sm font-medium text-white/70 group-hover:text-white transition-colors leading-snug">
                          {test.name}
                        </span>
                        <span className="text-sm sm:text-base font-black text-primary-light shrink-0">₹{test.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Input */}
                  <div className="mb-6 relative z-10 bg-white/5 rounded-xl sm:rounded-2xl p-1.5 flex items-center border border-white/10 focus-within:border-primary/50 transition-colors">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full min-w-0 bg-transparent text-white font-bold px-3 py-2 outline-none placeholder:text-white/30 uppercase text-xs sm:text-sm leading-tight"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-white text-dark font-black text-xs sm:text-sm hover:bg-primary-light transition-colors active:scale-95 shrink-0 ml-1"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-rose-400 text-xs font-bold -mt-4 mb-6 px-2 relative z-10">{promoError}</p>}
                  {promoSuccess && <p className="text-emerald-400 text-xs font-bold -mt-4 mb-6 px-2 relative z-10">{promoSuccess}</p>}

                  <div className="pt-6 border-t border-white/10 relative z-10">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-white/60 font-bold uppercase text-[11px]">Subtotal</span>
                      <div className="text-right">
                        {totalOriginal > totalPrice && <span className="text-xs sm:text-sm font-bold line-through text-white/30 mr-2">₹{totalOriginal}</span>}
                        <span className="font-black text-sm sm:text-lg text-white">₹{totalPrice}</span>
                      </div>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center mb-4 text-emerald-400">
                        <span className="font-bold uppercase text-[10px] sm:text-[11px]">Discount ({appliedPromo?.code})</span>
                        <span className="font-black text-sm sm:text-lg">- ₹{discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-6 border-t border-white/10 pt-4 mt-2">
                      <span className="text-white text-base sm:text-lg font-black italic">Net Amount</span>
                      <span className="text-2xl sm:text-3xl font-black text-primary-light">₹{netAmount}</span>
                    </div>

                    <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[11px] font-bold text-white/60 leading-relaxed text-center italic">
                        By clicking below, you agree to our terms of service and refund policy.
                      </p>
                    </div>

                    <button
                      onClick={() => { haptics.success(); handleConfirm(); }}
                      className="w-full py-5 min-h-[56px] rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/pay"
                    >
                      Pay & Confirm
                      <ArrowRight className="w-5 h-5 group-hover/pay:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-center text-[10px] text-white/30 mt-4 font-bold uppercase tracking-widest">
                      Instant Booking Protocol
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.button
                variants={itemVariants}
                onClick={() => { haptics.light(); setStep(3); }}
                className="flex items-center gap-2 text-sm font-black text-text-muted hover:text-dark transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Patient Details
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-[72px] bg-surface">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-[40px] p-8 border border-border space-y-6">
                     <Skeleton className="h-4 w-48" />
                     <Skeleton className="h-10 w-3/4" />
                     <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 rounded-3xl" />
                        <Skeleton className="h-24 rounded-3xl" />
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-4">
                  <Skeleton className="h-[600px] w-full rounded-[40px]" />
               </div>
            </div>
         </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
