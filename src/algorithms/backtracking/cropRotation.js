/**
 * Crop Rotation — Backtracking (Graph Coloring)
 * Module 5: Backtracking
 * Trace now includes nodeId + parentId for proper tree rendering
 */

function isValid(plotIdx, cropId, assignment, plots, crops) {
  const plot = plots[plotIdx];
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return { valid: false, reason: 'Crop not found' };
  if (!crop.compatibleSoilTypes.includes(plot.soilType))
    return { valid: false, reason: `Soil incompatible (${plot.soilType} ≠ ${crop.compatibleSoilTypes.join('/')})` };
  for (const adjId of (plot.adjacent || [])) {
    const adjIdx = plots.findIndex(p => p.id === adjId);
    if (adjIdx !== -1 && assignment[adjIdx] === cropId)
      return { valid: false, reason: `Adjacent plot ${adjId} already has ${crop.name}` };
  }
  for (const prevCropId of (plot.soilHistory || [])) {
    const prevCrop = crops.find(c => c.id === prevCropId);
    if (prevCrop && prevCrop.family === crop.family)
      return { valid: false, reason: `Same family (${crop.family}) as previous crop` };
  }
  const lastHistory = plot.soilHistory?.[plot.soilHistory.length - 1];
  if (lastHistory && crop.incompatibleAfter?.includes(lastHistory))
    return { valid: false, reason: `${crop.name} cannot follow previous crop` };
  return { valid: true };
}

export function cropRotation(plots, crops) {
  const trace = [];
  let nodeCounter = 0;

  // Stack of { plotIdx, assignment, parentNodeId, depth }
  // We use an explicit call stack simulation so we can emit proper parentId
  function bt(plotIdx, assignment, parentNodeId, depth) {
    if (plotIdx === plots.length) return true;

    const validCropsForPlot = crops.filter(c => c.plantingWindow.startWeek <= 8);

    for (const crop of validCropsForPlot) {
      const nodeId = ++nodeCounter;
      const check  = isValid(plotIdx, crop.id, assignment, plots, crops);

      if (check.valid) {
        assignment[plotIdx] = crop.id;
        trace.push({
          nodeId, parentNodeId, depth,
          plotId:   plots[plotIdx].id,
          plotName: plots[plotIdx].name,
          cropId:   crop.id,
          cropName: crop.name,
          label:    `${plots[plotIdx].id}=${crop.name}`,
          status:   'assigned',
          assignment: [...assignment],
        });

        if (bt(plotIdx + 1, assignment, nodeId, depth + 1)) return true;

        // Backtrack
        const btNodeId = ++nodeCounter;
        trace.push({
          nodeId: btNodeId, parentNodeId: nodeId, depth: depth + 1,
          plotId:   plots[plotIdx].id,
          plotName: plots[plotIdx].name,
          cropId:   crop.id,
          cropName: crop.name,
          label:    `↩ ${crop.name}`,
          status:   'backtrack',
          assignment: [...assignment],
        });
        assignment[plotIdx] = null;
      } else {
        trace.push({
          nodeId, parentNodeId, depth,
          plotId:   plots[plotIdx].id,
          plotName: plots[plotIdx].name,
          cropId:   crop.id,
          cropName: crop.name,
          label:    `${plots[plotIdx].id}≠${crop.name}`,
          status:   'failed',
          reason:   check.reason,
          assignment: [...assignment],
        });
      }
    }
    return false;
  }

  const assignment = new Array(plots.length).fill(null);
  const success = bt(0, assignment, null, 0);

  return {
    success,
    assignment: success ? assignment : null,
    assignmentMap: success
      ? Object.fromEntries(plots.map((p, i) => [p.id, assignment[i]]))
      : {},
    trace,
  };
}
