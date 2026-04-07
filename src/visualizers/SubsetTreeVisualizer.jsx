import React, { useMemo } from 'react';

export default function SubsetTreeVisualizer({ trace, currentStep }) {
  const visible = useMemo(() => {
    if (!trace || currentStep < 0) return [];
    return trace.slice(0, currentStep + 1).slice(-50);
  }, [trace, currentStep]);

  if (!visible.length) {
    return <div className="flex items-center justify-center h-48 text-muted text-sm">Press Play to explore the subset tree</div>;
  }

  const NODE_R = 22, V_GAP = 60, H_GAP = 10;
  const byDepth = {};
  visible.forEach((node, i) => {
    const depth = node.idx ?? i;
    if (!byDepth[depth]) byDepth[depth] = [];
    byDepth[depth].push({ ...node, _i: i });
  });

  const maxDepth = Math.max(...Object.keys(byDepth).map(Number));
  const SVG_W   = Math.max(500, Object.values(byDepth).reduce((m, v) => Math.max(m, v.length), 0) * (NODE_R * 2 + H_GAP) + 40);
  const SVG_H   = (maxDepth + 1) * V_GAP + 80;

  const positions = {};
  Object.entries(byDepth).forEach(([depth, nodes]) => {
    const d = Number(depth);
    const cnt = nodes.length;
    const totalW = cnt * (NODE_R * 2 + H_GAP) - H_GAP;
    const startX = (SVG_W - totalW) / 2;
    nodes.forEach((node, j) => {
      positions[node._i] = {
        x: startX + j * (NODE_R * 2 + H_GAP) + NODE_R,
        y: d * V_GAP + NODE_R + 20,
      };
    });
  });

  function getStyle(node) {
    if (node.status === 'found')      return { fill: '#FFD700', stroke: '#F57F17', text: '#5D4037' };
    if (node.status === 'pruned')     return { fill: '#FFCDD2', stroke: '#C62828', text: '#B71C1C' };
    if (node.status === 'exhausted')  return { fill: '#F5F5F5', stroke: '#9E9E9E', text: '#757575' };
    if (node.status === 'include')    return { fill: '#BBDEFB', stroke: '#1565C0', text: '#0D47A1' };
    if (node.status === 'exclude')    return { fill: '#F3E5F5', stroke: '#6A1B9A', text: '#4A148C' };
    return { fill: '#E8F5E9', stroke: '#2E7D32', text: '#1B5E20' };
  }

  return (
    <div className="overflow-auto">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', minHeight: 200 }}>
        {visible.map((node, i) => {
          if (i === 0) return null;
          const from = positions[i - 1], to = positions[i];
          if (!from || !to) return null;
          const isInclude = node.status === 'include';
          return (
            <g key={`e${i}`}>
              <line x1={from.x} y1={from.y + NODE_R} x2={to.x} y2={to.y - NODE_R}
                stroke={isInclude ? '#1565C0' : '#6A1B9A'} strokeWidth={1.5} strokeDasharray={isInclude ? '' : '4,3'} />
              <text x={(from.x + to.x) / 2 + 6} y={(from.y + to.y) / 2}
                fontSize={8} fill={isInclude ? '#1565C0' : '#6A1B9A'} fontWeight="600">
                {isInclude ? `+${node.include || ''}L` : 'skip'}
              </text>
            </g>
          );
        })}

        {visible.map((node, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const s = getStyle(node);
          const sum = node.currentSum ?? 0;
          const isLast = i === visible.length - 1;
          return (
            <g key={i} style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <circle cx={pos.x} cy={pos.y} r={NODE_R}
                fill={s.fill} stroke={s.stroke} strokeWidth={isLast ? 3 : 1.5} />
              <text x={pos.x} y={pos.y - 3} textAnchor="middle" fontSize={9} fontWeight="700" fill={s.text}>
                {sum}L
              </text>
              <text x={pos.x} y={pos.y + 9} textAnchor="middle" fontSize={7} fill={s.text} opacity={0.8}>
                {node.status === 'found' ? '✓ Match!' : node.status === 'pruned' ? '✕ Over' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
        {[['Include branch','#BBDEFB'],['Exclude branch','#F3E5F5'],['Pruned (over target)','#FFCDD2'],['Found!','#FFD700']].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1">
            <span style={{ width:10,height:10,background:c,borderRadius:'50%',display:'inline-block',border:'1px solid #ccc' }}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
