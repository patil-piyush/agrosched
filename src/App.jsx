import React, { useRef } from 'react';
import { FarmProvider } from './context/FarmContext';
import HeroSection         from './sections/HeroSection';
import FarmOverviewSection from './sections/FarmOverviewSection';
import Module2Section      from './sections/Module2Section';
import Module3Section      from './sections/Module3Section';
import Module4Section      from './sections/Module4Section';
import Module5Section      from './sections/Module5Section';
import Module6Section      from './sections/Module6Section';
import FullSeasonSection   from './sections/FullSeasonSection';
import ComparisonsSection  from './sections/ComparisonsSection';

const SECTIONS = ['Home','Farm','M2: D&C','M3: Greedy','M4: DP','M5: BT','M6: B&B','Season','Compare'];

function NavDots({ containerRef }) {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setActive(Math.round(el.scrollTop / window.innerHeight));
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [containerRef]);
  const scrollTo = i => { const el=containerRef.current; if(el) el.scrollTo({top:i*window.innerHeight,behavior:'smooth'}); };
  return (
    <div style={{position:'fixed',right:12,top:'50%',transform:'translateY(-50%)',zIndex:50,display:'flex',flexDirection:'column',gap:8}}>
      {SECTIONS.map((label,i)=>(
        <button key={i} onClick={()=>scrollTo(i)} title={label}
          style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end',background:'none',border:'none',cursor:'pointer',padding:2}}>
          <div style={{width:active===i?10:6,height:active===i?10:6,borderRadius:'50%',transition:'all 0.3s',
            background:active===i?'#52B788':'rgba(0,0,0,0.25)',
            boxShadow:active===i?'0 0 0 2px rgba(82,183,136,0.4)':'none'}}/>
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
