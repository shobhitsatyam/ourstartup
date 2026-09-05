import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, MessageSquare, Sparkles } from 'lucide-react';

// Official Ocean Jewel Social Profile URL configuration
export const OCEAN_JEWEL_INSTAGRAM_URL = 'https://www.instagram.com/oceanjewel.luxury';

export default function FloatingSocialButton({ onOpenAIChat }) {
  const [hoveredBtn, setHoveredBtn] = useState(null); // 'instagram' | 'aichat' | null

  return (
    // Strictly desktop-only (hidden lg:flex): never shown on mobile or tablet
    // Fixed at bottom-left corner
    <aside
      aria-label="Floating quick actions"
      className="hidden lg:flex fixed bottom-6 left-6 z-40 items-center gap-2.5"
    >
      {/* 1. Official Instagram Floating Button */}
      <div
        className="relative"
        onMouseEnter={() => setHoveredBtn('instagram')}
        onMouseLeave={() => setHoveredBtn(null)}
      >
        <motion.a
          href={OCEAN_JEWEL_INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          aria-label="Visit Ocean Jewel on Instagram"
          className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#17151F] text-[#D6CFFF] hover:text-white hover:bg-[#7464B8] border border-[#D6CFFF]/40 shadow-[0_4px_16px_rgba(23,21,31,0.18)] hover:shadow-[0_8px_25px_rgba(116,100,184,0.35)] transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-[#7464B8]/50 focus:ring-offset-2"
        >
          <Instagram className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="absolute inset-0 rounded-full bg-[#D6CFFF]/10 group-hover:bg-white/15 transition-colors pointer-events-none" />
        </motion.a>

        {/* Micro-Tooltip for Instagram */}
        <AnimatePresence>
          {hoveredBtn === 'instagram' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#17151F]/95 backdrop-blur-md text-white border border-[#D6CFFF]/30 shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6CFFF] animate-pulse" />
              <span className="text-[10px] font-medium tracking-wide text-[#FAF9FF]">
                @oceanjewel.luxury
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Modern AI Chatbot Floating Button */}
      <div
        className="relative"
        onMouseEnter={() => setHoveredBtn('aichat')}
        onMouseLeave={() => setHoveredBtn(null)}
      >
        <motion.button
          type="button"
          onClick={() => {
            if (typeof onOpenAIChat === 'function') {
              onOpenAIChat();
            }
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.04 }}
          aria-label="AI Jewellery Concierge"
          className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#17151F] text-[#D6CFFF] hover:text-white hover:bg-[#7464B8] border border-[#D6CFFF]/40 shadow-[0_4px_16px_rgba(23,21,31,0.18)] hover:shadow-[0_8px_25px_rgba(116,100,184,0.35)] transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-[#7464B8]/50 focus:ring-offset-2"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <Sparkles className="w-2.5 h-2.5 absolute -top-1.5 -right-1.5 text-[#D6CFFF] group-hover:text-white transition-colors" />
          </div>
          <span className="absolute inset-0 rounded-full bg-[#D6CFFF]/10 group-hover:bg-white/15 transition-colors pointer-events-none" />
        </motion.button>

        {/* Micro-Tooltip for AI Chatbot */}
        <AnimatePresence>
          {hoveredBtn === 'aichat' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#17151F]/95 backdrop-blur-md text-white border border-[#D6CFFF]/30 shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 text-[#D6CFFF]" />
              <span className="text-[10px] font-medium tracking-wide text-[#FAF9FF]">
                AI Jewellery Stylist
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
