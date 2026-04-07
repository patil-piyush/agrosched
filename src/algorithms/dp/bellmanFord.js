/**
 * Bellman-Ford — Degrading Pipe Routing
 * Module 4: Dynamic Programming
 */
export function bellmanFord(network, sourceId = 'SOURCE', week = 1) {
  const { nodes, edges } = network;
  const n   = nodes.length;
  const ids = nodes.map(nd => nd.id);

  // Apply week-based degradation
  const degradedEdges = edges.flatMap(e => {
    const w = +(e.efficiencyLoss + e.degradationRate * week).toFixed(4);
    return [
      { from: e.from, to: e.to, weight: w },
      { from: e.to, to: e.from, weight: w },
    ];
  });

  const dist = Object.fromEntries(ids.map(id => [id, Infinity]));
  const prev = Object.fromEntries(ids.map(id => [id, null]));
  dist[sourceId] = 0;

  const trace = [];

  // N-1 relaxation passes
  for (let pass = 1; pass <= n - 1; pass++) {
    const relaxations = [];
    let updated = false;
    for (const e of degradedEdges) {
      if (dist[e.from] + e.weight < dist[e.to]) {
        const old = dist[e.to];
        dist[e.to] = +(dist[e.from] + e.weight).toFixed(4);
        prev[e.to] = e.from;
        relaxations.push({ edge: `${e.from}→${e.to}`, oldDist: old === Infinity ? '∞' : old, newDist: dist[e.to], updated: true });
        updated = true;
      } else {
        relaxations.push({ edge: `${e.from}→${e.to}`, oldDist: dist[e.to] === Infinity ? '∞' : dist[e.to], newDist: dist[e.to] === Infinity ? '∞' : dist[e.to], updated: false });
      }
    }
    trace.push({ pass, relaxations, updated });
    if (!updated) break; // early termination
  }

  // Negative cycle detection
  let negativeCycleDetected = false;
  for (const e of degradedEdges) {
    if (dist[e.from] + e.weight < dist[e.to]) {
      negativeCycleDetected = true;
      break;
    }
  }

  trace.push({ pass: 'check', negativeCycleDetected });

  // Efficiency per plot
  const efficiency = {};
  nodes.filter(nd => nd.type === 'plot').forEach(nd => {
    efficiency[nd.id] = dist[nd.id] === Infinity ? 0 : +((1 - dist[nd.id]) * 100).toFixed(1);
  });

  return {
    distances: Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, v === Infinity ? '∞' : v])),
    efficiency,
    negativeCycleDetected,
    trace,
    week,
  };
}
