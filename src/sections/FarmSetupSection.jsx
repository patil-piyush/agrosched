import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { sampleFarm, CROP_COLORS } from '../data/sampleFarm';
import ScrollIndicator from '../components/ScrollIndicator';
import { Settings, Droplets, Layers, Leaf, CheckSquare, Square, ChevronRight } from 'lucide-react';

const SOIL_COLORS   = { loamy:'#8BC34A', sandy:'#FFCA28', clayey:'#8D6E63', silty:'#4FC3F7' };
const SOIL_OPTIONS  = ['loamy','sandy','clayey','silty'];

export default function FarmSetupSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.1 });
  const { farm, setFarm } = useFarm();

  const [plotCount,    setPlotCount]    = useState(farm.plots.length);
  const [budget,       setBudget]       = useState(farm.budget);
  const [weeklyWater,  setWeeklyWater]  = useState(farm.weeklyWater);
  const [selectedCrops, setSelectedCrops] = useState(new Set(farm.crops.map(c => c.id)));
  const [plotSoils,    setPlotSoils]    = useState(
    Object.fromEntries(farm.plots.map(p => [p.id, p.soilType]))
  );
  const [applied, setApplied] = useState(false);

  const ALL_CROPS = sampleFarm.crops;

  function toggleCrop(id) {
    setSelectedCrops(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 2) next.delete(id); }
      else next.add(id);
      return next;
    });
    setApplied(false);
  }

  function applyConfig() {
    const plots = sampleFarm.plots.slice(0, plotCount).map(p => ({
      ...p,
      soilType: plotSoils[p.id] || p.soilType,
    }));
    const crops = ALL_CROPS.filter(c => selectedCrops.has(c.id));
    setFarm({ ...sampleFarm, budget, weeklyWater, plots, crops });
    setApplied(true);
  }

  return (
    <section ref={ref} className="scroll-section flex flex-col"
      style={{ minHeight:'100vh', background:'linear-gradient(180deg,#F0FDF4 0%,#F8FAF5 100%)' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">

        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2 flex items-center gap-1.5">
            <Settings size={12} /> Farm Configuration
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Set Up Your Farm</h2>
          <p className="text-gray-500 text-sm mb-8">
            Configure your farm parameters. All 16 algorithms will run on this data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left — Budget, Water, Plot Count */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:0.1 }}>
            <div className="algo-card space-y-6">

              {/* Budget */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Layers size={14} className="text-green-600" /> Seasonal Budget
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min={20000} max={500000} step={5000}
                    value={budget} onChange={e => { setBudget(+e.target.value); setApplied(false); }}
                    className="flex-1 accent-green-600" />
                  <span className="font-mono font-bold text-green-700 w-24 text-right">
                    ₹{budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>₹20,000</span><span>₹5,00,000</span>
                </div>
              </div>

              {/* Water */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Droplets size={14} className="text-blue-500" /> Weekly Water Supply
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min={3000} max={60000} step={1000}
                    value={weeklyWater} onChange={e => { setWeeklyWater(+e.target.value); setApplied(false); }}
                    className="flex-1 accent-blue-500" />
                  <span className="font-mono font-bold text-blue-700 w-24 text-right">
                    {weeklyWater.toLocaleString()}L
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>3,000L</span><span>60,000L</span>
                </div>
              </div>

              {/* Plot Count */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Layers size={14} className="text-purple-600" /> Number of Plots
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[4,5,6,7,8].map(n => (
                    <button key={n} onClick={() => { setPlotCount(n); setApplied(false); }}
                      className="w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all"
                      style={{
                        background: plotCount===n ? '#2D6A4F' : '#fff',
                        borderColor: plotCount===n ? '#2D6A4F' : '#E5E7EB',
                        color: plotCount===n ? '#fff' : '#374151',
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plot soil types */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Plot Soil Types</label>
                <div className="space-y-1.5">
                  {sampleFarm.plots.slice(0, plotCount).map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="w-8 text-xs font-bold text-gray-500">{p.id}</span>
                      <div className="flex gap-1 flex-wrap">
                        {SOIL_OPTIONS.map(soil => (
                          <button key={soil} onClick={() => { setPlotSoils(s => ({...s, [p.id]: soil})); setApplied(false); }}
                            className="px-2 py-0.5 rounded-full text-xs font-medium border transition-all"
                            style={{
                              background:  (plotSoils[p.id]||p.soilType)===soil ? SOIL_COLORS[soil] : '#f9f9f9',
                              borderColor: (plotSoils[p.id]||p.soilType)===soil ? SOIL_COLORS[soil] : '#E5E7EB',
                              color:       (plotSoils[p.id]||p.soilType)===soil ? '#fff' : '#6B7280',
                            }}>
                            {soil}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Crop Selection */}
          <motion.div initial={{ opacity:0, x:20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:0.15 }}>
            <div className="algo-card h-full">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Leaf size={15} className="text-green-600" /> Select Crops
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Choose which crops are available this season. Min 2. ({selectedCrops.size} selected)
              </p>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {ALL_CROPS.map(c => {
                  const checked = selectedCrops.has(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleCrop(c.id)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: checked ? CROP_COLORS[c.id] : '#F3F4F6',
                        background:  checked ? CROP_COLORS[c.id] + '18' : '#FAFAFA',
                      }}>
                      <div style={{ color: checked ? '#374151' : '#D1D5DB', flexShrink:0 }}>
                        {checked
                          ? <CheckSquare size={16} style={{ color: CROP_COLORS[c.id] }} />
                          : <Square size={16} />}
                      </div>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CROP_COLORS[c.id] }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.family}</div>
                      </div>
                      <div className="text-right flex-shrink-0 text-xs">
                        <div className="text-gray-500">₹{(c.packageCost/1000).toFixed(0)}k cost</div>
                        <div className="font-bold text-green-700">₹{(c.expectedYield/1000).toFixed(0)}k yield</div>
                      </div>
                      <div className="flex-shrink-0" style={{ width:40 }}>
                        {/* Planting window mini bar */}
                        <div className="relative h-2 bg-gray-200 rounded-full">
                          <div className="absolute top-0 bottom-0 rounded-full"
                            style={{
                              left:`${(c.plantingWindow.startWeek/24)*100}%`,
                              width:`${((c.plantingWindow.endWeek - c.plantingWindow.startWeek)/24)*100}%`,
                              background: CROP_COLORS[c.id],
                            }} />
                        </div>
                        <div className="text-center text-gray-400" style={{ fontSize:7, marginTop:1 }}>
                          W{c.plantingWindow.startWeek}–{c.plantingWindow.endWeek}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Apply Button */}
        <motion.div initial={{ opacity:0, y:10 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.3 }}
          className="mt-6 flex items-center gap-4">
          <button onClick={applyConfig}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#2D6A4F,#52B788)' }}>
            <ChevronRight size={16} />
            Apply Farm Config & Start
          </button>
          {applied && (
            <motion.span initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              className="text-sm text-green-700 font-semibold flex items-center gap-1.5">
              <CheckSquare size={15} /> Farm configured — scroll down to run algorithms
            </motion.span>
          )}
          <button onClick={() => {
            setPlotCount(sampleFarm.plots.length);
            setBudget(sampleFarm.budget);
            setWeeklyWater(sampleFarm.weeklyWater);
            setSelectedCrops(new Set(sampleFarm.crops.map(c => c.id)));
            setPlotSoils(Object.fromEntries(sampleFarm.plots.map(p => [p.id, p.soilType])));
            setFarm(sampleFarm);
            setApplied(true);
          }} className="text-xs text-gray-400 underline hover:text-gray-600">
            Reset to defaults
          </button>
        </motion.div>
      </div>

      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView && applied} label="Scroll to run algorithms on your farm" />
      </div>
    </section>
  );
}
