/**
 * Multistage Graph DP — Season Phase Optimizer
 * Module 4: Dynamic Programming
 * For each plot, finds the optimal crop sequence across 3 phases
 */
export function multistageGraph(plot, availableCrops, phases) {
  // Filter crops compatible with this plot's soil
  const compatible = availableCrops.filter(c =>
    c.compatibleSoilTypes.includes(plot.soilType)
  );

  // States: null = fallow
  const cropOptions = [null, ...compatible];

  // Build stage nodes: each node = { cropId, soilFertility }
  // Stage 0 = start (before season), stages 1-3 = phases
  const numPhases = phases.length;
  const stages = [];

  // Stage 0: initial state
  stages.push([{ cropId: null, soilFertility: plot.fertility, cumYield: 0, path: [] }]);

  const trace = { stages: [], optimalPath: [], totalYield: 0 };

  for (let s = 0; s < numPhases; s++) {
    const prevNodes = stages[s];
    const nextNodes = [];
    const stageTrace = { stage: s + 1, nodes: [] };

    for (const option of cropOptions) {
      // Phase planting window check
      const phase = phases[s];
      if (option && (option.plantingWindow.endWeek < phase.startWeek ||
                     option.plantingWindow.startWeek > phase.endWeek)) continue;

      let bestYield = -Infinity;
      let bestPrev  = null;

      for (const prev of prevNodes) {
        // Rotation constraint: no same family consecutively
        const prevCrop = prev.path.length > 0 ? prev.path[prev.path.length - 1] : null;
        if (option && prevCrop) {
          const prevCropObj = compatible.find(c => c.id === prevCrop);
          if (prevCropObj && prevCropObj.family === option.family) continue;
        }

        const drain     = option ? (option.soilFertilityDrain || 0) : 0;
        const newFert   = Math.max(0, prev.soilFertility - drain);
        const yieldGain = option ? Math.round(option.expectedYield * plot.area * (newFert / 100)) : 0;
        const totalYield = prev.cumYield + yieldGain;

        if (totalYield > bestYield) {
          bestYield = totalYield;
          bestPrev  = { ...prev, newFert, yieldGain, drain };
        }
      }

      if (bestPrev !== null) {
        const drain   = option ? (option.soilFertilityDrain || 0) : 0;
        const newFert = Math.max(0, bestPrev.soilFertility - drain);
        const node = {
          cropId:        option ? option.id : null,
          cropName:      option ? option.name : 'Fallow',
          soilFertility: newFert,
          cumYield:      bestYield,
          path:          [...bestPrev.path, option ? option.id : null],
          yieldThisPhase:bestPrev.yieldGain || 0,
        };
        nextNodes.push(node);
        stageTrace.nodes.push({ cropName: node.cropName, soilAfter: newFert, cumYield: bestYield });
      }
    }

    stages.push(nextNodes);
    trace.stages.push(stageTrace);
  }

  // Find optimal end node
  const lastStage = stages[numPhases];
  const optimal = lastStage.reduce((best, n) => n.cumYield > best.cumYield ? n : best, lastStage[0] || { cumYield: 0, path: [] });

  trace.optimalPath = optimal.path;
  trace.totalYield  = optimal.cumYield;
  trace.soilEnd     = optimal.soilFertility;

  return { optimalPath: optimal.path, totalYield: optimal.cumYield, stages, trace };
}
