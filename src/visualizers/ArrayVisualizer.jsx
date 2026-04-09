import React from 'react';
import { CROP_COLORS } from '../utils/formatters';

const ACTION_LABELS = {
  pivot_select:    f => `Pivot selected: ${f.pivotName} (ratio: ${f.pivotValue})`,
  compare:         f => `Comparing index ${f.i} with pivot`,
  swap:            f => `Swapping positions ${f.i} and ${f.j}`,
  partition_done:  f => `Partition complete — pivot settled at index ${f.pivotFinal}`,
  sorted:          _  => 'Array sorted!',
  single:          f  => `Single element at index ${f.index}`,
};

export default function ArrayVisualizer({ trace, currentStep }) {
  if (!trace || trace.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Press Play to start Quick Sort</div>;
  }
  const frame = trace[Math.max(0, currentStep)] || trace[0];
  const arr   = frame?.array || [];
  const maxV  = Math.max(...arr.map(x => x.ratio || 0), 0.1);

  const labelFn = ACTION_LABELS[frame?.action];
  const actionLabel = labelFn ? labelFn(frame) : 'Ready';

  return (
    <div className="w-full">
      {/* Action label */}
      <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-xs font-mono text-blue-800 min-h-[28px] flex items-center">
        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 flex-shrink-0" />
        {actionLabel}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1 px-2" style={{ height: 200 }}>
        {arr.map((item, i) => {
          const h         = Math.max(8, (item.ratio / maxV) * 180);
          const col       = CROP_COLORS[item.id] || '#52B788';
          const isPivot   = frame?.action === 'pivot_select' && i === frame.pivotIndex;
          const isSwap    = frame?.action === 'swap' && (i === frame.i || i === frame.j);
          const isCompare = frame?.action === 'compare' && (i === frame.i || i === frame.pivotIndex);
          const isSorted  = frame?.action === 'sorted';

          return (
            <div key={item.id + i} className="flex flex-col items-center gap-0.5 flex-1">
              <span style={{ fontSize:8, color:'#9CA3AF', fontFamily:'JetBrains Mono' }}>
                {item.ratio?.toFixed(1)}
              </span>
              <div
                title={`${item.name}: ratio ${item.ratio}`}
                style={{
                  height: h, width: '100%', borderRadius: '4px 4px 0 0',
                  background: isSorted    ? '#52B788'
                            : isSwap     ? '#F4A261'
                            : isPivot    ? '#EF5350'
                            : isCompare  ? '#FFE082'
                            : col,
                  border: isPivot ? '2.5px solid #C62828' : isSwap ? '2px solid #E65100' : '1px solid rgba(0,0,0,0.08)',
                  transition: 'height 0.3s ease, background 0.25s ease',
                  position: 'relative',
                }}
              >
                {/* Pivot marker line instead of emoji */}
                {isPivot && (
                  <div style={{
                    position:'absolute', top:-4, left:'50%', transform:'translateX(-50%)',
                    width:2, height:8, background:'#C62828', borderRadius:1,
                  }} />
                )}
              </div>
              <span style={{ fontSize:7, color:'#6B7B6E', maxWidth:36, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center' }}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
        {[['Pivot','#EF5350'],['Comparing','#FFE082'],['Swapping','#F4A261'],['Sorted','#52B788']].map(([l,c])=>(
          <span key={l} className="flex items-center gap-1">
            <span style={{ width:10,height:10,background:c,display:'inline-block',borderRadius:2 }}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
