import React, { useMemo } from 'react';

const NODE_STYLES = {
  source:   { fill:'#1565C0', stroke:'#0D47A1', r:20, textColor:'#fff' },
  junction: { fill:'#9E9E9E', stroke:'#616161', r:16, textColor:'#fff' },
  plot:     { fill:'#52B788', stroke:'#2D6A4F', r:18, textColor:'#fff' },
};

export default function GraphVisualizer({ network, trace, currentStep, efficiency }) {
  if (!network) return null;
  const { nodes, edges } = network;

  const frame = trace?.[currentStep];
  const visited  = new Set(frame?.visited || []);
  const current  = frame?.current;
  const relaxed  = new Set((frame?.relaxed || []).map(r => typeof r === 'string' ? r : r.to));

  // All visited up to this step
  const allVisited = useMemo(() => {
    if (!trace || currentStep < 0) return new Set();
    const s = new Set();
    trace.slice(0, currentStep + 1).forEach(f => (f.visited || []).forEach(v => s.add(v)));
    return s;
  }, [trace, currentStep]);

  const W = 620, H = 340;

  function getNodeStyle(node) {
    const base = NODE_STYLES[node.type] || NODE_STYLES.plot;
    if (node.id === current)         return { ...base, fill:'#F4A261', stroke:'#E65100' };
    if (allVisited.has(node.id))     return { ...base, fill:'#52B788', stroke:'#2D6A4F' };
    if (relaxed.has(node.id))        return { ...base, fill:'#FFE082', stroke:'#F9A825' };
    return base;
  }

  // Find shortest path edges
  const pathEdges = useMemo(() => {
    if (!trace || currentStep < 0) return new Set();
    const s = new Set();
    trace.slice(0, currentStep + 1).forEach(f => {
      (f.relaxed || []).forEach(r => {
        const to = typeof r === 'string' ? r : r.to;
        s.add(`${f.current}-${to}`);
      });
    });
    return s;
  }, [trace, currentStep]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth:W, height:'auto' }}>
      {/* Edges */}
      {edges.map((e, i) => {
        const from = nodes.find(n => n.id === e.from);
        const to   = nodes.find(n => n.id === e.to);
        if (!from || !to) return null;
        const isPath = pathEdges.has(`${e.from}-${e.to}`) || pathEdges.has(`${e.to}-${e.from}`);
        return (
          <g key={i}>
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isPath ? '#52B788' : '#CBD5E0'}
              strokeWidth={isPath ? 3 : 1.5}
              strokeDasharray={isPath ? 'none' : '4,3'}
            />
            {/* Edge weight label */}
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 - 5}
              fontSize={9} fill="#9CA3AF" textAnchor="middle" fontFamily="JetBrains Mono"
            >
              {e.efficiencyLoss?.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const style = getNodeStyle(node);
        const isPulse = node.id === current;
        const eff = efficiency?.[node.id];
        return (
          <g key={node.id} className={isPulse ? 'node-pulse' : ''}>
            <circle
              cx={node.x} cy={node.y} r={style.r}
              fill={style.fill} stroke={style.stroke} strokeWidth={2}
              style={{ transition: 'fill 0.3s, stroke 0.3s' }}
            />
            <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={8} fontWeight="600" fill={style.textColor} fontFamily="Inter">
              {node.label?.replace('Plot ', 'P').replace('Junction ', 'J')}
            </text>
            {/* Efficiency badge */}
            {eff !== undefined && allVisited.has(node.id) && (
              <text x={node.x} y={node.y + style.r + 10} textAnchor="middle"
                fontSize={9} fill="#2D6A4F" fontWeight="700">
                {eff}%
              </text>
            )}
          </g>
        );
      })}

      {/* Step info */}
      {frame && (
        <text x={10} y={H - 10} fontSize={10} fill="#6B7B6E" fontFamily="JetBrains Mono">
          Step {currentStep + 1}: Processing {frame.current}
        </text>
      )}
    </svg>
  );
}
