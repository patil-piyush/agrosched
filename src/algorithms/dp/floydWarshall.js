/**
 * Floyd-Warshall — All-Pairs Irrigation Paths
 * Module 4: Dynamic Programming
 */
export function floydWarshall(network) {
  const { nodes, edges } = network;
  const n     = nodes.length;
  const ids   = nodes.map(nd => nd.id);
  const idx   = Object.fromEntries(ids.map((id, i) => [id, i]));

  // Init dist and next matrices
  const INF  = Infinity;
  const dist = Array.from({ length: n }, () => new Array(n).fill(INF));
  const next = Array.from({ length: n }, () => new Array(n).fill(null));

  for (let i = 0; i < n; i++) { dist[i][i] = 0; }

  edges.forEach(e => {
    const u = idx[e.from], v = idx[e.to];
    if (e.efficiencyLoss < dist[u][v]) {
      dist[u][v] = e.efficiencyLoss;
      dist[v][u] = e.efficiencyLoss;
      next[u][v] = v;
      next[v][u] = u;
    }
  });

  const trace = [];

  for (let k = 0; k < n; k++) {
    const updated = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = +(dist[i][k] + dist[k][j]).toFixed(4);
          next[i][j] = next[i][k];
          updated.push([ids[i], ids[j]]);
        }
      }
    }
    trace.push({
      k,
      kLabel: ids[k],
      matrix: dist.map(row => row.map(v => v === INF ? '∞' : +v.toFixed(3))),
      updated,
    });
  }

  // Path reconstruction helper
  function getPath(from, to) {
    const u = idx[from], v = idx[to];
    if (next[u][v] === null) return [];
    const path = [from];
    let cur = u;
    while (cur !== v) {
      cur = next[cur][v];
      if (cur === null) return [];
      path.push(ids[cur]);
    }
    return path;
  }

  return {
    dist,
    next,
    ids,
    trace,
    getPath,
    displayMatrix: dist.map(row => row.map(v => v === INF ? '∞' : +v.toFixed(3))),
  };
}
