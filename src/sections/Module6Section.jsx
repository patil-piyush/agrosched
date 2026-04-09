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
import { Trophy, Map } from 'lucide-react';

const TABS       = ['Knapsack B&B', 'TSP Tour'];
const STRATEGIES = ['FIFO','LIFO','LC'];
const S_COLORS   = { FIFO:'#1565C0', LIFO:'#6A1B9A', LC:'#2E7D32' };

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

  // Normalize TSP coordinates to fit SVG viewport cleanly
  const SVG_W = 580, SVG_H = 300, PAD = 36;
  const coords = farm.plotCoordinates;
  const xs = coords.map(p=>p.x), ys = coords.map(p=>p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const scaleX = (maxX-minX)>0 ? (SVG_W-PAD*2)/(maxX-minX) : 1;
  const scaleY = (maxY-minY)>0 ? (SVG_H-PAD*2)/(maxY-minY) : 1;
  const sc     = Math.min(scaleX, scaleY);
  const nx = p => PAD + (p.x - minX) * sc;
  const ny = p => PAD + (p.y - minY) * sc;

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#FFF0F6' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={6} title="Branch & Bound"
            subtitle="Systematic enumeration with intelligent upper-bound pruning. Explores far fewer nodes than brute force while guaranteeing the optimal answer."
            timeComplexity="O(2ⁿ) worst · much better avg" spaceComplexity="O(2ⁿ)" />
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

          {/* KNAPSACK B&B */}
          {tab === 0 && (
            <>
              <div className="flex gap-2 mb-1 flex-wrap">
                {STRATEGIES.map(s => (
                  <button key={s} onClick={() => { setStrat(s); bnbPlayer.reset(); }}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all border-2"
                    style={{
                      background:  strat===s ? S_COLORS[s] : '#fff',
                      borderColor: S_COLORS[s],
                      color:       strat===s ? '#fff' : S_COLORS[s],
                    }}>
                    {s} {strat===s && `· ${bnbResult[s]?.nodes} nodes`}
                  </button>
                ))}
              </div>

              <div className="algo-card">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">Knapsack B&B — {strat} Strategy</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {strat==='FIFO' && 'Queue (BFS) — explores tree level by level'}
                      {strat==='LIFO' && 'Stack (DFS) — explores depth first, backtracks early'}
                      {strat==='LC'   && 'Priority queue — always explores node with highest upper-bound (most efficient)'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-2 rounded-lg text-center"
                      style={{ background: S_COLORS[strat]+'18', border:`1px solid ${S_COLORS[strat]}44` }}>
                      <div className="text-xl font-extrabold" style={{ color: S_COLORS[strat] }}>{stratData?.nodes}</div>
                      <div className="text-xs text-gray-400">nodes explored</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-green-50 text-center">
                      <div className="text-xl font-extrabold text-green-700">₹{(stratData?.best||0).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">optimal</div>
                    </div>
                  </div>
                </div>

                <TreeVisualizer
                  trace={stratData?.trace||[]}
                  currentStep={bnbPlayer.currentStep}
                  labelKey="label"
                  valueKey="value"
                  maxNodes={60}
                />
                <div className="mt-3">
                  <StepController player={bnbPlayer} label={`B&B ${strat}`} />
                </div>
              </div>

              {/* 3-way comparison */}
              <div className="algo-card">
                <h3 className="font-bold text-gray-900 mb-3">Strategy Comparison — same problem, same optimal answer</h3>
                <div className="grid grid-cols-3 gap-3">
                  {STRATEGIES.map(s => {
                    const d = bnbResult[s];
                    const maxN = Math.max(bnbResult.FIFO.nodes, bnbResult.LIFO.nodes, bnbResult.LC.nodes);
                    const isWinner = d?.nodes === Math.min(bnbResult.FIFO.nodes, bnbResult.LIFO.nodes, bnbResult.LC.nodes);
                    return (
                      <div key={s} className={`p-3 rounded-xl text-center border-2 ${isWinner?'border-green-400 bg-green-50':'border-gray-200 bg-gray-50'}`}>
                        <div className="text-xs font-bold mb-1" style={{ color: S_COLORS[s] }}>{s}</div>
                        <div className="text-xs text-gray-400 mb-1">
                          {s==='FIFO'?'BFS queue':s==='LIFO'?'DFS stack':'Priority queue (max UB)'}
                        </div>
                        <div className="text-2xl font-extrabold" style={{ color: S_COLORS[s] }}>{d?.nodes}</div>
                        <div className="text-xs text-gray-400">nodes</div>
                        {isWinner && (
                          <div className="mt-1 text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                            <Trophy size={11} /> Most efficient
                          </div>
                        )}
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width:`${(d?.nodes/maxN)*100}%`, background: S_COLORS[s] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-3 rounded-xl bg-green-50 text-sm text-center">
                  <span className="font-bold text-green-800">All three find optimal ₹{bnbResult.optimal.toLocaleString()}. </span>
                  <span className="text-green-700">
                    LC explores {Math.round((1-bnbResult.LC.nodes/bnbResult.FIFO.nodes)*100)}% fewer nodes than FIFO
                    because it always chooses the most promising branch.
                  </span>
                </div>
              </div>
            </>
          )}

          {/* TSP TOUR */}
          {tab === 1 && (
            <div className="algo-card">
              <div className="flex items-center gap-2 mb-1">
                <Map size={15} className="text-pink-700" />
                <h3 className="font-bold text-gray-900">Branch & Bound TSP — Plot Inspection Tour</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Farmer visits all plots each week. B&B with LC strategy finds shortest route
                using reduced-cost-matrix lower bounds. Prunes partial tours worse than current best.
              </p>

              {/* Tour map */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden mb-4">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width:'100%', height:'auto' }}>
                  {/* Background grid */}
                  {[1,2,3,4,5].map(i=>(
                    <line key={`gx${i}`} x1={i*96} y1={0} x2={i*96} y2={SVG_H} stroke="#F0F0F0" strokeWidth={0.5}/>
                  ))}
                  {[1,2].map(i=>(
                    <line key={`gy${i}`} x1={0} y1={i*100} x2={SVG_W} y2={i*100} stroke="#F0F0F0" strokeWidth={0.5}/>
                  ))}

                  {/* All possible edges (light) */}
                  {coords.map((a,ai) => coords.slice(ai+1).map((b,bi) => (
                    <line key={`bg-${ai}-${bi}`}
                      x1={nx(a)} y1={ny(a)} x2={nx(b)} y2={ny(b)}
                      stroke="#E5E7EB" strokeWidth={0.7} />
                  )))}

                  {/* Tour path when done */}
                  {tspPlayer.isDone && tspResult.tourCoords.length > 1 &&
                    tspResult.tourCoords.slice(0,-1).map((from, i) => {
                      const to = tspResult.tourCoords[i+1];
                      return (
                        <motion.line key={`tour-${i}`}
                          x1={nx(from)} y1={ny(from)} x2={nx(to)} y2={ny(to)}
                          stroke="#2D6A4F" strokeWidth={2.5}
                          initial={{ pathLength:0 }} animate={{ pathLength:1 }}
                          transition={{ delay: i*0.15, duration:0.4 }}
                        />
                      );
                    })
                  }

                  {/* Partial tour from trace (in progress) */}
                  {!tspPlayer.isDone && tspPlayer.currentStep >= 0 && (() => {
                    const frame = tspResult.trace[tspPlayer.currentStep];
                    if (!frame?.tour || frame.tour.length < 2) return null;
                    return frame.tour.slice(0,-1).map((label, i) => {
                      const fromC = coords.find(p=>p.label===frame.tour[i]);
                      const toC   = coords.find(p=>p.label===frame.tour[i+1]);
                      if (!fromC||!toC) return null;
                      return (
                        <line key={`partial-${i}`}
                          x1={nx(fromC)} y1={ny(fromC)} x2={nx(toC)} y2={ny(toC)}
                          stroke={frame.status==='pruned'?'#EF5350':'#F4A261'}
                          strokeWidth={2} strokeDasharray={frame.status==='pruned'?'6,4':''} />
                      );
                    });
                  })()}

                  {/* Nodes */}
                  {coords.map(p => {
                    const isHome   = p.id === 'FARM';
                    const inTour   = tspPlayer.isDone && tspResult.tour.includes(p.label);
                    const fill     = isHome ? '#2D6A4F' : inTour ? '#52B788' : '#B0BEC5';
                    const r        = isHome ? 15 : 12;
                    return (
                      <g key={p.id}>
                        <circle cx={nx(p)} cy={ny(p)} r={r}
                          fill={fill} stroke={isHome?'#1B5E3B':'#2D6A4F'} strokeWidth={2} />
                        <text x={nx(p)} y={ny(p)} textAnchor="middle" dominantBaseline="middle"
                          fontSize={isHome?8:9} fontWeight="700" fill="#fff" fontFamily="Inter">
                          {isHome ? 'H' : p.id}
                        </text>
                        <text x={nx(p)} y={ny(p)+r+10} textAnchor="middle"
                          fontSize={8} fill="#6B7B6E" fontFamily="Inter">
                          {isHome ? 'Home' : p.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <StepController player={tspPlayer} label="TSP Branch & Bound" />

              {tspPlayer.isDone && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  className="mt-3 p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="font-bold text-green-800 mb-1">Optimal Inspection Tour Found</div>
                  <div className="text-sm text-green-700 font-mono mb-2">
                    {tspResult.tour.join(' → ')}
                  </div>
                  <div className="flex gap-6 text-sm flex-wrap">
                    <span><strong>Total distance:</strong> {tspResult.cost} units</span>
                    <span><strong>Nodes explored:</strong> {tspResult.nodes}</span>
                  </div>
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
