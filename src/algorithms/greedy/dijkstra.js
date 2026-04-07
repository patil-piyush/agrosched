/**
 * Dijkstra's Algorithm — Irrigation Path Efficiency
 * Module 3: Greedy
 * Finds minimum-loss paths from SOURCE to all plot nodes
 */

export function dijkstra(network, sourceId = 'SOURCE') {
  const { nodes, edges } = network;
  const nodeIds = nodes.map(n => n.id);

  // Build adjacency list
  const adj = {};
  nodeIds.forEach(id => { adj[id] = []; });
  edges.forEach(e => {
    adj[e.from].push({ to: e.to,   weight: e.efficiencyLoss });
    // Undirected for backup routing
    adj[e.to].push({ to: e.from, weight: e.efficiencyLoss });
  });

  // Init distances
  const dist = {};
  const prev = {};
  const visited = new Set();
  nodeIds.forEach(id => { dist[id] = Infinity; prev[id] = null; });
  dist[sourceId] = 0;

  const trace = [];
  let step = 0;

  while (visited.size < nodeIds.length) {
    // Pick unvisited node with smallest dist (min-priority queue simulation)
    let u = null;
    let minD = Infinity;
    nodeIds.forEach(id => {
      if (!visited.has(id) && dist[id] < minD) { minD = dist[id]; u = id; }
    });
    if (u === null) break;

    visited.add(u);
    step++;

    const relaxed = [];
    adj[u].forEach(({ to, weight }) => {
      if (visited.has(to)) return;
      const newDist = dist[u] + weight;
      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = u;
        relaxed.push({ to, oldDist: dist[to] === newDist ? Infinity : dist[to], newDist: +newDist.toFixed(4) });
      }
    });

    trace.push({
      step,
      current:  u,
      visited:  [...visited],
      distances: Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, v === Infinity ? '∞' : +v.toFixed(4)])),
      relaxed,
    });
  }

  // Reconstruct paths
  const paths = {};
  const efficiency = {};
  nodes.filter(n => n.type === 'plot').forEach(n => {
    const path = [];
    let cur = n.id;
    while (cur) { path.unshift(cur); cur = prev[cur]; }
    paths[n.id]      = path;
    efficiency[n.id] = dist[n.id] === Infinity ? 0 : +((1 - dist[n.id]) * 100).toFixed(1);
  });

  return { distances: dist, paths, efficiency, trace };
}

// Apply week-based degradation for Bellman-Ford comparison
export function applyDegradation(network, week) {
  return {
    ...network,
    edges: network.edges.map(e => ({
      ...e,
      efficiencyLoss: +(e.efficiencyLoss + e.degradationRate * week).toFixed(4),
    })),
  };
}
