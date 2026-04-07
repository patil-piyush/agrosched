import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function SectionWrapper({ id, children, className = '', minHeight = '100vh', bg = '#F8FAF5', onEnter }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.3, once: false });

  useEffect(() => {
    if (inView && onEnter) onEnter();
  }, [inView]);

  return (
    <section
      id={id}
      ref={ref}
      className={`scroll-section flex flex-col ${className}`}
      style={{ minHeight, background: bg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </section>
  );
}
