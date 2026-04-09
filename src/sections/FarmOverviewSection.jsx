import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { CROP_COLORS } from '../utils/formatters';
import ScrollIndicator from '../components/ScrollIndicator';
import { Layers, Leaf, Droplets, Calendar } from 'lucide-react';

const SOIL_COLORS = { loamy:'#8BC34A', sandy:'#FFCA28', clayey:'#8D6E63', silty:'#4FC3F7' };

export default function FarmOverviewSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const { farm } = useFarm();

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#F8FAF5' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-14">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Your Farm</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{farm.name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5">
              <Droplets size={14} className="text-blue-500" />
              <strong className="text-blue-700">₹{farm.weeklyWater.toLocaleString()}L/week</strong> water
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-green-600" />
              Budget: <strong className="text-green-700">₹{farm.budget.toLocaleString()}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-600" />
              <strong>24 weeks · 3 phases</strong>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Plots */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:0.15 }}>
            <div className="algo-card h-full">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Layers size={16} className="text-green-600" />
                Farm Plots ({farm.plots.length})
              </h3>
              <div className="space-y-2">
                {farm.plots.map((p, i) => (
                  <motion.div key={p.id}
                    initial={{ opacity:0, x:-10 }} animate={inView ? { opacity:1, x:0 } : {}}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: SOIL_COLORS[p.soilType] }}>
                      {p.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.area} acres · {p.soilType}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs font-semibold text-green-700">Fertility</div>
                      <div className="w-16 h-1.5 rounded-full bg-gray-200 mt-0.5">
                        <div className="h-full rounded-full" style={{ width:`${p.fertility}%`, background:'#52B788' }} />
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.fertility}%</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Crops */}
          <motion.div initial={{ opacity:0, x:20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:0.2 }}>
            <div className="algo-card h-full">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Leaf size={16} className="text-green-600" />
                Selected Crops ({farm.crops.length})
              </h3>
              <div className="space-y-2">
                {farm.crops.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity:0, x:10 }} animate={inView ? { opacity:1, x:0 } : {}}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CROP_COLORS[c.id] }} />
                    <span className="text-sm font-medium flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-gray-400 font-mono">₹{(c.packageCost/1000).toFixed(0)}k</span>
                    <span className="text-xs font-semibold text-green-700">₹{(c.expectedYield/1000).toFixed(0)}k</span>
                    <div className="w-14 relative" style={{ height:6, flexShrink:0 }}>
                      <div className="absolute inset-0 rounded bg-gray-200" />
                      <div className="absolute top-0 bottom-0 rounded" style={{
                        left:`${(c.plantingWindow.startWeek/24)*100}%`,
                        width:`${((c.plantingWindow.endWeek - c.plantingWindow.startWeek)/24)*100}%`,
                        background: CROP_COLORS[c.id],
                      }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Phase timeline */}
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.5 }}
          className="mt-6 algo-card">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar size={15} className="text-purple-600" /> Season Timeline — 24 Weeks
          </h3>
          <div className="flex gap-2">
            {farm.season.phases.map((ph, i) => {
              const cols  = ['#E3F2FD','#F3E5F5','#E8F5E9'];
              const bcols = ['#1565C0','#6A1B9A','#2E7D32'];
              return (
                <div key={ph.id} className="flex-1 rounded-lg p-3 border-l-4"
                  style={{ background: cols[i], borderColor: bcols[i] }}>
                  <div className="font-bold text-sm" style={{ color: bcols[i] }}>{ph.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Weeks {ph.startWeek}–{ph.endWeek}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView} label="Scroll to see algorithms" />
      </div>
    </section>
  );
}
