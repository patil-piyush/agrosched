import React, { useMemo } from 'react';

const STATUS_STYLE = {
  assigned: { fill: '#C8E6C9', stroke: '#2E7D32',  text: '#1B5E20' },
  explore:  { fill: '#BBDEFB', stroke: '#1565C0',  text: '#0D47A1' },
  pruned:   { fill: '#FFCDD2', stroke: '#C62828',  text: '#B71C1C' },
  backtrack:{ fill: '#FFE0B2', stroke: '#E65100',  text: '#BF360C' },
  failed:   { fill: '#FFF9C4', stroke: '#F9A825',  text: '#F57F17' },
  complete: { fill: '#C8E6C9', stroke: '#2E7D32',  text: '#1B5E20' },
  found:    { fill: '#FFD700', stroke: '#F57F17',  text: '#4E342E' },
  default:  { fill: '#F5F5F5', stroke: '#9E9E9E',  text: '#424242' },
};

const NODE_W = 82, NODE_H = 34, V_GAP = 62, H_GAP = 6;

/**
 * Build a proper tree layout using nodeId/parentNodeId from trace.
 * Returns Map<nodeId, {x, y, ...node}>
 */
function buildTreeLayout(visibleNodes) {
  if (!visibleNodes.length) return { positions: new Map(), svgW: 600, svgH: 200 };

  // Build adjacency: parentId -> [childIds]
  const children = new Map();
  const nodeMap  = new Map();
  visibleNodes.forEach(n => {
    nodeMap.set(n.nodeId, n);
    if (!children.has(n.parentNodeId)) children.set(n.parentNodeId, []);
    if (!children.has(n.nodeId))       children.set(n.nodeId, []);
    children.get(n.parentNodeId).push(n.nodeId);
  });

  // Find root(s) — nodes whose parentNodeId is null or not in nodeMap
  const roots = visibleNodes.filter(n =>
    n.parentNodeId === null || n.parentNodeId === undefined || !nodeMap.has(n.parentNodeId)
  );

  // Assign x positions via post-order: give each subtree its natural width
  const subtreeW = new Map(); // nodeId -> total width needed
  function calcWidth(id) {
    const ch = children.get(id) || [];
    if (!ch.length) { subtreeW.set(id, NODE_W + H_GAP); return NODE_W + H_GAP; }
    const total = ch.reduce((s, c) => s + calcWidth(c), 0);
    subtreeW.set(id, Math.max(total, NODE_W + H_GAP));
    return subtreeW.get(id);
  }
  roots.forEach(r => calcWidth(r.nodeId));

  // Assign absolute x by walking left-to-right across siblings
  const positions = new Map();
  function placeNode(id, leftEdge, depth) {
    const w  = subtreeW.get(id) || (NODE_W + H_GAP);
    const cx = leftEdge + w / 2;
    positions.set(id, { x: cx, y: depth * V_GAP + 24 });
    const ch = children.get(id) || [];
    let cursor = leftEdge;
    ch.forEach(c => {
      placeNode(c, cursor, depth + 1);
      cursor += subtreeW.get(c) || (NODE_W + H_GAP);
    });
  }
  let rootCursor = 10;
  roots.forEach(r => {
    placeNode(r.nodeId, rootCursor, 0);
    rootCursor += subtreeW.get(r.nodeId) || (NODE_W + H_GAP);
  });

  const allX = [...positions.values()].map(p => p.x);
  const allY = [...positions.values()].map(p => p.y);
  const svgW = Math.max(600, Math.max(...allX) + NODE_W / 2 + 20);
  const svgH = Math.max(200, Math.max(...allY) + NODE_H + 30);

  return { positions, svgW, svgH };
}

