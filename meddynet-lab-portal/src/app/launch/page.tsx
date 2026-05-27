"use client";

import { motion } from "framer-motion";
import { 
  Rocket, 
  ArrowRight, 
  LayoutDashboard, 
  BarChart3, 
  Users2, 
  Activity,
  ShieldCheck,
  Zap,
  Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1000px] w-full text-center space-y-12">
        {/* Logo Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-4 group cursor-default"
        >
          <div className="w-20 h-20 relative">
            <Image src="/icon.png" alt="MeddyNet" width={80} height={80} className="w-full h-full object-contain" />
          </div>
          <span className="text-4xl font-black text-dark-light tracking-tight italic">Meddy<span className="text-primary not-italic">Net</span></span>
        </motion.div>

        {/* Main Heading */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-7xl font-black text-dark-light tracking-tight leading-[1.1] mb-6 px-4">
              Your Laboratory is <br className="hidden sm:block" />
              <span className="text-primary text-glow-primary">Powerfully Reimagined.</span>
            </h1>
            <p className="text-text-muted font-bold text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Step into the future of diagnostics. Your management suite is ready to scale your operations and patient discovery.
            </p>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
          className="flex flex-col items-center gap-6"
        >
          <Link 
            href="/dashboard"
            className="group relative flex items-center gap-3 px-10 py-6 rounded-5xl bg-dark text-white font-black text-lg shadow-2xl shadow-dark/20 hover:shadow-primary/30 hover:bg-dark-light hover:-translate-y-2 transition-all active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <LayoutDashboard className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Launch Full Dashboard
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
          </Link>
          
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 py-3 px-6 rounded-3xl sm:rounded-full bg-white/50 border border-border-dark/20 backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-black text-[10px] text-text-muted uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Secure Portal
            </div>
            <div className="w-1 h-1 rounded-full bg-border-dark" />
            <div className="flex items-center gap-1.5 font-black text-[10px] text-text-muted uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Real-time Sync
            </div>
            <div className="w-1 h-1 rounded-full bg-border-dark" />
            <div className="flex items-center gap-1.5 font-black text-[10px] text-text-muted uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              Premium Access
            </div>
          </div>
        </motion.div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-16 max-w-5xl mx-auto px-4 w-full">
          {[
            { label: "Bookings", value: "Smart Queue", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Revenue", value: "Live Insights", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Patients", value: "Patient Hub", icon: Users2, color: "text-indigo-500", bg: "bg-indigo-50" },
            { label: "Network", value: "MeddyNet Connected", icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white rounded-3xl p-5 border border-border-dark/10 shadow-xl shadow-black/2 flex flex-col items-center gap-4 transition-all hover:border-border-dark/30 hover:shadow-black/5"
            >
              <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-inner`}>
                <item.icon className="w-5 h-5 shadow-sm" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-0.5">{item.label}</p>
                <p className="text-xs font-black text-dark-light">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Footer Details */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 text-center"
      >
        <p className="text-xs font-bold text-text-muted">
          Logged in as <span className="text-dark-light font-black">National Diagnostics</span>
        </p>
      </motion.div>
    </div>
  );
}