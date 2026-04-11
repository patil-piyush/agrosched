import React, { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { jobScheduling } from '../algorithms/greedy/jobScheduling';
import { fractionalKnapsack, buildWeeklyAssignments } from '../algorithms/greedy/fractionalKnapsack';
import { dijkstra } from '../algorithms/greedy/dijkstra';
import { useAlgorithmPlayer } from '../hooks/useAlgorithmPlayer';
import GanttChart from '../visualizers/GanttChart';
import GraphVisualizer from '../visualizers/GraphVisualizer';
import StepController from '../components/StepController';
import ModuleHeader from '../components/ModuleHeader';
import ScrollIndicator from '../components/ScrollIndicator';
import { CROP_COLORS } from '../utils/formatters';
import { Calendar, Droplets, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const TABS = ['Job Scheduling', 'Fractional Knapsack', 'Dijkstra'];

function FarmerInsight({ icon: Icon, title, children, color = '#2E7D32' }) {
  return (
    <div className="mt-4 p-4 rounded-xl border-l-4 bg-white" style={{ borderColor:color }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} style={{ color }}/>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{title}</span>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Module3Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.1 });
  const { farm } = useFarm();
  const [tab,  setTab]  = useState(0);
  const [week, setWeek] = useState(4);

  const ksResult   = useMemo(() => knapsack01(farm.crops, farm.budget), [farm]);
  const jobResult  = useMemo(() => jobScheduling(ksResult.selected, farm.plots, farm.season.totalWeeks), [ksResult, farm]);
  const dijkResult = useMemo(() => dijkstra(farm.irrigationNetwork), [farm.irrigationNetwork]);

  const weeklyAssignments = useMemo(() => buildWeeklyAssignments(jobResult.assignments, week), [jobResult.assignments, week]);
  const fkResult = useMemo(() => fractionalKnapsack(weeklyAssignments, farm.weeklyWater), [weeklyAssignments, farm.weeklyWater]);

  const jobPlayer  = useAlgorithmPlayer(jobResult.trace);
  const dijkPlayer = useAlgorithmPlayer(dijkResult.trace);

  // First week with active crops
  const firstActiveWeek = useMemo(() => {
    for (let w = 1; w <= 24; w++) {
      if (buildWeeklyAssignments(jobResult.assignments, w).length > 0) return w;
    }
    return 4;
  }, [jobResult.assignments]);

  // Critical deadlines: crops that must be planted soon
  const urgentCrops = useMemo(() => {
    return jobResult.assignments
      .filter(a => a.plantWeek <= 6)
      .sort((a, b) => a.plantWeek - b.plantWeek)
      .slice(0, 3);
  }, [jobResult.assignments]);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#FAF5FF' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={3} title="Greedy Algorithms"
            subtitle="Make the locally best choice at each step. Fast, practical, and close to optimal for these resource allocation problems."
            timeComplexity="O(n log n)" spaceComplexity="O(n)" />
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit flex-wrap">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: tab===i ? '#6A1B9A' : 'transparent', color: tab===i ? '#fff' : '#6B7B6E' }}>
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.2 }} className="flex-1 flex flex-col gap-4">

          {/* ── JOB SCHEDULING ── */}
          {tab === 0 && (
            <div className="algo-card">
              <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="text-xs font-bold text-purple-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-purple-700">
                  Each crop has a deadline — the last week you can plant it and still get a harvest this season.
                  The algorithm assigns the highest-value crops to the latest available slots before their deadlines,
                  maximising total yield while respecting all planting windows.
                </div>
              </div>

              <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">Job Scheduling — Crop Planting Calendar</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Each bar = one crop in one plot. Bar appears when the algorithm assigns it.
                    Red labels = missed deadlines (no slot available).
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-purple-50 rounded-xl px-3 py-2 text-center">
                    <div className="text-xl font-extrabold text-purple-700">{jobResult.assignments.length}</div>
                    <div className="text-xs text-gray-400">Scheduled</div>
                  </div>
                  <div className="bg-red-50 rounded-xl px-3 py-2 text-center">
                    <div className="text-xl font-extrabold text-red-600">{jobResult.rejected.length}</div>
                    <div className="text-xs text-gray-400">Missed</div>
                  </div>
                  <div className="bg-green-50 rounded-xl px-3 py-2 text-center">
                    <div className="text-xl font-extrabold text-green-700">₹{Math.round(jobResult.totalYield/1000)}k</div>
                    <div className="text-xs text-gray-400">Yield</div>
                  </div>
                </div>
              </div>

              <GanttChart assignments={jobResult.assignments} rejected={jobResult.rejected}
                trace={jobResult.trace} currentStep={jobPlayer.currentStep}
                plots={farm.plots} totalWeeks={farm.season.totalWeeks} />

              <div className="bg-gray-50 rounded-lg p-2 max-h-24 overflow-y-auto font-mono text-xs space-y-0.5 mt-3">
                {jobResult.trace.slice(0, Math.max(0, jobPlayer.currentStep + 1)).map((t, i) => (
                  <div key={i} className={`flex gap-2 ${t.status==='scheduled'?'text-green-700':'text-red-500'}`}>
                    {t.status==='scheduled' ? <CheckCircle size={10} className="mt-0.5 flex-shrink-0"/> : <AlertCircle size={10} className="mt-0.5 flex-shrink-0"/>}
                    <span>{t.cropName} → {t.plotName}</span>
                    <span className="text-gray-400">deadline W{t.deadline}</span>
                    {t.status==='scheduled' && <span>→ planted W{t.slotAssigned}</span>}
                  </div>
                ))}
              </div>

              <div className="mt-3"><StepController player={jobPlayer} label="Job Scheduling — planting assignments" /></div>

              {urgentCrops.length > 0 && (
                <FarmerInsight icon={Calendar} title="Your planting schedule — act now" color="#6A1B9A">
                  <strong>Urgent deadlines this season:</strong>
                  <div className="mt-2 space-y-1">
                    {urgentCrops.map(a => (
                      <div key={a.id} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CROP_COLORS[a.cropId] }}/>
                        <strong>{a.cropName}</strong> in <strong>{a.plotName}</strong> — must be planted by <strong>Week {a.deadline}</strong>
                        <span className="text-purple-600 font-semibold">(₹{a.profit.toLocaleString()} yield)</span>
                      </div>
                    ))}
                  </div>
                  {jobResult.rejected.length > 0 && (
                    <div className="mt-2 text-red-600">
                      <strong>{jobResult.rejected.length} crops missed</strong> due to overlapping deadlines.
                      Consider adding more plots next season.
                    </div>
                  )}
                </FarmerInsight>
              )}
            </div>
          )}

          {/* ── FRACTIONAL KNAPSACK ── */}
          {tab === 1 && (
            <div className="algo-card">
              <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="text-xs font-bold text-purple-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-purple-700">
                  Every week your borewell supplies exactly {farm.weeklyWater.toLocaleString()}L.
                  Multiple crops are competing for this water. Unlike the seed budget (0/1 knapsack),
                  water is divisible — crops can get a partial supply. The algorithm prioritises crops
                  that give the most revenue per litre of water.
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">Fractional Knapsack — Weekly Water Allocation</h3>
              <p className="text-xs text-gray-500 mb-4">
                Crops sorted by revenue-per-litre. Highest ratio crops get water first.
                The last crop gets whatever remains — possibly just a fraction.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-semibold text-gray-700">Week:</label>
                <input type="range" min={1} max={24} value={week}
                  onChange={e => setWeek(+e.target.value)} className="w-32 accent-purple-600"/>
                <span className="font-mono text-sm font-bold text-purple-700">W{week}</span>
                <span className="text-xs text-gray-400">({weeklyAssignments.length} active crops)</span>
              </div>

              {weeklyAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No crops active in Week {week}. Try Week {firstActiveWeek}.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Water allocation bar ({farm.weeklyWater.toLocaleString()}L total)</div>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-gray-200">
                      {fkResult.allocations.map((a, i) => {
                        const pct = (a.allocated / farm.weeklyWater) * 100;
                        const col = CROP_COLORS[a.id?.split('-')[0]] || '#52B788';
                        return (
                          <div key={i} title={`${a.name}: ${a.allocated.toLocaleString()}L (${Math.round(a.fraction*100)}%)`}
                            style={{ width:`${pct}%`, background:col, display:'flex', alignItems:'center',
                              justifyContent:'center', overflow:'hidden', position:'relative',
                              borderRight:'1px solid rgba(255,255,255,0.3)' }}>
                            {pct > 7 && <span className="text-white text-xs font-bold" style={{ textShadow:'0 1px 2px rgba(0,0,0,0.5)' }}>
                              {Math.round(pct)}%
                            </span>}
                            {a.fraction < 1 && (
                              <div style={{ position:'absolute', right:0, top:0, bottom:0, width:`${(1-a.fraction)*100}%`,
                                background:'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)' }}/>
                            )}
                          </div>
                        );
                      })}
                      {(() => { const used=fkResult.allocations.reduce((s,a)=>s+a.allocated,0); const pct=(farm.weeklyWater-used)/farm.weeklyWater*100; return pct>0 && <div style={{width:`${pct}%`,background:'#F3F4F6'}}/>;})()}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0L</span>
                      <span className="font-semibold text-purple-700">
                        {fkResult.totalAllocated.toLocaleString()}L used / {farm.weeklyWater.toLocaleString()}L available
                      </span>
                      <span>{farm.weeklyWater.toLocaleString()}L</span>
                    </div>
                  </div>

                  <div className="overflow-auto rounded-xl border border-gray-200">
                    <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ background:'#F3F4F6', textAlign:'left' }}>
                          <th style={{ padding:'8px 10px' }}>Crop @ Plot</th>
                          <th style={{ padding:'8px 10px' }}>Need</th>
                          <th style={{ padding:'8px 10px' }}>Revenue/Litre</th>
                          <th style={{ padding:'8px 10px' }}>Gets</th>
                          <th style={{ padding:'8px 10px' }}>Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fkResult.allocations.map((a, i) => (
                          <tr key={i} style={{ borderTop:'1px solid #F0F0F0' }}>
                            <td style={{ padding:'7px 10px', fontWeight:500 }}>{a.name}</td>
                            <td style={{ padding:'7px 10px', fontFamily:'monospace' }}>{a.demand.toLocaleString()}L</td>
                            <td style={{ padding:'7px 10px', fontFamily:'monospace' }}>₹{a.ratio}/L</td>
                            <td style={{ padding:'7px 10px', fontFamily:'monospace' }}>{a.allocated.toLocaleString()}L</td>
                            <td style={{ padding:'7px 10px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <div style={{ width:56, height:6, background:'#E5E7EB', borderRadius:3 }}>
                                  <div style={{ height:'100%', borderRadius:3, width:`${a.fraction*100}%`,
                                    background:a.fraction>=1?'#52B788':a.fraction>=0.7?'#F9A825':'#EF5350' }}/>
                                </div>
                                <span style={{ fontSize:11, fontWeight:600, color:a.fraction<1?'#E65100':'#2E7D32' }}>
                                  {Math.round(a.fraction*100)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex gap-4 p-3 rounded-xl bg-purple-50 flex-wrap text-sm">
                    <span>Water efficiency: <strong className="text-purple-700">{fkResult.efficiency}%</strong></span>
                    {fkResult.yieldImpact > 0 && (
                      <span className="text-red-600">Revenue lost from partial watering: <strong>₹{fkResult.yieldImpact.toLocaleString()}</strong></span>
                    )}
                  </div>

                  <FarmerInsight icon={Droplets} title="Your watering priority this week" color="#6A1B9A">
                    Water crops in this order: <strong>{fkResult.allocations.map(a=>a.name.split(' @')[0]).join(' → ')}</strong>.
                    {fkResult.allocations.some(a=>a.fraction<1) && (
                      <> The last crop gets reduced water this week — consider that plot for a drought-resistant crop next phase.</>
                    )}
                    {fkResult.yieldImpact > 0 && (
                      <> Partial watering costs you ₹{fkResult.yieldImpact.toLocaleString()} in yield.
                      Increasing your weekly water to {Math.round(farm.weeklyWater*1.15).toLocaleString()}L could eliminate this.</>
                    )}
                  </FarmerInsight>
                </>
              )}
            </div>
          )}

          {/* ── DIJKSTRA ── */}
          {tab === 2 && (
            <div className="algo-card">
              <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="text-xs font-bold text-purple-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-purple-700">
                  Water from your borewell travels through pipes and junctions to each plot.
                  Every pipe segment loses some water. Dijkstra's algorithm finds the path from
                  the borewell to each plot that loses the least water — your most efficient irrigation route.
                </div>
              </div>

              <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">Dijkstra — Most Efficient Water Routes</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Orange = currently processing. Teal = settled (shortest path found).
                    Numbers on nodes = delivery efficiency % after path is computed.
                  </p>
                </div>
              </div>

              <GraphVisualizer network={farm.irrigationNetwork} trace={dijkResult.trace}
                currentStep={dijkPlayer.currentStep}
                efficiency={dijkPlayer.isDone ? dijkResult.efficiency : {}} />

              {dijkPlayer.isDone && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(dijkResult.efficiency).map(([nodeId, eff]) => {
                      const plot = farm.plots.find(p=>p.irrigationNode===nodeId);
                      return (
                        <div key={nodeId} className="p-2.5 rounded-xl text-center"
                          style={{ background:eff>=85?'#D1FAE5':eff>=70?'#FEF9C3':'#FEE2E2',
                                   border:`1px solid ${eff>=85?'#A7F3D0':eff>=70?'#FDE68A':'#FECACA'}` }}>
                          <div className="text-xs text-gray-500">{plot?.name?.replace('Plot ','P')||nodeId}</div>
                          <div className="text-2xl font-extrabold" style={{ color:eff>=85?'#065F46':eff>=70?'#92400E':'#991B1B' }}>{eff}%</div>
                          <div className="text-xs text-gray-400">delivered</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="mt-3"><StepController player={dijkPlayer} label="Dijkstra — shortest water path" /></div>

              {dijkPlayer.isDone && (
                <FarmerInsight icon={TrendingUp} title="Your irrigation efficiency report" color="#6A1B9A">
                  {(() => {
                    const entries = Object.entries(dijkResult.efficiency);
                    const best  = entries.reduce((a,b) => a[1]>b[1]?a:b);
                    const worst = entries.reduce((a,b) => a[1]<b[1]?a:b);
                    const bestPlot  = farm.plots.find(p=>p.irrigationNode===best[0]);
                    const worstPlot = farm.plots.find(p=>p.irrigationNode===worst[0]);
                    return <>
                      <strong>{bestPlot?.name}</strong> gets {best[1]}% of pumped water — your most efficient plot.
                      Grow your most water-hungry crops here.{' '}
                      <strong>{worstPlot?.name}</strong> only receives {worst[1]}% — grow drought-tolerant crops there,
                      or repair the pipe between {worst[0]} and its upstream junction to reduce water loss.
                    </>;
                  })()}
                </FarmerInsight>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView} label="Next: Dynamic Programming" />
      </div>
    </section>
  );
}
