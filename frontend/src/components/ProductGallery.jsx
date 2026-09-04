import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, ShieldCheck } from 'lucide-react';

export default function ProductGallery({ images = [], name = 'Ocean Jewel Piece' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const galleryImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 shrink-0">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-gray-100 ${
                currentIndex === idx
                  ? 'border-[#7464B8] shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${name} thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Frame - Strict 1:1 Aspect Ratio on Desktop */}
      <div className="relative flex-1 rounded-3xl overflow-hidden bg-[#F3EFFF] border border-[#D6CFFF]/50 shadow-xl aspect-square lg:aspect-square lg:[aspect-ratio:1/1]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={galleryImages[currentIndex]}
            alt={`${name} view ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover object-center cursor-zoom-in"
            onClick={() => setFullscreenOpen(true)}
          />
        </AnimatePresence>

        {/* Anti-Tarnish Guaranteed Badge */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel shadow-sm text-[10px] font-bold tracking-wider uppercase text-[#17151F]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#7464B8]" />
          <span>Anti-Tarnish Certified</span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-sm"
          title="Fullscreen Zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Carousel Prev/Next Navigation Controls */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white shadow-md transition-all active:scale-90"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white shadow-md transition-all active:scale-90"
              aria-label="Next Image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Fullscreen Modal Lightbox */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setFullscreenOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={galleryImages[currentIndex]}
              alt={name}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
