import React, { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { cropRotation } from '../algorithms/backtracking/cropRotation';
import { knapsackBacktrack } from '../algorithms/backtracking/knapsackBacktrack';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { useAlgorithmPlayer } from '../hooks/useAlgorithmPlayer';
import TreeVisualizer from '../visualizers/TreeVisualizer';
import DPTableVisualizer from '../visualizers/DPTableVisualizer';
import StepController from '../components/StepController';
import ModuleHeader from '../components/ModuleHeader';
import ScrollIndicator from '../components/ScrollIndicator';
import { CROP_COLORS } from '../utils/formatters';

const SOIL_COLORS = { loamy:'#8BC34A', sandy:'#FFCA28', clayey:'#8D6E63', silty:'#4FC3F7' };
const TABS = ['Crop Rotation', 'Knapsack Comparison'];

export default function Module5Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.1 });
  const { farm } = useFarm();
  const [tab, setTab] = useState(0);

  const crResult  = useMemo(() => cropRotation(farm.plots, farm.crops), [farm]);
  const btResult  = useMemo(() => knapsackBacktrack(farm.crops.slice(0,7), farm.budget, true),  [farm]);
  const btNoPrune = useMemo(() => knapsackBacktrack(farm.crops.slice(0,7), farm.budget, false), [farm]);
  const dpResult  = useMemo(() => knapsack01(farm.crops.slice(0,7), farm.budget), [farm]);

  const crPlayer  = useAlgorithmPlayer(crResult.trace);
  const btPlayer  = useAlgorithmPlayer(btResult.trace);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#FFF8F1' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={5} title="Backtracking"
            subtitle="Explore all candidates, prune branches that violate constraints. Correct but expensive — pruning makes it practical."
            timeComplexity="O(k^n)" spaceComplexity="O(n)" />

          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: tab===i ? '#E65100' : 'transparent', color: tab===i ? '#fff' : '#6B7B6E' }}>
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.2 }} className="flex-1 flex flex-col gap-4">

          {/* CROP ROTATION */}
          {tab === 0 && (
            <>
              <div className="algo-card">
                <h3 className="font-bold text-textDark mb-1">Crop Rotation — Graph Coloring via Backtracking</h3>
                <p className="text-xs text-muted mb-4">
                  Assigns crops to plots as a Graph Coloring problem. Constraints: soil compatibility · no same crop in adjacent plots · no same family consecutively.
                </p>

                {/* Farm grid visualization */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {farm.plots.map((plot, i) => {
                    const frame = crResult.trace[Math.max(0, crPlayer.currentStep)];
                    const assignmentSoFar = frame?.assignment || [];
                    const assignedCropId  = assignmentSoFar[i];
                    const crop = farm.crops.find(c => c.id === assignedCropId);
                    const isCurrent = frame?.plotId === plot.id;
                    const isFailed  = crResult.trace
                      .slice(0, Math.max(0, crPlayer.currentStep + 1))
                      .some(t => t.plotId === plot.id && t.status === 'backtrack');

                    return (
                      <motion.div key={plot.id}
                        animate={{
                          boxShadow: isCurrent ? '0 0 0 3px #F4A261, 0 4px 16px rgba(0,0,0,0.12)' :
                                     crop ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                        }}
                        className="rounded-xl p-3 border-2 text-center transition-all"
                        style={{
                          borderColor: isCurrent ? '#F4A261' : crop ? CROP_COLORS[assignedCropId] : '#E5E7EB',
                          background:  crop ? CROP_COLORS[assignedCropId] + '22' : '#f9fafb',
                        }}>
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                          <span className="w-3 h-3 rounded-full" style={{ background: SOIL_COLORS[plot.soilType] }} />
                          <span className="text-xs font-bold text-gray-600">{plot.id}</span>
                        </div>
                        <div className="text-xs text-muted mb-1">{plot.soilType}</div>
                        {crop ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-4 h-4 rounded-full" style={{ background: CROP_COLORS[assignedCropId] }} />
                            <span className="text-sm font-bold" style={{ color: '#2D6A4F' }}>{crop.name}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-muted italic">{isCurrent ? '⏳ assigning…' : 'unassigned'}</div>
                        )}
                        {/* Adjacency markers */}
                        <div className="mt-1 flex justify-center gap-0.5 flex-wrap">
                          {(plot.adjacent||[]).map(adj => (
                            <span key={adj} className="text-xs bg-gray-100 text-gray-500 rounded px-1">{adj}</span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Trace log */}
                <div className="bg-gray-50 rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-xs space-y-0.5 mb-3">
                  {crResult.trace.slice(0, Math.max(0, crPlayer.currentStep + 1)).map((t, i) => (
                    <div key={i} className={`flex gap-2 ${t.status==='assigned'?'text-green-700':t.status==='backtrack'?'text-red-600':'text-orange-600'}`}>
                      <span>{t.status==='assigned'?'✓':t.status==='backtrack'?'↩':'✕'}</span>
                      <span className="font-semibold">{t.plotId}</span>
                      <span>→ {t.cropName}</span>
                      {t.status==='failed' && <span className="text-gray-400">({t.reason})</span>}
                    </div>
                  ))}
                </div>

                <StepController player={crPlayer} label="Crop Rotation Backtracking" />

                {crPlayer.isDone && crResult.success && (
                  <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200">
                    <span className="text-sm font-bold text-green-800">✓ Valid assignment found! All rotation & adjacency constraints satisfied.</span>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* KNAPSACK COMPARISON */}
          {tab === 1 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Backtracking tree */}
                <div className="algo-card">
                  <h3 className="font-bold text-textDark mb-1 text-sm">Backtracking — Decision Tree</h3>
                  <p className="text-xs text-muted mb-2">With pruning (upper-bound cut). Explored: <strong className="text-orange-600">{Math.min(btPlayer.currentStep + 1, btResult.nodes)} nodes</strong></p>
                  <TreeVisualizer trace={btResult.trace} currentStep={btPlayer.currentStep} labelKey="idx" valueKey="value" />
                  <div className="mt-3"><StepController player={btPlayer} label="Knapsack Backtracking" /></div>
                </div>

                {/* DP table */}
                <div className="algo-card">
                  <h3 className="font-bold text-textDark mb-1 text-sm">Dynamic Programming — DP Table</h3>
                  <p className="text-xs text-muted mb-2">Same problem, same data. Filled: <strong className="text-green-600">{dpResult.fills.length} cells</strong></p>
                  <DPTableVisualizer
                    dp={dpResult.dp}
                    fills={dpResult.fills}
                    backtrack={dpResult.backtrack}
                    currentStep={dpResult.fills.length - 1}
                    rowLabels={farm.crops.slice(0,7).map(c => c.name)}
                    colStep={dpResult.step}
                    maxCols={16}
                  />
                  <div className="mt-3 text-xs text-muted">All cells computed automatically — no branching needed</div>
                </div>
              </div>

              {/* Comparison stats */}
              <div className="algo-card">
                <h3 className="font-bold text-textDark mb-3">Head-to-Head Comparison (Same Problem, Same Data)</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-orange-50">
                    <div className="text-xs text-muted mb-1">Backtracking (pruned)</div>
                    <div className="text-2xl font-extrabold text-orange-600">{btResult.nodes}</div>
                    <div className="text-xs text-muted">nodes explored</div>
                    <div className="text-xs mt-1 font-mono text-orange-500">O(2ⁿ) worst</div>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50">
                    <div className="text-xs text-muted mb-1">Backtracking (no prune)</div>
                    <div className="text-2xl font-extrabold text-red-600">{btNoPrune.nodes}</div>
                    <div className="text-xs text-muted">nodes explored</div>
                    <div className="text-xs mt-1 font-mono text-red-500">exponential</div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50 border-2 border-green-300">
                    <div className="text-xs text-muted mb-1">DP (0/1 Knapsack)</div>
                    <div className="text-2xl font-extrabold text-green-700">{dpResult.fills.length}</div>
                    <div className="text-xs text-muted">table cells filled</div>
                    <div className="text-xs mt-1 font-mono text-green-600">O(nW) = predictable</div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-gray-50 text-center">
                  <span className="text-sm text-textDark">All three find the same optimal: </span>
                  <span className="text-sm font-extrabold text-green-700">₹{btResult.bestValue.toLocaleString()}</span>
                  <span className="text-sm text-muted"> — DP used </span>
                  <span className="text-sm font-bold text-green-600">{Math.round((1 - dpResult.fills.length / btNoPrune.nodes) * 100)}% fewer operations</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView} label="Next: Branch & Bound" />
      </div>
    </section>
  );
}
