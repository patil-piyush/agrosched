import React, { useMemo } from 'react';

const NODE_STYLES = {
  source:   { fill:'#1565C0', stroke:'#0D47A1', r:22, textColor:'#fff' },
  junction: { fill:'#78909C', stroke:'#455A64', r:16, textColor:'#fff' },
  plot:     { fill:'#52B788', stroke:'#2D6A4F', r:18, textColor:'#fff' },
};

export default function GraphVisualizer({ network, trace, currentStep, efficiency }) {
  if (!network) return null;
  const { nodes, edges } = network;

  const frame      = trace?.[currentStep];
  const current    = frame?.current;

  // Accumulate visited + path edges up to currentStep
  const { allVisited, pathEdgeSet } = useMemo(() => {
    const vis  = new Set();
    const path = new Set();
    if (!trace || currentStep < 0) return { allVisited: vis, pathEdgeSet: path };
    trace.slice(0, currentStep + 1).forEach(f => {
      (f.visited || []).forEach(v => vis.add(v));
      (f.relaxed || []).forEach(r => {
        const to = typeof r === 'string' ? r : r.to;
        path.add(`${f.current}|${to}`);
        path.add(`${to}|${f.current}`); // undirected highlight
      });
    });
    return { allVisited: vis, pathEdgeSet: path };
  }, [trace, currentStep]);

  function getNodeFill(node) {
    if (node.id === current)            return '#F4A261';
    if (allVisited.has(node.id))        return '#52B788';
    return NODE_STYLES[node.type]?.fill || '#78909C';
  }
  function getNodeStroke(node) {
    if (node.id === current)            return '#E65100';
    if (allVisited.has(node.id))        return '#2D6A4F';
    return NODE_STYLES[node.type]?.stroke || '#455A64';
  }

  // Fit all nodes into a 620×320 viewport
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 620, H = 320, PAD = 40;
  const scaleX = (maxX - minX) > 0 ? (W - PAD*2) / (maxX - minX) : 1;
  const scaleY = (maxY - minY) > 0 ? (H - PAD*2) / (maxY - minY) : 1;
  const scale  = Math.min(scaleX, scaleY);
  const px = n => PAD + (n.x - minX) * scale;
  const py = n => PAD + (n.y - minY) * scale;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>

        {/* All edges — always visible as solid lines (this IS a network graph) */}
        {edges.map((e, i) => {
          const from = nodes.find(n => n.id === e.from);
          const to   = nodes.find(n => n.id === e.to);
          if (!from || !to) return null;
          const isPath = pathEdgeSet.has(`${e.from}|${e.to}`);
          return (
            <g key={i}>
              <line
                x1={px(from)} y1={py(from)} x2={px(to)} y2={py(to)}
                stroke={isPath ? '#2D6A4F' : '#B0BEC5'}
                strokeWidth={isPath ? 3 : 1.8}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
              {/* Weight badge */}
              <rect
                x={(px(from)+px(to))/2 - 14} y={(py(from)+py(to))/2 - 8}
                width={28} height={14} rx={3}
                fill="white" fillOpacity={0.85}
              />
              <text
                x={(px(from)+px(to))/2} y={(py(from)+py(to))/2 + 1}
                fontSize={8} fill={isPath ? '#2D6A4F' : '#78909C'}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="JetBrains Mono" fontWeight={isPath ? '700' : '400'}
              >
                {(e.efficiencyLoss ?? 0).toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const r    = NODE_STYLES[node.type]?.r || 18;
          const fill = getNodeFill(node);
          const strk = getNodeStroke(node);
          const eff  = efficiency?.[node.id];

          return (
            <g key={node.id}
              style={node.id === current ? { animation: 'nodePulse 0.7s ease-in-out infinite' } : {}}>
              <circle
                cx={px(node)} cy={py(node)} r={r}
                fill={fill} stroke={strk} strokeWidth={node.id === current ? 3 : 2}
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />
              <text
                x={px(node)} y={py(node)} textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fontWeight="700" fill="#fff" fontFamily="Inter"
              >
                {(node.label || node.id).replace('Junction ', 'J').replace('Plot ', 'P').replace('Borewell','SRC')}
              </text>
              {/* Efficiency label below node when computed */}
              {eff !== undefined && allVisited.has(node.id) && (
                <text
                  x={px(node)} y={py(node) + r + 11}
                  textAnchor="middle" fontSize={9}
                  fill="#2D6A4F" fontWeight="700"
                >
                  {eff}%
                </text>
              )}
            </g>
          );
        })}

        {/* Current step label */}
        {frame && (
          <text x={8} y={H - 8} fontSize={10} fill="#78909C" fontFamily="JetBrains Mono">
            Step {currentStep + 1}/{trace.length}: processing {frame.current}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-white flex-wrap">
        {[['Source','#1565C0'],['Junction','#78909C'],['Plot','#52B788'],['Current','#F4A261'],['Visited','#52B788'],['Shortest path','#2D6A4F']].map(([l,c])=>(
          <span key={l} className="flex items-center gap-1">
            <span style={{width:10,height:10,background:c,borderRadius:'50%',display:'inline-block'}}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
