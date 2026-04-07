import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollIndicator({ show = true, label = 'Scroll to next algorithm' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2 py-4"
        >
          <span className="text-xs text-muted font-medium tracking-wide uppercase">{label}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-full border-2 border-secondary flex items-center justify-center"
            style={{ color: '#52B788' }}
          >
            ↓
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
