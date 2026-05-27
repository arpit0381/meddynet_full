"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Microscope } from "lucide-react";
import { haptics } from "@/lib/haptics";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else {
      Promise.resolve().then(() => {
        setCanResend(true);
      });
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    haptics.selection();
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits filled
    if (index === 5 && value) {
      const full = [...newOtp.slice(0, 5), value].join("");
      if (full.length === 6) {
        haptics.success();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    haptics.medium();
    setTimer(30);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    const filled = otp.join("").length === 6;
    if (filled) {
      haptics.success();
    } else {
      haptics.error();
    }
  };

  return (
    <div className="min-h-screen pt-[72px] bg-linear-to-br from-surface via-white to-primary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/8 p-6 sm:p-10 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary-light mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/25">
          <Microscope className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-dark-light mb-2">
          Verify Your Number
        </h1>
        <p className="text-sm text-text-muted mb-8">
          We&apos;ve sent a 6-digit OTP to{" "}
          <span className="font-semibold text-text">+91 98765 XXXXX</span>
        </p>

        {/* OTP Inputs — 6-column grid */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 max-w-xs sm:max-w-sm mx-auto mb-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-12 sm:h-14 w-full text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${
                digit
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-dark text-text focus:border-primary focus:ring-4 focus:ring-primary/10"
              }`}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-primary-light text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 mb-6"
        >
          Verify &amp; Continue
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Resend — always visible */}
        <div className="text-sm text-text-muted">
          {canResend ? (
            <button
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline min-h-[44px] px-4"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resend OTP
            </button>
          ) : (
            <span className="inline-block py-2">
              Resend OTP in{" "}
              <span className="font-semibold text-primary">
                0:{timer.toString().padStart(2, "0")}
              </span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 mt-6">
          <Link href="/login" onClick={() => haptics.light()} className="text-primary font-medium hover:underline py-2 inline-block">
            ← Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
