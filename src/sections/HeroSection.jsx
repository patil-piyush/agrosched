import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ScrollIndicator from '../components/ScrollIndicator';

const STATS = [
  { label: 'Algorithms', value: '16' },
  { label: 'DAA Modules', value: '5' },
  { label: 'Plots Managed', value: '6' },
  { label: 'Season Weeks', value: '24' },
];

const MODULES = [
  { num: 2, name: 'Divide & Conquer', color: '#1565C0', algos: 'Quick Sort · Binary Search · Karatsuba' },
  { num: 3, name: 'Greedy',           color: '#6A1B9A', algos: 'Job Scheduling · Fractional Knapsack · Dijkstra' },
  { num: 4, name: 'Dynamic Prog.',    color: '#2E7D32', algos: '0/1 Knapsack · Multistage · Floyd-Warshall · Bellman-Ford · SoS · Binomial' },
  { num: 5, name: 'Backtracking',     color: '#E65100', algos: 'Crop Rotation · Knapsack BT' },
  { num: 6, name: 'Branch & Bound',   color: '#880E4F', algos: 'Knapsack (FIFO/LIFO/LC) · TSP Tour' },
];

// Animated farm field SVG
function FarmField() {
  return (
    <svg viewBox="0 0 400 200" style={{ width: '100%', maxWidth: 440, opacity: 0.9 }}>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D47A1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1B5E3B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#sky)" rx="12" />

      {/* Plot rows — animated */}
      {[0,1,2,3,4,5].map(i => {
        const colors = ['#FDD835','#E53935','#8E24AA','#FFB300','#43A047','#7CB342'];
        const y = 30 + i * 28;
        return (
          <g key={i}>
            <rect x="20" y={y} width="360" height="20" rx="4" fill={colors[i]} opacity="0.15" />
            {/* Crop icons */}
            {Array.from({ length: 12 }).map((_, j) => (
              <motion.rect
                key={j}
                x={25 + j * 30} y={y + 3} width={22} height={14} rx={3}
                fill={colors[i]}
                opacity={0.7}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.1 + j * 0.03, duration: 0.4, ease: 'easeOut' }}
              />
            ))}
          </g>
        );
      })}

      {/* Irrigation lines */}
      {[0,1,2].map(i => (
        <motion.line key={i}
          x1="200" y1="10" x2={60 + i * 140} y2="170"
          stroke="#2196F3" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 0.8 + i * 0.2, duration: 0.8 }}
        />
      ))}

      {/* Source node */}
      <motion.circle cx="200" cy="12" r="8" fill="#2196F3"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
      <text x="200" y="16" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">S</text>
    </svg>
  );
}

export default function HeroSection() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 200); }, []);

  return (
    <section className="scroll-section gradient-hero flex flex-col" style={{ minHeight: '100vh' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-white max-w-5xl mx-auto w-full">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm">
          DAA Mini Project · Maharashtra, India · 2024
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-extrabold text-center mb-2 leading-tight">
          Agro<span style={{ color: '#52B788' }}>Sched</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="text-white/60 text-sm font-mono mb-3 tracking-wide">
          A Multi-Strategy Algorithm Framework for Smart Crop Cycle Planning
        </motion.p>

        {/* Farm visual */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="my-6 w-full max-w-sm">
          <FarmField />
        </motion.div>

        {/* Problem statement */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-white/75 text-center text-sm leading-relaxed max-w-xl mb-8">
          A farmer manages <strong className="text-white">6 plots</strong> with varying soil conditions, 
          a fixed <strong className="text-white">₹80,000 budget</strong> and <strong className="text-white">15,000L/week</strong> water. 
          Which crops go where and when? <span style={{ color:'#52B788' }}>16 algorithms across 5 modules</span> find the answer.
        </motion.p>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
          className="grid grid-cols-4 gap-4 w-full max-w-lg mb-10">
          {STATS.map(s => (
            <div key={s.label} className="text-center bg-white/10 rounded-xl py-3 backdrop-blur-sm">
              <div className="text-2xl font-extrabold" style={{ color: '#52B788' }}>{s.value}</div>
              <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Module chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-2 mb-10">
          {MODULES.map(m => (
            <span key={m.num}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{ background: m.color + '22', borderColor: m.color + '55', color: '#fff' }}>
              M{m.num}: {m.name}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="flex flex-col items-center pb-8 text-white/50">
        <span className="text-xs font-medium tracking-widest uppercase mb-2">Scroll to begin</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-sm">
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
