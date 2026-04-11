/**
 * Sum of Subset — Zero-Waste Water Check
 * Trace emits nodeId + parentNodeId for proper tree rendering
 */
function sosRec(demands, idx, currentSum, target, path, state, parentNodeId) {
  if (state.found || state.nodeCounter > 120) return;
  const nodeId = ++state.nodeCounter;

  if (currentSum === target) {
    state.found = true;
    state.solution = [...path];
    state.trace.push({ nodeId, parentNodeId, depth: idx, idx, currentSum, status: 'found',
      label: `${currentSum}L`, path: [...path] });
    return;
  }
  if (idx >= demands.length || currentSum > target) {
    state.trace.push({ nodeId, parentNodeId, depth: idx, idx, currentSum,
      status: currentSum > target ? 'pruned' : 'exhausted',
      label: currentSum > target ? `${currentSum}L` : `done`, path: [...path] });
    return;
  }

  // Emit current node
  state.trace.push({ nodeId, parentNodeId, depth: idx, idx, currentSum,
    status: 'explore', label: `${currentSum}L`, path: [...path] });

  // Include branch
  sosRec(demands, idx + 1, currentSum + demands[idx], target,
         [...path, demands[idx]], state, nodeId);

  // Exclude branch
  if (!state.found) {
    sosRec(demands, idx + 1, currentSum, target, [...path], state, nodeId);
  }
}

export function sumOfSubset(demands, target) {
  const state = { found: false, solution: [], trace: [], nodeCounter: 0 };
  const limited = demands.slice(0, 9);
  sosRec(limited, 0, 0, target, [], state, null);
  return { found: state.found, subset: state.solution, target, trace: state.trace };
}

export function buildWaterDemands(assignments) {
  return assignments.map(a => Math.round(a.waterPerWeek || a.demand || 0)).filter(Boolean);
}
