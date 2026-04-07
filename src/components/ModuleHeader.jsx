import React from 'react';

const MOD_COLORS = {
  2: { bg:'#E3F2FD', color:'#1565C0' },
  3: { bg:'#F3E5F5', color:'#6A1B9A' },
  4: { bg:'#E8F5E9', color:'#2E7D32' },
  5: { bg:'#FFF3E0', color:'#E65100' },
  6: { bg:'#FCE4EC', color:'#880E4F' },
};

export default function ModuleHeader({ module, title, subtitle, timeComplexity, spaceComplexity, children }) {
  const mc = MOD_COLORS[module] || { bg:'#F5F5F5', color:'#333' };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start gap-3 mb-2">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{ background: mc.bg, color: mc.color }}
        >
          Module {module}
        </span>
        {timeComplexity && (
          <span className="complexity-pill">⏱ {timeComplexity}</span>
        )}
        {spaceComplexity && (
          <span className="complexity-pill">💾 {spaceComplexity}</span>
        )}
      </div>
      <h2 className="text-2xl font-bold text-textDark mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-muted leading-relaxed">{subtitle}</p>}
      {children}
    </div>
  );
}
