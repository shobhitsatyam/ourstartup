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
    <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 lg:gap-3 items-start">
      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex lg:flex-col gap-2.5 sm:gap-3 lg:gap-2.5 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 shrink-0 lg:max-h-[500px] scrollbar-none">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-[64px] lg:h-[64px] xl:w-[68px] xl:h-[68px] rounded-2xl lg:rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white p-0.5 ${
                currentIndex === idx
                  ? 'border-[#7464B8] shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${name} thumb ${idx}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Frame - Natural Aspect Ratio & Contained on Desktop */}
      <div className="relative flex-1 w-full rounded-3xl lg:rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAF8FF] via-[#F6F2FF] to-[#EFE9FC] border border-[#D6CFFF]/50 shadow-xl lg:shadow-xs aspect-square max-h-[500px] flex items-center justify-center p-3 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={galleryImages[currentIndex]}
            alt={`${name} view ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full max-h-[460px] object-contain object-center cursor-zoom-in drop-shadow-xs transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => setFullscreenOpen(true)}
          />
        </AnimatePresence>

        {/* Anti-Tarnish Guaranteed Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full glass-panel shadow-sm text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase text-[#17151F]">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#7464B8]" />
          <span>Anti-Tarnish Certified</span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-sm"
          title="Fullscreen Zoom"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Carousel Prev/Next Navigation Controls */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white shadow-md transition-all active:scale-90"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white shadow-md transition-all active:scale-90"
              aria-label="Next Image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
