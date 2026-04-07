import React, { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { multistageGraph } from '../algorithms/dp/multistageGraph';
import { floydWarshall } from '../algorithms/dp/floydWarshall';
import { bellmanFord } from '../algorithms/dp/bellmanFord';
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

const TABS = ['0/1 Knapsack','Multistage Graph','Floyd-Warshall','Bellman-Ford','Sum of Subset','Binomial Coeff'];

export default function Module4Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.08 });
  const { farm } = useFarm();
  const [tab, setTab]  = useState(0);
  const [bfWeek, setBfWeek] = useState(1);
  const [plotIdx, setPlotIdx] = useState(0);

  const ksResult  = useMemo(() => knapsack01(farm.crops, farm.budget), [farm]);
  const msResult  = useMemo(() => multistageGraph(farm.plots[plotIdx], farm.crops, farm.season.phases), [farm, plotIdx]);
  const fwResult  = useMemo(() => floydWarshall(farm.irrigationNetwork), [farm.irrigationNetwork]);
  const bfResult  = useMemo(() => bellmanFord(farm.irrigationNetwork, 'SOURCE', bfWeek), [farm.irrigationNetwork, bfWeek]);

  const jobResult = useMemo(() => jobScheduling(ksResult.selected, farm.plots), [ksResult]);
  const weekDemands = useMemo(() => jobResult.assignments.filter(a=>a.plantWeek<=6&&a.harvestWeek>6).map(a=>Math.round(a.waterPerWeek)), [jobResult]);
  const sosResult = useMemo(() => sumOfSubset(weekDemands, farm.weeklyWater), [weekDemands, farm.weeklyWater]);

  const { n: binom_n, k: binom_k } = buildCombinationCount(farm);
  const binomResult = useMemo(() => binomialCoeff(binom_n, binom_k), [binom_n, binom_k]);

  const ksPlayer  = useAlgorithmPlayer(ksResult.fills);
  const msPlayer  = useAlgorithmPlayer(msResult.trace.stages || []);
  const sosPlayer = useAlgorithmPlayer(sosResult.trace);
  const binomPlayer = useAlgorithmPlayer(binomResult.fills);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#F0FDF4' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={4} title="Dynamic Programming"
            subtitle="Solve complex problems by breaking them into overlapping sub-problems and storing results."
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

          {/* 0/1 Knapsack */}
          {tab === 0 && (
            <div className="algo-card">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-textDark">0/1 Knapsack — Seasonal Budget ₹{farm.budget.toLocaleString()}</h3>
                  <p className="text-xs text-muted mt-0.5">Which crops to invest in? Cannot buy partial seed packages. DP table finds optimal subset.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-extrabold text-green-700">₹{ksResult.totalCost.toLocaleString()}</div>
                    <div className="text-xs text-muted">Budget Used</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-extrabold text-emerald-700">₹{ksResult.totalYield.toLocaleString()}</div>
                    <div className="text-xs text-muted">Projected Yield</div>
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
                maxCols={Math.min(ksResult.cols, 22)}
              />

              {ksPlayer.isDone && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-3">
                  <div className="text-xs font-semibold text-muted mb-2">Selected crops (backtrack path ↑):</div>
                  <div className="flex flex-wrap gap-2">
                    {ksResult.selected.map(c => (
                      <span key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: CROP_COLORS[c.id] }} />
                        <span className="text-sm font-medium">{c.name}</span>
                        <span className="text-xs text-muted">₹{c.packageCost.toLocaleString()}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="mt-3"><StepController player={ksPlayer} label="0/1 Knapsack DP" /></div>
            </div>
          )}

          {/* Multistage Graph */}
          {tab === 1 && (
            <div className="algo-card">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-textDark">Multistage Graph — Season Phase Optimizer</h3>
                  <p className="text-xs text-muted mt-0.5">Finds optimal crop sequence across 3 phases for each plot. Edges = yield gained minus soil drain.</p>
                </div>
                <div className="flex gap-1">
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
                currentStep={msPlayer.currentStep === -1 ? msResult.trace.stages.length + 1 : msPlayer.currentStep}
              />

              <div className="mt-3 grid grid-cols-3 gap-3">
                {msResult.trace.optimalPath?.map((cropId, i) => {
                  const crop = farm.crops.find(c => c.id === cropId);
                  const ph   = farm.season.phases[i];
                  return (
                    <div key={i} className="p-2.5 rounded-lg bg-green-50 border border-green-100 text-center">
                      <div className="text-xs text-muted">{ph?.name}</div>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        {cropId && <span className="w-3 h-3 rounded-full" style={{ background: CROP_COLORS[cropId] }} />}
                        <span className="text-sm font-bold">{crop?.name || 'Fallow 🌿'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 p-3 rounded-xl bg-green-50">
                <span className="text-sm font-bold text-green-800">
                  Optimal yield for {farm.plots[plotIdx].name}: ₹{msResult.trace.totalYield?.toLocaleString()}
                </span>
              </div>

              <div className="mt-3"><StepController player={msPlayer} label="Multistage Graph DP" /></div>
            </div>
          )}

          {/* Floyd-Warshall */}
          {tab === 2 && (
            <div className="algo-card">
              <h3 className="font-bold text-textDark mb-1">Floyd-Warshall — All-Pairs Irrigation Paths</h3>
              <p className="text-xs text-muted mb-4">Computes minimum water-loss between ALL node pairs. Enables instant pipe failure rerouting.</p>

              <div className="overflow-auto mb-4">
                <table className="text-center" style={{ fontSize:10 }}>
                  <thead>
                    <tr>
                      <th className="dp-cell bg-gray-800 text-white">From\To</th>
                      {fwResult.ids.map(id => <th key={id} className="dp-cell bg-gray-700 text-white" style={{fontSize:9}}>{id.replace('SOURCE','SRC')}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {fwResult.displayMatrix.map((row, i) => (
                      <tr key={i}>
                        <td className="dp-cell bg-gray-100 font-semibold sticky left-0">{fwResult.ids[i].replace('SOURCE','SRC')}</td>
                        {row.map((v, j) => (
                          <td key={j} className="dp-cell"
                            style={{ background: v==='∞'?'#fafafa': v===0?'#fff':v<0.1?'#C8E6C9':v<0.15?'#FFF9C4':'#FFCDD2',
                                     color: v===0?'#9CA3AF':v<0.1?'#2E7D32':'#B71C1C', fontWeight: v===0?300:500 }}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-green-50 text-sm">
                <span className="font-semibold text-green-800">Color guide: </span>
                <span className="text-green-700">Green = low loss (&lt;0.10) · </span>
                <span className="text-yellow-700">Yellow = medium · </span>
                <span className="text-red-700">Red = high loss</span>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-blue-50">
                <div className="font-semibold text-blue-800 text-sm mb-1">Time Complexity: O(V³) = O({fwResult.ids.length}³) = {Math.pow(fwResult.ids.length,3)} operations</div>
                <div className="text-xs text-blue-600">vs Dijkstra: O((V+E)logV) per source × V sources = O(V(V+E)logV)</div>
              </div>
            </div>
          )}

          {/* Bellman-Ford */}
          {tab === 3 && (
            <div className="algo-card">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-textDark">Bellman-Ford — Degrading Pipe Routing</h3>
                  <p className="text-xs text-muted mt-0.5">Models seasonal pipe degradation (efficiencyLoss increases per week). Handles negative weights. Detects negative cycles.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-medium">Week:</label>
                <input type="range" min={1} max={24} value={bfWeek} onChange={e=>setBfWeek(+e.target.value)} className="w-32 accent-green-600" />
                <span className="font-mono text-sm font-bold text-green-700">W{bfWeek}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {Object.entries(bfResult.efficiency).map(([nodeId, eff]) => {
                  const plot = farm.plots.find(p=>p.irrigationNode===nodeId);
                  return (
                    <div key={nodeId} className="p-2.5 rounded-lg text-center border"
                      style={{ borderColor: eff>=85?'#4CAF50':eff>=70?'#FF9800':'#F44336',
                               background:  eff>=85?'#E8F5E9':eff>=70?'#FFF3E0':'#FFEBEE' }}>
                      <div className="text-xs text-muted">{plot?.name||nodeId}</div>
                      <div className="text-xl font-extrabold" style={{ color: eff>=85?'#2E7D32':eff>=70?'#E65100':'#C62828' }}>
                        {eff}%
                      </div>
                      <div className="text-xs text-muted">delivery (W{bfWeek})</div>
                    </div>
                  );
                })}
              </div>

              {/* Relaxation passes */}
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto text-xs font-mono space-y-1">
                {bfResult.trace.filter(t=>t.pass!=='check').map((pass, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-green-700 font-bold">Pass {pass.pass}:</span>
                    <span className={pass.updated?'text-blue-600':'text-gray-400'}>{pass.updated?'relaxed edges':'no updates (converged)'}</span>
                  </div>
                ))}
              </div>

              <div className={`mt-3 p-3 rounded-xl ${bfResult.negativeCycleDetected?'bg-red-50 border border-red-200':'bg-green-50'}`}>
                <span className={`text-sm font-bold ${bfResult.negativeCycleDetected?'text-red-700':'text-green-800'}`}>
                  {bfResult.negativeCycleDetected ? '⚠️ Negative cycle detected — network configuration error!' : '✓ No negative cycles detected — network valid'}
                </span>
              </div>
            </div>
          )}

          {/* Sum of Subset */}
          {tab === 4 && (
            <div className="algo-card">
              <h3 className="font-bold text-textDark mb-1">Sum of Subset — Zero-Waste Water Check</h3>
              <p className="text-xs text-muted mb-4">
                Does any subset of crop water demands sum exactly to {farm.weeklyWater.toLocaleString()}L? Zero water wasted!
                <br/>Active demands (Week 6): [{weekDemands.join(', ')}]L
              </p>

              <SubsetTreeVisualizer trace={sosResult.trace} currentStep={sosPlayer.currentStep} />

              {sosPlayer.isDone && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  className={`mt-3 p-3 rounded-xl ${sosResult.found?'bg-yellow-50 border border-yellow-200':'bg-gray-50'}`}>
                  {sosResult.found
                    ? <span className="text-sm font-bold text-yellow-800">✓ Found perfect subset: [{sosResult.subset.join(' + ')}]L = {farm.weeklyWater.toLocaleString()}L — zero waste!</span>
                    : <span className="text-sm text-gray-600">No exact subset found — some water will be unused this week</span>}
                </motion.div>
              )}

              <div className="mt-3"><StepController player={sosPlayer} label="Sum of Subset" /></div>
            </div>
          )}

          {/* Binomial Coefficients */}
          {tab === 5 && (
            <div className="algo-card">
              <h3 className="font-bold text-textDark mb-1">Binomial Coefficients — Pascal's Triangle</h3>
              <p className="text-xs text-muted mb-4">
                C(n,k) = total possible crop combinations for your farm's decision space.
                n={binom_n} (crops×plots×phases), k={binom_k} (plots)
              </p>

              {/* Pascal's triangle */}
              <div className="overflow-auto mb-4">
                <div className="text-center font-mono text-xs space-y-0.5">
                  {binomResult.table.slice(0, Math.min(binomResult.n + 1, 12)).map((row, i) => {
                    const filled = binomPlayer.currentStep >= 0
                      ? binomResult.fills.filter(f=>f.row===i&&(f.col<=binomPlayer.currentStep)).length > 0
                      : false;
                    return (
                      <div key={i} className="flex justify-center gap-1">
                        {row.slice(0, i + 1).map((v, j) => {
                          const isFilled = binomResult.fills.findIndex(f=>f.row===i&&f.col===j) <= binomPlayer.currentStep && binomPlayer.currentStep >= 0;
                          const isHighlight = i === Math.min(binomResult.n, 11) && j === Math.min(binomResult.k, i);
                          return (
                            <div key={j}
                              style={{ width:38, height:22, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4,
                                       background: isHighlight?'#FFD700': isFilled?'#C8E6C9':'#F0F4F0',
                                       color: isHighlight?'#5D4037': isFilled?'#2E7D32':'#bbb',
                                       fontWeight: isHighlight?700:400, fontSize: 9,
                                       border: isHighlight?'2px solid #F57F17':'1px solid #e0e0e0',
                                       transition:'background 0.3s' }}>
                              {v > 999999 ? '∞' : v}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl text-center" style={{ background:'linear-gradient(135deg,#1B5E3B,#2D6A4F)', color:'#fff' }}>
                <div className="text-xs opacity-70 mb-1">Your farm has</div>
                <div className="text-3xl font-extrabold mb-1">{binomResult.approxResult}</div>
                <div className="text-sm opacity-80">possible season configurations</div>
                <div className="text-xs opacity-60 mt-2">AgroSched evaluates the optimal path in polynomial time instead of brute-forcing all {binomResult.approxResult} options</div>
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
