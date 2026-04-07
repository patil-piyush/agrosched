import React, { useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { knapsack01 } from '../algorithms/dp/knapsack01';
import { knapsackBacktrack } from '../algorithms/backtracking/knapsackBacktrack';
import { knapsackBnB } from '../algorithms/branchBound/knapsackBnB';
import { dijkstra } from '../algorithms/greedy/dijkstra';
import { bellmanFord } from '../algorithms/dp/bellmanFord';
import { floydWarshall } from '../algorithms/dp/floydWarshall';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MODULE_META = [
  { module:2, label:'Divide & Conquer', color:'#1565C0', bg:'#E3F2FD', algos:[
    { name:'Quick Sort', tc:'O(n log n)', sc:'O(log n)', use:'Crop ranking' },
    { name:'Binary Search', tc:'O(log n)', sc:'O(1)', use:'Water threshold' },
    { name:'Karatsuba', tc:'O(n^1.585)', sc:'O(n)', use:'Yield arithmetic' },
  ]},
  { module:3, label:'Greedy', color:'#6A1B9A', bg:'#F3E5F5', algos:[
    { name:'Job Scheduling', tc:'O(n²)', sc:'O(n)', use:'Planting windows' },
    { name:'Fractional Knapsack', tc:'O(n log n)', sc:'O(n)', use:'Weekly water' },
    { name:'Dijkstra', tc:'O((V+E)logV)', sc:'O(V)', use:'Irrigation paths' },
  ]},
  { module:4, label:'Dynamic Programming', color:'#2E7D32', bg:'#E8F5E9', algos:[
    { name:'0/1 Knapsack', tc:'O(nW)', sc:'O(nW)', use:'Budget allocation' },
    { name:'Multistage Graph', tc:'O(V+E)', sc:'O(V)', use:'Phase planning' },
    { name:'Floyd-Warshall', tc:'O(V³)', sc:'O(V²)', use:'All-pairs routing' },
    { name:'Bellman-Ford', tc:'O(VE)', sc:'O(V)', use:'Degrading pipes' },
    { name:'Sum of Subset', tc:'O(2ⁿ)', sc:'O(n)', use:'Water zero-waste' },
    { name:'Binomial Coeff', tc:'O(n²)', sc:'O(n²)', use:'Combo counting' },
  ]},
  { module:5, label:'Backtracking', color:'#E65100', bg:'#FFF3E0', algos:[
    { name:'Crop Rotation', tc:'O(k^n)', sc:'O(n)', use:'Rotation rules' },
    { name:'Knapsack BT', tc:'O(2ⁿ)', sc:'O(n)', use:'Comparison' },
  ]},
  { module:6, label:'Branch & Bound', color:'#880E4F', bg:'#FCE4EC', algos:[
    { name:'Knapsack B&B (FIFO)', tc:'O(2ⁿ)', sc:'O(2ⁿ)', use:'Crop investment' },
    { name:'Knapsack B&B (LIFO)', tc:'O(2ⁿ)', sc:'O(2ⁿ)', use:'Crop investment' },
    { name:'Knapsack B&B (LC)', tc:'O(2ⁿ)', sc:'O(2ⁿ)', use:'Crop investment' },
    { name:'TSP B&B', tc:'O(n!)', sc:'O(n²)', use:'Inspection tour' },
  ]},
];

export default function ComparisonsSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { threshold: 0.08 });
  const { farm } = useFarm();

  const crops7  = farm.crops.slice(0, 7);
  const ksResult = useMemo(() => knapsack01(crops7, farm.budget), [farm]);
  const btResult = useMemo(() => knapsackBacktrack(crops7, farm.budget, true),  [farm]);
  const bpResult = useMemo(() => knapsackBacktrack(crops7, farm.budget, false), [farm]);
  const bnbResult = useMemo(() => knapsackBnB(crops7, farm.budget), [farm]);

  const knapsackData = [
    { name:'Greedy (Frac.)', ops: Math.round(farm.crops.length * Math.log2(farm.crops.length) * 2), optimal:'N/A*', color:'#9E9E9E' },
    { name:'DP 0/1', ops: ksResult.fills.length, optimal:`₹${ksResult.totalYield.toLocaleString()}`, color:'#2E7D32' },
    { name:'Backtracking\n(pruned)', ops: btResult.nodes, optimal:`₹${btResult.bestValue.toLocaleString()}`, color:'#E65100' },
    { name:'B&B LC', ops: bnbResult.LC.nodes, optimal:`₹${bnbResult.LC.best.toLocaleString()}`, color:'#880E4F' },
  ];

  const bnbCompareData = [
    { name:'FIFO (BFS)', nodes: bnbResult.FIFO.nodes, color:'#1565C0' },
    { name:'LIFO (DFS)', nodes: bnbResult.LIFO.nodes, color:'#6A1B9A' },
    { name:'LC (Best)',  nodes: bnbResult.LC.nodes,   color:'#2E7D32' },
  ];

  return (
    <section ref={ref} className="scroll-section flex flex-col" style={{ minHeight:'100vh', background:'#fff' }}>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Algorithm Analysis</div>
          <h2 className="text-3xl font-extrabold text-textDark mb-1">Comparisons Dashboard</h2>
          <p className="text-muted text-sm mb-8">Same data, different strategies. See exactly why each algorithm was chosen for each sub-problem.</p>
        </motion.div>

        <div className="space-y-6">

          {/* Knapsack 4-way comparison */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.1 }}
            className="algo-card">
            <h3 className="font-bold text-textDark mb-1">Knapsack — 4 Approaches, Same Problem</h3>
            <p className="text-xs text-muted mb-4">Budget: ₹{farm.budget.toLocaleString()} · {crops7.length} crops · All find optimal = ₹{ksResult.totalYield.toLocaleString()}</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={knapsackData} margin={{ top:5, right:10, bottom:5, left:10 }}>
                <XAxis dataKey="name" tick={{ fontSize:10 }} />
                <YAxis tick={{ fontSize:9 }} label={{ value:'Operations', angle:-90, position:'insideLeft', fontSize:9 }}/>
                <Tooltip formatter={(v,n) => [v, 'Operations']} />
                <Bar dataKey="ops" radius={[4,4,0,0]}>
                  {knapsackData.map((d,i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {knapsackData.map(d => (
                <div key={d.name} className="p-2 rounded-lg text-center border" style={{ borderColor: d.color+'33', background: d.color+'0A' }}>
                  <div className="text-xs font-bold mb-0.5" style={{ color: d.color }}>{d.name.replace('\n',' ')}</div>
                  <div className="text-lg font-extrabold" style={{ color: d.color }}>{d.ops}</div>
                  <div className="text-xs text-muted">ops/nodes</div>
                  <div className="text-xs font-semibold mt-0.5 text-green-700">{d.optimal}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-gray-50 text-xs text-muted">
              * Fractional Knapsack yields more (items are divisible) — not valid for 0/1 item selection. Shows why we use DP for discrete items.
            </div>
          </motion.div>

          {/* Shortest path comparison */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.2 }}
            className="algo-card">
            <h3 className="font-bold text-textDark mb-1">Shortest Path — 3 Algorithms, Same Irrigation Network</h3>
            <p className="text-xs text-muted mb-4">{farm.irrigationNetwork.nodes.length} nodes · {farm.irrigationNetwork.edges.length} edges</p>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2">Algorithm</th><th className="p-2">Negative Weights</th>
                    <th className="p-2">All Pairs</th><th className="p-2">Time</th><th className="p-2">Used For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name:'Dijkstra',       neg:'✕ No',  all:'✕ SSSP', tc:'O((V+E)logV)', use:'Weekly routing', color:'#6A1B9A' },
                    { name:'Bellman-Ford',   neg:'✓ Yes', all:'✕ SSSP', tc:'O(VE)',        use:'Degraded pipes', color:'#2E7D32' },
                    { name:'Floyd-Warshall', neg:'✓ Yes', all:'✓ APSP', tc:'O(V³)',        use:'Pipe failure backup', color:'#1565C0' },
                  ].map(r => (
                    <tr key={r.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 font-bold" style={{ color: r.color }}>{r.name}</td>
                      <td className="p-2">{r.neg}</td>
                      <td className="p-2">{r.all}</td>
                      <td className="p-2 font-mono">{r.tc}</td>
                      <td className="p-2 text-muted">{r.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 p-2 rounded-lg bg-blue-50 text-xs text-blue-700">
              💡 When a pipe is simulated as broken: Dijkstra can fail with inconsistent results. Bellman-Ford correctly reroutes. Floyd-Warshall gives instant backup path from precomputed matrix.
            </div>
          </motion.div>

          {/* B&B strategy comparison */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.3 }}
            className="algo-card">
            <h3 className="font-bold text-textDark mb-3">Branch & Bound — FIFO vs LIFO vs LC</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={bnbCompareData} margin={{ top:5, right:10, bottom:5, left:10 }}>
                <XAxis dataKey="name" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:9 }} />
                <Tooltip />
                <Bar dataKey="nodes" radius={[4,4,0,0]}>
                  {bnbCompareData.map((d,i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-2 rounded-lg bg-green-50 text-sm">
              <span className="font-bold text-green-800">LC wins: </span>
              <span className="text-green-700">Always explores the node with highest upper-bound estimate → prunes more aggressively → {Math.round((1-bnbResult.LC.nodes/bnbResult.FIFO.nodes)*100)}% fewer nodes than FIFO.</span>
            </div>
          </motion.div>

          {/* Full complexity table */}
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.4 }}
            className="algo-card">
            <h3 className="font-bold text-textDark mb-3">Complete Time & Space Complexity Summary</h3>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-800 text-white text-left">
                    <th className="p-2">Module</th><th className="p-2">Algorithm</th>
                    <th className="p-2">Time</th><th className="p-2">Space</th><th className="p-2">Application in AgroSched</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULE_META.map(mod => mod.algos.map((algo, ai) => (
                    <tr key={`${mod.module}-${ai}`} className="border-b border-gray-100 hover:bg-gray-50">
                      {ai===0 && (
                        <td className="p-2 font-bold text-xs" rowSpan={mod.algos.length}
                          style={{ borderLeft:`3px solid ${mod.color}`, color:mod.color, background:mod.bg }}>
                          M{mod.module}<br/>{mod.label}
                        </td>
                      )}
                      <td className="p-2 font-medium">{algo.name}</td>
                      <td className="p-2 font-mono" style={{ color:'#2E7D32' }}>{algo.tc}</td>
                      <td className="p-2 font-mono" style={{ color:'#1565C0' }}>{algo.sc}</td>
                      <td className="p-2 text-muted">{algo.use}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.6 }}
          className="mt-10 p-6 rounded-2xl text-center"
          style={{ background:'linear-gradient(135deg,#1B5E3B,#2D6A4F)', color:'#fff' }}>
          <div className="text-2xl font-extrabold mb-1">AgroSched</div>
          <div className="text-sm text-white/70 mb-3">A Multi-Strategy Algorithm Framework for Smart Crop Cycle Planning</div>
          <div className="flex justify-center gap-4 flex-wrap text-xs text-white/60">
            <span>16 Algorithms</span><span>·</span>
            <span>5 DAA Modules</span><span>·</span>
            <span>6 Farm Plots</span><span>·</span>
            <span>24-Week Season</span><span>·</span>
            <span>Real-world: Fasal · CropIn · AgroStar</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
