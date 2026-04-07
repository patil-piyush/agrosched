import React, { useMemo } from 'react';

const STATUS_STYLE = {
  assigned: { fill: '#C8E6C9', stroke: '#2E7D32', text: '#2E7D32' },
  explore:  { fill: '#E3F2FD', stroke: '#1565C0', text: '#1565C0' },
  pruned:   { fill: '#FFCDD2', stroke: '#C62828', text: '#C62828' },
  backtrack:{ fill: '#FFCDD2', stroke: '#E53935', text: '#C62828' },
  failed:   { fill: '#FFF3E0', stroke: '#E65100', text: '#E65100' },
  complete: { fill: '#C8E6C9', stroke: '#2E7D32', text: '#2E7D32' },
  found:    { fill: '#FFD700', stroke: '#F57F17', text: '#5D4037' },
  default:  { fill: '#F5F5F5', stroke: '#9E9E9E', text: '#333' },
};

export default function TreeVisualizer({ trace, currentStep, maxNodes = 60, labelKey = 'cropName', valueKey = 'value' }) {
  const visibleTrace = useMemo(() => {
    if (!trace || currentStep < 0) return [];
    return trace.slice(0, currentStep + 1).slice(-maxNodes);
  }, [trace, currentStep, maxNodes]);

  if (!visibleTrace.length) {
    return <div className="flex items-center justify-center h-48 text-muted text-sm">Press Play to grow the tree</div>;
  }

  // Layout: simple level-based positioning
  const NODE_W = 80, NODE_H = 36, H_GAP = 10, V_GAP = 55;
  const byDepth = {};
  visibleTrace.forEach((node, i) => {
    const depth = node.idx ?? node.level ?? Math.floor(Math.log2(i + 2));
    if (!byDepth[depth]) byDepth[depth] = [];
    byDepth[depth].push({ ...node, _i: i });
  });

  const maxDepth = Math.max(...Object.keys(byDepth).map(Number));
  const positions = {};

  Object.entries(byDepth).forEach(([depth, nodes]) => {
    const d   = Number(depth);
    const cnt = nodes.length;
    const totalW = cnt * NODE_W + (cnt - 1) * H_GAP;
    const startX = Math.max(10, 300 - totalW / 2);
    nodes.forEach((node, j) => {
      positions[node._i] = {
        x: startX + j * (NODE_W + H_GAP) + NODE_W / 2,
        y: d * V_GAP + 20,
      };
    });
  });

  const svgH = (maxDepth + 1) * V_GAP + 60;
  const svgW = Math.max(600, ...Object.values(positions).map(p => p.x + 50));

  return (
    <div className="overflow-auto">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', minHeight: 200 }}>
        {/* Edges */}
        {visibleTrace.map((node, i) => {
          if (i === 0) return null;
          const parentIdx = i - 1;
          const from = positions[parentIdx];
          const to   = positions[i];
          if (!from || !to) return null;
          return (
            <line key={`e${i}`}
              x1={from.x} y1={from.y + NODE_H / 2}
              x2={to.x}   y2={to.y - NODE_H / 2}
              stroke="#CBD5E0" strokeWidth={1.5}
            />
          );
        })}

        {/* Nodes */}
        {visibleTrace.map((node, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const s = STATUS_STYLE[node.status] || STATUS_STYLE.default;
          const label = node[labelKey] || node.cropName || node.job || node.name || `N${i}`;
          const val   = node[valueKey] ?? node.value ?? node.cost ?? node.currentSum ?? '';
          const isLast = i === visibleTrace.length - 1;

          return (
            <g key={i} style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <rect
                x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2}
                width={NODE_W} height={NODE_H} rx={6}
                fill={s.fill} stroke={s.stroke} strokeWidth={isLast ? 2.5 : 1.5}
              />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle"
                fontSize={9} fontWeight="600" fill={s.text} fontFamily="Inter">
                {String(label).length > 12 ? String(label).slice(0, 12) + '…' : label}
              </text>
              {val !== '' && (
                <text x={pos.x} y={pos.y + 8} textAnchor="middle"
                  fontSize={8} fill={s.text} fontFamily="JetBrains Mono" opacity={0.8}>
                  {typeof val === 'number' ? `₹${val.toLocaleString()}` : val}
                </text>
              )}
              {node.status === 'pruned'   && <text x={pos.x} y={pos.y + 2} textAnchor="middle" fontSize={14}>✕</text>}
              {node.status === 'found'    && <text x={pos.x} y={pos.y + 2} textAnchor="middle" fontSize={14}>✓</text>}
              {node.status === 'complete' && <text x={pos.x} y={pos.y + 2} textAnchor="middle" fontSize={14}>✓</text>}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 flex-wrap text-xs text-gray-500">
        {[['Assigned','#C8E6C9'],['Exploring','#E3F2FD'],['Failed/Pruned','#FFCDD2'],['Solution','#FFD700']].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1">
            <span style={{ width:10,height:10,background:c,display:'inline-block',borderRadius:2,border:'1px solid #ccc' }}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
