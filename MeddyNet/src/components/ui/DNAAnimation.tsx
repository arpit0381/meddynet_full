"use client";

import React from "react";
import { motion } from "framer-motion";

const DNAAnimation = () => {
  const dots = 18;
  const range = Array.from({ length: dots }, (_, i) => i);
  const [particles, setParticles] = React.useState<any[]>([]);

  React.useEffect(() => {
    setParticles(
      [...Array(6)].map(() => ({
        initialX: Math.random() * 400,
        initialY: Math.random() * 600,
        y: Math.random() * -100 - 50,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 5,
        left: `${10 + Math.random() * 80}%`,
        top: `${20 + Math.random() * 60}%`,
      }))
    );
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-white to-blue-50/40">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" 
        />
        
        {/* Subtle Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      <svg
        viewBox="0 0 400 600"
        className="relative z-10 w-full h-full max-w-[450px] drop-shadow-[0_20px_50px_rgba(59,130,246,0.15)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="dna-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="dna-grad-2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.23 0 0 0 0 0.51 0 0 0 0 0.96 0 0 0 0.3 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Helix connections with enhanced look */}
        {range.map((i) => (
          <motion.line
            key={`line-${i}`}
            x1="120"
            y1={80 + i * 28}
            x2="280"
            y2={80 + i * 28}
            stroke="url(#dna-grad-1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0.1 }}
            animate={{
              x1: [120, 280, 120],
              x2: [280, 120, 280],
              opacity: [0.1, 0.4, 0.1],
              strokeWidth: [1.5, 2.5, 1.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        ))}

        {/* First Strand (Blue/Purple) */}
        {range.map((i) => (
          <motion.circle
            key={`strand1-${i}`}
            cx="200"
            cy={80 + i * 28}
            r="8"
            fill="url(#dna-grad-1)"
            filter="url(#glow)"
            animate={{
              x: [120 - 200, 280 - 200, 120 - 200],
              scale: [0.9, 1.25, 0.9],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        ))}

        {/* Second Strand (Teal/Blue) */}
        {range.map((i) => (
          <motion.circle
            key={`strand2-${i}`}
            cx="200"
            cy={80 + i * 28}
            r="8"
            fill="url(#dna-grad-2)"
            filter="url(#glow)"
            animate={{
              x: [280 - 200, 120 - 200, 280 - 200],
              scale: [1.25, 0.9, 1.25],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        ))}
      </svg>
      
      {/* Floating Medical Glassmorphism Cards */}
      <motion.div 
        className="absolute top-12 left-12 p-5 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
        transition={{ 
          opacity: { duration: 1 },
          x: { duration: 1 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        </div>
        <div>
          <div className="w-20 h-2 bg-slate-200 rounded-full mb-2" />
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        </div>
      </motion.div>

      <motion.div 
        className="absolute bottom-16 right-12 p-5 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center gap-4 rotate-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, 20, 0] }}
        transition={{ 
          opacity: { duration: 1, delay: 0.5 },
          x: { duration: 1, delay: 0.5 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }}
      >
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-lg bg-accent shadow-[0_0_15px_rgba(45,212,191,0.5)] rotate-45" />
        </div>
        <div>
          <div className="w-24 h-2 bg-slate-200 rounded-full mb-2" />
          <div className="w-16 h-1.5 bg-slate-100 rounded-full" />
        </div>
      </motion.div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-primary/20 blur-[1px]"
          initial={{ 
            x: p.initialX, 
            y: p.initialY,
            opacity: 0
          }}
          animate={{ 
            y: [null, p.y],
            opacity: [0, 0.5, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "easeInOut"
          }}
          style={{
            left: p.left,
            top: p.top,
          }}
        />
      ))}
    </div>
  );
};

export default DNAAnimation;