export default function TreeVisualizer({
  trace, currentStep, maxNodes = 80,
  labelKey = 'label', valueKey = 'value',
}) {
  const visibleNodes = useMemo(() => {
    if (!trace || currentStep < 0) return [];
    return trace.slice(0, currentStep + 1).slice(-maxNodes);
  }, [trace, currentStep, maxNodes]);

  const { positions, svgW, svgH } = useMemo(
    () => buildTreeLayout(visibleNodes),
    [visibleNodes]
  );

  if (!visibleNodes.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Press Play to grow the tree
      </div>
    );
  }

  const lastNode = visibleNodes[visibleNodes.length - 1];

  return (
    <div className="overflow-auto rounded-lg border border-gray-100 bg-gray-50" style={{ maxHeight: 380 }}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: Math.max(svgW, 600), height: svgH, display: 'block' }}
      >
        {/* Edges — drawn before nodes so nodes appear on top */}
        {visibleNodes.map(node => {
          if (node.parentNodeId === null || node.parentNodeId === undefined) return null;
          const fromPos = positions.get(node.parentNodeId);
          const toPos   = positions.get(node.nodeId);
          if (!fromPos || !toPos) return null;

          const isPruned  = node.status === 'pruned' || node.status === 'backtrack';
          const isBranch  = node.branch === 'incl' || node.branch === 'excl';

          return (
            <g key={`e-${node.nodeId}`}>
              <line
                x1={fromPos.x} y1={fromPos.y + NODE_H / 2}
                x2={toPos.x}   y2={toPos.y   - NODE_H / 2}
                stroke={isPruned ? '#EF9A9A' : '#B0BEC5'}
                strokeWidth={1.8}
                strokeDasharray={node.status === 'backtrack' ? '5,3' : 'none'}
              />
              {/* Branch label (include / exclude) */}
              {isBranch && (
                <text
                  x={(fromPos.x + toPos.x) / 2 + (toPos.x > fromPos.x ? 6 : -6)}
                  y={(fromPos.y + toPos.y) / 2}
                  fontSize={8} fill={node.branch === 'incl' ? '#1565C0' : '#6A1B9A'}
                  fontWeight="600" textAnchor="middle" fontFamily="Inter"
                >
                  {node.branch === 'incl' ? '+' : '−'}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {visibleNodes.map(node => {
          const pos = positions.get(node.nodeId);
          if (!pos) return null;
          const s      = STATUS_STYLE[node.status] || STATUS_STYLE.default;
          const isLast = node.nodeId === lastNode.nodeId;
          const label  = node[labelKey] ?? node.label ?? node.cropName ?? `N${node.nodeId}`;
          const val    = node[valueKey] ?? node.value ?? node.cost ?? node.currentSum;

          const displayLabel = String(label).length > 11 ? String(label).slice(0, 10) + '…' : String(label);

          return (
            <g key={`n-${node.nodeId}`}>
              <rect
                x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2}
                width={NODE_W} height={NODE_H} rx={6}
                fill={s.fill} stroke={s.stroke}
                strokeWidth={isLast ? 2.5 : 1.5}
                style={{ transition: 'fill 0.25s, stroke 0.25s' }}
              />
              <text
                x={pos.x} y={pos.y - (val !== undefined && val !== '' ? 4 : 1)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fontWeight="600" fill={s.text} fontFamily="Inter"
              >
                {displayLabel}
              </text>
              {val !== undefined && val !== '' && val !== null && (
                <text
                  x={pos.x} y={pos.y + 9}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={7.5} fill={s.text} fontFamily="JetBrains Mono" opacity={0.75}
                >
                  {typeof val === 'number'
                    ? val > 999 ? `₹${Math.round(val / 1000)}k` : val
                    : val}
                </text>
              )}
              {/* Status icon — SVG text instead of emoji */}
              {node.status === 'pruned' && (
                <text x={pos.x + NODE_W / 2 - 7} y={pos.y - NODE_H / 2 + 9}
                  fontSize={9} fill="#C62828" fontWeight="700" textAnchor="middle">✗</text>
              )}
              {(node.status === 'found' || node.status === 'complete' || node.status === 'assigned') && (
                <text x={pos.x + NODE_W / 2 - 7} y={pos.y - NODE_H / 2 + 9}
                  fontSize={9} fill="#2E7D32" fontWeight="700" textAnchor="middle">✓</text>
              )}
              {node.status === 'backtrack' && (
                <text x={pos.x + NODE_W / 2 - 7} y={pos.y - NODE_H / 2 + 9}
                  fontSize={9} fill="#E65100" fontWeight="700" textAnchor="middle">↩</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-3 p-2 flex-wrap text-xs text-gray-500 border-t border-gray-100 bg-white">
        {[
          ['Assigned / Exploring', '#BBDEFB', '#1565C0'],
          ['Failed constraint',    '#FFF9C4', '#F9A825'],
          ['Pruned / Backtrack',   '#FFCDD2', '#C62828'],
          ['Solution',             '#FFD700', '#F57F17'],
        ].map(([l, f, s]) => (
          <span key={l} className="flex items-center gap-1">
            <span style={{ width:10, height:10, background:f, border:`1.5px solid ${s}`, display:'inline-block', borderRadius:2 }}/>
            {l}
          </span>
        ))}
        <span className="ml-auto font-mono">
          Nodes: {visibleNodes.length}
        </span>
      </div>
    </div>
  );
}
