"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DNA_FUNCTIONS = [
  { id: 1, name: "Genomics", color: "from-blue-500 to-indigo-600", desc: "Advanced genetic mapping for precision medicine." },
  { id: 2, name: "Diagnostics", color: "from-teal-400 to-emerald-500", desc: "Automated analysis for faster diagnostic results." },
  { id: 3, name: "Molecular", color: "from-purple-500 to-pink-500", desc: "In-depth study of cellular molecular structures." },
  { id: 4, name: "Biotech", color: "from-orange-400 to-rose-500", desc: "Integration of technology with biological systems." },
];

const ProfessionalDNA = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const segments = 12;
  const range = Array.from({ length: segments }, (_, i) => i);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center bg-white rounded-3xl p-8 border border-slate-100 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] group/container">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-4 rounded-2xl opacity-10 pointer-events-none group-hover/container:opacity-20 transition-opacity">
        <div 
          className="w-full h-full"
          style={{ 
            backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />
      </div>

      {/* SVG DNA Structure */}
      <svg
        viewBox="0 0 400 400"
        className="relative z-10 w-full h-full max-w-[320px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="helix-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="helix-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <filter id="drop-shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Pairs (Steps) */}
        {range.map((i) => {
          const y = 50 + i * 28;
          const progress = (i / segments) * Math.PI * 2;
          const x1 = 200 + Math.sin(progress) * 80;
          const x2 = 200 + Math.sin(progress + Math.PI) * 80;
          
          return (
            <motion.line
              key={`pair-${i}`}
              x1={x1} y1={y} x2={x2} y2={y}
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeDasharray="4 2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="pointer-events-none"
            />
          );
        })}

        {/* First Helix Strand */}
        {range.map((i) => {
          const y = 50 + i * 28;
          const progress = (i / segments) * Math.PI * 2;
          const x = 200 + Math.sin(progress) * 80;
          const isFront = Math.cos(progress) > 0;
          
          return (
            <motion.circle
              key={`h1-${i}`}
              cx={x} cy={y}
              r={isFront ? 8 : 5}
              fill="url(#helix-grad-1)"
              filter={isFront ? "url(#drop-shadow)" : "none"}
              onMouseEnter={() => i % 3 === 0 && setActiveNode(Math.floor(i/3))}
              onMouseLeave={() => setActiveNode(null)}
              className="cursor-pointer"
              animate={{ 
                x: [x - 2, x + 2, x - 2],
                scale: isFront ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: i * 0.1 
              }}
            />
          );
        })}

        {/* Second Helix Strand */}
        {range.map((i) => {
          const y = 50 + i * 28;
          const progress = (i / segments) * Math.PI * 2 + Math.PI;
          const x = 200 + Math.sin(progress) * 80;
          const isFront = Math.cos(progress) > 0;
          
          return (
            <motion.circle
              key={`h2-${i}`}
              cx={x} cy={y}
              r={isFront ? 8 : 5}
              fill="url(#helix-grad-2)"
              filter={isFront ? "url(#drop-shadow)" : "none"}
              className="cursor-pointer"
              animate={{ 
                x: [x + 2, x - 2, x + 2],
                scale: isFront ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: i * 0.1 
              }}
            />
          );
        })}
      </svg>

      {/* Floating Info Panels (Functions) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {DNA_FUNCTIONS.map((func, i) => (
          <motion.div
            key={func.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white shadow-sm border border-slate-100 flex items-center gap-2 transition-all cursor-help
              ${activeNode === i ? "scale-110 shadow-md border-primary/30" : "opacity-80"}
            `}
          >
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${func.color}`} />
            {func.name}
          </motion.div>
        ))}
      </div>

      {/* Center Tooltip for interactivity */}
      <AnimatePresence>
        {activeNode !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl z-20"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DNA_FUNCTIONS[activeNode].color} mb-2`} />
            <h4 className="text-sm font-bold text-dark">{DNA_FUNCTIONS[activeNode].name} Analysis</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {DNA_FUNCTIONS[activeNode].desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Label (Bottom Right) */}
      <div className="absolute bottom-4 right-6 text-right">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">MeddyNet Genetic Core</p>
        <p className="text-[8px] font-medium text-slate-300">v2.4.0-diagnostics</p>
      </div>
    </div>
  );
};

export default ProfessionalDNA;
