import React, { useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { knapsackBacktrack } from '../algorithms/backtracking/knapsackBacktrack';
import { knapsackBnB } from '../algorithms/branchBound/knapsackBnB';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Info, ArrowRight } from 'lucide-react';

const MODULE_META = [
  { module:2, label:'Divide & Conquer', color:'#1565C0', bg:'#E3F2FD', algos:[
    { name:'Quick Sort',      tc:'O(n log n)', sc:'O(log n)', use:'Crop ranking by ratio' },
    { name:'Binary Search',   tc:'O(log n)',   sc:'O(1)',     use:'Min water threshold' },
    { name:'Karatsuba',       tc:'O(n^1.585)', sc:'O(n)',     use:'Large yield arithmetic' },
  ]},
  { module:3, label:'Greedy', color:'#6A1B9A', bg:'#F3E5F5', algos:[
    { name:'Job Scheduling',       tc:'O(n²)',        sc:'O(n)', use:'Planting window slots' },
    { name:'Fractional Knapsack',  tc:'O(n log n)',   sc:'O(n)', use:'Weekly water allocation' },
    { name:'Dijkstra',             tc:'O((V+E)logV)', sc:'O(V)', use:'Irrigation path efficiency' },
  ]},
  { module:4, label:'Dynamic Programming', color:'#2E7D32', bg:'#E8F5E9', algos:[
    { name:'0/1 Knapsack',    tc:'O(nW)',   sc:'O(nW)', use:'Seasonal budget allocation' },
    { name:'Multistage Graph',tc:'O(V+E)',  sc:'O(V)',  use:'Phase-by-phase crop sequencing' },
    { name:'Floyd-Warshall',  tc:'O(V³)',   sc:'O(V²)', use:'All-pairs backup pipe routing' },
    { name:'Bellman-Ford',    tc:'O(VE)',   sc:'O(V)',  use:'Degraded pipe routing' },
    { name:'Sum of Subset',   tc:'O(2ⁿ)',   sc:'O(n)',  use:'Zero-waste water check' },
    { name:'Binomial Coeff',  tc:'O(n²)',   sc:'O(n²)', use:'Combination space sizing' },
  ]},
  { module:5, label:'Backtracking', color:'#E65100', bg:'#FFF3E0', algos:[
    { name:'Crop Rotation',   tc:'O(k^n)', sc:'O(n)', use:'Rotation & adjacency constraints' },
    { name:'Knapsack BT',     tc:'O(2ⁿ)',  sc:'O(n)', use:'Exact solver (comparison)' },
  ]},
  { module:6, label:'Branch & Bound', color:'#880E4F', bg:'#FCE4EC', algos:[
    { name:'Knapsack FIFO',   tc:'O(2ⁿ)', sc:'O(2ⁿ)', use:'BFS-order crop investment' },
    { name:'Knapsack LIFO',   tc:'O(2ⁿ)', sc:'O(2ⁿ)', use:'DFS-order crop investment' },
    { name:'Knapsack LC',     tc:'O(2ⁿ)', sc:'O(2ⁿ)', use:'Best-first crop investment' },
    { name:'TSP B&B',         tc:'O(n!)', sc:'O(n²)',  use:'Optimal plot inspection tour' },
  ]},
];

