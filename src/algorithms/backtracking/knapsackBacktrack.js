/**
 * Knapsack via Backtracking — Comparison Run
 * Module 5: Backtracking
 * Trace includes nodeId + parentNodeId for proper tree rendering
 */
export function knapsackBacktrack(crops, budget, pruning = true) {
  let nodeCounter = 0;
  let bestValue   = 0;
  let bestSet     = [];
  const trace     = [];

  function bt(idx, currentCost, currentValue, chosen, parentNodeId, depth) {
    const nodeId = ++nodeCounter;
    if (nodeCounter > 300) return; // safety cap for display

    trace.push({
      nodeId, parentNodeId, depth,
      idx, cost: currentCost, value: currentValue,
      label: idx < crops.length ? crops[idx].name : 'leaf',
      chosen: [...chosen],
      status: 'explore',
    });

    if (currentValue > bestValue) {
      bestValue = currentValue;
      bestSet   = [...chosen];
    }
    if (idx >= crops.length) return;

    // Pruning: upper bound
    if (pruning) {
      let ub  = currentValue;
      let cap = budget - currentCost;
      for (let i = idx; i < crops.length && cap > 0; i++) {
        if (crops[i].packageCost <= cap) {
          ub  += crops[i].expectedYield;
          cap -= crops[i].packageCost;
        } else {
          ub += (cap / crops[i].packageCost) * crops[i].expectedYield;
          cap = 0;
        }
      }
      if (ub <= bestValue) {
        const pruneId = ++nodeCounter;
        trace.push({
          nodeId: pruneId, parentNodeId: nodeId, depth: depth + 1,
          idx, cost: currentCost, value: currentValue,
          label: 'pruned', status: 'pruned', reason: 'UB ≤ best',
        });
        return;
      }
    }

    // Include branch
    if (currentCost + crops[idx].packageCost <= budget) {
      bt(idx + 1, currentCost + crops[idx].packageCost,
         currentValue + crops[idx].expectedYield,
         [...chosen, crops[idx].id], nodeId, depth + 1);
    }
    // Exclude branch
    bt(idx + 1, currentCost, currentValue, [...chosen], nodeId, depth + 1);
  }

  bt(0, 0, 0, [], null, 0);

  return { bestValue, bestSet, nodes: nodeCounter, trace, pruning };
}
