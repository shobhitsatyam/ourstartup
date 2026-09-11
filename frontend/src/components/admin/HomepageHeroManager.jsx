import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Eye,
  CheckCircle2,
  ArrowUpRight,
  Smartphone,
  Monitor,
  RotateCcw,
  Compass,
  ChevronLeft,
  ChevronRight,
  Layers2,
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import DragDropImageUpload from './DragDropImageUpload';
import { useToast } from '../../context/ToastContext';
import {
  getHeroConfig,
  fetchHeroConfig,
  saveHeroConfigApi,
  resetHeroConfigApi,
  HERO_UPDATE_EVENT,
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_CONFIG,
} from '../../utils/heroBannerStorage';

export default function HomepageHeroManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [heroForm, setHeroForm] = useState(() => getHeroConfig());
  const [activeSlideTab, setActiveSlideTab] = useState(0);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' (16:5) | 'mobile' (16:10)

  // Fetch live CMS configuration from MongoDB Atlas on mount
  useEffect(() => {
    let isMounted = true;
    fetchHeroConfig().then((liveConfig) => {
      if (isMounted && liveConfig) {
        setHeroForm(liveConfig);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for external updates (e.g. cross-tab)
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

  const slides = heroForm.slides && heroForm.slides.length > 0
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

  const handleMoveSlide = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;
    setHeroForm({ ...heroForm, slides: newSlides });
    setActiveSlideTab(targetIdx);
    setPreviewSlideIndex(targetIdx);
  };

  const handleRemoveSlide = (index) => {
    if (slides.length <= 1) {
      addToast('At least one hero banner is required.', 'warning');
      return;
    }
    if (window.confirm(`Are you sure you want to remove Banner ${index + 1}?`)) {
      const newSlides = slides.filter((_, idx) => idx !== index);
      setHeroForm({ ...heroForm, slides: newSlides });
      const newTab = Math.max(0, index - 1);
      setActiveSlideTab(newTab);
      setPreviewSlideIndex(newTab);
      addToast(`Banner ${index + 1} removed. Remember to Save Changes.`, 'info');
    }
  };

  const handleAddSlide = () => {
    const newSlideNumber = slides.length + 1;
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: `NEW COLLECTION EDIT ${newSlideNumber}`,
      subtitle: 'Handcrafted luxury pieces with 18K Gold PVD coating',
      ctaText: 'Explore Collection',
      image: DEFAULT_HERO_SLIDES[0].image,
      destinationUrl: '/collections',
      active: true,
    };
    const newSlides = [...slides, newSlide];
    setHeroForm({ ...heroForm, slides: newSlides });
    setActiveSlideTab(newSlides.length - 1);
    setPreviewSlideIndex(newSlides.length - 1);
    addToast(`New Banner ${newSlideNumber} added.`, 'success');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    for (let i = 0; i < slides.length; i++) {
      if (!slides[i]?.image) {
        addToast(`Please upload or select an image for Banner ${i + 1}`, 'error');
        setActiveSlideTab(i);
        return;
      }
    }

    try {
      setIsSaving(true);
      await saveHeroConfigApi({
        ...heroForm,
        slides,
      });
      setSaved(true);
      addToast(`Hero banners saved to MongoDB Atlas! All ${slides.length} banners updated live globally.`, 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save hero banner error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save to database';
      addToast(`Error saving Hero Banner: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all hero banners to original 4 brand defaults across the live store?')) {
      try {
        setIsSaving(true);
        await resetHeroConfigApi();
        setHeroForm(DEFAULT_HERO_CONFIG);
        setPreviewSlideIndex(0);
        setActiveSlideTab(0);
        addToast('Hero banners reset to 4 brand defaults globally', 'info');
      } catch (err) {
        addToast('Failed to reset hero configuration', 'error');
      } finally {
        setIsSaving(false);
      }
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

  const currentSlide = slides[activeSlideTab] || slides[0] || DEFAULT_HERO_SLIDES[0];
  const previewSlide = slides[previewSlideIndex] || slides[0] || DEFAULT_HERO_SLIDES[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#7464B8] uppercase tracking-wider bg-[#F3EFFF] px-2.5 py-0.5 rounded-full border border-[#D6CFFF]/60">
              Homepage Hero & Mobile Banners ({slides.length} Banners)
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#171522] font-light mt-1">
            Homepage Hero Banner Management
          </h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">
            Manage all 4 hero banners: upload images, set 16:10 mobile & 16:5 desktop view, edit titles, CTAs, destination links, reorder, and save globally to MongoDB Atlas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Status Switch */}
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D6CFFF]/60 shadow-xs hover:border-[#7464B8] transition-colors">
            <input
              type="checkbox"
              checked={heroForm.active}
              onChange={(e) => setHeroForm({ ...heroForm, active: e.target.checked })}
              className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4 accent-[#7464B8]"
            />
            <span className="text-xs font-semibold text-[#171522]">
              {heroForm.active ? 'Hero: Active' : 'Hero: Inactive'}
            </span>
          </label>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            title="Reset to default brand images"
            className="p-2 rounded-xl text-gray-400 hover:text-[#171522] hover:bg-white border border-transparent hover:border-[#D6CFFF]/60 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving to Atlas...' : saved ? 'Saved Live' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Banner Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Banner Selector Tabs with Add & Reorder */}
          <div className="bg-white p-2 rounded-2xl border border-[#D6CFFF]/60 shadow-xs flex flex-wrap items-center gap-2">
            {slides.map((slide, idx) => {
              const isSelected = activeSlideTab === idx;
              return (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveSlideTab(idx);
                    setPreviewSlideIndex(idx);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#171522] text-white shadow-xs'
                      : 'bg-[#FAF9FF] text-gray-600 hover:bg-[#F3EFFF] hover:text-[#171522]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>Banner {idx + 1}</span>
                  {slide.active === false && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      Off
                    </span>
                  )}
                  {slide.image && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}

            {/* Add Slide Button */}
            <button
              type="button"
              onClick={handleAddSlide}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#F3EFFF] text-[#7464B8] hover:bg-[#e7e1fa] border border-[#D6CFFF]/60 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Banner</span>
            </button>
          </div>

          {/* Active Banner Detailed Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/20">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#7464B8]/10 text-[#7464B8] font-mono text-xs font-bold flex items-center justify-center">
                  {activeSlideTab + 1}
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#171522]">
                  BANNER {activeSlideTab + 1} CONFIGURATION
                </h3>
              </div>

              {/* Banner Actions: Active toggle, Move, Delete */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={currentSlide.active !== false}
                    onChange={(e) => handleUpdateSlide(activeSlideTab, 'active', e.target.checked)}
                    className="rounded text-[#7464B8] w-3.5 h-3.5 accent-[#7464B8]"
                  />
                  <span>Active</span>
                </label>

                {/* Move Left / Up */}
                <button
                  type="button"
                  onClick={() => handleMoveSlide(activeSlideTab, -1)}
                  disabled={activeSlideTab === 0}
                  title="Move banner earlier in sequence"
                  className="p-1.5 rounded-lg border border-[#D6CFFF]/60 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-gray-600" />
                </button>

                {/* Move Right / Down */}
                <button
                  type="button"
                  onClick={() => handleMoveSlide(activeSlideTab, 1)}
                  disabled={activeSlideTab === slides.length - 1}
                  title="Move banner later in sequence"
                  className="p-1.5 rounded-lg border border-[#D6CFFF]/60 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
                </button>

                {/* Remove Banner */}
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(activeSlideTab)}
                    title="Delete banner"
                    className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Cloudinary Drag & Drop Uploader */}
            <DragDropImageUpload
              label={`Banner ${activeSlideTab + 1} Image (Cloudinary Persisted)`}
              value={currentSlide.image}
              onChange={(val) => {
                handleUpdateSlide(activeSlideTab, 'image', val);
                setPreviewSlideIndex(activeSlideTab);
              }}
              aspectRatio="aspect-[16/10]"
              helperText="Uploads directly to Cloudinary and saves globally to MongoDB Atlas. Works across all devices."
            />

            {/* Banner Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171522]">
                Banner Title / Heading
              </label>
              <input
                type="text"
                value={currentSlide.title || ''}
                onChange={(e) => handleUpdateSlide(activeSlideTab, 'title', e.target.value)}
                placeholder="e.g. THE ROYAL ANTI-TARNISH COLLECTION"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            {/* Banner Subtitle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171522]">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={currentSlide.subtitle || ''}
                onChange={(e) => handleUpdateSlide(activeSlideTab, 'subtitle', e.target.value)}
                placeholder="e.g. Handcrafted with 18K Real Gold PVD coating & lifetime tarnish warranty"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            {/* CTA Button Text & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171522]">
                  Button CTA Text
                </label>
                <input
                  type="text"
                  value={currentSlide.ctaText || ''}
                  onChange={(e) => handleUpdateSlide(activeSlideTab, 'ctaText', e.target.value)}
                  placeholder="e.g. Shop Women"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171522]">
                  Click Destination Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentSlide.destinationUrl || ''}
                    onChange={(e) => handleUpdateSlide(activeSlideTab, 'destinationUrl', e.target.value)}
                    placeholder="/collections or /women or /bestsellers"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono"
                  />
                  <Compass className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quick Destination Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-gray-400 font-medium self-center mr-1">Quick Picks:</span>
              {QUICK_DESTINATIONS.map((dest) => (
                <button
                  key={dest.url}
                  type="button"
                  onClick={() => handleUpdateSlide(activeSlideTab, 'destinationUrl', dest.url)}
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

          {/* Quick Slides Overview Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171522] flex items-center gap-1.5">
              <Layers2 className="w-3.5 h-3.5 text-[#7464B8]" />
              Configured Banners Sequence ({slides.length} Total)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
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
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-[#120F1D] mb-1.5 relative">
                    <img src={s.image} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover object-[center_35%]" />
                    {s.active === false && (
                      <span className="absolute top-1 right-1 text-[8px] uppercase px-1 py-0.2 rounded bg-red-600 text-white font-bold">
                        Off
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#171522]">Banner {idx + 1}</span>
                    <span className="font-mono text-gray-500 truncate max-w-[70px]">{s.destinationUrl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Storefront Preview (Desktop 16:5 / Mobile 16:10) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
              {/* Preview Aspect Switcher */}
              <div className="flex items-center gap-1 bg-[#FAF9FF] p-1 rounded-xl border border-[#D6CFFF]/50">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    previewMode === 'desktop'
                      ? 'bg-[#171522] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-[#171522]'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop 16:5</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    previewMode === 'mobile'
                      ? 'bg-[#171522] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-[#171522]'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile 16:10</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Banner {previewSlideIndex + 1} of {slides.length}
                </span>
              </div>
            </div>

            {/* Preview Viewport Container */}
            <div
              className={`relative w-full rounded-xl overflow-hidden bg-[#120F1D] border border-[#D6CFFF]/60 shadow-sm group select-none ${
                previewMode === 'desktop' ? 'aspect-[16/5]' : 'aspect-[16/10]'
              }`}
            >
              <img
                src={previewSlide.image}
                alt={previewSlide.title}
                className="w-full h-full object-cover object-[center_35%]"
              />

              {/* Text & CTA Overlay (Desktop Only — Mobile/Tablet is Clean Image-Only) */}
              {previewMode === 'desktop' ? (
                <div className="absolute inset-0 bg-gradient-to-t from-[#120F1D]/90 via-[#120F1D]/30 to-transparent flex flex-col justify-end p-4">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs w-fit mb-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#D6CFFF]" />
                    <span className="text-[8px] font-semibold text-white uppercase tracking-wider">
                      Zivana Jewels Luxury
                    </span>
                  </div>
                  <h4 className="font-serif text-sm sm:text-base text-white font-light line-clamp-1">
                    {previewSlide.title || 'JEWELLERY THAT DEFINES YOU'}
                  </h4>
                  {previewSlide.subtitle && (
                    <p className="text-[10px] text-[#E8E3FF]/90 line-clamp-1 mt-0.5">
                      {previewSlide.subtitle}
                    </p>
                  )}
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-[#17151F] text-[10px] font-semibold uppercase tracking-wider">
                      {previewSlide.ctaText || 'Shop Now'}
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-medium text-white/90 border border-white/20">
                  Clean Image-Only (Mobile/Tablet)
                </div>
              )}

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={() => setPreviewSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs border border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewSlideIndex((prev) => (prev + 1) % slides.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs border border-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>Aspect Ratio: {previewMode === 'desktop' ? '16:5 Desktop' : '16:10 Mobile/Tablet'}</span>
              <span className="font-mono text-[10px] text-[#7464B8] truncate max-w-[180px]">
                {previewSlide.destinationUrl}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
