import React from 'react';
import { CROP_COLORS } from '../utils/formatters';

export default function ArrayVisualizer({ trace, currentStep }) {
  if (!trace || trace.length === 0) {
    return <div className="flex items-center justify-center h-48 text-muted text-sm">Press Play to start Quick Sort</div>;
  }

  const frame = trace[Math.max(0, currentStep)] || trace[0];
  const arr   = frame?.array || [];
  const maxV  = Math.max(...arr.map(x => x.ratio || 0), 0.1);

  return (
    <div className="w-full">
      {/* Action label */}
      <div className="mb-3 px-3 py-2 rounded-lg bg-gray-50 text-xs font-mono text-gray-600 min-h-[28px]">
        {frame?.action === 'pivot_select' && `🎯 Pivot selected: ${frame.pivotName} (ratio: ${frame.pivotValue})`}
        {frame?.action === 'compare'      && `🔍 Comparing index ${frame.i} with pivot`}
        {frame?.action === 'swap'         && `🔄 Swapping positions ${frame.i} ↔ ${frame.j}`}
        {frame?.action === 'partition_done' && `✂ Partition done — pivot at position ${frame.pivotFinal}`}
        {frame?.action === 'sorted'       && `✅ Array sorted!`}
        {frame?.action === 'single'       && `📌 Single element at index ${frame.index}`}
        {!frame?.action && 'Ready'}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1 px-2" style={{ height: 200 }}>
        {arr.map((item, i) => {
          const h   = Math.max(8, (item.ratio / maxV) * 180);
          const col = CROP_COLORS[item.id] || '#52B788';
          const isPivot   = frame?.action === 'pivot_select' && i === frame.pivotIndex;
          const isSwapA   = frame?.action === 'swap' && (i === frame.i || i === frame.j);
          const isCompare = frame?.action === 'compare' && (i === frame.i || i === frame.pivotIndex);
          const isSorted  = frame?.action === 'sorted';

          return (
            <div key={item.id + i} className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-xs font-mono text-gray-500" style={{ fontSize: 9 }}>
                {item.ratio?.toFixed(1)}
              </span>
              <div
                style={{
                  height: h,
                  background: isSorted ? '#52B788' : isSwapA ? '#F4A261' : isPivot ? '#FF7043' : isCompare ? '#FFE082' : col,
                  borderRadius: '4px 4px 0 0',
                  width: '100%',
                  border: isPivot ? '2.5px solid #E64A19' : isSwapA ? '2px solid #E65100' : '1px solid rgba(0,0,0,0.1)',
                  transition: 'height 0.3s ease, background 0.25s ease',
                  position: 'relative',
                }}
              >
                {isPivot && (
                  <div style={{ position:'absolute', top:-18, left:'50%', transform:'translateX(-50%)', fontSize:12 }}>
                    📌
                  </div>
                )}
              </div>
              <span className="text-center" style={{ fontSize: 8, color:'#6B7B6E', maxWidth: 36, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
        {[['Pivot','#FF7043'],['Comparing','#FFE082'],['Swapping','#F4A261'],['Sorted','#52B788']].map(([l,c]) => (
          <span key={l} className="flex items-center gap-1">
            <span style={{ width:10,height:10,background:c,display:'inline-block',borderRadius:2 }}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
