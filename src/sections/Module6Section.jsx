import React, { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsackBnB } from '../algorithms/branchBound/knapsackBnB';
import { tspBnB } from '../algorithms/branchBound/tsp';
import { useAlgorithmPlayer } from '../hooks/useAlgorithmPlayer';
import TreeVisualizer from '../visualizers/TreeVisualizer';
import StepController from '../components/StepController';
import ModuleHeader from '../components/ModuleHeader';
import ScrollIndicator from '../components/ScrollIndicator';
import { Trophy, Map, ArrowRight, TrendingUp, Scissors } from 'lucide-react';

const TABS       = ['Knapsack B&B', 'TSP Tour'];
const STRATEGIES = ['FIFO','LIFO','LC'];
const S_COLORS   = { FIFO:'#1565C0', LIFO:'#6A1B9A', LC:'#2E7D32' };

function FarmerInsight({ icon: Icon, title, children, color = '#2E7D32' }) {
  return (
    <div className="mt-4 p-4 rounded-xl border-l-4 bg-white" style={{ borderColor:color }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} style={{ color }} />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{title}</span>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Module6Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.1 });
  const { farm } = useFarm();
  const [tab,   setTab]   = useState(0);
  const [strat, setStrat] = useState('LC');

  const bnbResult = useMemo(() => knapsackBnB(farm.crops, farm.budget), [farm]);
  const tspResult = useMemo(() => tspBnB(farm.plotCoordinates), [farm]);

  const stratData = bnbResult[strat];
  const bnbPlayer = useAlgorithmPlayer(stratData?.trace || []);
  const tspPlayer = useAlgorithmPlayer(tspResult.trace);

  // Current TSP trace frame for step explanation
  const tspFrame = tspResult.trace[tspPlayer.currentStep] || null;

  // Normalize TSP coordinates
  const SVG_W = 560, SVG_H = 290, PAD = 40;
  const coords = farm.plotCoordinates;
  const xs = coords.map(p=>p.x), ys = coords.map(p=>p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const sc   = Math.min((SVG_W-PAD*2)/Math.max(maxX-minX,1), (SVG_H-PAD*2)/Math.max(maxY-minY,1));
  const nx   = p => PAD + (p.x - minX) * sc;
  const ny   = p => PAD + (p.y - minY) * sc;

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#FFF0F6' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={6} title="Branch & Bound"
            subtitle="Explore a decision tree intelligently — always go towards the most promising branch, and cut branches that provably cannot beat the current best solution."
            timeComplexity="O(2ⁿ) worst · much better in practice" spaceComplexity="O(2ⁿ)" />
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: tab===i ? '#880E4F' : 'transparent', color: tab===i ? '#fff' : '#6B7B6E' }}>
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.2 }} className="flex-1 flex flex-col gap-4">

          {/* ── KNAPSACK B&B ── */}
          {tab === 0 && (
            <>
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 mb-2">
                <div className="text-xs font-bold text-pink-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-pink-700">
                  Same crop investment problem as 0/1 Knapsack DP — but solved three different ways.
                  Each strategy explores a decision tree (include or exclude each crop) with intelligent pruning.
                  Watch how FIFO, LIFO and LC explore different paths to the same optimal answer.
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {STRATEGIES.map(s => (
                  <button key={s} onClick={() => { setStrat(s); bnbPlayer.reset(); }}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all border-2"
                    style={{ background:strat===s?S_COLORS[s]:'#fff', borderColor:S_COLORS[s],
                             color:strat===s?'#fff':S_COLORS[s] }}>
                    {s} · {bnbResult[s]?.nodes} nodes
                  </button>
                ))}
              </div>

              <div className="algo-card">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {strat === 'FIFO' && 'FIFO — Explore level by level (Queue / BFS)'}
                      {strat === 'LIFO' && 'LIFO — Explore depth first (Stack / DFS)'}
                      {strat === 'LC'   && 'LC — Always go to most promising node (Priority Queue)'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Blue nodes = being explored · Red = pruned (upper bound too low) · Green = solution
                      {strat==='LC' && ' · LC wins by skipping unpromising branches earliest'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-2 rounded-lg text-center"
                      style={{ background:S_COLORS[strat]+'18', border:`1px solid ${S_COLORS[strat]}44` }}>
                      <div className="text-xl font-extrabold" style={{ color:S_COLORS[strat] }}>{stratData?.nodes}</div>
                      <div className="text-xs text-gray-400">nodes explored</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-green-50 text-center">
                      <div className="text-xl font-extrabold text-green-700">₹{(stratData?.best||0).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">optimal yield</div>
                    </div>
                  </div>
                </div>

                <TreeVisualizer trace={stratData?.trace||[]} currentStep={bnbPlayer.currentStep}
                  labelKey="label" valueKey="value" maxNodes={60} />
                <div className="mt-3"><StepController player={bnbPlayer} label={`B&B ${strat}`} /></div>
              </div>

              <div className="algo-card">
                <h3 className="font-bold text-gray-900 mb-3">All three strategies, same correct answer</h3>
                <div className="grid grid-cols-3 gap-3">
                  {STRATEGIES.map(s => {
                    const d = bnbResult[s];
                    const maxN = Math.max(bnbResult.FIFO.nodes, bnbResult.LIFO.nodes, bnbResult.LC.nodes);
                    const isWinner = d?.nodes === Math.min(bnbResult.FIFO.nodes, bnbResult.LIFO.nodes, bnbResult.LC.nodes);
                    return (
                      <div key={s} className={`p-3 rounded-xl text-center border-2 ${isWinner?'border-green-400 bg-green-50':'border-gray-200 bg-gray-50'}`}>
                        <div className="text-xs font-bold mb-1" style={{ color:S_COLORS[s] }}>{s}</div>
                        <div className="text-xs text-gray-400 mb-2">
                          {s==='FIFO'?'Queue / level-by-level':s==='LIFO'?'Stack / depth-first':'Priority queue / best-first'}
                        </div>
                        <div className="text-2xl font-extrabold" style={{ color:S_COLORS[s] }}>{d?.nodes}</div>
                        <div className="text-xs text-gray-400 mb-1">nodes</div>
                        {isWinner && <div className="flex items-center justify-center gap-1 text-xs font-bold text-green-700"><Trophy size={11}/>Most efficient</div>}
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${(d?.nodes/maxN)*100}%`, background:S_COLORS[s] }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <FarmerInsight icon={TrendingUp} title="What this shows" color="#880E4F">
                  All three methods find the same optimal crop investment of ₹{bnbResult.optimal.toLocaleString()}.
                  LC is {Math.round((1-bnbResult.LC.nodes/bnbResult.FIFO.nodes)*100)}% faster than FIFO
                  because it always checks the most promising investment combination first,
                  cutting dead-end branches early.
                </FarmerInsight>
              </div>
            </>
          )}

          {/* ── TSP TOUR ── */}
          {tab === 1 && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                <div className="text-xs font-bold text-pink-800 mb-1">PROBLEM BEING SOLVED</div>
                <div className="text-sm text-pink-700">
                  Every week you walk all your plots to check crop health. What is the shortest route
                  that visits every plot exactly once and returns home? Branch & Bound tests partial
                  routes and prunes any that are already longer than the best complete route found so far.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MAP */}
                <div className="algo-card">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Map size={15} className="text-pink-700"/> Farm Inspection Map
                  </h3>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width:'100%', height:'auto' }}>
                      {/* Light background edges */}
                      {coords.map((a,ai) => coords.slice(ai+1).map((b,bi) => (
                        <line key={`bg${ai}-${bi}`} x1={nx(a)} y1={ny(a)} x2={nx(b)} y2={ny(b)}
                          stroke="#F0F0F0" strokeWidth={0.8}/>
                      )))}

                      {/* Partial tour being built (during animation) */}
                      {!tspPlayer.isDone && tspFrame?.tour?.length > 1 &&
                        tspFrame.tour.slice(0,-1).map((label, i) => {
                          const from = coords.find(p=>p.label===tspFrame.tour[i]);
                          const to   = coords.find(p=>p.label===tspFrame.tour[i+1]);
                          if (!from||!to) return null;
                          return (
                            <line key={`partial${i}`}
                              x1={nx(from)} y1={ny(from)} x2={nx(to)} y2={ny(to)}
                              stroke={tspFrame.status==='pruned'?'#EF9A9A':'#F4A261'}
                              strokeWidth={tspFrame.status==='pruned'?1.5:2.5}
                              strokeDasharray={tspFrame.status==='pruned'?'6,4':''}/>
                          );
                        })
                      }

                      {/* Final optimal tour */}
                      {tspPlayer.isDone && tspResult.tourCoords.length > 1 &&
                        tspResult.tourCoords.slice(0,-1).map((from, i) => {
                          const to = tspResult.tourCoords[i+1];
                          return (
                            <motion.line key={`tour${i}`}
                              x1={nx(from)} y1={ny(from)} x2={nx(to)} y2={ny(to)}
                              stroke="#2D6A4F" strokeWidth={3}
                              initial={{ pathLength:0 }} animate={{ pathLength:1 }}
                              transition={{ delay:i*0.15, duration:0.4 }}/>
                          );
                        })
                      }

                      {/* Nodes */}
                      {coords.map(p => {
                        const isHome = p.id==='FARM';
                        const inTour = tspPlayer.isDone && tspResult.tour.includes(p.label);
                        const isInCurrent = tspFrame?.tour?.includes(p.label);
                        return (
                          <g key={p.id}>
                            <circle cx={nx(p)} cy={ny(p)} r={isHome?16:13}
                              fill={isHome?'#2D6A4F':inTour||isInCurrent?'#52B788':'#B0BEC5'}
                              stroke={isHome?'#1B5E3B':'#2D6A4F'} strokeWidth={2}/>
                            <text x={nx(p)} y={ny(p)} textAnchor="middle" dominantBaseline="middle"
                              fontSize={isHome?9:10} fontWeight="700" fill="#fff" fontFamily="Inter">
                              {isHome ? 'H' : p.id}
                            </text>
                            <text x={nx(p)} y={ny(p)+(isHome?20:18)} textAnchor="middle"
                              fontSize={8} fill="#6B7B6E" fontFamily="Inter">
                              {p.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* STEP EXPLANATION PANEL */}
                <div className="algo-card">
                  <h3 className="font-bold text-gray-900 mb-3">Step-by-Step Explanation</h3>

                  {tspPlayer.currentStep < 0 ? (
                    <div className="text-sm text-gray-400 text-center py-8">Press Play to watch the algorithm work</div>
                  ) : tspFrame ? (
                    <div className="space-y-3">
                      {/* Current status */}
                      <div className={`p-3 rounded-xl border ${tspFrame.status==='pruned'?'bg-red-50 border-red-200':tspFrame.status==='complete'?'bg-green-50 border-green-200':'bg-blue-50 border-blue-100'}`}>
                        <div className="text-xs font-bold mb-1"
                          style={{ color:tspFrame.status==='pruned'?'#C62828':tspFrame.status==='complete'?'#2E7D32':'#1565C0' }}>
                          {tspFrame.status==='pruned'   ? 'BRANCH PRUNED' :
                           tspFrame.status==='complete' ? 'COMPLETE TOUR FOUND' : 'EXPLORING PARTIAL TOUR'}
                        </div>
                        <div className="text-sm font-mono font-medium text-gray-800">
                          {(tspFrame.tour||[]).join(' → ')}
                        </div>
                        {tspFrame.status === 'pruned' && (
                          <div className="text-xs text-red-600 mt-1">
                            Cost so far ({tspFrame.cost?.toFixed(0)} units) already exceeds best known tour —
                            no need to continue this path.
                          </div>
                        )}
                        {tspFrame.status === 'complete' && (
                          <div className="text-xs text-green-700 mt-1">
                            New best! Complete tour cost = {tspFrame.total?.toFixed(0)} units. All future partial tours longer than this will be pruned.
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-gray-50 text-center">
                          <div className="text-xs text-gray-400 mb-0.5">Partial tour cost</div>
                          <div className="text-lg font-extrabold text-gray-700">{tspFrame.cost?.toFixed(0) || 0}</div>
                          <div className="text-xs text-gray-400">units so far</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-gray-50 text-center">
                          <div className="text-xs text-gray-400 mb-0.5">Lower bound</div>
                          <div className="text-lg font-extrabold text-blue-700">{tspFrame.lb?.toFixed(0) || 0}</div>
                          <div className="text-xs text-gray-400">min possible total</div>
                        </div>
                      </div>

                      {/* Plots visited / remaining */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">Progress</div>
                        <div className="flex flex-wrap gap-1.5">
                          {coords.map(p => {
                            const visited = (tspFrame.tour||[]).includes(p.label);
                            return (
                              <span key={p.id} className={`px-2 py-1 rounded-lg text-xs font-bold border ${visited?'bg-green-100 border-green-300 text-green-800':'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                {p.id==='FARM' ? 'Home' : p.id}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step counter */}
                      <div className="text-xs text-gray-400 text-right font-mono">
                        Step {tspPlayer.currentStep + 1} / {tspResult.trace.length} · {tspResult.trace.filter(t=>t.status==='pruned').length} branches pruned
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <StepController player={tspPlayer} label="TSP Branch & Bound" />
                  </div>
                </div>
              </div>

              {/* Result */}
              {tspPlayer.isDone && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  className="algo-card border-2 border-green-300">
                  <div className="font-bold text-green-800 text-base mb-2 flex items-center gap-2">
                    <Trophy size={16} className="text-green-600"/> Optimal Weekly Inspection Route Found
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mb-3 font-mono text-sm text-gray-700">
                    {tspResult.tour.map((stop, i) => (
                      <React.Fragment key={i}>
                        <span className="px-2 py-1 rounded-lg font-bold"
                          style={{ background: stop==='Farmhouse'?'#2D6A4F':'#52B788', color:'#fff' }}>
                          {stop}
                        </span>
                        {i < tspResult.tour.length-1 && <ArrowRight size={12} className="text-gray-400"/>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex gap-6 text-sm flex-wrap mb-2">
                    <span><strong className="text-gray-700">Total walk:</strong> <strong className="text-green-700">{tspResult.cost} units</strong></span>
                    <span><strong className="text-gray-700">Paths checked:</strong> {tspResult.nodes}</span>
                    <span><strong className="text-gray-700">Branches pruned:</strong> {tspResult.trace.filter(t=>t.status==='pruned').length}</span>
                  </div>
                  <FarmerInsight icon={Map} title="Your action" color="#2E7D32">
                    Every week, walk this route: <strong>{tspResult.tour.join(' → ')}</strong>.
                    This is the shortest possible path that covers all your plots.
                    Following this route saves you time compared to any other sequence —
                    the algorithm checked {tspResult.nodes} different route options to confirm this is optimal.
                  </FarmerInsight>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView} label="Next: Full Season Plan" />
      </div>
    </section>
  );
}
