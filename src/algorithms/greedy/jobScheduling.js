/**
 * Job Scheduling with Deadlines — Planting Window Scheduler
 * Module 3: Greedy
 */

export function jobScheduling(selectedCrops, plots, totalWeeks = 24) {
  const trace = [];
  // Each (crop, plot) pair = a job. Profit = expectedYield. Deadline = crop.plantingWindow.endWeek
  const jobs = [];
  selectedCrops.forEach(crop => {
    plots.forEach(plot => {
      if (!crop.compatibleSoilTypes.includes(plot.soilType)) return;
      jobs.push({
        id:       `${crop.id}-${plot.id}`,
        cropId:   crop.id,
        cropName: crop.name,
        plotId:   plot.id,
        plotName: plot.name,
        profit:   Math.round(crop.expectedYield * plot.area),
        deadline: crop.plantingWindow.endWeek,
        startWeek:crop.plantingWindow.startWeek,
        growthDurationWeeks: crop.growthDurationWeeks,
        waterPerWeek: crop.waterPerWeek * plot.area,
      });
    });
  });

  // Sort by profit descending
  jobs.sort((a, b) => b.profit - a.profit);

  // Slot matrix: plotId -> Set of used weeks
  const slotMatrix = {};
  plots.forEach(p => { slotMatrix[p.id] = new Set(); });
  const assignments = [];
  const rejected    = [];

  jobs.forEach((job, idx) => {
    // Find latest available slot <= deadline for this plot
    let assigned = null;
    for (let w = job.deadline; w >= job.startWeek; w--) {
      if (!slotMatrix[job.plotId].has(w)) {
        assigned = w;
        break;
      }
    }

    if (assigned !== null) {
      slotMatrix[job.plotId].add(assigned);
      assignments.push({ ...job, plantWeek: assigned, harvestWeek: assigned + job.growthDurationWeeks });
      trace.push({ step: idx + 1, job: job.id, cropName: job.cropName, plotName: job.plotName, profit: job.profit, deadline: job.deadline, slotAssigned: assigned, status: 'scheduled' });
    } else {
      rejected.push(job);
      trace.push({ step: idx + 1, job: job.id, cropName: job.cropName, plotName: job.plotName, profit: job.profit, deadline: job.deadline, slotAssigned: null, status: 'rejected', reason: 'No slot available before deadline' });
    }
  });

  const totalYield = assignments.reduce((s, a) => s + a.profit, 0);

  return { assignments, rejected, totalYield, trace };
}
