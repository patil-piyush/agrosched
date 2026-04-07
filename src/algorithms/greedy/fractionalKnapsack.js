/**
 * Fractional Knapsack — Weekly Water Allocation
 * Module 3: Greedy
 */

export function fractionalKnapsack(activeAssignments, weeklyWater) {
  if (!activeAssignments || activeAssignments.length === 0) {
    return { allocations: [], totalAllocated: 0, yieldImpact: 0, efficiency: 100, trace: [] };
  }

  // Add ratio: yield per litre
  const items = activeAssignments.map(a => ({
    ...a,
    ratio: +(a.yieldContrib / a.demand).toFixed(3),
  }));

  // Sort by ratio descending
  items.sort((a, b) => b.ratio - a.ratio);

  let remaining = weeklyWater;
  let totalYield = 0;
  let fullYield  = 0;
  const allocations = [];
  const trace = [];

  items.forEach((item, i) => {
    fullYield += item.yieldContrib;
    const take     = Math.min(item.demand, remaining);
    const fraction = item.demand > 0 ? take / item.demand : 0;
    const yieldGot = fraction * item.yieldContrib;
    totalYield += yieldGot;
    remaining  -= take;

    allocations.push({ ...item, allocated: Math.round(take), fraction: +fraction.toFixed(3), yieldGot: Math.round(yieldGot) });
    trace.push({
      step: i + 1,
      name:      item.name || item.id,
      demand:    item.demand,
      ratio:     item.ratio,
      allocated: Math.round(take),
      fraction:  +fraction.toFixed(3),
      remaining: Math.round(remaining),
    });
  });

  return {
    allocations,
    totalAllocated: weeklyWater - remaining,
    yieldImpact:    Math.round(fullYield - totalYield),
    efficiency:     fullYield > 0 ? +((totalYield / fullYield) * 100).toFixed(1) : 100,
    trace,
  };
}

// Build active assignments for a given week from job schedule
export function buildWeeklyAssignments(jobAssignments, week) {
  return jobAssignments
    .filter(a => a.plantWeek <= week && a.harvestWeek > week)
    .map(a => ({
      id:          a.id,
      name:        `${a.cropName} @ ${a.plotName}`,
      demand:      Math.round(a.waterPerWeek),
      yieldContrib:Math.round(a.profit / a.growthDurationWeeks),
      ratio:       +(a.profit / (a.waterPerWeek * a.growthDurationWeeks)).toFixed(3),
    }));
}
