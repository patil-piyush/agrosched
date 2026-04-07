/**
 * Branch and Bound Knapsack — FIFO / LIFO / LC
 * Module 6: Branch and Bound
 */

function upperBound(crops, idx, cost, value, budget) {
  let ub  = value;
  let cap = budget - cost;
  for (let i = idx; i < crops.length && cap > 0; i++) {
    if (crops[i].packageCost <= cap) {
      ub  += crops[i].expectedYield;
      cap -= crops[i].packageCost;
    } else {
      ub += (cap / crops[i].packageCost) * crops[i].expectedYield;
      cap = 0;
    }
  }
  return ub;
}

function runBnB(crops, budget, strategy) {
  // Sort crops by value/weight ratio for UB calc
  const sorted = [...crops].sort((a, b) =>
    (b.expectedYield / b.packageCost) - (a.expectedYield / a.packageCost)
  );

  let best      = 0;
  let bestItems = [];
  let nodes     = 0;
  const trace   = [];
  const nodeList = [];

  let nodeId = 0;

  // Root node
  const root = {
    id: nodeId++, idx: 0, cost: 0, value: 0,
    ub: upperBound(sorted, 0, 0, 0, budget),
    included: [],
  };

  let queue = [root];

  while (queue.length > 0) {
    let cur;
    if (strategy === 'FIFO')      cur = queue.shift();          // BFS
    else if (strategy === 'LIFO') cur = queue.pop();            // DFS
    else                           cur = queue.reduce((a, b) => a.ub > b.ub ? a : b); // LC: max ub

    if (strategy === 'LC') queue = queue.filter(n => n !== cur);

    nodes++;
    if (nodes > 300) break; // safety

    nodeList.push({ ...cur, status: 'explore' });
    trace.push({ node: nodes, id: cur.id, idx: cur.idx, cost: cur.cost, value: cur.value, ub: +cur.ub.toFixed(0), strategy, status: 'explore' });

    if (cur.ub < best) {
      nodeList[nodeList.length - 1].status = 'pruned';
      trace[trace.length - 1].status = 'pruned';
      continue;
    }
    if (cur.value > best) {
      best      = cur.value;
      bestItems = [...cur.included];
    }
    if (cur.idx >= sorted.length) continue;

    const crop = sorted[cur.idx];

    // Include branch
    if (cur.cost + crop.packageCost <= budget) {
      const inclNode = {
        id: nodeId++, idx: cur.idx + 1,
        cost: cur.cost + crop.packageCost,
        value: cur.value + crop.expectedYield,
        ub: upperBound(sorted, cur.idx + 1, cur.cost + crop.packageCost, cur.value + crop.expectedYield, budget),
        included: [...cur.included, crop.id],
        parent: cur.id, branch: 'include',
      };
      if (inclNode.ub >= best) queue.push(inclNode);
    }

    // Exclude branch
    const exclNode = {
      id: nodeId++, idx: cur.idx + 1,
      cost: cur.cost,
      value: cur.value,
      ub: upperBound(sorted, cur.idx + 1, cur.cost, cur.value, budget),
      included: [...cur.included],
      parent: cur.id, branch: 'exclude',
    };
    if (exclNode.ub >= best) queue.push(exclNode);
  }

  return { best, bestItems, nodes, nodeList, trace };
}

export function knapsackBnB(crops, budget) {
  const sorted = [...crops].sort((a, b) =>
    (b.expectedYield / b.packageCost) - (a.expectedYield / a.packageCost)
  );

  const fifo = runBnB(sorted, budget, 'FIFO');
  const lifo = runBnB(sorted, budget, 'LIFO');
  const lc   = runBnB(sorted, budget, 'LC');

  return {
    optimal: Math.max(fifo.best, lifo.best, lc.best),
    FIFO: fifo,
    LIFO: lifo,
    LC:   lc,
  };
}
