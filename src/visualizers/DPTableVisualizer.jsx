import React, { useMemo } from 'react';

export default function DPTableVisualizer({ dp, fills, backtrack, currentStep, rowLabels, colStep = 1, maxCols = 20 }) {
  if (!dp || dp.length === 0) {
    return <div className="flex items-center justify-center h-48 text-muted text-sm">Press Play to fill the DP table</div>;
  }

  const nRows = dp.length;
  const nCols = Math.min(dp[0]?.length || 0, maxCols);

  // What's been filled so far
  const filledSet  = useMemo(() => {
    const s = new Set();
    if (currentStep < 0) return s;
    fills?.slice(0, currentStep + 1).forEach(f => s.add(`${f.row},${f.col}`));
    return s;
  }, [currentStep, fills]);

  const currentFill = fills?.[currentStep];
  const backSet = useMemo(() => {
    const s = new Set();
    if (!backtrack) return s;
    backtrack.forEach(b => b.decision === 'included' && s.add(`${b.row},${b.col}`));
    return s;
  }, [backtrack]);

  const isInBacktrack = currentStep >= (fills?.length || 0);

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-center" style={{ fontSize: 10 }}>
        <thead>
          <tr>
            <th className="dp-cell bg-gray-800 text-white sticky left-0 z-10" style={{ minWidth: 80 }}>Crop \ Budget</th>
            {Array.from({ length: nCols }, (_, j) => (
              <th key={j} className="dp-cell bg-gray-700 text-white" style={{ fontSize: 9 }}>
                {j === 0 ? 0 : j * colStep >= 1000 ? `${Math.round(j * colStep / 1000)}k` : j * colStep}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dp.slice(0, nRows).map((row, i) => (
            <tr key={i}>
              <td className="dp-cell bg-gray-100 font-medium sticky left-0 z-10 text-left px-1" style={{ minWidth: 80, fontSize: 10 }}>
                {i === 0 ? '—' : (rowLabels?.[i - 1] || `Item ${i}`)}
              </td>
              {row.slice(0, nCols).map((val, j) => {
                const key      = `${i},${j}`;
                const isCurrent = currentFill?.row === i && currentFill?.col === j;
                const isFilled  = filledSet.has(key);
                const isBackt   = backSet.has(key);

                let bg = '#f9fafb';
                if (isBackt)    bg = '#FFD700';
                else if (isCurrent) bg = '#FFE082';
                else if (isFilled && val > 0) bg = '#C8E6C9';
                else if (isFilled) bg = '#f1f5f1';

                return (
                  <td
                    key={j}
                    className="dp-cell"
                    style={{
                      background: bg,
                      color: isBackt ? '#6D4C00' : val > 0 ? '#2E7D32' : '#9CA3AF',
                      fontWeight: isBackt || isCurrent ? 700 : 400,
                      transition: 'background 0.3s',
                      boxShadow: isCurrent ? 'inset 0 0 0 2px #F4A261' : isBackt ? 'inset 0 0 0 2px #FFD700' : 'none',
                    }}
                  >
                    {isFilled || i === 0 ? (val >= 1000 ? `${Math.round(val/1000)}k` : val || 0) : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
        {[['Current','#FFE082'],['Filled (value>0)','#C8E6C9'],['Backtrack path','#FFD700']].map(([l,c]) => (
          <span key={l} className="flex items-center gap-1">
            <span style={{ width:10,height:10,background:c,display:'inline-block',borderRadius:2,border:'1px solid #ddd' }}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
