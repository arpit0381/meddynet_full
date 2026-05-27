"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Home,
  Download,
  Share2,
  ShieldCheck,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Navigation
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getLabById, type Lab } from "@/lib/labs";
import { createBooking, type CreateBookingPayload, type Booking } from "@/lib/bookings";
import BookingReceiptPDF from "@/components/pdf/BookingReceiptPDF";
import { Skeleton } from "@/components/ui/Skeleton";
import Toast from "@/components/ui/Toast";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const labId = searchParams.get("lab") || "1";
  const bookingType = searchParams.get("type") || "home_collection";
  const dateStr = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const status = searchParams.get("status") || "success";
  const reason = searchParams.get("reason") || "Your bank declined the transaction. No amount was deducted. Please check your balance or try a different payment method.";

  const amountStr = searchParams.get("amount");
  
  // Robust test ID extraction (handles both singular and plural from different portals)
  const testIds = useMemo(() => {
    const testIdSingular = searchParams.get("test");
    const testsPlural = searchParams.get("tests");
    const raw = (testsPlural ? testsPlural.split(",") : (testIdSingular ? [testIdSingular] : []));
    return raw.filter(id => id.trim() !== "");
  }, [searchParams]);
  const name = searchParams.get("name") || "Valued Customer";
  const email = searchParams.get("email") || "patient@meddynet.com";
  const phone = searchParams.get("phone") || "+91-XXXXXXXXXX";
  const subtotalStr = searchParams.get("subtotal") || "0";
  const discountStr = searchParams.get("discount") || "0";
  const age = searchParams.get("age") || "";
  const gender = searchParams.get("gender") || "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");

  const selectedTests = lab ? lab.tests.filter((t: any) => testIds.includes(t.id)) : [];
  const selectedTestNames = selectedTests.map((t: any) => t.name);
  const displayPrice = amountStr || (lab?.tests?.[0]?.price?.toString() || '1,299');

  const [isProcessing, setIsProcessing] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<"success" | "failed">(status as "success" | "failed");
  const [errorMessage, setErrorMessage] = useState(reason);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const bookingInitiated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    
    async function performBooking() {
      if (!labId || testIds.length === 0 || bookingInitiated.current) {
        if (!bookingInitiated.current) setIsProcessing(false);
        return;
      }

      bookingInitiated.current = true;

      try {
        // 1. Fetch Lab Details
        const labData = await getLabById(labId);
        if (cancelled) return;
        if (!labData) throw new Error("Lab not found");
        setLab(labData);

        // 2. Create Booking (with 20s timeout)
        const scheduledAt = new Date(`${dateStr} ${time || "09:00 AM"}`).toISOString();
        const payload: CreateBookingPayload = {
          lab_id: labId,
          test_ids: testIds,
          type: bookingType as any,
          scheduled_at: scheduledAt,
          patient_name: name,
          patient_phone: phone,
          patient_age: age ? parseInt(age) : undefined,
          patient_gender: gender || undefined,
          address: searchParams.get("address") || undefined,
          promo_code: searchParams.get("promo") || undefined,
          notes: searchParams.get("notes") || undefined
        };

        // Initiating booking creation
        const bookingTimeout = setTimeout(() => {
          if (isProcessing && !booking) {
             console.error("[MeddyNet] Booking request timed out (20s).");
             setBookingStatus("failed");
             setErrorMessage("The booking server is taking too long to respond. Please check your internet or retry later.");
             setIsProcessing(false);
          }
        }, 20000);

        const result = await createBooking(payload);
        clearTimeout(bookingTimeout);
        // Booking created successfully
        
        if (cancelled) return;
        setBooking(result);

        // 3. SECURE PAYMENT: Load Razorpay and Trigger Popup
        const loadScript = () => {
          return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const scriptLoaded = await loadScript();
        if (!scriptLoaded) throw new Error("Razorpay SDK failed to load. Please check your internet.");

        // ── SIMULATION PROTOCOL ──
        // If the order_id is a mock one (from dev environment), skip Razorpay popup
        if (result.razorpay_order_id && result.razorpay_order_id.includes("mock")) {
          // Mock order detected in dev mode — auto-verify
          const { apiClient } = await import("@/lib/api");
          await apiClient.post("/payments/verify", {
            razorpay_order_id: result.razorpay_order_id,
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(7),
          });
          setTransactionId("TXN-MOCK-" + Math.random().toString(36).substring(5).toUpperCase());
          setBookingStatus("success");
          setIsProcessing(false);
          return;
        }

        // Preparing Razorpay checkout

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SYtud8bQx2VFGp",
          amount: result.amount,
          currency: "INR",
          name: "MeddyNet Labs",
          description: `Booking for ${name}`,
          order_id: result.razorpay_order_id,
          handler: async (response: any) => {
            try {
              setIsProcessing(true);
              const { apiClient } = await import("@/lib/api");
              await apiClient.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              
              setBookingStatus("success");
              setReceiptNumber(`RCP-${new Date().getFullYear()}-${result.id.slice(-5)}`);
              setTransactionId(response.razorpay_payment_id);
              setToast({ message: "Payment verified successfully!", type: "success" });
            } catch (err) {
              setBookingStatus("failed");
              setErrorMessage("Payment verification failed. Please contact support.");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: name,
            email: email,
            contact: phone,
          },
          theme: { color: "#00A86B" },
          modal: {
            ondismiss: () => {
              if (bookingStatus !== "success") {
                setBookingStatus("failed");
                setErrorMessage("Payment was interrupted. You can retry below to secure your slot.");
                setIsProcessing(false);
              }
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        
        // ── IMPORTANT ──
        // Hide the full-screen spinner before opening the popup 
        // otherwise it might block interaction or look confusing
        setIsProcessing(false);
        rzp.open();
        
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosErr = err as { message?: string };
        setBookingStatus("failed");
        setErrorMessage(axiosErr.message || "Something went wrong.");
        setIsProcessing(false);
      }
    }

    performBooking();
    return () => { cancelled = true; };
  }, [labId, dateStr, time, testIds, bookingType, name, phone]);

  // ── Retry Payment Handler ──
  const handleRetryPayment = async () => {
    if (!booking || !booking.razorpay_order_id) {
      setToast({ message: "No active booking found to retry. Please create a new booking.", type: "error" });
      return;
    }

    setIsProcessing(true);

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SYtud8bQx2VFGp",
        amount: booking.amount,
        currency: "INR",
        name: "MeddyNet Labs",
        description: `Retry Payment for ${name}`,
        order_id: booking.razorpay_order_id,
        handler: async (response: any) => {
          try {
            setIsProcessing(true);
            const { apiClient } = await import("@/lib/api");
            await apiClient.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookingStatus("success");
            setReceiptNumber(`RCP-${new Date().getFullYear()}-${booking.id.slice(-5)}`);
            setTransactionId(response.razorpay_payment_id);
            setToast({ message: "Payment verified successfully!", type: "success" });
          } catch (err) {
            setBookingStatus("failed");
            setErrorMessage("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: "#00A86B" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setIsProcessing(false);
    } catch (err) {
      setToast({ message: "Failed to restart payment modal.", type: "error" });
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    setToast({ message: "Generating premium PDF receipt...", type: "info" });
    try {
      const { toJpeg } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      
      const element = document.getElementById("premium-receipt-template");
      if (!element) return;
      
      const dataUrl = await toJpeg(element, { quality: 0.95, backgroundColor: '#ffffff', pixelRatio: 2 });
      
      const pdf = new jsPDF({
        orientation: element.offsetWidth > element.offsetHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [element.offsetWidth, element.offsetHeight]
      });
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, element.offsetWidth, element.offsetHeight);
      pdf.save(`MeddyNet_Booking_${booking?.id || "MN-PENDING"}.pdf`);
      
      setToast({ message: "Receipt downloaded successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to generate PDF. You can also print this page.", type: "error" });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "MeddyNet Booking Receipt",
          text: `Here is your booking confirmation for ID: ${booking?.id || "MN-PENDING"}`,
          url: window.location.href,
        });
        setToast({ message: "Shared successfully!", type: "success" });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setToast({ message: "Share link copied to clipboard.", type: "success" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const dateDisplay = dateStr
    ? new Date(dateStr).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tomorrow";

  return (
    <div className="min-h-screen pt-[100px] pb-12 bg-linear-to-br from-surface via-white to-primary/10 flex items-center justify-center px-4">
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,168,107,0.15)] overflow-hidden relative p-12 flex flex-col items-center justify-center text-center border border-border"
          >
             {/* Logo Top */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-80">
              <div className="relative w-32 h-10">
                <Image src="/MeddyNetlogo.png" alt="MeddyNet Logo" fill className="object-contain" />
              </div>
            </div>

            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-32 -mb-32 animate-pulse" style={{ animationDelay: "1s" }} />
            
            {/* Animated Scanner Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent animate-shimmer bg-size-[200%_100%]" />

            <div className="relative z-10 w-full flex flex-col items-center mt-8">
                <div className="relative mb-10 w-36 h-36 flex items-center justify-center">
                    {/* Ring Animations */}
                    <div className="absolute inset-0 border-[3px] border-surface border-dashed rounded-full animate-spin-slow" />
                    <div className="absolute inset-2 border-4 border-primary border-t-transparent border-l-transparent rounded-full animate-spin shadow-[0_0_40px_rgba(0,168,107,0.3)]" style={{ animationDuration: "1.2s" }} />
                    <div className="absolute inset-6 border-4 border-accent border-b-transparent border-r-transparent rounded-full animate-spin" style={{ animationDuration: "1.8s", animationDirection: "reverse" }} />
                    
                    {/* Pulsing Icon Core */}
                    <div className="w-16 h-16 bg-linear-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center z-10 shadow-[0_0_30px_rgba(0,168,107,0.4)] relative overflow-hidden rotate-12">
                       <CheckCircle className="w-8 h-8 text-white -rotate-12 animate-pulse" />
                       <div className="absolute inset-0 bg-white/20 animate-ping opacity-20" />
                    </div>
                </div>

                <div className="space-y-4">
                   <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-primary border border-primary/20">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Secure
                   </div>
                   <h2 className="text-2xl font-black text-dark-light tracking-tight">Confirming Booking</h2>
                   <p className="text-sm font-bold text-text-muted italic max-w-[220px] mx-auto leading-relaxed">
                      Please hold on while we secure your slot.
                   </p>
                </div>
            </div>
          </motion.div>
        ) : bookingStatus === "failed" ? (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            className="w-full max-w-[380px] md:max-w-[780px] bg-white rounded-[32px] md:rounded-[40px] shadow-[0_40px_80px_-20px_rgba(220,38,38,0.15)] md:shadow-2xl overflow-hidden flex flex-col md:flex-row border border-red-100"
          >
            {/* Left Header Failed Section */}
            <div className="md:w-[45%] bg-linear-to-br from-dark to-slate-900 pt-8 pb-12 md:py-16 px-8 flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_150%,#DC2626_0%,transparent_60%)] opacity-30" />
                
                {/* Logo */}
                <div className="flex items-center justify-center relative z-10 mb-6 border-b border-white/10 pb-4 w-full">
                    <div className="relative w-32 h-10 mx-auto">
                        <Image src="/MeddyNetlogo.png" alt="MeddyNet Logo" fill className="object-contain brightness-0 invert opacity-90" />
                    </div>
                </div>

                <motion.div
                    initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-[20px] bg-linear-to-br from-red-500 to-rose-600 mx-auto mb-4 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)] border border-white/20 relative rotate-12"
                >
                    <div className="absolute inset-0 rounded-[20px] bg-white animate-ping opacity-20" />
                    <XCircle className="w-8 h-8 text-white -rotate-12 drop-shadow-xl" strokeWidth={3} />
                </motion.div>
                
                <div className="relative z-10">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-1.5 block animate-pulse">Payment Declined</span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">Failed</h1>
                    <p className="text-white/60 text-[10px] font-bold italic tracking-[0.2em] uppercase mt-3">
                        Transaction Unsuccessful
                    </p>
                </div>
            </div>

            {/* Right Receipt Body */}
            <div className="flex-1 p-6 sm:p-8 md:p-10 -mt-6 md:mt-0 md:-ml-6 relative z-10 bg-white rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-[-20px_0_40px_rgba(0,0,0,0.08)] flex flex-col justify-center">
              
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-dashed border-border-dark/60">
                <div>
                   <p className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Attempted ID</p>
                   <p className="text-xs sm:text-sm md:text-base font-black text-dark tracking-tighter">ERR-{Date.now().toString().slice(-6)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Date</p>
                   <p className="text-xs sm:text-sm md:text-base font-black text-dark tracking-tighter">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-red-50 rounded-2xl p-4 md:p-5 mb-6 md:mb-8 border border-red-100 flex gap-4 md:items-center">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                   <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-red-800 font-bold leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 md:space-y-4 mt-auto">
                 <button 
                   onClick={handleRetryPayment}
                   disabled={isProcessing}
                   className="w-full flex items-center justify-center gap-3 h-12 md:h-14 rounded-2xl bg-red-600 text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/30 hover:bg-red-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <RefreshCcw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} /> {isProcessing ? 'Opening Payment...' : 'Retry Payment'}
                 </button>
                 <Link href="/book" className="w-full flex items-center justify-center h-12 md:h-14 rounded-xl bg-surface text-[10px] md:text-[11px] font-black uppercase tracking-widest text-text-secondary hover:bg-white border border-transparent hover:border-red-200 hover:text-red-600 transition-all">
                    Modify Booking Details
                 </Link>
                 <Link href="/dashboard" className="w-full flex items-center justify-center h-10 md:h-12 rounded-xl bg-transparent text-[10px] md:text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-dark transition-all">
                    Cancel & Return to Dashboard
                 </Link>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            id="receipt-content"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            className="w-full max-w-[380px] md:max-w-[780px] bg-white rounded-[32px] md:rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] md:shadow-2xl overflow-hidden flex flex-col md:flex-row border border-border"
          >
            {/* Left Header Success Section */}
            <div className="md:w-[45%] bg-linear-to-br from-dark to-slate-900 pt-8 pb-12 md:py-16 px-8 flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_150%,#00A86B_0%,transparent_60%)] opacity-30" />
                
                {/* Logo */}
                <div className="flex items-center justify-center relative z-10 mb-6 border-b border-white/10 pb-4 w-full">
                    <div className="relative w-32 h-10 mx-auto">
                        <Image src="/MeddyNetlogo.png" alt="MeddyNet Logo" fill className="object-contain brightness-0 invert opacity-90" />
                    </div>
                </div>

                <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-[20px] bg-linear-to-br from-primary to-emerald-500 mx-auto mb-4 flex items-center justify-center shadow-[0_0_40px_rgba(0,168,107,0.4)] border border-white/20 relative rotate-12"
                >
                    <div className="absolute inset-0 rounded-[20px] bg-white animate-ping opacity-20" />
                    <CheckCircle className="w-8 h-8 text-white -rotate-12 drop-shadow-xl" strokeWidth={3} />
                </motion.div>
                
                <div className="relative z-10">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-1.5 block animate-pulse">Booking Confirmed</span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">₹{displayPrice}</h1>
                    <p className="text-white/60 text-[10px] font-bold italic tracking-[0.2em] uppercase mt-3 md:mt-4">
                        Booking Successful
                    </p>
                </div>
            </div>

            {/* Right Receipt Body */}
            <div className="flex-1 p-6 sm:p-8 md:p-10 -mt-6 md:mt-0 md:-ml-6 relative z-10 bg-white rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-[-20px_0_40px_rgba(0,0,0,0.08)] flex flex-col justify-center">
              
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-dashed border-border-dark/60">
                <div>
                   <p className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Transaction ID</p>
                   <p className="text-xs sm:text-sm md:text-base font-black text-dark tracking-tighter">{booking?.id || "MN-PENDING"}</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Date</p>
                   <p className="text-xs sm:text-sm md:text-base font-black text-dark tracking-tighter">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Lab Info */}
              {lab && (
                <div className="flex items-start gap-4 mb-6 group">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${lab.color} flex items-center justify-center text-white font-black shadow-lg shrink-0 text-sm sm:text-base`}>
                    {lab.initials}
                  </div>
                  <div>
                    <h3 className="font-black text-dark-light text-sm sm:text-base tracking-tight leading-none mb-1.5">{lab.name}</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-text-muted leading-relaxed line-clamp-2 md:pr-4">{lab.address}, {lab.city}</p>
                  </div>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="space-y-3 mb-6 bg-surface rounded-[20px] p-4 md:p-5 border border-border">
                {selectedTestNames.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-muted">Tests</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] md:text-xs font-black text-dark-light text-right max-w-[65%] leading-snug wrap-break-word">
                      {selectedTestNames.join(", ")}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    {bookingType === "home_collection" ? <Home className="w-3.5 h-3.5 text-primary" /> : <MapPin className="w-3.5 h-3.5 text-accent" />}
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-muted">Type</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] md:text-xs font-black text-dark-light capitalize">{bookingType === "home_collection" ? "Home Collection" : "Lab Visit"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-muted">Date</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] md:text-xs font-black text-dark-light">{dateDisplay.split(",").slice(0, 2).join(",")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-muted">Time</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] md:text-xs font-black text-dark-light">{time || "9:00 AM"}</p>
                </div>
              </div>

              {/* Info Note */}
              {bookingType === "home_collection" && (
                <div className="bg-primary/5 rounded-2xl p-3 md:p-4 mb-6 border border-primary/20 flex gap-3 md:items-center">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                     <span className="text-white text-[10px] font-black">!</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] text-primary-dark font-bold leading-relaxed">
                    Tech arriving 30 mins early. Keep ID & prescription ready.
                  </p>
                </div>
              )}

              {bookingType === "lab_visit" && (
                <div className="bg-accent/5 rounded-2xl p-3 md:p-4 mb-6 border border-accent/20 flex gap-3 md:items-center">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                     <Navigation className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] text-accent/80 font-black uppercase tracking-tight leading-relaxed">
                    Live tracking enabled. Navigate to {lab?.name} via Dashboard.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 mt-auto">
                 <Link href="/dashboard" className="w-full flex items-center justify-center h-12 md:h-14 rounded-2xl bg-primary text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform active:scale-95">
                    Goto Dashboard
                 </Link>
                 <div className="flex gap-3">
                   <button 
                     onClick={handleDownload}
                     className="flex-1 h-10 md:h-12 flex items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-surface text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-white border border-transparent hover:border-primary/20 hover:text-primary transition-all"
                   >
                     <Download className="w-3 h-3 md:w-3.5 md:h-3.5" /> PDF
                   </button>
                   <button 
                     onClick={handleShare}
                     className="flex-1 h-10 md:h-12 flex items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-surface text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-white border border-transparent hover:border-accent/20 hover:text-accent transition-all"
                   >
                     <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> Share
                   </button>
                 </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Premium PDF Template (Hidden from View) */}
      <div className="absolute top-0 left-0 -z-50 pointer-events-none opacity-0 overflow-hidden h-0">
        <BookingReceiptPDF 
          id="premium-receipt-template"
          receiptNumber={receiptNumber}
          bookingId={booking?.id || "MN-PENDING"}
          date={dateDisplay}
          time={time || "9:00 AM"}
          customerName={name}
          customerEmail={email}
          customerPhone={phone}
          bookingType={bookingType}
          labName={lab?.name || "MeddyNet Partner Lab"}
          labAddress={lab?.address || "Location not specified"}
          tests={selectedTests}
          subtotal={parseInt(subtotalStr)}
          discount={parseInt(discountStr)}
          total={parseInt(displayPrice)}
          transactionId={transactionId}
        />
      </div>
    </div>
  );
}

function ReceiptSkeleton() {
  return (
    <div className="min-h-screen pt-[100px] bg-linear-to-br from-surface via-white to-primary/10 flex items-center justify-center px-4">
      <div className="w-full max-w-[780px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-border h-[500px]">
        <div className="md:w-[45%] bg-slate-900 p-12 flex flex-col items-center justify-center gap-6">
           <Skeleton className="w-20 h-20 rounded-[24px] bg-white/10" />
           <Skeleton className="h-10 w-32 bg-white/10" />
           <Skeleton className="h-4 w-24 bg-white/5" />
        </div>
        <div className="flex-1 p-10 space-y-8">
           <div className="flex justify-between">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
           </div>
           <Skeleton className="h-16 w-full rounded-2xl" />
           <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
           </div>
           <div className="flex gap-4 pt-10">
              <Skeleton className="h-14 flex-1 rounded-2xl" />
              <Skeleton className="h-14 w-32 rounded-2xl" />
           </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ReceiptSkeleton />}>
      <ConfirmationContent />
    </Suspense>
  );
}
///hehe bhai hehe
