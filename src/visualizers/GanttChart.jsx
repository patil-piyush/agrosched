import React, { useMemo } from 'react';
import { CROP_COLORS } from '../utils/formatters';

export default function GanttChart({ assignments, rejected, trace, currentStep, plots, totalWeeks = 24 }) {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Which assignments have been placed so far in the animation
  const placed = useMemo(() => {
    if (!trace || currentStep < 0) return new Set();
    const s = new Set();
    trace.slice(0, currentStep + 1).forEach(f => {
      if (f.status === 'scheduled') s.add(f.job);
    });
    return s;
  }, [trace, currentStep]);

  const currentFrame = trace?.[currentStep];
  const rejectedSoFar = useMemo(() => {
    if (!trace || currentStep < 0) return new Set();
    const s = new Set();
    trace.slice(0, currentStep + 1).forEach(f => {
      if (f.status === 'rejected') s.add(f.job);
    });
    return s;
  }, [trace, currentStep]);

  // Build lookup: plotId -> list of assignments
  const assignByPlot = useMemo(() => {
    const map = {};
    (plots || []).forEach(p => { map[p.id] = []; });
    (assignments || []).filter(a => placed.has(a.id)).forEach(a => {
      if (map[a.plotId]) map[a.plotId].push(a);
    });
    return map;
  }, [assignments, placed, plots]);

  // Phase lines
  const phases = [
    { name: 'Kharif Early', start: 1,  end: 8,  color: '#E3F2FD' },
    { name: 'Kharif Late',  start: 9,  end: 16, color: '#F3E5F5' },
    { name: 'Rabi',         start: 17, end: 24, color: '#E8F5E9' },
  ];

  const CELL_W = 28;
  const ROW_H  = 38;

  return (
    <div className="overflow-x-auto">
      {/* Phase header */}
      <div className="flex mb-1" style={{ marginLeft: 90 }}>
        {phases.map(ph => (
          <div
            key={ph.name}
            className="text-center text-xs font-semibold py-1 rounded-t"
            style={{ width: (ph.end - ph.start + 1) * CELL_W, background: ph.color, color: '#555' }}
          >
            {ph.name}
          </div>
        ))}
      </div>

      {/* Week numbers */}
      <div className="flex mb-1" style={{ marginLeft: 90 }}>
        {weeks.map(w => (
          <div key={w} className="text-center text-gray-400 border-l border-gray-100"
            style={{ width: CELL_W, fontSize: 9, lineHeight: '16px' }}>
            {w % 4 === 1 ? w : ''}
          </div>
        ))}
      </div>

      {/* Rows per plot */}
      {(plots || []).map(plot => (
        <div key={plot.id} className="flex items-center mb-0.5">
          {/* Plot label */}
          <div className="text-xs font-medium text-gray-600 pr-2 text-right" style={{ width: 90, flexShrink: 0 }}>
            {plot.name.replace('Plot ', 'P')}
            <div className="text-gray-400" style={{ fontSize: 9 }}>{plot.soilType}</div>
          </div>

          {/* Week cells */}
          <div className="flex relative" style={{ height: ROW_H }}>
            {weeks.map(w => {
              const ph = phases.find(p => w >= p.start && w <= p.end);
              return (
                <div
                  key={w}
                  className="gantt-cell"
                  style={{ width: CELL_W, background: ph?.color || '#f9fafb', opacity: 0.6 }}
                />
              );
            })}

            {/* Crop blocks */}
            {(assignByPlot[plot.id] || []).map(a => {
              const col  = CROP_COLORS[a.cropId] || '#52B788';
              const left = (a.plantWeek - 1) * CELL_W;
              const width = Math.min(a.growthDurationWeeks, totalWeeks - a.plantWeek + 1) * CELL_W - 2;
              const isNew = currentFrame?.job === a.id;
              return (
                <div
                  key={a.id}
                  title={`${a.cropName} @ ${a.plotName}\nPlanted: Week ${a.plantWeek} | Harvest: Week ${a.harvestWeek}\nYield: ₹${a.profit?.toLocaleString()}`}
                  style={{
                    position: 'absolute',
                    left, top: 3, height: ROW_H - 6, width,
                    background: col,
                    borderRadius: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    boxShadow: isNew ? '0 0 0 3px #F4A261, 0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.15)',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', padding: '0 6px',
                    animation: isNew ? 'slideInLeft 0.4s ease-out' : 'none',
                    zIndex: 2,
                  }}
                >
                  {a.cropName}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Rejected list */}
      {rejectedSoFar.size > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-red-500">Missed deadlines:</span>
          {[...rejectedSoFar].map(job => (
            <span key={job} className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5">
              {job}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
