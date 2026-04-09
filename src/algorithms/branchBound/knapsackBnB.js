/**
 * Branch and Bound Knapsack — FIFO / LIFO / LC
 * Module 6: Branch and Bound
 * Trace includes nodeId + parentNodeId for proper tree layout
 */

function upperBound(crops, idx, cost, value, budget) {
  let ub = value, cap = budget - cost;
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
  const sorted = [...crops].sort((a, b) =>
    (b.expectedYield / b.packageCost) - (a.expectedYield / a.packageCost)
  );

  let best = 0, bestItems = [], nodes = 0;
  let globalNodeId = 0;
  const trace = [];

  const root = {
    nodeId: ++globalNodeId, parentNodeId: null, depth: 0,
    idx: 0, cost: 0, value: 0,
    ub: upperBound(sorted, 0, 0, 0, budget),
    included: [],
  };

  let queue = [root];

  while (queue.length > 0 && nodes < 200) {
    let cur;
    if      (strategy === 'FIFO') cur = queue.shift();
    else if (strategy === 'LIFO') cur = queue.pop();
    else {
      cur = queue.reduce((a, b) => a.ub > b.ub ? a : b);
      queue = queue.filter(n => n !== cur);
    }

    nodes++;
    trace.push({
      nodeId:     cur.nodeId,
      parentNodeId: cur.parentNodeId,
      depth:      cur.depth,
      idx:        cur.idx,
      cost:       cur.cost,
      value:      cur.value,
      ub:         +cur.ub.toFixed(0),
      label:      cur.idx < sorted.length ? sorted[cur.idx - 1]?.name || 'root' : 'leaf',
      status:     'explore',
      branch:     cur.branch,
    });

    if (cur.ub < best) {
      trace[trace.length - 1].status = 'pruned';
      continue;
    }
    if (cur.value > best) { best = cur.value; bestItems = [...cur.included]; }
    if (cur.idx >= sorted.length) continue;

    const crop = sorted[cur.idx];

    // Include
    if (cur.cost + crop.packageCost <= budget) {
      const inclId = ++globalNodeId;
      const inclNode = {
        nodeId: inclId, parentNodeId: cur.nodeId, depth: cur.depth + 1,
        idx: cur.idx + 1,
        cost:  cur.cost  + crop.packageCost,
        value: cur.value + crop.expectedYield,
        ub: upperBound(sorted, cur.idx + 1, cur.cost + crop.packageCost, cur.value + crop.expectedYield, budget),
        included: [...cur.included, crop.id],
        branch: 'incl',
      };
      if (inclNode.ub >= best) queue.push(inclNode);
    }

    // Exclude
    const exclId = ++globalNodeId;
    const exclNode = {
      nodeId: exclId, parentNodeId: cur.nodeId, depth: cur.depth + 1,
      idx: cur.idx + 1,
      cost: cur.cost, value: cur.value,
      ub: upperBound(sorted, cur.idx + 1, cur.cost, cur.value, budget),
      included: [...cur.included],
      branch: 'excl',
    };
    if (exclNode.ub >= best) queue.push(exclNode);
  }

  return { best, bestItems, nodes, trace };
}

export function knapsackBnB(crops, budget) {
  const sorted = [...crops].sort((a, b) =>
    (b.expectedYield / b.packageCost) - (a.expectedYield / a.packageCost)
  );
  const FIFO = runBnB(sorted, budget, 'FIFO');
  const LIFO = runBnB(sorted, budget, 'LIFO');
  const LC   = runBnB(sorted, budget, 'LC');
  return { optimal: Math.max(FIFO.best, LIFO.best, LC.best), FIFO, LIFO, LC };
}
