import React, { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { quickSort } from '../algorithms/divideConquer/quickSort';
import { binarySearch, buildAssignmentsForBS } from '../algorithms/divideConquer/binarySearch';
import { karatsuba, buildFarmMultiplication } from '../algorithms/divideConquer/karatsuba';
import { useAlgorithmPlayer } from '../hooks/useAlgorithmPlayer';
import ArrayVisualizer from '../visualizers/ArrayVisualizer';
import StepController from '../components/StepController';
import ModuleHeader from '../components/ModuleHeader';
import ScrollIndicator from '../components/ScrollIndicator';

const TABS = ['Quick Sort', 'Binary Search', 'Karatsuba'];

export default function Module2Section() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.15 });
  const { farm } = useFarm();
  const [tab, setTab] = useState(0);
  const [sortKey, setSortKey] = useState(0); // 0=yield/cost, 1=yield/water

  const qsResult  = useMemo(() => quickSort(farm.crops), [farm.crops]);
  const bsResult  = useMemo(() => {
    const assgns = buildAssignmentsForBS(farm.crops, farm.plots);
    return binarySearch(assgns, Math.round(farm.crops.reduce((s,c)=>s+c.expectedYield,0)*0.7), farm.weeklyWater * 2);
  }, [farm]);
  const karaResult = useMemo(() => {
    const { x, y } = buildFarmMultiplication(farm);
    return karatsuba(x, y);
  }, [farm]);

  const trace   = sortKey === 0 ? qsResult.trace1 : qsResult.trace2;
  const player  = useAlgorithmPlayer(trace);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#EFF6FF' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <ModuleHeader module={2} title="Divide & Conquer"
            subtitle="Split problems into sub-problems, solve recursively, combine results."
            timeComplexity="O(n log n)" spaceComplexity="O(log n)" />

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: tab===i ? '#1565C0' : 'transparent', color: tab===i ? '#fff' : '#6B7B6E' }}>
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.2 }}
          className="flex-1 flex flex-col">

          {/* ── QUICK SORT ── */}
          {tab === 0 && (
            <div className="flex flex-col gap-4">
              <div className="algo-card">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-textDark">Quick Sort — Crop Prioritization</h3>
                    <p className="text-xs text-muted mt-0.5">Sorts crops by efficiency ratio using pivot partitioning</p>
                  </div>
                  <div className="flex gap-1">
                    {['Yield / Cost', 'Yield / Water'].map((l, i) => (
                      <button key={l} onClick={() => { setSortKey(i); player.reset(); }}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
                        style={{ background: sortKey===i ? '#1565C0' : '#f0f4ff', color: sortKey===i ? '#fff' : '#1565C0' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <ArrayVisualizer trace={trace} currentStep={player.currentStep} />
                <div className="mt-4">
                  <StepController player={player} label={`Sorting by ${sortKey===0?'Yield/Cost':'Yield/Water'} ratio`} />
                </div>
              </div>

              {/* Sorted result */}
              {player.isDone && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="algo-card">
                  <h4 className="font-semibold text-sm text-textDark mb-2">Sorted Result → feeds {sortKey===0?'0/1 Knapsack':'Fractional Knapsack'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(sortKey===0 ? qsResult.sortedByYieldCost : qsResult.sortedByYieldWater).map((c, i) => (
                      <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                        <span className="text-xs font-bold text-blue-700">#{i+1}</span>
                        <span className="text-xs font-medium">{c.name}</span>
                        <span className="text-xs text-muted font-mono">{c.ratio}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ── BINARY SEARCH ── */}
          {tab === 1 && (
            <div className="flex flex-col gap-4">
              <div className="algo-card">
                <h3 className="font-bold text-textDark mb-1">Binary Search on the Answer</h3>
                <p className="text-xs text-muted mb-4">Finds minimum weekly water supply to achieve target yield ₹{Math.round(farm.crops.reduce((s,c)=>s+c.expectedYield,0)*0.7).toLocaleString()}</p>

                {/* Number line */}
                <div className="relative w-full h-10 bg-blue-50 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-y-0 flex items-center w-full px-4">
                    <div className="w-full h-2 bg-blue-200 rounded-full relative">
                      {bsResult.trace.map((step, i) => {
                        const pct = (step.mid / 50000) * 100;
                        return (
                          <div key={i} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                            style={{ left:`${pct}%`, background: step.decision==='go_lower'?'#1565C0':'#6A1B9A', opacity: 0.6 + i*0.08 }} />
                        );
                      })}
                    </div>
                  </div>
                  <span className="absolute left-4 top-0 text-xs text-blue-400 leading-tight mt-0.5">1kL</span>
                  <span className="absolute right-4 top-0 text-xs text-blue-400 leading-tight mt-0.5">50kL</span>
                </div>

                {/* Steps table */}
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left bg-blue-50">
                        <th className="p-2 rounded-tl">Step</th><th className="p-2">Low</th><th className="p-2">High</th>
                        <th className="p-2">Mid</th><th className="p-2">Yield at Mid</th><th className="p-2 rounded-tr">Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bsResult.trace.map((s, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/50">
                          <td className="p-2 font-mono text-blue-600">{s.step}</td>
                          <td className="p-2 font-mono">{s.low.toLocaleString()}L</td>
                          <td className="p-2 font-mono">{s.high.toLocaleString()}L</td>
                          <td className="p-2 font-mono font-bold">{s.mid.toLocaleString()}L</td>
                          <td className="p-2 font-mono text-green-700">₹{s.yieldAtMid.toLocaleString()}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.decision==='go_lower'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>
                              {s.decision === 'go_lower' ? '↓ Go lower' : '↑ Go higher'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 rounded-xl" style={{ background:'#E3F2FD' }}>
                  <span className="text-sm font-bold text-blue-800">
                    ✓ Minimum water needed: {bsResult.minWater.toLocaleString()}L/week to achieve ₹{bsResult.achievedYield.toLocaleString()} yield
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── KARATSUBA ── */}
          {tab === 2 && (
            <div className="flex flex-col gap-4">
              <div className="algo-card">
                <h3 className="font-bold text-textDark mb-1">Karatsuba Multiplication</h3>
                <p className="text-xs text-muted mb-4">Efficient large-integer multiplication for seasonal yield computation</p>

                {/* The numbers */}
                {(() => { const fm = buildFarmMultiplication(farm); return (
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                      <div className="text-xs text-muted mb-1">Total area factor</div>
                      <div className="font-bold text-blue-700">{fm.x}</div>
                    </div>
                    <div className="text-2xl text-muted">×</div>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                      <div className="text-xs text-muted mb-1">Yield · weeks · price</div>
                      <div className="font-bold text-purple-700">{fm.y}</div>
                    </div>
                    <div className="text-2xl text-muted">=</div>
                    <div className="bg-green-50 rounded-lg p-3 font-mono text-sm">
                      <div className="text-xs text-muted mb-1">Result</div>
                      <div className="font-bold text-green-700">{karaResult.result}</div>
                    </div>
                  </div>
                ); })()}

                {/* Comparison */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-gray-50 text-center">
                    <div className="text-xs text-muted mb-1">Standard Multiplication</div>
                    <div className="text-3xl font-extrabold text-gray-700">{karaResult.standardOps}</div>
                    <div className="text-xs text-muted mt-1">multiplications</div>
                    <div className="text-xs mt-1 text-gray-500">O(n²)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 text-center border-2 border-blue-200">
                    <div className="text-xs text-muted mb-1">Karatsuba</div>
                    <div className="text-3xl font-extrabold text-blue-700">{karaResult.karatsubaOps}</div>
                    <div className="text-xs text-muted mt-1">multiplications</div>
                    <div className="text-xs mt-1 text-blue-600 font-semibold">O(n^1.585)</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-green-50 text-center">
                  <span className="text-sm font-bold text-green-800">
                    Karatsuba saves {karaResult.savings}% operations for these numbers
                  </span>
                </div>

                {/* Trace tree condensed */}
                <div className="mt-4">
                  <div className="text-xs font-semibold text-muted mb-2">Recursive split trace:</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-xs">
                    {karaResult.trace.map((t, i) => (
                      <div key={i} className="flex gap-2 items-center pl-4" style={{ paddingLeft: t.level * 16 + 4 }}>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${t.action==='split'?'bg-blue-100 text-blue-700':t.action==='base_case'?'bg-gray-100 text-gray-600':'bg-green-100 text-green-700'}`}>
                          {t.action}
                        </span>
                        <span className="text-gray-500">L{t.level}</span>
                        <span>{t.x} × {t.y}</span>
                        {t.result && <span className="text-green-700">= {t.result}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <div className="flex justify-center pb-8">
        <ScrollIndicator show={inView} label="Next: Greedy Algorithms" />
      </div>
    </section>
  );
}
