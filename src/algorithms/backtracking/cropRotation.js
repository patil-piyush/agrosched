/**
 * Crop Rotation — Backtracking (Graph Coloring)
 * Module 5: Backtracking
 * Assigns crops to plots respecting rotation & adjacency constraints
 */
let _trace = [];
let _step  = 0;

function isValid(plotIdx, cropId, assignment, plots, crops) {
  const plot = plots[plotIdx];
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return { valid: false, reason: 'Crop not found' };

  // Soil compatibility
  if (!crop.compatibleSoilTypes.includes(plot.soilType)) {
    return { valid: false, reason: `Soil incompatible (${plot.soilType} ≠ ${crop.compatibleSoilTypes.join('/')})` };
  }

  // Adjacent plots: no same crop
  for (const adjId of (plot.adjacent || [])) {
    const adjIdx = plots.findIndex(p => p.id === adjId);
    if (adjIdx !== -1 && assignment[adjIdx] === cropId) {
      return { valid: false, reason: `Adjacent plot ${adjId} already has ${crop.name}` };
    }
  }

  // No same family as previous in same plot
  for (const prevCropId of (plot.soilHistory || [])) {
    const prevCrop = crops.find(c => c.id === prevCropId);
    if (prevCrop && prevCrop.family === crop.family) {
      return { valid: false, reason: `Same family (${crop.family}) as previous crop` };
    }
  }

  // Incompatible-after check
  const lastHistory = plot.soilHistory?.[plot.soilHistory.length - 1];
  if (lastHistory && crop.incompatibleAfter?.includes(lastHistory)) {
    return { valid: false, reason: `${crop.name} cannot follow previous crop` };
  }

  return { valid: true };
}

function backtrack(plotIdx, assignment, plots, crops) {
  if (plotIdx === plots.length) return true;

  for (const crop of crops) {
    _step++;
    const check = isValid(plotIdx, crop.id, assignment, plots, crops);

    if (check.valid) {
      assignment[plotIdx] = crop.id;
      _trace.push({
        step:     _step,
        plotId:   plots[plotIdx].id,
        plotName: plots[plotIdx].name,
        cropId:   crop.id,
        cropName: crop.name,
        status:   'assigned',
        assignment: [...assignment],
      });

      if (backtrack(plotIdx + 1, assignment, plots, crops)) return true;

      // Backtrack
      _trace.push({
        step:     ++_step,
        plotId:   plots[plotIdx].id,
        plotName: plots[plotIdx].name,
        cropId:   crop.id,
        cropName: crop.name,
        status:   'backtrack',
        assignment: [...assignment],
      });
      assignment[plotIdx] = null;
    } else {
      _trace.push({
        step:     _step,
        plotId:   plots[plotIdx].id,
        plotName: plots[plotIdx].name,
        cropId:   crop.id,
        cropName: crop.name,
        status:   'failed',
        reason:   check.reason,
        assignment: [...assignment],
      });
    }
  }
  return false;
}

export function cropRotation(plots, crops) {
  _trace = [];
  _step  = 0;
  const assignment = new Array(plots.length).fill(null);

  // Filter to crops with valid planting windows
  const validCrops = crops.filter(c => c.plantingWindow.startWeek <= 8);

  const success = backtrack(0, assignment, plots, validCrops);

  return {
    success,
    assignment: success ? assignment : null,
    assignmentMap: success
      ? Object.fromEntries(plots.map((p, i) => [p.id, assignment[i]]))
      : {},
    trace: [..._trace],
  };
}
