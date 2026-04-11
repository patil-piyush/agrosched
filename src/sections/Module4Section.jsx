import React, { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { floydWarshall } from '../algorithms/dp/floydWarshall';
import { bellmanFord } from '../algorithms/dp/bellmanFord';
import { dijkstra } from '../algorithms/greedy/dijkstra';
import { sumOfSubset } from '../algorithms/dp/sumOfSubset';
import { jobScheduling } from '../algorithms/greedy/jobScheduling';
import { useAlgorithmPlayer } from '../hooks/useAlgorithmPlayer';
import DPTableVisualizer from '../visualizers/DPTableVisualizer';
import TreeVisualizer from '../visualizers/TreeVisualizer';
import StepController from '../components/StepController';
import ModuleHeader from '../components/ModuleHeader';
import ScrollIndicator from '../components/ScrollIndicator';
import { CROP_COLORS } from '../utils/formatters';
import { CheckCircle, AlertTriangle, Info, TrendingUp, Droplets, MapPin } from 'lucide-react';

const TABS = ['0/1 Knapsack','Floyd-Warshall','Bellman-Ford','Sum of Subset'];

function FarmerInsight({ icon: Icon, title, children, color = '#2E7D32' }) {
  return (
    <div className="mt-4 p-4 rounded-xl border-l-4 bg-white"
      style={{ borderColor: color }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} style={{ color }} />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{title}</span>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Module4Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.08 });
  const { farm } = useFarm();
  const [tab,    setTab]    = useState(0);
  const [bfWeek, setBfWeek] = useState(1);

  const ksResult   = useMemo(() => knapsack01(farm.crops, farm.budget), [farm]);
  const fwResult   = useMemo(() => floydWarshall(farm.irrigationNetwork), [farm.irrigationNetwork]);
  const bfResult   = useMemo(() => bellmanFord(farm.irrigationNetwork, 'SOURCE', bfWeek), [farm.irrigationNetwork, bfWeek]);
  const dijkResult = useMemo(() => dijkstra(farm.irrigationNetwork), [farm.irrigationNetwork]);

  const jobResult   = useMemo(() => jobScheduling(ksResult.selected, farm.plots), [ksResult, farm]);
  const weekDemands = useMemo(() =>
    jobResult.assignments.filter(a => a.plantWeek <= 6 && a.harvestWeek > 6)
      .map(a => Math.round(a.waterPerWeek)).filter(Boolean),
    [jobResult]
  );
  const sosResult = useMemo(() => sumOfSubset(weekDemands, farm.weeklyWater), [weekDemands, farm.weeklyWater]);

  const ksPlayer  = useAlgorithmPlayer(ksResult.fills);
  const sosPlayer = useAlgorithmPlayer(sosResult.trace);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#F0FDF4' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={4} title="Dynamic Programming"
            subtitle="Remember solutions to sub-problems so you never solve the same thing twice. Guaranteed optimal results in polynomial time."
            timeComplexity="O(nW) to O(V³)" spaceComplexity="O(nW)" />
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm flex-wrap">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: tab===i ? '#2E7D32' : 'transparent', color: tab===i ? '#fff' : '#6B7B6E' }}>
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.2 }} className="flex-1 flex flex-col gap-4">

          {/* ── 0/1 KNAPSACK ── */}
          {tab === 0 && (
            <div className="algo-card">
              {/* Problem explanation */}
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xs font-bold text-blue-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-blue-700">
                  You have ₹{farm.budget.toLocaleString()} to spend on seeds and fertilizer.
                  Each crop package costs a fixed amount — you either buy it fully or skip it (no halves).
                  Which combination of crops gives you the maximum possible seasonal revenue?
                </div>
              </div>

              <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">0/1 Knapsack — Which Crops to Buy?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    The DP table fills left-to-right, row-by-row. Each cell = best yield achievable
                    with the first N crops and that column's budget. Gold cells trace the optimal selection.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-green-50 rounded-xl px-4 py-2 text-center">
                    <div className="text-xl font-extrabold text-green-700">₹{ksResult.totalCost.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Spent on seeds</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl px-4 py-2 text-center">
                    <div className="text-xl font-extrabold text-emerald-700">₹{ksResult.totalYield.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Expected revenue</div>
                  </div>
                </div>
              </div>

              <DPTableVisualizer
                dp={ksResult.dp} fills={ksResult.fills} backtrack={ksResult.backtrack}
                currentStep={ksPlayer.currentStep}
                rowLabels={farm.crops.map(c => c.name)}
                colStep={ksResult.step}
                maxCols={Math.min(ksResult.cols, 80)}
              />

              <div className="mt-3"><StepController player={ksPlayer} label="0/1 Knapsack DP table filling" /></div>

              {ksPlayer.isDone && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-gray-500">Buy these crop packages:</span>
                    {ksResult.selected.map(c => (
                      <span key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: CROP_COLORS[c.id] }} />
                        <span className="text-sm font-medium">{c.name}</span>
                        <span className="text-xs text-gray-400">₹{c.packageCost.toLocaleString()}</span>
                      </span>
                    ))}
                  </div>
                  <FarmerInsight icon={TrendingUp} title="What this means for you" color="#2E7D32">
                    Invest <strong>₹{ksResult.totalCost.toLocaleString()}</strong> on seeds for{' '}
                    <strong>{ksResult.selected.map(c => c.name).join(', ')}</strong>.
                    This combination gives the highest possible return of{' '}
                    <strong className="text-green-700">₹{ksResult.totalYield.toLocaleString()}</strong> this season —
                    a <strong>{Math.round((ksResult.totalYield / ksResult.totalCost) * 10) / 10}× return</strong> on every rupee spent.
                    {farm.budget - ksResult.totalCost > 0 && (
                      <> You save ₹{(farm.budget - ksResult.totalCost).toLocaleString()} for emergency expenses.</>
                    )}
                  </FarmerInsight>
                </motion.div>
              )}
            </div>
          )}

          {/* ── FLOYD-WARSHALL ── */}
          {tab === 1 && (
            <div className="algo-card">
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xs font-bold text-blue-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-blue-700">
                  Your irrigation pipes connect the borewell to all plots through junctions.
                  Some pipes lose more water than others. This algorithm finds the most efficient water route
                  between EVERY pair of points — so if any pipe breaks, you instantly know the backup route.
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">Floyd-Warshall — All Irrigation Path Losses</h3>
              <p className="text-xs text-gray-500 mb-4">
                Each cell = minimum water loss % to get from row-node to column-node.
                Green = efficient path, Red = high loss. O(V³) = {Math.pow(fwResult.ids.length,3)} total operations.
              </p>

              <div className="overflow-auto rounded-xl border border-gray-200 mb-4">
                <table style={{ borderCollapse:'collapse', fontSize:11, textAlign:'center' }}>
                  <thead>
                    <tr>
                      <th style={{ background:'#1F2937', color:'#fff', padding:'6px 10px',
                        position:'sticky', left:0, zIndex:10, minWidth:64, textAlign:'left', fontSize:10 }}>
                        From \ To
                      </th>
                      {fwResult.ids.map(id => (
                        <th key={id} style={{ background:'#374151', color:'#fff', padding:'6px 8px',
                          minWidth:52, fontSize:9, fontFamily:'JetBrains Mono' }}>
                          {id.replace('SOURCE','SRC').replace('Junction ','J').replace('Plot ','P')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fwResult.displayMatrix.map((row, i) => (
                      <tr key={i}>
                        <td style={{ background:'#F3F4F6', fontWeight:600, padding:'5px 10px',
                          position:'sticky', left:0, zIndex:5, fontSize:9,
                          borderRight:'2px solid #E5E7EB', textAlign:'left', fontFamily:'JetBrains Mono' }}>
                          {fwResult.ids[i].replace('SOURCE','SRC').replace('Junction ','J').replace('Plot ','P')}
                        </td>
                        {row.map((v, j) => {
                          const isInf = v === '∞';
                          const num   = isInf ? Infinity : Number(v);
                          const bg    = i===j ? '#F9FAFB' : isInf ? '#FAFAFA'
                                      : num<0.10 ? '#D1FAE5' : num<0.16 ? '#FEF9C3' : '#FEE2E2';
                          const col   = i===j ? '#D1D5DB' : isInf ? '#D1D5DB'
                                      : num<0.10 ? '#065F46' : num<0.16 ? '#92400E' : '#991B1B';
                          return (
                            <td key={j} title={`${fwResult.ids[i]} → ${fwResult.ids[j]}: ${v} loss`}
                              style={{ background:bg, color:col, fontWeight:(i===j||isInf)?300:600,
                                padding:'5px 0', border:'1px solid #E5E7EB',
                                minWidth:52, fontFamily:'JetBrains Mono', fontSize:10 }}>
                              {v}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 flex-wrap text-xs mb-4">
                {[['< 10% loss','#D1FAE5','#065F46'],['10–15% loss','#FEF9C3','#92400E'],['> 15% loss','#FEE2E2','#991B1B']].map(([l,bg,c])=>(
                  <span key={l} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold"
                    style={{background:bg, color:c}}>{l}</span>
                ))}
              </div>

              {/* Best and worst plot efficiency */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {['most','least'].map(kind => {
                  const entries = Object.entries(dijkResult.efficiency);
                  const sorted  = entries.sort((a,b) => kind==='most' ? b[1]-a[1] : a[1]-b[1]);
                  const [nodeId, eff] = sorted[0] || [];
                  const plot = farm.plots.find(p=>p.irrigationNode===nodeId);
                  return (
                    <div key={kind} className={`p-3 rounded-xl border text-center ${kind==='most'?'bg-green-50 border-green-200':'bg-red-50 border-red-200'}`}>
                      <div className={`text-xs font-bold mb-1 ${kind==='most'?'text-green-700':'text-red-700'}`}>
                        {kind==='most' ? 'Best served plot' : 'Most water lost'}
                      </div>
                      <div className={`text-xl font-extrabold ${kind==='most'?'text-green-800':'text-red-800'}`}>
                        {plot?.name?.replace('Plot ','P') || nodeId}
                      </div>
                      <div className={`text-sm font-semibold ${kind==='most'?'text-green-700':'text-red-600'}`}>{eff}% delivered</div>
                    </div>
                  );
                })}
              </div>

              <FarmerInsight icon={Droplets} title="What this means for your irrigation" color="#1565C0">
                If any pipe from your borewell breaks, this table shows the alternate route instantly.
                The red cells show which plot connections lose the most water in transit —
                those pipe segments are worth upgrading first to improve your water efficiency.
              </FarmerInsight>
            </div>
          )}

          {/* ── BELLMAN-FORD ── */}
          {tab === 2 && (
            <div className="algo-card">
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xs font-bold text-blue-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-blue-700">
                  Your pipes wear out over time — the longer the season, the more water they lose in transit.
                  Dijkstra's algorithm can't handle this. Bellman-Ford recalculates routes correctly
                  as pipe efficiency degrades week by week. It also detects impossible network configurations.
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">Bellman-Ford vs Dijkstra — Pipe Degradation</h3>
              <p className="text-xs text-gray-500 mb-4">
                Loss at Week W = base loss + (degradation rate × W). Slide the week to see how efficiency drops.
                When values diverge, Dijkstra is wrong and Bellman-Ford is correct.
              </p>

              <div className="flex items-center gap-3 mb-5">
                <label className="text-sm font-semibold text-gray-700">Week:</label>
                <input type="range" min={1} max={24} value={bfWeek}
                  onChange={e => setBfWeek(+e.target.value)} className="w-40 accent-green-600" />
                <span className="font-mono text-sm font-bold text-green-700 w-8">W{bfWeek}</span>
                {bfWeek >= 12 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">High degradation</span>}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border-2 border-green-300 bg-green-50 p-3">
                  <div className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle size={12} /> Bellman-Ford (correct at W{bfWeek})
                  </div>
                  {Object.entries(bfResult.efficiency).map(([nodeId, eff]) => {
                    const plot = farm.plots.find(p=>p.irrigationNode===nodeId);
                    return (
                      <div key={nodeId} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-600 w-14 font-medium truncate">{plot?.id||nodeId}</span>
                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width:`${eff}%`, background:eff>=85?'#52B788':eff>=70?'#F9A825':'#EF5350' }}/>
                        </div>
                        <span className="text-xs font-bold w-10 text-right"
                          style={{ color:eff>=85?'#2E7D32':eff>=70?'#E65100':'#C62828' }}>{eff}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3">
                  <div className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                    <Info size={12} /> Dijkstra (uses Week-1 weights — stale)
                  </div>
                  {Object.entries(dijkResult.efficiency).map(([nodeId, eff]) => {
                    const plot = farm.plots.find(p=>p.irrigationNode===nodeId);
                    return (
                      <div key={nodeId} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-600 w-14 font-medium truncate">{plot?.id||nodeId}</span>
                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${eff}%`, background:'#90CAF9' }}/>
                        </div>
                        <span className="text-xs font-bold w-10 text-right text-blue-600">{eff}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {bfWeek >= 12 && (
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 mb-3">
                  <AlertTriangle size={13} className="text-amber-600 mt-0.5 flex-shrink-0"/>
                  <span className="text-xs text-amber-800">
                    At Week {bfWeek}, Dijkstra's routes (computed at Week 1) are now out of date.
                    Bellman-Ford's numbers are lower because it accounts for {bfWeek} weeks of pipe wear.
                    Use Bellman-Ford for mid-season and late-season water planning.
                  </span>
                </motion.div>
              )}

              <div className={`p-3 rounded-xl flex items-center gap-2 ${bfResult.negativeCycleDetected?'bg-red-50 border border-red-200':'bg-green-50'}`}>
                {bfResult.negativeCycleDetected
                  ? <AlertTriangle size={13} className="text-red-600 flex-shrink-0"/>
                  : <CheckCircle  size={13} className="text-green-600 flex-shrink-0"/>}
                <span className={`text-sm font-bold ${bfResult.negativeCycleDetected?'text-red-700':'text-green-800'}`}>
                  {bfResult.negativeCycleDetected
                    ? 'Network error detected — pipe loop creates impossible efficiency gain'
                    : 'Network valid — no circular pipe errors detected'}
                </span>
              </div>

              <FarmerInsight icon={Droplets} title="Action for you" color="#2E7D32">
                Move the slider to your current week. Any plot below 75% delivery efficiency is losing
                significant water. At Week {bfWeek},{' '}
                {Object.entries(bfResult.efficiency).filter(([,e])=>e<75).length > 0
                  ? `plots ${Object.entries(bfResult.efficiency).filter(([,e])=>e<75).map(([n])=>farm.plots.find(p=>p.irrigationNode===n)?.id||n).join(', ')} need attention — consider drip irrigation or pipe maintenance.`
                  : 'all your plots are receiving water efficiently. Good network health.'}
              </FarmerInsight>
            </div>
          )}

          {/* ── SUM OF SUBSET ── */}
          {tab === 3 && (
            <div className="algo-card">
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xs font-bold text-blue-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-blue-700">
                  You have exactly {farm.weeklyWater.toLocaleString()}L of water per week.
                  Can any combination of your active crops use <em>exactly</em> that amount — zero waste?
                  The tree below explores every possible yes/no combination, pruning branches that exceed the target.
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">Sum of Subset — Can We Use Water With Zero Waste?</h3>
              <p className="text-xs text-gray-500 mb-3">
                Target: {farm.weeklyWater.toLocaleString()}L &nbsp;·&nbsp;
                Active crop demands (Week 6): [{weekDemands.join(', ')}]L &nbsp;·&nbsp;
                Left branch = skip this crop's water | Right branch = include it
              </p>

              <TreeVisualizer
                trace={sosResult.trace}
                currentStep={sosPlayer.currentStep}
                labelKey="label"
                maxNodes={80}
              />

              {sosPlayer.isDone && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${sosResult.found?'bg-yellow-50 border border-yellow-300':'bg-gray-50 border border-gray-200'}`}>
                  {sosResult.found
                    ? <CheckCircle size={14} className="text-yellow-600 flex-shrink-0"/>
                    : <Info size={14} className="text-gray-400 flex-shrink-0"/>}
                  {sosResult.found
                    ? <span className="text-sm font-bold text-yellow-800">
                        Perfect match: {sosResult.subset.join(' + ')}L = {farm.weeklyWater.toLocaleString()}L — zero waste possible!
                      </span>
                    : <span className="text-sm text-gray-600">
                        No exact match — some water will remain unused this week
                      </span>}
                </motion.div>
              )}

              <div className="mt-3"><StepController player={sosPlayer} label="Sum of Subset tree exploration" /></div>

              <FarmerInsight icon={Droplets} title="What this means for your water use" color="#1565C0">
                {sosResult.found
                  ? `If you water crops with demands of ${sosResult.subset.join(' + ')}L this week, you use exactly all ${farm.weeklyWater.toLocaleString()}L available — no water wasted, maximum efficiency.`
                  : `No perfect combination exists this week. The Fractional Knapsack algorithm will allocate water proportionally to minimize waste.`}
              </FarmerInsight>
            </div>
          )}

        </motion.div>
      </div>
      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView} label="Next: Backtracking" />
      </div>
    </section>
  );
}
