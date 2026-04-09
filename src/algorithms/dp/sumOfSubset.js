/**
 * Sum of Subset — Zero-Waste Water Check
 * Module 4: Dynamic Programming (backtracking with memoization + trace)
 * Fixed: no module-level mutable globals (was breaking React StrictMode)
 */

function sosRec(demands, idx, currentSum, target, path, state) {
  if (state.found) return;
  const nodeId = ++state.nodeCounter;

  if (currentSum === target) {
    state.found    = true;
    state.solution = [...path];
    state.trace.push({ nodeId, idx, currentSum, status: 'found', path: [...path] });
    return;
  }
  if (idx >= demands.length || currentSum > target) {
    state.trace.push({
      nodeId, idx, currentSum,
      status: currentSum > target ? 'pruned' : 'exhausted',
      path: [...path],
    });
    return;
  }

  // Include
  state.trace.push({ nodeId, idx, currentSum, include: demands[idx], status: 'include', path: [...path] });
  sosRec(demands, idx + 1, currentSum + demands[idx], target, [...path, demands[idx]], state);

  // Exclude
  if (!state.found) {
    const exNodeId = ++state.nodeCounter;
    state.trace.push({ nodeId: exNodeId, idx, currentSum, exclude: demands[idx], status: 'exclude', path: [...path] });
    sosRec(demands, idx + 1, currentSum, target, [...path], state);
  }
}

export function sumOfSubset(demands, target) {
  const state = { found: false, solution: [], trace: [], nodeCounter: 0 };
  // Limit demands to avoid exponential blowup in UI
  const limited = demands.slice(0, 10);
  sosRec(limited, 0, 0, target, [], state);
  return { found: state.found, subset: state.solution, target, trace: state.trace };
}

export function buildWaterDemands(assignments) {
  return assignments.map(a => Math.round(a.waterPerWeek || a.demand || 0)).filter(Boolean);
}
