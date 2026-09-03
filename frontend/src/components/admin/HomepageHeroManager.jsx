import React, { useState } from 'react';
import { Sparkles, Save, Eye, CheckCircle2 } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import { useToast } from '../../context/ToastContext';
import heroBannerAsset from '../../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';

export default function HomepageHeroManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);

  const [heroForm, setHeroForm] = useState({
    active: true,
    desktopImage: heroBannerAsset,
    mobileImage: '',
    eyebrow: 'The Royal Anti-Tarnish Collection • 2026',
    mainHeading: 'JEWELLERY THAT DEFINES',
    highlightHeading: 'YOU.',
    description: 'Timeless pieces designed for modern Indian elegance. Handcrafted with 18K Real Gold PVD coating, natural freshwater pearls, and guaranteed zero tarnish.',
    primaryButtonText: 'Shop Women',
    primaryButtonLink: '/women',
    secondaryButtonText: 'Shop Men',
    secondaryButtonLink: '/men',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    addToast('Hero Banner configuration saved successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">Hero Banner Management</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">Customize the main full-bleed cinematic hero section of the live storefront.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D6CFFF]/60 shadow-xs">
            <input
              type="checkbox"
              checked={heroForm.active}
              onChange={(e) => setHeroForm({ ...heroForm, active: e.target.checked })}
              className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
            />
            <span className="text-xs font-semibold text-[#171522]">
              {heroForm.active ? 'Status: Active' : 'Status: Disabled'}
            </span>
          </label>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20">
            Content & Copy
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Badge / Eyebrow Text</label>
              <input
                type="text"
                value={heroForm.eyebrow}
                onChange={(e) => setHeroForm({ ...heroForm, eyebrow: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Main Heading</label>
                <input
                  type="text"
                  value={heroForm.mainHeading}
                  onChange={(e) => setHeroForm({ ...heroForm, mainHeading: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Highlight / Italic Heading</label>
                <input
                  type="text"
                  value={heroForm.highlightHeading}
                  onChange={(e) => setHeroForm({ ...heroForm, highlightHeading: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Hero Description</label>
              <textarea
                rows={3}
                value={heroForm.description}
                onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D6CFFF]/20">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Primary CTA Label</label>
                <input
                  type="text"
                  value={heroForm.primaryButtonText}
                  onChange={(e) => setHeroForm({ ...heroForm, primaryButtonText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Primary CTA Link</label>
                <input
                  type="text"
                  value={heroForm.primaryButtonLink}
                  onChange={(e) => setHeroForm({ ...heroForm, primaryButtonLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Secondary CTA Label</label>
                <input
                  type="text"
                  value={heroForm.secondaryButtonText}
                  onChange={(e) => setHeroForm({ ...heroForm, secondaryButtonText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Secondary CTA Link</label>
                <input
                  type="text"
                  value={heroForm.secondaryButtonLink}
                  onChange={(e) => setHeroForm({ ...heroForm, secondaryButtonLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Images & Live Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20">
              Hero Imagery
            </h3>

            <ImageUploadField
              label="Desktop Hero Banner Image"
              value={heroForm.desktopImage}
              onChange={(val) => setHeroForm({ ...heroForm, desktopImage: val })}
              helperText="Recommended: 1920x800px high-resolution banner"
            />

            <ImageUploadField
              label="Mobile Hero Image (Optional)"
              value={heroForm.mobileImage}
              onChange={(val) => setHeroForm({ ...heroForm, mobileImage: val })}
              helperText="Optional portrait/square format for small screens"
            />
          </div>

          {/* Quick Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#7464B8]" />
                Live Preview Snapshot
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Active
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video bg-[#120F1D] border border-[#D6CFFF]/40">
              <img
                src={heroForm.desktopImage || heroBannerAsset}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
                <p className="text-[8px] font-semibold tracking-wider text-[#D6CFFF] uppercase">{heroForm.eyebrow}</p>
                <p className="font-serif text-xs font-light leading-tight">{heroForm.mainHeading} {heroForm.highlightHeading}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
