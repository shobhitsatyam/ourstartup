import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Eye, CheckCircle2, ArrowUpRight, Smartphone, Monitor, RotateCcw, Compass } from 'lucide-react';
import DragDropImageUpload from './DragDropImageUpload';
import { useToast } from '../../context/ToastContext';
import { getHeroConfig, saveHeroConfig, resetHeroConfig, HERO_UPDATE_EVENT } from '../../utils/heroBannerStorage';

export default function HomepageHeroManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [heroForm, setHeroForm] = useState(() => getHeroConfig());

  // Listen for external updates (e.g. across tabs)
  useEffect(() => {
    const handleUpdate = () => {
      setHeroForm(getHeroConfig());
    };
    window.addEventListener(HERO_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(HERO_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!heroForm.desktopImage) {
      addToast('Please upload or provide a desktop hero image', 'error');
      return;
    }

    const savedData = saveHeroConfig(heroForm);
    if (savedData) {
      setSaved(true);
      addToast('Hero Banner saved! Live storefront updated immediately.', 'success');
      setTimeout(() => setSaved(false), 3000);
    } else {
      addToast('Failed to save hero banner configuration', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset hero banner to initial brand defaults?')) {
      const resetData = resetHeroConfig();
      setHeroForm(resetData);
      addToast('Hero banner reset to defaults', 'info');
    }
  };

  const QUICK_DESTINATIONS = [
    { label: 'All Collections (/shop)', url: '/shop' },
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
              Image-Only Banner CMS
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#171522] font-light mt-1">Hero Banner Management</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">
            Configure the desktop full-bleed clickable image banner and optional mobile hero presentation.
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
            title="Reset to default image"
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
        {/* Left Column: Banner Media & Click Destination Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Desktop Hero Banner Section */}
          <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CFFF]/20">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#7464B8]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#171522]">
                  Desktop Hero Banner
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#7464B8] uppercase tracking-wider">
                Target Ratio 16:6
              </span>
            </div>

            <p className="text-xs text-gray-500 font-light">
              On desktop, all text, badges, descriptions, buttons, and overlays are removed. The banner renders as a clean, high-resolution 16:6 image that is entirely clickable.
            </p>

            {/* Desktop Hero Image Upload */}
            <DragDropImageUpload
              label="Desktop Hero Image"
              value={heroForm.desktopImage}
              onChange={(val) => setHeroForm({ ...heroForm, desktopImage: val })}
              aspectRatio="aspect-[16/6]"
              helperText="Drag & drop JPG, PNG, or WebP (recommended 1920x720px or 16:6 ratio, up to 10MB)"
            />

            {/* Banner Click Destination */}
            <div className="pt-3 border-t border-[#D6CFFF]/20 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171522]">
                Banner Click Destination (Collection / Page URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={heroForm.destinationUrl || ''}
                  onChange={(e) => setHeroForm({ ...heroForm, destinationUrl: e.target.value })}
                  placeholder="/shop or /new-arrivals or /collections/rings"
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
                    onClick={() => setHeroForm({ ...heroForm, destinationUrl: dest.url })}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium border transition-all ${
                      heroForm.destinationUrl === dest.url
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

          {/* 2. Mobile Hero Banner Section (Optional Custom Override) */}
          <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CFFF]/20">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#7464B8]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#171522]">
                  Mobile Hero Banner (Optional)
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                4:5 Ratio
              </span>
            </div>

            <p className="text-xs text-gray-500 font-light">
              Optional custom portrait hero image for mobile and tablet screens. If left unconfigured, the default luxury mobile editorial carousel will display.
            </p>

            <DragDropImageUpload
              label="Mobile Hero Image (Optional)"
              value={heroForm.mobileImage || ''}
              onChange={(val) => setHeroForm({ ...heroForm, mobileImage: val })}
              aspectRatio="aspect-[4/5]"
              helperText="Drag & drop JPG, PNG, or WebP for mobile screens (recommended 4:5 ratio)"
            />

            {heroForm.mobileImage && (
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171522] mb-1">
                  Mobile Destination Link
                </label>
                <input
                  type="text"
                  value={heroForm.mobileDestinationUrl || ''}
                  onChange={(e) => setHeroForm({ ...heroForm, mobileDestinationUrl: e.target.value })}
                  placeholder="/shop"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Desktop & Mobile Preview */}
        <div className="lg:col-span-5 space-y-5">
          {/* Desktop Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#7464B8]" />
                Desktop Storefront Preview (16:6 Ratio)
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                heroForm.active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {heroForm.active ? 'Active' : 'Disabled'}
              </span>
            </div>

            {/* 16:6 Aspect Ratio Container */}
            <div
              className="relative w-full rounded-xl overflow-hidden bg-[#120F1D] border border-[#D6CFFF]/60 shadow-sm group cursor-pointer"
              style={{ aspectRatio: '16 / 6' }}
            >
              {heroForm.desktopImage ? (
                <img
                  src={heroForm.desktopImage}
                  alt="Desktop Hero Preview"
                  className="w-full h-full object-cover object-[center_32%] group-hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50 text-xs">
                  <p>No desktop hero image selected</p>
                </div>
              )}

              {/* Destination URL Overlay Indicator */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-[9.5px] font-mono text-white flex items-center gap-1 border border-white/20">
                  <Compass className="w-3 h-3 text-[#D6CFFF]" />
                  <span>Click Destination: {heroForm.destinationUrl || '/shop'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/90 text-[#171522] text-[9px] font-bold uppercase tracking-wider shadow-xs">
                  Click Anywhere
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-light text-center">
              Clean image-only banner. Visitors clicking anywhere on the image will be redirected to{' '}
              <strong className="font-mono text-[#171522]">{heroForm.destinationUrl || '/shop'}</strong>.
            </p>
          </div>

          {/* Mobile Preview Snapshot (if configured) */}
          {heroForm.mobileImage && (
            <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#7464B8]" />
                  Mobile Image Preview (4:5 Ratio)
                </span>
              </div>
              <div className="w-36 mx-auto rounded-xl overflow-hidden aspect-[4/5] bg-[#120F1D] border border-[#D6CFFF]/60 shadow-sm">
                <img
                  src={heroForm.mobileImage}
                  alt="Mobile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Save Card on Side */}
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#171522]">Ready to Publish?</p>
              <p className="text-[11px] text-gray-500 font-light">Updates reflect instantly across all open browser tabs.</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#7464B8] text-white rounded-xl text-xs font-bold hover:bg-[#5f509e] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saved ? 'Saved' : 'Save Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
