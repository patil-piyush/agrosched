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

const TABS = ['Job Scheduling', 'Fractional Knapsack', 'Dijkstra'];

export default function Module3Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.1 });
  const { farm, storeResult } = useFarm();
  const [tab, setTab]  = useState(0);
  const [week, setWeek] = useState(1);

  // Compute: first select crops via knapsack, then schedule
  const ksResult  = useMemo(() => knapsack01(farm.crops, farm.budget), [farm]);
  const jobResult = useMemo(() => jobScheduling(ksResult.selected, farm.plots, farm.season.totalWeeks), [ksResult]);
  const dijkResult = useMemo(() => dijkstra(farm.irrigationNetwork), [farm.irrigationNetwork]);

  // Weekly water for selected week
  const weeklyAssignments = useMemo(
    () => buildWeeklyAssignments(jobResult.assignments, week),
    [jobResult.assignments, week]
  );
  const fkResult = useMemo(() => fractionalKnapsack(weeklyAssignments, farm.weeklyWater), [weeklyAssignments, farm.weeklyWater]);

  const jobPlayer  = useAlgorithmPlayer(jobResult.trace);
  const dijkPlayer = useAlgorithmPlayer(dijkResult.trace);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#FAF5FF' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={3} title="Greedy Algorithms"
            subtitle="Make the locally optimal choice at each step. Fast and effective for these sub-problems."
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
            <>
              <div className="algo-card">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-textDark">Job Scheduling with Deadlines</h3>
                    <p className="text-xs text-muted mt-0.5">Each (crop, plot) pair is a job. Deadline = end of planting window. Greedy assigns highest-yield jobs to latest available slots.</p>
                  </div>
                  <div className="flex gap-3 text-center">
                    <div className="bg-purple-50 rounded-lg px-3 py-2">
                      <div className="text-lg font-extrabold text-purple-700">{jobResult.assignments.length}</div>
                      <div className="text-xs text-muted">Scheduled</div>
                    </div>
                    <div className="bg-red-50 rounded-lg px-3 py-2">
                      <div className="text-lg font-extrabold text-red-600">{jobResult.rejected.length}</div>
                      <div className="text-xs text-muted">Rejected</div>
                    </div>
                    <div className="bg-green-50 rounded-lg px-3 py-2">
                      <div className="text-lg font-extrabold text-green-700">₹{Math.round(jobResult.totalYield/1000)}k</div>
                      <div className="text-xs text-muted">Total Yield</div>
                    </div>
                  </div>
                </div>

                <GanttChart
                  assignments={jobResult.assignments}
                  rejected={jobResult.rejected}
                  trace={jobResult.trace}
                  currentStep={jobPlayer.currentStep}
                  plots={farm.plots}
                  totalWeeks={farm.season.totalWeeks}
                />

                {/* Trace log */}
                <div className="mt-3 bg-gray-50 rounded-lg p-2 max-h-28 overflow-y-auto font-mono text-xs space-y-0.5">
                  {jobResult.trace.slice(0, Math.max(0, jobPlayer.currentStep + 1)).map((t, i) => (
                    <div key={i} className={`flex gap-2 ${t.status==='scheduled'?'text-green-700':'text-red-600'}`}>
                      <span>{t.status==='scheduled'?'✓':'✕'}</span>
                      <span>{t.cropName} @ {t.plotName}</span>
                      <span className="text-gray-400">deadline W{t.deadline}</span>
                      {t.status==='scheduled' && <span>→ slot W{t.slotAssigned}</span>}
                      {t.status==='rejected'  && <span>— {t.reason}</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <StepController player={jobPlayer} label="Job Scheduling" />
                </div>
              </div>
            </>
          )}

          {/* ── FRACTIONAL KNAPSACK ── */}
          {tab === 1 && (
            <div className="algo-card">
              <h3 className="font-bold text-textDark mb-1">Fractional Knapsack — Weekly Water Allocation</h3>
              <p className="text-xs text-muted mb-4">Allocates {farm.weeklyWater.toLocaleString()}L of water greedily by yield-per-litre ratio. Partial allocation allowed.</p>

              {/* Week selector */}
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-medium text-textDark">Week:</label>
                <input type="range" min={1} max={24} value={week} onChange={e => setWeek(+e.target.value)}
                  className="w-32 accent-purple-600" />
                <span className="font-mono text-sm font-bold text-purple-700">W{week}</span>
                <span className="text-xs text-muted">({weeklyAssignments.length} active crops)</span>
              </div>

              {weeklyAssignments.length === 0 ? (
                <div className="text-center py-10 text-muted text-sm">No crops active in Week {week}</div>
              ) : (
                <>
                  {/* Stacked water bar */}
                  <div className="mb-4">
                    <div className="flex h-10 rounded-lg overflow-hidden border border-gray-200">
                      {fkResult.allocations.map((a, i) => {
                        const pct = (a.allocated / farm.weeklyWater) * 100;
                        const col = CROP_COLORS[a.id?.split('-')[0]] || '#52B788';
                        return (
                          <div key={i} title={`${a.name}: ${a.allocated.toLocaleString()}L (${Math.round(a.fraction*100)}%)`}
                            style={{ width:`${pct}%`, background: col, transition:'width 0.4s', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                            {pct > 6 && <span className="text-white text-xs font-bold" style={{ textShadow:'0 1px 2px rgba(0,0,0,0.5)' }}>
                              {Math.round(pct)}%
                            </span>}
                          </div>
                        );
                      })}
                      {/* Unused */}
                      {(() => { const used = fkResult.allocations.reduce((s,a)=>s+a.allocated,0); const pct=(farm.weeklyWater-used)/farm.weeklyWater*100; return pct>0&&(<div style={{width:`${pct}%`,background:'#F0F4F8'}}/>); })()}
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-1">
                      <span>0L</span>
                      <span className="font-semibold text-purple-700">Used: {fkResult.totalAllocated.toLocaleString()}L / {farm.weeklyWater.toLocaleString()}L</span>
                      <span>{farm.weeklyWater.toLocaleString()}L</span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-purple-50 text-left">
                          <th className="p-2">Crop @ Plot</th><th className="p-2">Demand</th>
                          <th className="p-2">Yield/L ratio</th><th className="p-2">Allocated</th><th className="p-2">Fraction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fkResult.allocations.map((a, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="p-2 font-medium">{a.name}</td>
                            <td className="p-2 font-mono">{a.demand.toLocaleString()}L</td>
                            <td className="p-2 font-mono">{a.ratio}</td>
                            <td className="p-2 font-mono">{a.allocated.toLocaleString()}L</td>
                            <td className="p-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 h-2 rounded-full bg-gray-200">
                                  <div className="h-full rounded-full" style={{ width:`${a.fraction*100}%`, background: a.fraction===1?'#2E7D32':'#E65100' }} />
                                </div>
                                <span className={a.fraction<1?'text-orange-600 font-semibold':'text-green-700'}>{Math.round(a.fraction*100)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-purple-50 flex gap-6 flex-wrap">
                    <span className="text-sm"><span className="font-bold text-purple-700">Efficiency:</span> {fkResult.efficiency}%</span>
                    <span className="text-sm"><span className="font-bold text-red-600">Yield loss:</span> ₹{fkResult.yieldImpact.toLocaleString()} from partial watering</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── DIJKSTRA ── */}
          {tab === 2 && (
            <div className="algo-card">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-textDark">Dijkstra's Algorithm — Irrigation Network</h3>
                  <p className="text-xs text-muted mt-0.5">Finds minimum water-loss path from borewell to each plot. Edge weights = pipe efficiency loss.</p>
                </div>
              </div>

              <GraphVisualizer
                network={farm.irrigationNetwork}
                trace={dijkResult.trace}
                currentStep={dijkPlayer.currentStep}
                efficiency={dijkPlayer.isDone ? dijkResult.efficiency : {}}
              />

              {/* Efficiency results */}
              {dijkPlayer.isDone && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(dijkResult.efficiency).map(([nodeId, eff]) => {
                      const plot = farm.plots.find(p => p.irrigationNode === nodeId);
                      return (
                        <div key={nodeId} className="p-2 rounded-lg bg-green-50 border border-green-100 text-center">
                          <div className="text-xs text-muted">{plot?.name || nodeId}</div>
                          <div className={`text-lg font-extrabold ${eff>=90?'text-green-700':eff>=75?'text-yellow-600':'text-red-600'}`}>{eff}%</div>
                          <div className="text-xs text-muted">delivery</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="mt-3">
                <StepController player={dijkPlayer} label="Dijkstra — Irrigation" />
              </div>
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
