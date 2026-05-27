"use client";

import React from "react";

const StaticDNA = () => {
  const dots = 15;
  const range = Array.from({ length: dots }, (_, i) => i);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <svg
        viewBox="0 0 400 600"
        className="relative z-10 w-full h-full max-w-[400px] opacity-40 hover:opacity-100 transition-opacity duration-700"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="dna-light-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.6" />
          </linearGradient>
          <filter id="soft-brush-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Helix connections */}
        {range.map((i) => {
          const y = 80 + i * 32;
          const offset = Math.sin(i * 0.5) * 80;
          return (
            <line
              key={`line-${i}`}
              x1={200 - offset}
              y1={y}
              x2={200 + offset}
              y2={y}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-slate-200"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* First Strand */}
        {range.map((i) => {
          const y = 80 + i * 32;
          const offset = Math.sin(i * 0.5) * 80;
          return (
            <circle
              key={`strand1-${i}`}
              cx={200 - offset}
              cy={y}
              r="6"
              fill="white"
              stroke="url(#dna-light-grad)"
              strokeWidth="2"
              filter="url(#soft-brush-glow)"
            />
          );
        })}

        {/* Second Strand */}
        {range.map((i) => {
          const y = 80 + i * 32;
          const offset = Math.sin(i * 0.5) * 80;
          return (
            <circle
              key={`strand2-${i}`}
              cx={200 + offset}
              cy={y}
              r="6"
              fill="white"
              stroke="url(#dna-light-grad)"
              strokeWidth="2"
              filter="url(#soft-brush-glow)"
            />
          );
        })}
      </svg>
      
      {/* Subtle organic shapes for depth */}
      <div className="absolute top-[20%] right-[15%] w-4 h-4 rounded-full border border-primary/20 opacity-20" />
      <div className="absolute bottom-[30%] left-[10%] w-6 h-6 rounded-lg border border-accent/20 rotate-12 opacity-20" />
    </div>
  );
};

export default StaticDNA;
