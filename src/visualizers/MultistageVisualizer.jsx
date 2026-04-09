import React, { useMemo } from 'react';
import { CROP_COLORS } from '../utils/formatters';

export default function MultistageVisualizer({ stages, optimalPath, totalYield, currentStep }) {
  if (!stages || stages.length === 0) {
    return <div className="flex items-center justify-center h-48 text-muted text-sm">Press Play to see phase optimization</div>;
  }

  const W = 680, H = 320;
  const phaseLabels = ['Start', 'Kharif Early', 'Kharif Late', 'Rabi', 'End'];
  const totalCols   = stages.length + 2; // start + phases + end
  const colW        = W / totalCols;

  // Build node layout
  const cols = useMemo(() => {
    const c = [];
    // Start
    c.push([{ cropId: null, cropName: 'Start', cumYield: 0, isStart: true }]);
    stages.forEach(st => c.push(st.nodes || []));
    // End
    c.push([{ cropId: null, cropName: 'End', cumYield: totalYield, isEnd: true }]);
    return c;
  }, [stages, totalYield]);

  const nodePos = useMemo(() => {
    const pos = [];
    cols.forEach((col, ci) => {
      const colNodes = [];
      col.forEach((node, ni) => {
        const x = colW * (ci + 0.5);
        const y = 30 + (ni + 0.5) * ((H - 60) / Math.max(col.length, 1));
        colNodes.push({ x, y, ...node });
      });
      pos.push(colNodes);
    });
    return pos;
  }, [cols, colW]);

  // Which stages have been "revealed" so far
  const revealedCols = currentStep < 0 ? 0 : Math.min(currentStep + 1, nodePos.length);

  // Highlight optimal path nodes
  const optSet = new Set(optimalPath || []);

  return (
    <div className="overflow-auto">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minHeight: 260 }}>
        {/* Phase column backgrounds */}
        {phaseLabels.map((label, ci) => (
          <g key={ci}>
            <rect x={colW * ci} y={0} width={colW} height={H}
              fill={ci % 2 === 0 ? '#F8FAF5' : '#F0F7F4'} />
            <text x={colW * (ci + 0.5)} y={14} textAnchor="middle"
              fontSize={9} fill="#6B7B6E" fontWeight="600">{label}</text>
          </g>
        ))}

        {/* Edges (only between revealed cols) */}
        {nodePos.slice(0, revealedCols - 1).map((fromCol, ci) =>
          fromCol.map((fromNode, fi) =>
            nodePos[ci + 1]?.map((toNode, ti) => {
              const isOpt = optSet.has(fromNode.cropId) || optSet.has(toNode.cropId);
              return (
                <line key={`e${ci}-${fi}-${ti}`}
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x}   y2={toNode.y}
                  stroke={isOpt && currentStep >= stages.length ? '#FFD700' : '#E2E8F0'}
                  strokeWidth={isOpt && currentStep >= stages.length ? 2.5 : 1}
                  opacity={isOpt && currentStep >= stages.length ? 1 : 0.5}
                />
              );
            })
          )
        )}

        {/* Nodes */}
        {nodePos.slice(0, revealedCols).map((col, ci) =>
          col.map((node, ni) => {
            const r   = node.isStart || node.isEnd ? 18 : 22;
            const isOpt = optSet.has(node.cropId) && currentStep >= stages.length;
            const col2  = CROP_COLORS[node.cropId] || '#E8F5E9';
            const fill  = node.isStart || node.isEnd ? '#2D6A4F' : isOpt ? '#FFD700' : col2;
            const stroke= isOpt ? '#F57F17' : '#2D6A4F';

            return (
              <g key={`n${ci}-${ni}`} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <circle cx={node.x} cy={node.y} r={r}
                  fill={fill} stroke={stroke} strokeWidth={isOpt ? 2.5 : 1.5}
                />
                <text x={node.x} y={node.y - 2} textAnchor="middle"
                  fontSize={8} fontWeight="700"
                  fill={node.isStart || node.isEnd || isOpt ? '#333' : '#fff'}
                  fontFamily="Inter">
                  {(node.cropName || '').slice(0, 6)}
                </text>
                {node.cumYield > 0 && (
                  <text x={node.x} y={node.y + 10} textAnchor="middle"
                    fontSize={7} fill={isOpt ? '#5D4037' : 'rgba(255,255,255,0.8)'}
                    fontFamily="JetBrains Mono">
                    ₹{Math.round(node.cumYield / 1000)}k
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span style={{ width:10,height:10,background:'#FFD700',borderRadius:'50%',display:'inline-block',border:'1px solid #F57F17' }}/>
          Optimal path
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width:10,height:10,background:'#E8F5E9',borderRadius:'50%',display:'inline-block',border:'1px solid #2D6A4F' }}/>
          Explored states
        </span>
        {optimalPath?.filter(Boolean).map(id => (
          <span key={id} className="flex items-center gap-1">
            <span style={{ width:10,height:10,background:CROP_COLORS[id],borderRadius:'50%',display:'inline-block' }}/>
          </span>
        ))}
      </div>
    </div>
  );
}
