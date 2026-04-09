/**
 * Binary Search on the Answer — Minimum Water Threshold
 * Module 2: Divide and Conquer
 * A2 Fix: maxWater now derived from farm.weeklyWater * 2 (not hardcoded 50000)
 */

function computeYieldAtWater(assignments, water) {
  if (!assignments || assignments.length === 0) return 0;
  const sorted = [...assignments].sort((a, b) => b.ratio - a.ratio);
  let remaining = water, totalYield = 0;
  for (const item of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(item.demand, remaining);
    totalYield += (take / item.demand) * item.yieldContrib;
    remaining  -= take;
  }
  return Math.round(totalYield);
}

export function binarySearch(assignments, targetYield, maxWater = 50000) {
  const trace = [];
  let low = 1000, high = maxWater, result = maxWater, step = 0;

  while (low <= high) {
    step++;
    const mid        = Math.floor((low + high) / 2);
    const yieldAtMid = computeYieldAtWater(assignments, mid);
    const decision   = yieldAtMid >= targetYield ? 'go_lower' : 'go_higher';
    trace.push({ step, low, high, mid, yieldAtMid, targetYield, decision });

    if (yieldAtMid >= targetYield) { result = mid; high = mid - 1; }
    else                           { low    = mid + 1; }
  }

  return { minWater: result, achievedYield: computeYieldAtWater(assignments, result), trace };
}

export function buildAssignmentsForBS(selectedCrops, plots) {
  return selectedCrops.map((crop, i) => {
    const plot = plots[i % plots.length];
    return {
      id:          `${crop.id}-${plot.id}`,
      name:        `${crop.name} @ ${plot.name}`,
      demand:      Math.round(crop.waterPerWeek * plot.area),
      yieldContrib:Math.round(crop.expectedYield * plot.area),
      ratio:       +(crop.expectedYield / crop.waterPerWeek).toFixed(3),
    };
  });
}
