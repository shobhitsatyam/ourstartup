import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#17151F] text-white py-16 px-4 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#D6CFFF]/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md mx-auto text-center space-y-6 relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-[#D6CFFF]/40 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(214,207,255,0.4)]">
          <Compass className="w-10 h-10 text-[#D6CFFF] animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#D6CFFF]">
            Error 404
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-wide text-white">
            LOST AT SEA?
          </h1>
          <p className="text-xs text-white/60 font-light leading-relaxed max-w-sm mx-auto">
            The jewellery treasure or page you are searching for has drifted away or does not exist.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D6CFFF] to-[#E8E3FF] text-[#17151F] text-xs font-bold uppercase tracking-widest rounded-2xl hover:opacity-95 shadow-2xl btn-shine"
          >
            <span>Return to Shore (Home)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
