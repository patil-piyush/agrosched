import React, { useMemo, useState } from 'react';

/**
 * DPTableVisualizer — windowed DP table with row-by-row animation.
 * Shows only a 20-column window that the user can slide with a range input.
 * Cells animate row-by-row so the fill is fast and visible.
 */
export default function DPTableVisualizer({
  dp, fills, backtrack, currentStep,
  rowLabels, colStep = 1, maxCols = 20,
}) {
  const [windowStart, setWindowStart] = useState(0);
  const WINDOW = 18; // visible columns at once

  if (!dp || dp.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Press Play to fill the DP table
      </div>
    );
  }

  const nRows   = dp.length;
  const totalCols = Math.min(dp[0]?.length || 0, maxCols);
  const windowEnd = Math.min(windowStart + WINDOW, totalCols);

  // Which cells are filled up to currentStep (using row-level granularity for speed)
  const filledRows = useMemo(() => {
    if (currentStep < 0 || !fills) return -1;
    const lastFill = fills[Math.min(currentStep, fills.length - 1)];
    return lastFill?.row ?? -1;
  }, [currentStep, fills]);

  const currentFill   = fills?.[Math.min(currentStep, (fills?.length || 1) - 1)];
  const currentRow    = currentFill?.row ?? -1;
  const currentColRaw = currentFill?.col ?? -1;

  // Backtrack set
  const backSet = useMemo(() => {
    const s = new Set();
    (backtrack || []).forEach(b => {
      if (b.decision === 'included') s.add(`${b.row},${b.col}`);
    });
    return s;
  }, [backtrack]);

  const isInBacktrack = currentStep >= (fills?.length || 0);

  function cellBg(i, j) {
    const key = `${i},${j}`;
    if (backSet.has(key))                                    return '#FFD700'; // gold
    if (i === currentRow && j === currentColRaw && !isInBacktrack) return '#FDBA74'; // orange highlight
    if (i < currentRow || (i === currentRow && !isInBacktrack)) {
      const val = dp[i]?.[j] ?? 0;
      return val > 0 ? '#BBF7D0' : '#F3F4F6';
    }
    return '#F9FAFB';
  }

  function cellColor(i, j) {
    const key = `${i},${j}`;
    if (backSet.has(key)) return '#78350F';
    const val = dp[i]?.[j] ?? 0;
    if (i < currentRow || (i === currentRow && !isInBacktrack)) {
      return val > 0 ? '#14532D' : '#9CA3AF';
    }
    return '#D1D5DB';
  }

  function cellVal(i, j) {
    if (i > currentRow && !isInBacktrack) return '';
    const v = dp[i]?.[j] ?? 0;
    if (v === 0) return '0';
    return v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);
  }

  return (
    <div>
      {/* Window slider */}
      {totalCols > WINDOW && (
        <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
          <span>Budget window:</span>
          <input
            type="range" min={0} max={totalCols - WINDOW} value={windowStart}
            onChange={e => setWindowStart(+e.target.value)}
            className="w-40 accent-green-600"
          />
          <span className="font-mono text-green-700">
            ₹{(windowStart * colStep).toLocaleString()} – ₹{(windowEnd * colStep).toLocaleString()}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="border-collapse text-center" style={{ fontSize: 10, tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className="dp-cell bg-gray-800 text-white text-left px-2"
                  style={{ width: 88, minWidth: 88, position: 'sticky', left: 0, zIndex: 10 }}>
                Crop / Budget
              </th>
              {Array.from({ length: windowEnd - windowStart }, (_, k) => {
                const j = windowStart + k;
                const budget = j * colStep;
                return (
                  <th key={j} className="dp-cell bg-gray-700 text-white" style={{ width: 44, fontSize: 8 }}>
                    {budget >= 1000 ? `${Math.round(budget/1000)}k` : budget}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: nRows }, (_, i) => (
              <tr key={i}>
                <td
                  className="dp-cell text-left px-2 font-medium"
                  style={{
                    position: 'sticky', left: 0, zIndex: 5,
                    background: i === currentRow ? '#FEF9C3' : '#F3F4F6',
                    color: '#374151', fontSize: 9, minWidth: 88,
                    borderRight: '2px solid #E5E7EB',
                  }}
                >
                  {i === 0 ? '—' : (rowLabels?.[i - 1] ?? `Item ${i}`)}
                </td>
                {Array.from({ length: windowEnd - windowStart }, (_, k) => {
                  const j   = windowStart + k;
                  const key = `${i},${j}`;
                  const inBack = backSet.has(key);
                  return (
                    <td
                      key={j}
                      className="dp-cell"
                      title={`Row ${i} (${i===0?'—':rowLabels?.[i-1]??''}), Budget ₹${j*colStep}: ${dp[i]?.[j]??0}`}
                      style={{
                        background: cellBg(i, j),
                        color:      cellColor(i, j),
                        fontWeight: inBack || (i === currentRow && j === currentColRaw) ? 700 : 400,
                        transition: 'background 0.2s',
                        boxShadow:  inBack ? 'inset 0 0 0 2px #D97706' :
                                    (i === currentRow && j === currentColRaw && !isInBacktrack)
                                      ? 'inset 0 0 0 2px #EA580C' : 'none',
                        width: 44, minWidth: 44,
                      }}
                    >
                      {cellVal(i, j)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row progress + legend */}
      <div className="flex items-center gap-4 mt-2 flex-wrap">
        <div className="flex gap-1 text-xs text-gray-500">
          {[['Filling','#BBF7D0'],['Current cell','#FDBA74'],['Backtrack path','#FFD700']].map(([l,c])=>(
            <span key={l} className="flex items-center gap-1">
              <span style={{width:10,height:10,background:c,display:'inline-block',borderRadius:2,border:'1px solid #ccc'}}/>
              {l}
            </span>
          ))}
        </div>
        {currentRow > 0 && (
          <span className="ml-auto text-xs text-gray-400 font-mono">
            Row {currentRow}/{nRows - 1} filled
          </span>
        )}
      </div>
    </div>
  );
}
