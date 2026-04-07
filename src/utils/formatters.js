export const fmt = {
  inr:     v => `₹${Number(v).toLocaleString('en-IN')}`,
  litres:  v => `${Number(v).toLocaleString('en-IN')}L`,
  pct:     v => `${v}%`,
  acres:   v => `${v} ac`,
  dec:     (v, d=2) => Number(v).toFixed(d),
};

export const CROP_COLORS = {
  C1:'#FDD835', C2:'#E53935', C3:'#8E24AA', C4:'#795548',
  C5:'#43A047', C6:'#FFB300', C7:'#7CB342', C8:'#F9A825',
  C9:'#FF7043', C10:'#FFCA28', null:'#CFD8DC',
};

export const MODULE_META = [
  { module:2, label:'Divide & Conquer', color:'#1565C0', bg:'#E3F2FD',
    algos:['Quick Sort','Binary Search','Karatsuba'] },
  { module:3, label:'Greedy',           color:'#6A1B9A', bg:'#F3E5F5',
    algos:['Job Scheduling','Fractional Knapsack','Dijkstra'] },
  { module:4, label:'Dynamic Programming', color:'#2E7D32', bg:'#E8F5E9',
    algos:['0/1 Knapsack','Multistage Graph','Floyd-Warshall','Bellman-Ford','Sum of Subset','Binomial Coeff'] },
  { module:5, label:'Backtracking',     color:'#E65100', bg:'#FFF3E0',
    algos:['Crop Rotation','Knapsack BT'] },
  { module:6, label:'Branch & Bound',   color:'#880E4F', bg:'#FCE4EC',
    algos:['Knapsack B&B (FIFO/LIFO/LC)','TSP Tour'] },
];
