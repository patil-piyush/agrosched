/**
 * Binary Search on the Answer — Minimum Water Threshold
 * Module 2: Divide and Conquer
 * Finds min weekly water needed to achieve a target yield
 */

// Helper: run fractional knapsack given water supply
function computeYieldAtWater(assignments, water) {
  if (!assignments || assignments.length === 0) return 0;
  const sorted = [...assignments].sort((a, b) => b.ratio - a.ratio);
  let remaining = water;
  let totalYield = 0;
  for (const item of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(item.demand, remaining);
    totalYield += (take / item.demand) * item.yieldContrib;
    remaining -= take;
  }
  return Math.round(totalYield);
}

export function binarySearch(assignments, targetYield, maxWater = 50000) {
  const trace = [];
  let low  = 1000;
  let high = maxWater;
  let result = maxWater;
  let step = 0;

  while (low <= high) {
    step++;
    const mid = Math.floor((low + high) / 2);
    const yieldAtMid = computeYieldAtWater(assignments, mid);
    const decision = yieldAtMid >= targetYield ? 'go_lower' : 'go_higher';

    trace.push({ step, low, high, mid, yieldAtMid, targetYield, decision });

    if (yieldAtMid >= targetYield) {
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return { minWater: result, achievedYield: computeYieldAtWater(assignments, result), trace };
}

// Build assignments from farm data for binary search input
export function buildAssignmentsForBS(selectedCrops, plots) {
  const assignments = [];
  selectedCrops.forEach((crop, i) => {
    const plot = plots[i % plots.length];
    assignments.push({
      id:          `${crop.id}-${plot.id}`,
      name:        `${crop.name} @ ${plot.name}`,
      demand:      crop.waterPerWeek * plot.area,
      yieldContrib:crop.expectedYield * plot.area,
      ratio:       crop.expectedYield / crop.waterPerWeek,
    });
  });
  return assignments;
}