export default function ComparisonsSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.05 });
  const { farm } = useFarm();

  const crops7    = farm.crops.slice(0, 7);
  const ksResult  = useMemo(() => knapsack01(crops7, farm.budget),               [farm]);
  const btResult  = useMemo(() => knapsackBacktrack(crops7, farm.budget, true),  [farm]);
  const bpResult  = useMemo(() => knapsackBacktrack(crops7, farm.budget, false), [farm]);
  const bnbResult = useMemo(() => knapsackBnB(crops7, farm.budget),              [farm]);

  const knapsackData = [
    { name:'DP (0/1)',       ops:ksResult.fills.length, color:'#2E7D32' },
    { name:'B&B LC',         ops:bnbResult.LC.nodes,   color:'#880E4F' },
    { name:'BT (pruned)',    ops:btResult.nodes,        color:'#E65100' },
    { name:'BT (no prune)',  ops:bpResult.nodes,        color:'#C62828' },
  ];

  const bnbData = [
    { name:'FIFO (BFS)', nodes:bnbResult.FIFO.nodes, color:'#1565C0' },
    { name:'LIFO (DFS)', nodes:bnbResult.LIFO.nodes, color:'#6A1B9A' },
    { name:'LC (Best)',  nodes:bnbResult.LC.nodes,   color:'#2E7D32' },
  ];

  const optimal = Math.max(ksResult.totalYield, bnbResult.optimal, btResult.bestValue);

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#fff' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Analysis</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Comparisons Dashboard</h2>
          <p className="text-gray-500 text-sm mb-8">
            Same data, different strategies — see exactly why each algorithm was chosen for each sub-problem.
          </p>
        </motion.div>

        <div className="space-y-6">

          {/* Knapsack 4-way */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.1 }}
            className="algo-card">
            <h3 className="font-bold text-gray-900 mb-1">Knapsack — 4 Approaches, 1 Problem</h3>
            <p className="text-xs text-gray-500 mb-4">
              Budget ₹{farm.budget.toLocaleString()} · {crops7.length} crops · All exact solvers find optimal ₹{optimal.toLocaleString()}
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={knapsackData} margin={{ top:4, right:12, bottom:4, left:12 }}>
                <XAxis dataKey="name" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:9 }} label={{ value:'Operations', angle:-90, position:'insideLeft', fontSize:9 }}/>
                <Tooltip formatter={(v) => [v, 'Operations']} />
                <Bar dataKey="ops" radius={[4,4,0,0]}>
                  {knapsackData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {knapsackData.map(d => (
                <div key={d.name} className="p-2.5 rounded-lg text-center border"
                  style={{ borderColor:d.color+'33', background:d.color+'0A' }}>
                  <div className="text-xs font-bold mb-0.5" style={{ color:d.color }}>{d.name}</div>
                  <div className="text-xl font-extrabold" style={{ color:d.color }}>{d.ops}</div>
                  <div className="text-xs text-gray-400">ops / nodes</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-xl bg-green-50 text-sm text-center">
              DP is the most efficient for this problem — predictable O(nW) with no branching.
              Pruned backtracking is next. Unpruned is exponential.
            </div>
          </motion.div>

          {/* Shortest path comparison */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.2 }}
            className="algo-card">
            <h3 className="font-bold text-gray-900 mb-1">Shortest Path — 3 Algorithms, Same Network</h3>
            <p className="text-xs text-gray-500 mb-3">
              {farm.irrigationNetwork.nodes.length} nodes · {farm.irrigationNetwork.edges.length} edges
            </p>
            <div className="overflow-auto rounded-lg border border-gray-200 mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2.5 font-semibold">Algorithm</th>
                    <th className="p-2.5 font-semibold">Negative weights</th>
                    <th className="p-2.5 font-semibold">Coverage</th>
                    <th className="p-2.5 font-semibold">Time complexity</th>
                    <th className="p-2.5 font-semibold">Used for</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name:'Dijkstra',       neg:'No (fails)',  all:'Single source', tc:'O((V+E)logV)', use:'Weekly routing', color:'#6A1B9A', ok:false },
                    { name:'Bellman-Ford',   neg:'Yes',         all:'Single source', tc:'O(VE)',        use:'Degraded pipes', color:'#2E7D32', ok:true  },
                    { name:'Floyd-Warshall', neg:'Yes',         all:'All pairs',     tc:'O(V³)',        use:'Pipe failure backup', color:'#1565C0', ok:true },
                  ].map(r => (
                    <tr key={r.name} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 font-bold" style={{ color:r.color }}>{r.name}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.neg}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-600">{r.all}</td>
                      <td className="p-2.5 font-mono text-gray-700">{r.tc}</td>
                      <td className="p-2.5 text-gray-400">{r.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 flex items-start gap-2">
              <Info size={13} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-blue-700">
                When pipe degradation causes Dijkstra's greedy assumption to break, Bellman-Ford
                correctly handles increasing edge weights. Floyd-Warshall precomputes all paths
                so pipe failure rerouting is instant — no re-run needed.
              </span>
            </div>
          </motion.div>

          {/* B&B strategy comparison */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.3 }}
            className="algo-card">
            <h3 className="font-bold text-gray-900 mb-3">Branch & Bound — FIFO vs LIFO vs LC</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={bnbData} margin={{ top:4, right:12, bottom:4, left:12 }}>
                <XAxis dataKey="name" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:9 }} />
                <Tooltip />
                <Bar dataKey="nodes" radius={[4,4,0,0]}>
                  {bnbData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-xl bg-green-50 flex items-center gap-2">
              <Trophy size={14} className="text-green-600 flex-shrink-0" />
              <span className="text-sm">
                <strong className="text-green-800">LC wins</strong>
                <span className="text-green-700">
                  {' '}— always explores the node with the highest upper-bound estimate, pruning more aggressively.
                  {bnbResult.LC.nodes < bnbResult.FIFO.nodes && ` ${Math.round((1 - bnbResult.LC.nodes/bnbResult.FIFO.nodes)*100)}% fewer nodes than FIFO.`}
                </span>
              </span>
            </div>
          </motion.div>

          {/* Full complexity table */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.4 }}
            className="algo-card">
            <h3 className="font-bold text-gray-900 mb-3">Complete Time & Space Complexity — All 16 Algorithms</h3>
            <div className="overflow-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-800 text-white text-left">
                    <th className="p-2.5">Module</th>
                    <th className="p-2.5">Algorithm</th>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Space</th>
                    <th className="p-2.5">Application</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULE_META.map(mod =>
                    mod.algos.map((algo, ai) => (
                      <tr key={`${mod.module}-${ai}`}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        {ai === 0 && (
                          <td className="p-2 font-bold text-xs align-top" rowSpan={mod.algos.length}
                            style={{ borderLeft:`3px solid ${mod.color}`, color:mod.color, background:mod.bg, minWidth:100 }}>
                            M{mod.module}<br/>
                            <span style={{ fontWeight:400 }}>{mod.label}</span>
                          </td>
                        )}
                        <td className="p-2 font-medium text-gray-800">{algo.name}</td>
                        <td className="p-2 font-mono text-green-700">{algo.tc}</td>
                        <td className="p-2 font-mono text-blue-700">{algo.sc}</td>
                        <td className="p-2 text-gray-400">{algo.use}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.6 }}
          className="mt-10 p-6 rounded-2xl text-center"
          style={{ background:'linear-gradient(135deg,#1B5E3B,#2D6A4F)', color:'#fff' }}>
          <div className="text-3xl font-extrabold mb-1 tracking-tight">AgroSched</div>
          <div className="text-sm opacity-70 mb-4">
            A Multi-Strategy Algorithm Framework for Smart Crop Cycle Planning
          </div>
          <div className="flex justify-center gap-3 flex-wrap text-xs">
            {['16 Algorithms','5 DAA Modules','6 Farm Plots','24-Week Season','Real-world: Fasal · CropIn'].map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white/80">{s}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
