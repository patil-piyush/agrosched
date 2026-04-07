/**
 * Branch and Bound TSP — Plot Inspection Tour
 * Module 6: Branch and Bound (LC with reduced cost matrix)
 */

function calcDist(a, b) {
  return +Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2).toFixed(1);
}

function buildDistMatrix(points) {
  const n = points.length;
  const d = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => i === j ? 0 : calcDist(points[i], points[j]))
  );
  return d;
}

function lowerBound(dist, visited, current, n) {
  // Simple lower bound: sum of min outgoing edges from unvisited nodes
  let lb = 0;
  for (let i = 0; i < n; i++) {
    if (visited.has(i) && i !== current) continue;
    let minEdge = Infinity;
    for (let j = 0; j < n; j++) {
      if (i !== j && dist[i][j] < minEdge) minEdge = dist[i][j];
    }
    if (minEdge < Infinity) lb += minEdge;
  }
  return lb;
}

export function tspBnB(plotCoordinates) {
  const n      = plotCoordinates.length;
  const dist   = buildDistMatrix(plotCoordinates);
  const labels  = plotCoordinates.map(p => p.label);

  let bestCost = Infinity;
  let bestTour = [];
  let nodes    = 0;
  const trace  = [];

  // Priority queue (min-cost) using simple array + sort
  let pq = [{
    tour: [0],
    visited: new Set([0]),
    cost: 0,
    lb: lowerBound(dist, new Set([0]), 0, n),
  }];

  while (pq.length > 0 && nodes < 500) {
    // LC: pick node with min cost + lb
    pq.sort((a, b) => (a.cost + a.lb) - (b.cost + b.lb));
    const cur = pq.shift();
    nodes++;

    const { tour, visited, cost } = cur;
    const last = tour[tour.length - 1];

    trace.push({
      node:  nodes,
      tour:  tour.map(i => labels[i]),
      cost:  +cost.toFixed(1),
      lb:    +cur.lb.toFixed(1),
      status: 'explore',
    });

    if (tour.length === n) {
      // Complete tour: return to start
      const total = cost + dist[last][0];
      if (total < bestCost) {
        bestCost = total;
        bestTour = [...tour, 0];
        trace[trace.length - 1].status = 'complete';
        trace[trace.length - 1].total  = +total.toFixed(1);
      }
      continue;
    }

    // Pruning
    if (cost + cur.lb >= bestCost) {
      trace[trace.length - 1].status = 'pruned';
      continue;
    }

    // Branch: try each unvisited city
    for (let next = 1; next < n; next++) {
      if (visited.has(next)) continue;
      const newCost = cost + dist[last][next];
      const newVis  = new Set([...visited, next]);
      const newLB   = lowerBound(dist, newVis, next, n);

      if (newCost + newLB < bestCost) {
        pq.push({
          tour:    [...tour, next],
          visited: newVis,
          cost:    newCost,
          lb:      newLB,
        });
      }
    }
  }

  const tourLabels = bestTour.map(i => labels[i]);
  const tourCoords = bestTour.map(i => plotCoordinates[i]);

  return {
    tour: tourLabels,
    tourCoords,
    cost: +bestCost.toFixed(1),
    nodes,
    trace,
    distMatrix: dist,
    labels,
  };
}
