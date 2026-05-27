"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, Variants, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { 
  Activity, 
  Mail, 
  ArrowRight, 
  Heart,
  ShieldCheck,
  Plus,
  Stethoscope
} from "lucide-react";

// Social Icons SVGs
const socialIcons = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/themeddynet/?hl=en",
    gradient: "from-pink-600 via-red-500 to-yellow-500",
    border: "border-pink-500/50",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm3.961-9.982a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61580733425881",
    gradient: "from-blue-600 to-blue-800",
    border: "border-blue-500/50",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/112998354",
    gradient: "from-sky-500 to-sky-700",
    border: "border-sky-400/50",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/MeddyNet",
    gradient: "from-dark to-slate-800",
    border: "border-slate-700/50",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

function Particle({ i, smoothX, smoothY }: { i: number, smoothX: MotionValue<number>, smoothY: MotionValue<number> }) {
  const x = useTransform(smoothX, [-1000, 1000], [-(i * 8), i * 8]);
  const y = useTransform(smoothY, [-1000, 1000], [-(i * 8), i * 8]);
  
  let icon = null;
  if (i % 4 === 0) icon = <Plus className="w-8 h-8 text-primary" />;
  else if (i % 4 === 1) icon = <Heart className="w-6 h-6 text-accent" />;
  else if (i % 4 === 2) icon = <div className="w-2 h-2 rounded-full bg-white" />;
  else icon = <Stethoscope className="w-8 h-8 opacity-40" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15, transition: { delay: i * 0.2 } }}
      style={{ 
        top: `${((i * 47) % 80) + 10}%`, 
        left: `${((i * 73) % 80) + 10}%`,
        x,
        y,
      }}
      className="absolute hidden md:block will-change-transform"
    >
      {icon}
    </motion.div>
  );
}

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 2, minutes: 45, seconds: 30 });
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Advanced Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 300 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transformed values for 3D depth - pre-calculate or limit range
  const rotateX = useTransform(smoothY, [-500, 500], [8, -8]);
  const rotateY = useTransform(smoothX, [-500, 500], [-8, 8]);
  const bgX = useTransform(smoothX, [-800, 800], [-50, 50]);
  const bgY = useTransform(smoothY, [-800, 800], [-50, 50]);
  
  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    
    // Detect mobile/touch for performance optimization
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return; 
      const { clientX, clientY } = e;
      const x = clientX - window.innerWidth / 2;
      const y = clientY - window.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY, isMobile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const fadeInUp: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  // Prevent hydration mismatch by returning a shell until mounted
  if (!mounted) {
    return (
      <div className="relative min-h-screen w-full bg-[#020617] text-white flex items-center justify-center font-sans">
        <div className="text-primary animate-pulse font-black text-xl">MEDDYNET...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#020617] text-white selection:bg-primary/40 flex items-center justify-center overflow-hidden font-sans" ref={containerRef}>
      
      {/* ── Background Engine (Atmosphere) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ 
            x: isMobile ? 0 : bgX, 
            y: isMobile ? 0 : bgY,
            scale: isMobile ? 1 : 1.2
          }}
          className="absolute -top-[10%] -left-[5%] w-[120%] h-[120%] bg-primary/10 rounded-full blur-[120px] will-change-transform" 
        />
        
        <div className="absolute inset-0 opacity-[0.02] bg-size-[60px_60px] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]" />

        {!isMobile && [...Array(8)].map((_, i) => (
          <Particle key={i} i={i} smoothX={smoothX} smoothY={smoothY} />
        ))}
      </div>

      <div className="noise absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-6 py-12 flex flex-col min-h-screen"
      >
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          
          <div className="flex-1 text-center lg:text-left space-y-10 max-w-2xl">
            
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] uppercase font-black tracking-[0.3em] text-primary-light">Propelling Healthcare v2.0</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                HEALING <br/>
                <span className="relative inline-block text-primary italic">
                  SYSTEMS.
                  <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none hero-shimmer" />
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                MeddyNet is undergoing a high-precision digital surgery to deliver a faster, smarter, and life-first medical platform.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center lg:justify-start gap-4">
              {[
                { label: "Days", val: timeLeft.days },
                { label: "Hrs", val: timeLeft.hours },
                { label: "Mins", val: timeLeft.minutes },
                { label: "Secs", val: timeLeft.seconds },
              ].map((item, i) => (
                <div key={i} className="group relative">
                  <div className="relative glass-dark border border-white/10 p-5 md:p-6 rounded-3xl min-w-[100px] md:min-w-[130px] flex flex-col items-center justify-center shadow-2xl transition-all duration-300 hover:bg-white/5">
                    <span className="text-3xl md:text-5xl font-black text-white tabular-nums leading-none mb-2">
                       {String(item.val).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">{item.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="w-full max-w-md pt-2">
              <div className="relative p-px rounded-3xl bg-linear-to-r from-white/10 via-white/5 to-white/10">
                <div className="relative glass-dark rounded-3xl p-1.5 flex items-center overflow-hidden">
                  <div className="pl-5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email for live pulse..." 
                    className="w-full bg-transparent border-none py-4 px-3 focus:outline-none text-white placeholder:text-slate-600 font-bold text-sm"
                  />
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    className="shrink-0 bg-primary text-white py-3 px-6 md:px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg"
                  >
                    <span>Notify</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            variants={fadeInUp}
            className="flex-1 relative w-full max-w-[500px] lg:max-w-none perspective-2000"
          >
            <motion.div
              style={{ 
                rotateX: isMobile ? 0 : rotateX, 
                rotateY: isMobile ? 0 : rotateY, 
                transformStyle: "preserve-3d" 
              }}
              className="relative aspect-square w-full rounded-[4rem] border border-white/10 shadow-[0_60px_100px_-40px_rgba(0,0,0,0.8)] overflow-hidden will-change-transform"
            >
              <Image 
                src="/maintenance-hero.png" 
                alt="System Architecture" 
                fill
                priority
                className="object-cover grayscale-[0.2]"
              />
              
              <div className="absolute top-0 bottom-0 w-32 bg-white/10 blur-3xl -skew-x-30 pointer-events-none hero-sweep" />

              {!isMobile && (
                <>
                  <div className="absolute top-8 left-8 glass border border-white/20 p-4 rounded-3xl shadow-xl animate-float will-change-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none">CORE PULSE</h4>
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">Status: Optimizing</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-8 glass-dark border border-white/10 p-4 rounded-3xl shadow-xl animate-float-slow will-change-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white tracking-tight leading-none">SECURITY</h4>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Status: Active</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          variants={fadeInUp}
          className="mt-auto pt-12 pb-6 flex flex-col items-center gap-10 w-full"
        >
          <div className="flex gap-4">
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="squircleClip" clipPathUnits="objectBoundingBox">
                  <path d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5"></path>
                </clipPath>
              </defs>
            </svg>
            
            {socialIcons.map((icon) => (
              <a 
                key={icon.name}
                href={icon.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative w-12 h-12 bg-linear-to-br ${icon.gradient} border ${icon.border} flex items-center justify-center shadow-xl hover:-translate-y-2 transition-transform duration-300`}
                style={{ clipPath: "url(#squircleClip)" }}
              >
                <div className="relative scale-90 text-white">
                  {icon.svg}
                </div>
              </a>
            ))}
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-slate-600 text-[8px] font-black tracking-[0.4em] uppercase">
              <Plus className="w-2.5 h-2.5 text-primary" />
              Revolutionizing Diagnostic Care
              <Plus className="w-2.5 h-2.5 text-primary" />
            </div>
            <p className="text-slate-700 text-[8px] font-bold uppercase tracking-widest">
              MeddyNet Healthcare Pvt. Ltd. &copy; 2026
            </p>
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        body { background: #020617; }
        .glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .hero-shimmer {
          animation: shimmer-x 3s linear infinite;
        }
        .hero-sweep {
          animation: sweep-x 4s ease-in-out infinite;
        }
        @keyframes shimmer-x {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(250%) skewX(12deg); }
        }
        @keyframes sweep-x {
          0% { transform: translateX(-150%) skewX(-30deg); }
          50% { transform: translateX(250%) skewX(-30deg); }
          100% { transform: translateX(-150%) skewX(-30deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .perspective-2000 { perspective: 2000px; }
      `}</style>
    </div>
  );
}
