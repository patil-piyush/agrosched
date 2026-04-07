/**
 * Knapsack via Backtracking — Comparison Run
 * Module 5: Backtracking
 */
export function knapsackBacktrack(crops, budget, pruning = true) {
  let nodes     = 0;
  let bestValue = 0;
  let bestSet   = [];
  const trace   = [];

  function bt(idx, currentCost, currentValue, chosen) {
    nodes++;
    if (nodes > 2000) return; // safety cap for display

    trace.push({
      node:  nodes,
      idx,
      cost:  currentCost,
      value: currentValue,
      chosen:[...chosen],
      status:'explore',
    });

    // Update best
    if (currentValue > bestValue) {
      bestValue = currentValue;
      bestSet   = [...chosen];
    }

    if (idx >= crops.length) return;

    // Pruning: upper bound = current + remaining fractional value
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
        trace.push({ node: nodes, idx, cost: currentCost, value: currentValue, chosen:[...chosen], status:'pruned', reason:'UB ≤ best' });
        return;
      }
    }

    // Include crop[idx]
    if (currentCost + crops[idx].packageCost <= budget) {
      bt(idx + 1, currentCost + crops[idx].packageCost, currentValue + crops[idx].expectedYield, [...chosen, crops[idx].id]);
    }

    // Exclude
    bt(idx + 1, currentCost, currentValue, [...chosen]);
  }

  bt(0, 0, 0, []);

  return {
    bestValue,
    bestSet,
    nodes,
    trace,
    pruning,
  };
}
