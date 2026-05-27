"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Search, Home, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-surface flex flex-col items-center justify-center pt-[120px] sm:pt-[160px] pb-16 overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════ AMBIENT BACKGROUND GLOWS ═══════════════ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px] mix-blend-multiply" />
        
        {/* Subtle grid pattern for technical/medical feel */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{ backgroundImage: "radial-gradient(#94a3b8 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
        />
      </div>

      {/* ═══════════════ HEARTBEAT / RADAR ANIMATION ═══════════════ */}
      <div className="absolute z-0 w-full flex justify-center opacity-[0.15] pointer-events-none overflow-hidden">
        <svg 
          width="100%" 
          height="300" 
          viewBox="0 0 1000 300" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-[1200px]"
        >
          {/* Animated SVG ECG Line */}
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
            d="M0 150 H 350 L 370 100 L 400 250 L 430 50 L 460 150 H 1000" 
            stroke="url(#ecg-gradient-light)" 
            strokeWidth="4" 
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="ecg-gradient-light" x1="0" y1="0" x2="1000" y2="0">
              <stop offset="0%" stopColor="#00A86B" stopOpacity="0" />
              <stop offset="40%" stopColor="#00A86B" />
              <stop offset="50%" stopColor="#1E88E5" />
              <stop offset="60%" stopColor="#00A86B" />
              <stop offset="100%" stopColor="#00A86B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ═══════════════ 404 CONTENT ═══════════════ */}
      <div className="relative z-10 max-w-[800px] w-full px-4 sm:px-6 text-center">
        
        {/* HUGE 404 Text Masked with Image/Gradient */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative inline-block mb-4 sm:mb-8"
        >
          <h1 className="text-[140px] sm:text-[220px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-slate-200 via-slate-300 to-slate-100 select-none filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
            404
          </h1>
          {/* Floating badge */}
          <motion.div 
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 sm:top-16 -right-2 sm:-right-8 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl rotate-12 flex items-center gap-2"
          >
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-xs sm:text-sm font-bold text-dark tracking-widest uppercase">Pulse Lost</span>
          </motion.div>
        </motion.div>

        {/* Copywriting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-sans mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold text-dark mb-4 tracking-tight">
            Vital Signs Not Found
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            The page you&apos;re looking for seems to have been misplaced in our health vault. Don&apos;t worry, even the best diagnostics occasionally hit a dead end.
          </p>
        </motion.div>

        {/* Call to Actions Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl mx-auto"
        >
          <Link 
            href="/"
            className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all duration-300 shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Return to Homepage
          </Link>

          <Link 
            href="/search"
            className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-lg text-dark font-bold transition-all duration-300 hover:-translate-y-1"
          >
            <Search className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            Find Lab Tests
          </Link>
        </motion.div>

        {/* Subtle Footer Assistance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 sm:mt-24 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium"
        >
          <span>Need immediate assistance?</span>
          <Link href="/contact" className="text-primary flex items-center gap-1 hover:underline underline-offset-4 decoration-primary/50">
            <HelpCircle className="w-4 h-4" /> Contact Support
          </Link>
        </motion.div>

      </div>

    </main>
  );
}
