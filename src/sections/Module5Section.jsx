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
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const SOIL_COLORS = { loamy:'#8BC34A', sandy:'#FFCA28', clayey:'#8D6E63', silty:'#4FC3F7' };
const TABS = ['Crop Rotation', 'Knapsack Comparison'];

export default function Module5Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.1 });
  const { farm } = useFarm();
  const [tab, setTab] = useState(0);

  const crResult   = useMemo(() => cropRotation(farm.plots, farm.crops), [farm]);
  const btResult   = useMemo(() => knapsackBacktrack(farm.crops.slice(0, 7), farm.budget, true),  [farm]);
  const btNoPrune  = useMemo(() => knapsackBacktrack(farm.crops.slice(0, 7), farm.budget, false), [farm]);
  const dpResult   = useMemo(() => knapsack01(farm.crops.slice(0, 7), farm.budget), [farm]);

  const crPlayer = useAlgorithmPlayer(crResult.trace);
  const btPlayer = useAlgorithmPlayer(btResult.trace);

  // Build current assignment map from the live trace step
  const currentAssignment = useMemo(() => {
    if (crPlayer.currentStep < 0 || !crResult.trace.length) return {};
    const frame = crResult.trace[crPlayer.currentStep];
    if (!frame?.assignment) return {};
    const map = {};
    farm.plots.forEach((p, i) => { map[p.id] = frame.assignment[i] || null; });
    return map;
  }, [crPlayer.currentStep, crResult.trace, farm.plots]);

  const currentFrame = crResult.trace[crPlayer.currentStep];

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#FFF8F1' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={5} title="Backtracking"
            subtitle="Explore all candidates systematically, pruning branches that violate constraints. Returns the correct answer — at the cost of potentially exponential time without pruning."
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

          {/* ── CROP ROTATION ── */}
          {tab === 0 && (
            <>
              <div className="algo-card">
                <h3 className="font-bold text-gray-900 mb-1">Crop Rotation — Graph Coloring via Backtracking</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Assigns crops to plots as a graph coloring problem. Nodes = plots, colors = crops.
                  Constraints: soil compatibility · no same crop in adjacent plots · no same family consecutively.
                </p>

                {/* Farm grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {farm.plots.map((plot, i) => {
                    const assignedCropId = currentAssignment[plot.id];
                    const crop           = farm.crops.find(c => c.id === assignedCropId);
                    const isCurrent      = currentFrame?.plotId === plot.id;
                    const isBacktracking = currentFrame?.status === 'backtrack' && currentFrame?.plotId === plot.id;
                    const isFailed       = currentFrame?.status === 'failed'    && currentFrame?.plotId === plot.id;

                    return (
                      <motion.div key={plot.id}
                        animate={{
                          boxShadow: isCurrent
                            ? '0 0 0 3px #F4A261, 0 4px 16px rgba(0,0,0,0.12)'
                            : crop ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                          scale: isBacktracking ? 0.96 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl p-3 border-2 text-center transition-colors"
                        style={{
                          borderColor: isBacktracking ? '#EF5350'
                                     : isFailed      ? '#FFA726'
                                     : isCurrent     ? '#F4A261'
                                     : crop          ? CROP_COLORS[assignedCropId] + 'AA'
                                     : '#E5E7EB',
                          background:  isBacktracking ? '#FFEBEE'
                                     : crop          ? CROP_COLORS[assignedCropId] + '18'
                                     : '#FAFAFA',
                        }}>
                        {/* Soil color dot + plot ID */}
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                          <span className="w-3 h-3 rounded-full" style={{ background: SOIL_COLORS[plot.soilType] }} />
                          <span className="text-xs font-bold text-gray-600">{plot.id}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-1.5">{plot.soilType}</div>

                        {/* Assignment */}
                        {crop ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-4 h-4 rounded-full" style={{ background: CROP_COLORS[assignedCropId] }} />
                            <span className="text-sm font-bold text-gray-800">{crop.name}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic h-5 flex items-center justify-center">
                            {isCurrent ? 'Assigning...' : 'unassigned'}
                          </div>
                        )}

                        {/* Status icons using Lucide */}
                        {isBacktracking && (
                          <div className="mt-1 flex items-center justify-center gap-1 text-red-600">
                            <RotateCcw size={10} />
                            <span className="text-xs font-semibold">backtrack</span>
                          </div>
                        )}
                        {isFailed && (
                          <div className="mt-1 flex items-center justify-center gap-1 text-orange-600">
                            <XCircle size={10} />
                            <span className="text-xs font-semibold">constraint failed</span>
                          </div>
                        )}

                        {/* Adjacent plots */}
                        <div className="mt-1.5 flex justify-center gap-0.5 flex-wrap">
                          {(plot.adjacent || []).map(adj => (
                            <span key={adj} className="text-xs bg-gray-100 text-gray-400 rounded px-1">{adj}</span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* B&B Tree — Crop rotation decisions */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Backtracking decision tree:</div>
                  <TreeVisualizer
                    trace={crResult.trace}
                    currentStep={crPlayer.currentStep}
                    labelKey="label"
                    maxNodes={50}
                  />
                </div>

                {/* Trace log */}
                <div className="bg-gray-50 rounded-lg p-2 max-h-28 overflow-y-auto font-mono text-xs space-y-0.5 mb-3">
                  {crResult.trace.slice(0, Math.max(0, crPlayer.currentStep + 1)).map((t, i) => (
                    <div key={i} className={`flex gap-2 items-start ${
                      t.status==='assigned'  ? 'text-green-700'
                    : t.status==='backtrack' ? 'text-red-500'
                    : 'text-orange-600'}`}>
                      <span className="flex-shrink-0 mt-0.5">
                        {t.status==='assigned'  ? <CheckCircle size={10}/> :
                         t.status==='backtrack' ? <RotateCcw   size={10}/> :
                                                  <XCircle     size={10}/>}
                      </span>
                      <span className="font-semibold">{t.plotId}</span>
                      <span>→ {t.cropName}</span>
                      {t.status === 'failed' && <span className="text-gray-400 text-xs">({t.reason})</span>}
                    </div>
                  ))}
                </div>

                <StepController player={crPlayer} label="Crop Rotation Backtracking" />

                {crPlayer.isDone && crResult.success && (
                  <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-green-800">
                      Valid assignment found — all rotation and adjacency constraints satisfied.
                    </span>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* ── KNAPSACK COMPARISON ── */}
          {tab === 1 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Backtracking tree */}
                <div className="algo-card">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">Backtracking (with pruning)</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Explored so far: <strong className="text-orange-600">
                      {Math.min(Math.max(0, btPlayer.currentStep + 1), btResult.nodes)} / {btResult.nodes} nodes
                    </strong>
                  </p>
                  <TreeVisualizer
                    trace={btResult.trace}
                    currentStep={btPlayer.currentStep}
                    labelKey="label"
                    valueKey="value"
                    maxNodes={50}
                  />
                  <div className="mt-3">
                    <StepController player={btPlayer} label="Knapsack Backtracking" />
                  </div>
                </div>

                {/* DP table */}
                <div className="algo-card">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">Dynamic Programming — 0/1 Knapsack</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Total cells filled: <strong className="text-green-700">{dpResult.fills.length}</strong> (all at once, no branching)
                  </p>
                  <DPTableVisualizer
                    dp={dpResult.dp}
                    fills={dpResult.fills}
                    backtrack={dpResult.backtrack}
                    currentStep={dpResult.fills.length - 1}
                    rowLabels={farm.crops.slice(0, 7).map(c => c.name)}
                    colStep={dpResult.step}
                    maxCols={Math.min(dpResult.cols, 80)}
                  />
                  <div className="mt-3 text-xs text-gray-400">
                    All cells computed deterministically — no tree, no branching, no backtracking
                  </div>
                </div>
              </div>

              {/* Stats comparison */}
              <div className="algo-card">
                <h3 className="font-bold text-gray-900 mb-3">Head-to-Head — Same Problem, Same Data, Same Answer</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label:'BT (no pruning)', val:btNoPrune.nodes, unit:'nodes', color:'#C62828', sub:'O(2ⁿ) worst' },
                    { label:'BT (with pruning)', val:btResult.nodes,  unit:'nodes', color:'#E65100', sub:'pruning helps' },
                    { label:'DP (0/1 Knapsack)', val:dpResult.fills.length, unit:'cells', color:'#2E7D32', sub:'O(nW) predictable' },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl text-center border"
                      style={{ borderColor: item.color+'33', background: item.color+'0A' }}>
                      <div className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.label}</div>
                      <div className="text-2xl font-extrabold" style={{ color: item.color }}>{item.val}</div>
                      <div className="text-xs text-gray-400">{item.unit}</div>
                      <div className="text-xs font-mono mt-1" style={{ color: item.color }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <span className="text-sm text-gray-700">All three find the same optimal: </span>
                  <span className="text-sm font-extrabold text-green-700">₹{btResult.bestValue.toLocaleString()}</span>
                  <span className="text-sm text-gray-500"> &nbsp;·&nbsp; DP used </span>
                  <span className="text-sm font-bold text-green-600">
                    {Math.round((1 - dpResult.fills.length / Math.max(btNoPrune.nodes, 1)) * 100)}% fewer operations
                  </span>
                  <span className="text-sm text-gray-500"> than unguided backtracking</span>
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
