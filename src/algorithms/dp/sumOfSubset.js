/**
 * Sum of Subset — Zero-Waste Water Check
 * Module 4: Dynamic Programming (recursive with memoization + trace)
 */
let _trace = [];
let _found = false;
let _solution = [];
let _nodeId = 0;

function sosRec(demands, idx, currentSum, target, path) {
  if (_found) return;
  const nodeId = ++_nodeId;

  if (currentSum === target) {
    _found = true;
    _solution = [...path];
    _trace.push({ nodeId, idx, currentSum, remaining: demands.slice(idx), status: 'found', path: [...path] });
    return;
  }
  if (idx >= demands.length || currentSum > target) {
    _trace.push({ nodeId, idx, currentSum, remaining: demands.slice(idx), status: currentSum > target ? 'pruned' : 'exhausted', path: [...path] });
    return;
  }

  // Include
  _trace.push({ nodeId, idx, currentSum, include: demands[idx], remaining: demands.slice(idx + 1), status: 'include', path: [...path] });
  sosRec(demands, idx + 1, currentSum + demands[idx], target, [...path, demands[idx]]);

  // Exclude
  if (!_found) {
    _trace.push({ nodeId: ++_nodeId, idx, currentSum, exclude: demands[idx], remaining: demands.slice(idx + 1), status: 'exclude', path: [...path] });
    sosRec(demands, idx + 1, currentSum, target, [...path]);
  }
}

export function sumOfSubset(demands, target) {
  _trace   = [];
  _found   = false;
  _solution = [];
  _nodeId  = 0;

  sosRec(demands, 0, 0, target, []);

  return { found: _found, subset: _solution, target, trace: [..._trace] };
}

// Build water demands from active assignments
export function buildWaterDemands(assignments) {
  return assignments.map(a => Math.round(a.waterPerWeek || a.demand || 0));
}
