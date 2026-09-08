import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Eye, CheckCircle2, ArrowUpRight, Smartphone, Monitor, RotateCcw, Compass, ChevronLeft, ChevronRight, Layers, Layers2 } from 'lucide-react';
import DragDropImageUpload from './DragDropImageUpload';
import { useToast } from '../../context/ToastContext';
import {
  getHeroConfig,
  saveHeroConfig,
  resetHeroConfig,
  HERO_UPDATE_EVENT,
  DEFAULT_HERO_SLIDES,
} from '../../utils/heroBannerStorage';

export default function HomepageHeroManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [heroForm, setHeroForm] = useState(() => getHeroConfig());
  const [activeSlideTab, setActiveSlideTab] = useState(0); // 0 = Slide 1, 1 = Slide 2, 2 = Slide 3
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  // Listen for external updates (e.g. across tabs)
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail) {
        setHeroForm(e.detail);
      } else {
        setHeroForm(getHeroConfig());
      }
    };
    window.addEventListener(HERO_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(HERO_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const slides = heroForm.slides && heroForm.slides.length === 3
    ? heroForm.slides
    : DEFAULT_HERO_SLIDES;

  const handleUpdateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = {
      ...newSlides[index],
      [field]: value,
    };
    setHeroForm({
      ...heroForm,
      slides: newSlides,
    });
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    // Validate each slide has an image
    for (let i = 0; i < slides.length; i++) {
      if (!slides[i]?.image) {
        addToast(`Please upload or provide an image for Slide ${i + 1}`, 'error');
        setActiveSlideTab(i);
        return;
      }
    }

    const savedData = saveHeroConfig({
      ...heroForm,
      slides,
    });
    if (savedData) {
      setSaved(true);
      addToast('Hero Banner saved! All 3 slides updated live on desktop storefront.', 'success');
      setTimeout(() => setSaved(false), 3000);
    } else {
      addToast('Failed to save hero banner configuration', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all 3 hero slides to initial brand defaults?')) {
      const resetData = resetHeroConfig();
      setHeroForm(resetData);
      setPreviewSlideIndex(0);
      setActiveSlideTab(0);
      addToast('Hero banner reset to 3 default slides', 'info');
    }
  };

  const QUICK_DESTINATIONS = [
    { label: 'All Collections (/collections)', url: '/collections' },
    { label: 'Shop All (/shop)', url: '/shop' },
    { label: 'New Arrivals (/new-arrivals)', url: '/new-arrivals' },
    { label: 'Bestsellers (/bestsellers)', url: '/bestsellers' },
    { label: 'Women Collection (/women)', url: '/women' },
    { label: 'Men Collection (/men)', url: '/men' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#7464B8] uppercase tracking-wider bg-[#F3EFFF] px-2.5 py-0.5 rounded-full border border-[#D6CFFF]/60">
              Desktop 16:5 3-Slide Carousel
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#171522] font-light mt-1">
            Desktop Hero Banner Management
          </h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">
            Configure the 3 full-bleed slideshow images, 16:5 aspect ratio, and independent destination links for desktop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Switch */}
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D6CFFF]/60 shadow-xs hover:border-[#7464B8] transition-colors">
            <input
              type="checkbox"
              checked={heroForm.active}
              onChange={(e) => setHeroForm({ ...heroForm, active: e.target.checked })}
              className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4 accent-[#7464B8]"
            />
            <span className="text-xs font-semibold text-[#171522]">
              {heroForm.active ? 'Status: Active' : 'Status: Inactive'}
            </span>
          </label>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default brand images"
            className="p-2 rounded-xl text-gray-400 hover:text-[#171522] hover:bg-white border border-transparent hover:border-[#D6CFFF]/60 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs active:scale-98"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved Live' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3-Slide Independent Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slide Tab Selector */}
          <div className="bg-white p-2 rounded-2xl border border-[#D6CFFF]/60 shadow-xs flex items-center gap-2">
            {[0, 1, 2].map((idx) => {
              const slide = slides[idx] || {};
              const isSelected = activeSlideTab === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveSlideTab(idx);
                    setPreviewSlideIndex(idx);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#171522] text-white shadow-xs'
                      : 'bg-[#FAF9FF] text-gray-600 hover:bg-[#F3EFFF] hover:text-[#171522]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>Slide {idx + 1}</span>
                  {slide.image && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Slide Configuration Panel */}
          {(() => {
            const currentIdx = activeSlideTab;
            const currentSlide = slides[currentIdx] || DEFAULT_HERO_SLIDES[currentIdx];

            return (
              <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#7464B8]/10 text-[#7464B8] font-mono text-xs font-bold flex items-center justify-center">
                      {currentIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#171522]">
                      DESKTOP HERO — SLIDE {currentIdx + 1}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#7464B8] uppercase tracking-wider bg-[#F3EFFF] px-2.5 py-1 rounded-full border border-[#D6CFFF]/60">
                    Ratio 16:5
                  </span>
                </div>

                {/* Drag & Drop Image Uploader for this slide */}
                <DragDropImageUpload
                  label={`Desktop Hero Slide ${currentIdx + 1} Image`}
                  value={currentSlide.image}
                  onChange={(val) => {
                    handleUpdateSlide(currentIdx, 'image', val);
                    setPreviewSlideIndex(currentIdx);
                  }}
                  aspectRatio="aspect-[16/5]"
                  helperText="Recommended: 16:5 ratio (e.g. 1920x600px). Supports JPG, JPEG, PNG, or WebP up to 10MB"
                />

                {/* Slide Destination Link Input */}
                <div className="pt-3 border-t border-[#D6CFFF]/20 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171522]">
                    Slide {currentIdx + 1} Click Destination Link
                  </label>
                  <p className="text-[11px] text-gray-500 font-light">
                    Clicking anywhere on Slide {currentIdx + 1} will navigate to this URL without full page reload.
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentSlide.destinationUrl || ''}
                      onChange={(e) => handleUpdateSlide(currentIdx, 'destinationUrl', e.target.value)}
                      placeholder="/collections or /new-arrivals or /bestsellers"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono"
                    />
                    <Compass className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Quick Destination Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-medium self-center mr-1">Quick Picks:</span>
                    {QUICK_DESTINATIONS.map((dest) => (
                      <button
                        key={dest.url}
                        type="button"
                        onClick={() => handleUpdateSlide(currentIdx, 'destinationUrl', dest.url)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium border transition-all ${
                          currentSlide.destinationUrl === dest.url
                            ? 'bg-[#171522] text-white border-[#171522]'
                            : 'bg-[#FAF9FF] text-gray-600 border-[#D6CFFF]/50 hover:border-[#7464B8]'
                        }`}
                      >
                        {dest.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quick Slides Summary Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171522] flex items-center gap-1.5">
              <Layers2 className="w-3.5 h-3.5 text-[#7464B8]" />
              Configured Desktop Slides (Loop Order 1 → 2 → 3)
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveSlideTab(idx);
                    setPreviewSlideIndex(idx);
                  }}
                  className={`p-2 rounded-xl border cursor-pointer transition-all ${
                    activeSlideTab === idx
                      ? 'border-[#7464B8] bg-[#F3EFFF]/50 ring-1 ring-[#7464B8]'
                      : 'border-[#D6CFFF]/60 bg-[#FAF9FF] hover:border-[#7464B8]/60'
                  }`}
                >
                  <div className="aspect-[16/5] rounded-lg overflow-hidden bg-[#120F1D] mb-1.5">
                    <img src={s.image} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#171522]">Slide {idx + 1}</span>
                    <span className="font-mono text-gray-500 truncate max-w-[80px]">{s.destinationUrl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Desktop 16:5 Preview with Switcher */}
        <div className="lg:col-span-5 space-y-5">
          {/* Desktop Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#7464B8]" />
                Live Storefront Preview (16:5 Ratio)
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Slide {previewSlideIndex + 1} of 3
                </span>
              </div>
            </div>

            {/* 16:5 Aspect Ratio Container with Interactive Navigation */}
            <div
              className="relative w-full rounded-xl overflow-hidden bg-[#120F1D] border border-[#D6CFFF]/60 shadow-sm group select-none"
              style={{ aspectRatio: '16 / 5' }}
            >
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                    idx === previewSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`Preview Slide ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}

              {/* Preview Arrows */}
              <button
                type="button"
                onClick={() => setPreviewSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPreviewSlideIndex((prev) => (prev + 1) % slides.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Preview Indicator Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-xs">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewSlideIndex(idx)}
                    className={`transition-all rounded-full ${
                      idx === previewSlideIndex ? 'w-4 h-1 bg-white' : 'w-1 h-1 bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Destination URL Indicator Badge */}
              <div className="absolute top-2 left-2 z-20 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-mono text-white flex items-center gap-1 border border-white/20">
                  <Compass className="w-2.5 h-2.5 text-[#D6CFFF]" />
                  <span>{slides[previewSlideIndex]?.destinationUrl || '/collections'}</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/50 text-[11px] text-[#6F6B78] flex items-center justify-between">
              <span>Current slide destination: <strong className="text-[#171522] font-mono">{slides[previewSlideIndex]?.destinationUrl || '/collections'}</strong></span>
              <span className="text-[10px] font-semibold text-[#7464B8] uppercase tracking-wider">Auto-loops every 4.5s</span>
            </div>
          </div>

          {/* Ready to Publish Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#D6CFFF]/60 shadow-xs space-y-3">
            <div>
              <p className="text-xs font-bold text-[#171522]">Publish 3-Slide Carousel?</p>
              <p className="text-[11px] text-gray-500 font-light mt-0.5">
                Saving updates all 3 desktop slideshow images and links immediately on the live storefront.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 bg-[#7464B8] text-white rounded-xl text-xs font-bold hover:bg-[#5f509e] transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Saved Live on Storefront' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
