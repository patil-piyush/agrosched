import React, { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { multistageGraph } from '../algorithms/dp/multistageGraph';
import { floydWarshall } from '../algorithms/dp/floydWarshall';
import { bellmanFord } from '../algorithms/dp/bellmanFord';
import { dijkstra } from '../algorithms/greedy/dijkstra';
import { sumOfSubset } from '../algorithms/dp/sumOfSubset';
import { binomialCoeff, buildCombinationCount } from '../algorithms/dp/binomialCoeff';
import { jobScheduling } from '../algorithms/greedy/jobScheduling';
import { useAlgorithmPlayer } from '../hooks/useAlgorithmPlayer';
import DPTableVisualizer from '../visualizers/DPTableVisualizer';
import MultistageVisualizer from '../visualizers/MultistageVisualizer';
import SubsetTreeVisualizer from '../visualizers/SubsetTreeVisualizer';
import StepController from '../components/StepController';
import ModuleHeader from '../components/ModuleHeader';
import ScrollIndicator from '../components/ScrollIndicator';
import { CROP_COLORS } from '../utils/formatters';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

const TABS = ['0/1 Knapsack','Multistage Graph','Floyd-Warshall','Bellman-Ford','Sum of Subset','Binomial Coeff'];

export default function Module4Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.08 });
  const { farm } = useFarm();
  const [tab, setTab]     = useState(0);
  const [bfWeek, setBfWeek] = useState(1);
  const [plotIdx, setPlotIdx] = useState(0);

  const ksResult   = useMemo(() => knapsack01(farm.crops, farm.budget), [farm]);
  const msResult   = useMemo(() => multistageGraph(farm.plots[plotIdx] || farm.plots[0], farm.crops, farm.season.phases), [farm, plotIdx]);
  const fwResult   = useMemo(() => floydWarshall(farm.irrigationNetwork), [farm.irrigationNetwork]);
  const bfResult   = useMemo(() => bellmanFord(farm.irrigationNetwork, 'SOURCE', bfWeek), [farm.irrigationNetwork, bfWeek]);
  const dijkResult = useMemo(() => dijkstra(farm.irrigationNetwork), [farm.irrigationNetwork]);

  const jobResult    = useMemo(() => jobScheduling(ksResult.selected, farm.plots), [ksResult, farm.plots]);
  const weekDemands  = useMemo(() =>
    jobResult.assignments.filter(a => a.plantWeek <= 6 && a.harvestWeek > 6)
      .map(a => Math.round(a.waterPerWeek)).filter(Boolean),
    [jobResult]
  );
  const sosResult  = useMemo(() => sumOfSubset(weekDemands, farm.weeklyWater), [weekDemands, farm.weeklyWater]);
  const { n: binom_n, k: binom_k } = buildCombinationCount(farm);
  const binomResult = useMemo(() => binomialCoeff(binom_n, binom_k), [binom_n, binom_k]);

  const ksPlayer    = useAlgorithmPlayer(ksResult.fills);
  const msPlayer    = useAlgorithmPlayer(msResult.trace.stages || []);
  const sosPlayer   = useAlgorithmPlayer(sosResult.trace);
  const binomPlayer = useAlgorithmPlayer(binomResult.fills);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#F0FDF4' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={4} title="Dynamic Programming"
            subtitle="Solve complex problems by breaking them into overlapping sub-problems and storing results to avoid recomputation."
            timeComplexity="O(nW) to O(V³)" spaceComplexity="O(nW)" />

          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm flex-wrap">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
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
              <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">0/1 Knapsack — Seasonal Budget ₹{farm.budget.toLocaleString()}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Which crops to buy? Each seed+fertilizer package is indivisible. DP table fills left→right, top→bottom. Gold cells show the backtrack path.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-extrabold text-green-700">₹{ksResult.totalCost.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Budget used</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-extrabold text-emerald-700">₹{ksResult.totalYield.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Projected yield</div>
                  </div>
                </div>
              </div>

              <DPTableVisualizer
                dp={ksResult.dp}
                fills={ksResult.fills}
                backtrack={ksResult.backtrack}
                currentStep={ksPlayer.currentStep}
                rowLabels={farm.crops.map(c => c.name)}
                colStep={ksResult.step}
                maxCols={Math.min(ksResult.cols, 60)}
              />

              {ksPlayer.isDone && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Selected crops (backtrack path shown in gold above):</div>
                  <div className="flex flex-wrap gap-2">
                    {ksResult.selected.map(c => (
                      <span key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: CROP_COLORS[c.id] }} />
                        <span className="text-sm font-medium">{c.name}</span>
                        <span className="text-xs text-gray-400">₹{c.packageCost.toLocaleString()}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
              <div className="mt-3"><StepController player={ksPlayer} label="0/1 Knapsack DP" /></div>
            </div>
          )}

          {/* ── MULTISTAGE GRAPH ── */}
          {tab === 1 && (
            <div className="algo-card">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-gray-900">Multistage Graph — Season Phase Optimizer</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Finds the optimal crop sequence across 3 phases per plot. Each stage transition = yield gained minus soil fertility drain. Gold path = optimal.</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {farm.plots.map((p, i) => (
                    <button key={p.id} onClick={() => setPlotIdx(i)}
                      className="px-2 py-1 rounded text-xs font-medium transition-all"
                      style={{ background: plotIdx===i ? '#2E7D32' : '#f0f0f0', color: plotIdx===i ? '#fff' : '#555' }}>
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>

              <MultistageVisualizer
                stages={msResult.trace.stages}
                optimalPath={msResult.trace.optimalPath}
                totalYield={msResult.trace.totalYield}
                currentStep={msPlayer.currentStep === -1 ? (msResult.trace.stages?.length || 0) + 1 : msPlayer.currentStep}
              />

              <div className="mt-3 grid grid-cols-3 gap-3">
                {(msResult.trace.optimalPath || []).map((cropId, i) => {
                  const crop = farm.crops.find(c => c.id === cropId);
                  const ph   = farm.season.phases[i];
                  return (
                    <div key={i} className="p-2.5 rounded-lg bg-green-50 border border-green-100 text-center">
                      <div className="text-xs text-gray-400">{ph?.name}</div>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        {cropId && <span className="w-3 h-3 rounded-full" style={{ background: CROP_COLORS[cropId] }} />}
                        <span className="text-sm font-bold">{crop?.name || 'Fallow'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 p-3 rounded-xl bg-green-50">
                <span className="text-sm font-bold text-green-800">
                  Optimal yield for {farm.plots[plotIdx]?.name}: ₹{(msResult.trace.totalYield || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-3"><StepController player={msPlayer} label="Multistage Graph DP" /></div>
            </div>
          )}

          {/* ── FLOYD-WARSHALL ── */}
          {tab === 2 && (
            <div className="algo-card">
              <h3 className="font-bold text-gray-900 mb-1">Floyd-Warshall — All-Pairs Irrigation Paths</h3>
              <p className="text-xs text-gray-500 mb-4">
                Computes minimum water-loss between every pair of nodes. Enables instant rerouting when any pipe segment fails.
                O(V³) = O({fwResult.ids.length}³) = {Math.pow(fwResult.ids.length, 3)} operations total.
              </p>

              <div className="overflow-auto rounded-lg border border-gray-200 mb-4">
                <table className="text-center border-collapse" style={{ fontSize:10 }}>
                  <thead>
                    <tr>
                      <th className="dp-cell bg-gray-800 text-white sticky left-0 z-10" style={{ minWidth:56 }}>
                        From \ To
                      </th>
                      {fwResult.ids.map(id => (
                        <th key={id} className="dp-cell bg-gray-700 text-white" style={{ fontSize:8, minWidth:50 }}>
                          {id.replace('SOURCE','SRC').replace('Junction ','J')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fwResult.displayMatrix.map((row, i) => (
                      <tr key={i}>
                        <td className="dp-cell bg-gray-100 font-semibold sticky left-0 z-10" style={{ minWidth:56, fontSize:9 }}>
                          {fwResult.ids[i].replace('SOURCE','SRC').replace('Junction ','J')}
                        </td>
                        {row.map((v, j) => {
                          // B5 fix: parse numeric safely, never compare string '∞' numerically
                          const isInf = v === '∞';
                          const num   = isInf ? Infinity : Number(v);
                          const bg    = i === j   ? '#F9FAFB'
                                      : isInf     ? '#FAFAFA'
                                      : num < 0.10 ? '#C8E6C9'
                                      : num < 0.16 ? '#FFF9C4'
                                      :              '#FFCDD2';
                          const col   = i === j   ? '#D1D5DB'
                                      : isInf     ? '#D1D5DB'
                                      : num < 0.10 ? '#1B5E20'
                                      : num < 0.16 ? '#F57F17'
                                      :              '#B71C1C';
                          return (
                            <td key={j} className="dp-cell"
                              title={`${fwResult.ids[i]} → ${fwResult.ids[j]}: loss = ${v}`}
                              style={{ background:bg, color:col, fontWeight: (i===j||isInf) ? 300 : 500, minWidth:50 }}>
                              {v}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 flex-wrap text-xs mb-3">
                {[['< 0.10 loss','#C8E6C9','#1B5E20'],['0.10–0.15','#FFF9C4','#F57F17'],['> 0.15 loss','#FFCDD2','#B71C1C'],['No path (∞)','#FAFAFA','#D1D5DB']].map(([l,bg,c])=>(
                  <span key={l} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{background:bg,color:c,fontWeight:600}}>
                    {l}
                  </span>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-blue-50 flex items-start gap-2">
                <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-blue-700">
                  Floyd-Warshall gives all-pairs in O(V³) in one run. Running Dijkstra from each source would cost O(V·(V+E)logV) and would fail if any pipe had a negative efficiency-loss edge (e.g. after a repair grant).
                </span>
              </div>
            </div>
          )}

          {/* ── BELLMAN-FORD ── */}
          {tab === 3 && (
            <div className="algo-card">
              <h3 className="font-bold text-gray-900 mb-1">Bellman-Ford vs Dijkstra — Degrading Pipe Routing</h3>
              <p className="text-xs text-gray-500 mb-4">
                Pipe efficiency degrades over time: loss = baseLoss + degradationRate × week.
                Bellman-Ford handles this correctly. The comparison shows where Dijkstra diverges at high degradation.
              </p>

              <div className="flex items-center gap-3 mb-5">
                <label className="text-sm font-medium text-gray-700">Week:</label>
                <input type="range" min={1} max={24} value={bfWeek}
                  onChange={e => setBfWeek(+e.target.value)}
                  className="w-40 accent-green-600" />
                <span className="font-mono text-sm font-bold text-green-700 w-8">W{bfWeek}</span>
                <span className="text-xs text-gray-400">
                  (degradation factor: ×{bfWeek})
                </span>
              </div>

              {/* Side-by-side comparison: Bellman-Ford vs Dijkstra */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Bellman-Ford */}
                <div className="rounded-xl border-2 border-green-300 bg-green-50 p-3">
                  <div className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle size={12} /> Bellman-Ford (handles degradation)
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(bfResult.efficiency).map(([nodeId, eff]) => {
                      const plot = farm.plots.find(p => p.irrigationNode === nodeId);
                      return (
                        <div key={nodeId} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16 truncate">{plot?.id || nodeId}</span>
                          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width:`${eff}%`, background: eff>=85?'#52B788':eff>=70?'#F9A825':'#EF5350' }} />
                          </div>
                          <span className="text-xs font-bold w-10 text-right"
                            style={{ color: eff>=85?'#2E7D32':eff>=70?'#E65100':'#C62828' }}>
                            {eff}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dijkstra */}
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3">
                  <div className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                    <Info size={12} /> Dijkstra (week-1 weights only)
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(dijkResult.efficiency).map(([nodeId, eff]) => {
                      const plot = farm.plots.find(p => p.irrigationNode === nodeId);
                      return (
                        <div key={nodeId} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16 truncate">{plot?.id || nodeId}</span>
                          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width:`${eff}%`, background:'#90CAF9' }} />
                          </div>
                          <span className="text-xs font-bold w-10 text-right text-blue-700">{eff}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Divergence callout */}
              {bfWeek >= 12 && (
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 mb-3">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-amber-800">
                    At Week {bfWeek} the two algorithms show different efficiency scores for some plots because pipe weights have increased significantly.
                    Dijkstra computed routes using Week-1 weights and is now stale. Bellman-Ford recomputes correctly each week.
                  </span>
                </motion.div>
              )}

              {/* Relaxation passes */}
              <div className="bg-gray-50 rounded-lg p-3 max-h-36 overflow-y-auto text-xs font-mono space-y-0.5 mb-3">
                {bfResult.trace.filter(t => t.pass !== 'check').map((pass, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-green-700 font-bold w-14">Pass {pass.pass}:</span>
                    <span className={pass.updated ? 'text-blue-700' : 'text-gray-400'}>
                      {pass.updated
                        ? `${pass.relaxations?.filter(r => r.updated).length || 0} edges relaxed`
                        : 'no updates — early convergence'}
                    </span>
                  </div>
                ))}
              </div>

              <div className={`p-3 rounded-xl flex items-center gap-2 ${bfResult.negativeCycleDetected ? 'bg-red-50 border border-red-200' : 'bg-green-50'}`}>
                {bfResult.negativeCycleDetected
                  ? <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                  : <CheckCircle  size={14} className="text-green-600 flex-shrink-0" />}
                <span className={`text-sm font-bold ${bfResult.negativeCycleDetected ? 'text-red-700' : 'text-green-800'}`}>
                  {bfResult.negativeCycleDetected
                    ? 'Negative cycle detected — network has a circular pipe loop with net efficiency gain (configuration error)'
                    : 'No negative cycles — network topology is valid'}
                </span>
              </div>
            </div>
          )}

          {/* ── SUM OF SUBSET ── */}
          {tab === 4 && (
            <div className="algo-card">
              <h3 className="font-bold text-gray-900 mb-1">Sum of Subset — Zero-Waste Water Check</h3>
              <p className="text-xs text-gray-500 mb-4">
                Does any subset of crop water demands sum exactly to {farm.weeklyWater.toLocaleString()}L? If yes, zero water is wasted this week.
                Active demands (Week 6): [ {weekDemands.join(', ')} ]L
              </p>

              <SubsetTreeVisualizer trace={sosResult.trace} currentStep={sosPlayer.currentStep} />

              {sosPlayer.isDone && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${sosResult.found ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
                  {sosResult.found
                    ? <CheckCircle size={15} className="text-yellow-600 flex-shrink-0" />
                    : <Info size={15} className="text-gray-400 flex-shrink-0" />}
                  {sosResult.found
                    ? <span className="text-sm font-bold text-yellow-800">
                        Perfect subset found: [ {sosResult.subset.join(' + ')} ]L = {farm.weeklyWater.toLocaleString()}L — zero water wasted!
                      </span>
                    : <span className="text-sm text-gray-600">
                        No exact subset found — some water will be unused this week
                      </span>}
                </motion.div>
              )}
              <div className="mt-3"><StepController player={sosPlayer} label="Sum of Subset" /></div>
            </div>
          )}

          {/* ── BINOMIAL COEFFICIENTS ── */}
          {tab === 5 && (
            <div className="algo-card">
              <h3 className="font-bold text-gray-900 mb-1">Binomial Coefficients — Pascal's Triangle</h3>
              <p className="text-xs text-gray-500 mb-4">
                C(n,k) counts the total possible crop combinations for your farm's decision space.
                n = {binom_n} (crops × plots × phases), k = {binom_k} (plots)
              </p>

              {/* Pascal's Triangle */}
              <div className="overflow-auto mb-4 bg-gray-50 rounded-xl p-3">
                <div className="text-center font-mono space-y-0.5">
                  {binomResult.table.slice(0, Math.min(binomResult.n + 1, 13)).map((row, i) => (
                    <div key={i} className="flex justify-center gap-0.5">
                      {row.slice(0, i + 1).map((v, j) => {
                        const isFilled   = binomResult.fills.findIndex(f => f.row===i && f.col===j) <= binomPlayer.currentStep && binomPlayer.currentStep >= 0;
                        const isTarget   = i === Math.min(binomResult.n, 12) && j === Math.min(binomResult.k, i);
                        const isCurrent  = binomResult.fills[binomPlayer.currentStep]?.row === i && binomResult.fills[binomPlayer.currentStep]?.col === j;
                        return (
                          <div key={j} style={{
                            width:36, height:20, display:'flex', alignItems:'center', justifyContent:'center',
                            borderRadius:4, fontSize:9,
                            background: isTarget  ? '#FFD700'
                                      : isCurrent ? '#FDBA74'
                                      : isFilled  ? '#BBF7D0' : '#F3F4F6',
                            color:      isTarget  ? '#78350F'
                                      : isCurrent ? '#C2410C'
                                      : isFilled  ? '#14532D' : '#9CA3AF',
                            fontWeight: (isTarget || isCurrent) ? 700 : 400,
                            border:     isTarget  ? '2px solid #D97706'
                                      : isCurrent ? '1.5px solid #EA580C' : '1px solid #E5E7EB',
                            transition: 'background 0.25s, border 0.25s',
                          }}>
                            {v > 99999 ? '···' : v}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl text-center mb-3"
                style={{ background:'linear-gradient(135deg,#1B5E3B,#2D6A4F)', color:'#fff' }}>
                <div className="text-xs opacity-70 mb-1">Total possible season configurations for your farm</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight">{binomResult.approxResult}</div>
                <div className="text-xs opacity-60 mt-2">
                  AgroSched finds the optimal plan using polynomial-time algorithms — not brute force
                </div>
              </div>

              <div className="mt-3"><StepController player={binomPlayer} label="Pascal's Triangle" /></div>
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
