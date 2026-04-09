import React, { useRef } from 'react';
import { FarmProvider } from './context/FarmContext';
import HeroSection         from './sections/HeroSection';
import FarmSetupSection    from './sections/FarmSetupSection';
import FarmOverviewSection from './sections/FarmOverviewSection';
import Module2Section      from './sections/Module2Section';
import Module3Section      from './sections/Module3Section';
import Module4Section      from './sections/Module4Section';
import Module5Section      from './sections/Module5Section';
import Module6Section      from './sections/Module6Section';
import FullSeasonSection   from './sections/FullSeasonSection';
import ComparisonsSection  from './sections/ComparisonsSection';

const SECTIONS = [
  { label:'Home',      color:'#2D6A4F' },
  { label:'Setup',     color:'#1565C0' },
  { label:'Farm',      color:'#2D6A4F' },
  { label:'M2: D&C',   color:'#1565C0' },
  { label:'M3: Greedy',color:'#6A1B9A' },
  { label:'M4: DP',    color:'#2E7D32' },
  { label:'M5: BT',    color:'#E65100' },
  { label:'M6: B&B',   color:'#880E4F' },
  { label:'Season',    color:'#2D6A4F' },
  { label:'Compare',   color:'#374151' },
];

function NavDots({ containerRef }) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollTop / window.innerHeight);
      setActive(Math.min(idx, SECTIONS.length - 1));
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [containerRef]);

  const scrollTo = i => {
    const el = containerRef.current;
    if (el) el.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div style={{
      position:'fixed', right:14, top:'50%', transform:'translateY(-50%)',
      zIndex:50, display:'flex', flexDirection:'column', gap:7,
    }}>
      {SECTIONS.map((s, i) => (
        <button
          key={i} onClick={() => scrollTo(i)} title={s.label}
          style={{ background:'none', border:'none', cursor:'pointer', padding:3,
                   display:'flex', alignItems:'center', justifyContent:'flex-end', gap:6 }}
        >
          <div style={{
            width:  active===i ? 10 : 6,
            height: active===i ? 10 : 6,
            borderRadius: '50%',
            transition: 'all 0.3s',
            background: active===i ? s.color : 'rgba(0,0,0,0.2)',
            boxShadow: active===i ? `0 0 0 2.5px ${s.color}40` : 'none',
          }} />
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const containerRef = useRef(null);
  return (
    <FarmProvider>
      <div ref={containerRef} className="scroll-container">
        <NavDots containerRef={containerRef} />
        <HeroSection />
        <FarmSetupSection />
        <FarmOverviewSection />
        <Module2Section />
        <Module3Section />
        <Module4Section />
        <Module5Section />
        <Module6Section />
        <FullSeasonSection />
        <ComparisonsSection />
      </div>
    </FarmProvider>
  );
}
