import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LuxuryLoader({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#17151F] text-white"
        >
          {/* Ambient Glowing Lavender Orb */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: [0.8, 1.25, 1], opacity: [0.4, 0.8, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-72 h-72 rounded-full bg-[#D6CFFF] blur-[90px] pointer-events-none opacity-30"
          />

          {/* Luxury Pearl Sphere */}
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFFFFF] via-[#E8E3FF] to-[#D6CFFF] p-[2px] shadow-[0_0_35px_rgba(214,207,255,0.6)]"
            >
              <div className="w-full h-full rounded-full bg-[#17151F] flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-[#D6CFFF] shadow-[0_0_15px_#D6CFFF]"
                />
              </div>
            </motion.div>
          </div>

          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center tracking-[0.35em] text-white"
          >
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-[0.3em] uppercase bg-gradient-to-r from-white via-[#D6CFFF] to-white bg-clip-text text-transparent">
              Ocean Jewel
            </h1>
            <p className="text-[10px] sm:text-xs text-[#D6CFFF]/70 uppercase tracking-[0.4em] mt-2 font-sans font-medium">
              Timeless Elegance &bull; Modern Indian Luxury
            </p>
          </motion.div>

          {/* Minimalist Progress Line */}
          <div className="w-32 h-[2px] bg-white/10 rounded-full mt-8 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#D6CFFF] to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
