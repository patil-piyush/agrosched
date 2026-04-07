import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { CROP_COLORS } from '../utils/formatters';
import ScrollIndicator from '../components/ScrollIndicator';

const SOIL_COLORS = { loamy:'#8BC34A', sandy:'#FFCA28', clayey:'#8D6E63', silty:'#4FC3F7' };

export default function FarmOverviewSection() {
  const ref   = useRef(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const { farm } = useFarm();

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#F8FAF5' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-14">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">The Farm</div>
          <h2 className="text-3xl font-extrabold text-textDark mb-1">{farm.name}</h2>
          <p className="text-muted text-sm mb-6">
            Budget: <strong style={{color:'#2D6A4F'}}>₹{farm.budget.toLocaleString()}</strong> &nbsp;·&nbsp;
            Water: <strong style={{color:'#2196F3'}}>₹{farm.weeklyWater.toLocaleString()}L/week</strong> &nbsp;·&nbsp;
            Season: <strong>24 weeks · 3 phases</strong>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Plots */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:0.15, duration:0.5 }}>
            <div className="algo-card h-full">
              <h3 className="font-bold text-textDark mb-3 flex items-center gap-2">
                <span style={{fontSize:18}}>🌾</span> Farm Plots ({farm.plots.length})
              </h3>
              <div className="space-y-2">
                {farm.plots.map((p, i) => (
                  <motion.div key={p.id}
                    initial={{ opacity:0, x:-10 }} animate={inView ? { opacity:1, x:0 } : {}}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-secondary/40 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: SOIL_COLORS[p.soilType] || '#8BC34A' }}>
                      {p.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-textDark truncate">{p.name}</div>
                      <div className="text-xs text-muted">{p.area} acres · {p.soilType}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold" style={{ color:'#2D6A4F' }}>Fertility</div>
                      <div className="w-16 h-1.5 rounded-full bg-gray-200 mt-0.5">
                        <div className="h-full rounded-full" style={{ width:`${p.fertility}%`, background:'#52B788' }} />
                      </div>
                      <div className="text-xs text-muted mt-0.5">{p.fertility}%</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Crops */}
          <motion.div initial={{ opacity:0, x:20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:0.2, duration:0.5 }}>
            <div className="algo-card h-full">
              <h3 className="font-bold text-textDark mb-3 flex items-center gap-2">
                <span style={{fontSize:18}}>🌱</span> Crop Library ({farm.crops.length})
              </h3>
              <div className="space-y-2">
                {farm.crops.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity:0, x:10 }} animate={inView ? { opacity:1, x:0 } : {}}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CROP_COLORS[c.id] }} />
                    <span className="text-sm font-medium flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-muted font-mono">₹{(c.packageCost/1000).toFixed(0)}k cost</span>
                    <span className="text-xs font-semibold" style={{ color:'#2D6A4F' }}>₹{(c.expectedYield/1000).toFixed(0)}k yield</span>
                    {/* Planting window bar */}
                    <div className="w-16 relative" style={{ height:8 }}>
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
          <h3 className="font-bold text-textDark mb-3">Season Timeline — 24 Weeks</h3>
          <div className="flex gap-2">
            {farm.season.phases.map((ph, i) => {
              const colors = ['#E3F2FD','#F3E5F5','#E8F5E9'];
              const bcolors= ['#1565C0','#6A1B9A','#2E7D32'];
              return (
                <div key={ph.id} className="flex-1 rounded-lg p-3 border-l-4"
                  style={{ background: colors[i], borderColor: bcolors[i] }}>
                  <div className="font-bold text-sm" style={{ color: bcolors[i] }}>{ph.name}</div>
                  <div className="text-xs text-muted mt-0.5">Weeks {ph.startWeek}–{ph.endWeek}</div>
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
