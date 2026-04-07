import React, { useState, useMemo, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { jobScheduling } from '../algorithms/greedy/jobScheduling';
import { cropRotation } from '../algorithms/backtracking/cropRotation';
import { dijkstra } from '../algorithms/greedy/dijkstra';
import ScrollIndicator from '../components/ScrollIndicator';
import { CROP_COLORS } from '../utils/formatters';

const STEPS = [
  { label:'0/1 Knapsack',        desc:'Selecting crops within budget…',        color:'#2E7D32' },
  { label:'Quick Sort',          desc:'Ranking crops by efficiency ratio…',    color:'#1565C0' },
  { label:'Job Scheduling',      desc:'Assigning crops to plot-week slots…',   color:'#6A1B9A' },
  { label:'Crop Rotation BT',    desc:'Validating rotation constraints…',      color:'#E65100' },
  { label:'Multistage DP',       desc:'Optimizing season phase sequences…',    color:'#2E7D32' },
  { label:'Dijkstra',            desc:'Computing irrigation efficiency…',      color:'#6A1B9A' },
  { label:'Fractional Knapsack', desc:'Allocating weekly water supply…',       color:'#1565C0' },
  { label:'Floyd-Warshall',      desc:'Precomputing backup pipe routes…',      color:'#880E4F' },
];

export default function FullSeasonSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.15 });
  const { farm } = useFarm();

  const [running, setRunning]   = useState(false);
  const [doneStep, setDoneStep] = useState(-1);
  const [showPlan, setShowPlan] = useState(false);
  const [hovered, setHovered]   = useState(null);

  const ksResult   = useMemo(() => knapsack01(farm.crops, farm.budget), [farm]);
  const jobResult  = useMemo(() => jobScheduling(ksResult.selected, farm.plots, farm.season.totalWeeks), [ksResult]);
  const dijkResult = useMemo(() => dijkstra(farm.irrigationNetwork), [farm]);
  const totalYield = jobResult.totalYield;
  const budgetUsed = ksResult.totalCost;

  useEffect(() => {
    if (!running) return;
    if (doneStep >= STEPS.length - 1) {
      setTimeout(() => setShowPlan(true), 600);
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setDoneStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [running, doneStep]);

  const handleRun = () => {
    setDoneStep(-1);
    setShowPlan(false);
    setRunning(true);
    setTimeout(() => setDoneStep(0), 100);
  };

  const weeks = Array.from({ length: 24 }, (_, i) => i + 1);
  const phases = [{ start:1,end:8,name:'Kharif Early',color:'#DBEAFE' },{ start:9,end:16,name:'Kharif Late',color:'#EDE9FE' },{ start:17,end:24,name:'Rabi',color:'#DCFCE7' }];

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#F0FDF4' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Final Output</div>
          <h2 className="text-3xl font-extrabold text-textDark mb-1">Full Season Plan</h2>
          <p className="text-muted text-sm mb-6">Run all 8 algorithms in sequence to generate an optimized 24-week crop schedule.</p>

          {!showPlan && (
            <button onClick={handleRun} disabled={running}
              className="px-8 py-3 rounded-2xl text-white font-bold text-base transition-all shadow-lg hover:shadow-xl active:scale-95"
              style={{ background: running ? '#9CA3AF' : 'linear-gradient(135deg,#2D6A4F,#52B788)', cursor: running?'wait':'pointer' }}>
              {running ? '⏳ Running algorithms…' : doneStep >= 0 ? '↺ Run Again' : '▶ Run Full Season Plan'}
            </button>
          )}
        </motion.div>

        {/* Algorithm execution steps */}
        {doneStep >= 0 && !showPlan && (
          <div className="mt-6 space-y-2 max-w-lg">
            {STEPS.map((step, i) => {
              const done    = i <= doneStep;
              const current = i === doneStep;
              return (
                <motion.div key={i}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity: done||current?1:0.3, x:0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: done ? step.color+'14' : '#f9fafb', border: `1px solid ${done ? step.color+'44' : '#e5e7eb'}` }}>
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: done ? step.color : '#e5e7eb' }}>
                    {done && !current && <span className="text-white text-xs">✓</span>}
                    {current && (
                      <motion.div animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                        className="w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: done ? step.color : '#9CA3AF' }}>{step.label}</div>
                    {current && <div className="text-xs text-muted">{step.desc}</div>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Season calendar */}
        {showPlan && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label:'Total Projected Yield', value:`₹${Math.round(totalYield/1000)}k`, color:'#2E7D32' },
                { label:'Budget Used',           value:`₹${Math.round(budgetUsed/1000)}k / ₹80k`, color:'#1565C0' },
                { label:'Crops Scheduled',       value:jobResult.assignments.length,  color:'#6A1B9A' },
                { label:'Plots Active',           value:farm.plots.length,             color:'#880E4F' },
              ].map(s => (
                <div key={s.label} className="algo-card text-center py-3">
                  <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Gantt calendar */}
            <div className="algo-card overflow-x-auto">
              <h3 className="font-bold text-textDark mb-3">Season Calendar — All Plots × 24 Weeks</h3>

              {/* Phase header */}
              <div className="flex mb-1" style={{ marginLeft:100 }}>
                {phases.map(ph=>(
                  <div key={ph.name} className="text-center text-xs font-bold py-1 rounded-t"
                    style={{ width:(ph.end-ph.start+1)*26, background:ph.color, color:'#555' }}>
                    {ph.name}
                  </div>
                ))}
              </div>

              {/* Week numbers */}
              <div className="flex mb-1" style={{ marginLeft:100 }}>
                {weeks.map(w=>(
                  <div key={w} style={{ width:26, fontSize:8, textAlign:'center', color:'#9CA3AF', borderLeft:'1px solid #f3f4f6', lineHeight:'14px' }}>
                    {w%4===1?w:''}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {farm.plots.map(plot => {
                const plotAssignments = jobResult.assignments.filter(a=>a.plotId===plot.id);
                const eff = dijkResult.efficiency[plot.irrigationNode] || 100;
                return (
                  <div key={plot.id} className="flex items-center mb-0.5">
                    <div className="text-right pr-2 flex-shrink-0" style={{ width:100 }}>
                      <div className="text-xs font-medium text-gray-700">{plot.name.replace('Plot ','P')}</div>
                      <div style={{ fontSize:9, color:'#52B788' }}>💧{eff}%</div>
                    </div>
                    <div className="flex relative" style={{ height:34 }}>
                      {weeks.map(w=>{
                        const ph=phases.find(p=>w>=p.start&&w<=p.end);
                        return <div key={w} style={{ width:26, height:34, borderLeft:'1px solid #f3f4f6', background:ph?.color||'#f9fafb', opacity:0.5 }}/>;
                      })}
                      {plotAssignments.map(a=>{
                        const col=CROP_COLORS[a.cropId]||'#52B788';
                        const left=(a.plantWeek-1)*26;
                        const width=Math.min(a.growthDurationWeeks,24-a.plantWeek+1)*26-2;
                        return (
                          <div key={a.id}
                            onMouseEnter={()=>setHovered(a)} onMouseLeave={()=>setHovered(null)}
                            title={`${a.cropName} @ ${a.plotName} | W${a.plantWeek}–W${a.harvestWeek} | ₹${a.profit.toLocaleString()}`}
                            style={{ position:'absolute', left, top:3, height:28, width, background:col, borderRadius:5,
                                     display:'flex', alignItems:'center', justifyContent:'center',
                                     fontSize:8, fontWeight:700, color:'#fff', textShadow:'0 1px 2px rgba(0,0,0,0.5)',
                                     boxShadow: hovered?.id===a.id ? '0 0 0 2px #F4A261, 0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.15)',
                                     cursor:'pointer', overflow:'hidden', whiteSpace:'nowrap', padding:'0 4px', zIndex:2 }}>
                            {width > 30 ? a.cropName : a.cropName.slice(0,2)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Tooltip */}
              {hovered && (
                <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <strong>{hovered.cropName}</strong> @ {hovered.plotName} &nbsp;·&nbsp;
                  Weeks {hovered.plantWeek}–{hovered.harvestWeek} &nbsp;·&nbsp;
                  Yield: <strong className="text-green-700">₹{hovered.profit.toLocaleString()}</strong>
                </div>
              )}
            </div>

            {/* Soil health */}
            <div className="algo-card mt-4">
              <h3 className="font-bold text-textDark mb-3">Irrigation Efficiency per Plot</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {farm.plots.map(p=>{
                  const eff=dijkResult.efficiency[p.irrigationNode]||100;
                  return (
                    <div key={p.id} className="text-center p-2 rounded-lg bg-blue-50">
                      <div className="text-xs text-muted">{p.id}</div>
                      <div className="text-lg font-extrabold" style={{ color:eff>=85?'#2E7D32':eff>=70?'#E65100':'#C62828' }}>{eff}%</div>
                      <div style={{ height:4, background:'#e5e7eb', borderRadius:2, marginTop:4 }}>
                        <div style={{ height:'100%', width:`${eff}%`, background:eff>=85?'#52B788':eff>=70?'#F4A261':'#EF5350', borderRadius:2 }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView && showPlan} label="Next: Algorithm Comparisons" />
      </div>
    </section>
  );
}
