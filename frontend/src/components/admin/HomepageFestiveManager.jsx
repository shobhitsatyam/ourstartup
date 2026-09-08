import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Eye, CheckCircle2, Calendar, RotateCcw, Info, ArrowUpRight } from 'lucide-react';
import DragDropImageUpload from './DragDropImageUpload';
import { useToast } from '../../context/ToastContext';
import teejBannerAsset from '../../assets/teej_festive_offer_banner.png';
import {
  getFestiveConfig,
  saveFestiveConfig,
  resetFestiveConfig,
  FESTIVE_UPDATE_EVENT,
} from '../../utils/festiveBannerStorage';

export default function HomepageFestiveManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [festiveForm, setFestiveForm] = useState(() => getFestiveConfig());

  // Listen for real-time external updates (e.g. across tabs)
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail) {
        setFestiveForm(e.detail);
      } else {
        setFestiveForm(getFestiveConfig());
      }
    };
    window.addEventListener(FESTIVE_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(FESTIVE_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const campaignPresets = [
    { id: 'teej', name: 'Teej Festive', eyebrow: 'THE TEEJ EDIT', code: 'TEEJ500', offer: 'Flat ₹500 OFF on orders above ₹2,499' },
    { id: 'diwali', name: 'Diwali Grand Heirlooms', eyebrow: 'THE DIWALI EDIT', code: 'DIWALI20', offer: 'Flat 20% OFF on Festive Heirlooms' },
    { id: 'raksha-bandhan', name: 'Rakhi Special', eyebrow: 'RAKSHA BANDHAN EXCLUSIVE', code: 'RAKHI15', offer: '15% OFF on Sibling Gifts' },
    { id: 'durga-puja', name: 'Durga Puja Celebrations', eyebrow: 'PUJA HERITAGE EDIT', code: 'PUJA500', offer: 'Flat ₹500 OFF on Royal Gold' },
    { id: 'valentines', name: 'Valentine Solitaires', eyebrow: 'ETERNAL LOVE EDIT', code: 'LOVE10', offer: '10% OFF on Forever Rings' },
  ];

  const handleApplyPreset = (preset) => {
    setFestiveForm({
      ...festiveForm,
      campaignPreset: preset.id,
      campaignName: preset.name,
      eyebrow: preset.eyebrow,
      couponCode: preset.code,
      offerText: preset.offer,
    });
    addToast(`Applied ${preset.name} preset!`, 'info');
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!festiveForm.image) {
      addToast('Please upload or provide a festive banner background image', 'error');
      return;
    }

    const savedData = saveFestiveConfig(festiveForm);
    if (savedData) {
      setSaved(true);
      addToast('Festive Campaign saved! Live desktop banner updated immediately.', 'success');
      setTimeout(() => setSaved(false), 3000);
    } else {
      addToast('Failed to save festive campaign configuration', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset festive banner to brand defaults?')) {
      const resetData = resetFestiveConfig();
      setFestiveForm(resetData);
      addToast('Festive banner reset to defaults', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#7464B8] uppercase tracking-wider bg-[#F3EFFF] px-2.5 py-0.5 rounded-full border border-[#D6CFFF]/60">
              Desktop 16:4 Image-Only Banner
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#171522] font-light mt-1">Festival Offer Management</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">
            Control seasonal festive campaign artwork (Teej, Diwali, Rakhi) displayed on the desktop homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D6CFFF]/60 shadow-xs hover:border-[#7464B8] transition-colors">
            <input
              type="checkbox"
              checked={festiveForm.active}
              onChange={(e) => setFestiveForm({ ...festiveForm, active: e.target.checked })}
              className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4 accent-[#7464B8]"
            />
            <span className="text-xs font-semibold text-[#171522]">
              {festiveForm.active ? 'Campaign: Live' : 'Campaign: Disabled'}
            </span>
          </label>

          <button
            type="button"
            onClick={handleReset}
            title="Reset to default Teej banner"
            className="p-2 rounded-xl text-gray-400 hover:text-[#171522] hover:bg-white border border-transparent hover:border-[#D6CFFF]/60 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved' : 'Save Campaign'}</span>
          </button>
        </div>
      </div>

      {/* Campaign Presets Selector */}
      <div className="bg-white p-4 rounded-2xl border border-[#D6CFFF]/50 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#171522] mr-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#7464B8]" />
          Quick Festive Presets:
        </span>
        {campaignPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              festiveForm.campaignPreset === preset.id
                ? 'bg-[#7464B8] text-white shadow-xs'
                : 'bg-[#FAF9FF] text-[#171522] border border-[#D6CFFF]/60 hover:border-[#7464B8]'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campaign Details & Information */}
        <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#D6CFFF]/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8]">
              Campaign Information
            </h3>
            <span className="text-[10px] text-gray-500 font-medium">
              Click Destination: <code className="text-[#171522]">/collections</code>
            </span>
          </div>

          {/* Desktop Image-Only Banner Notice */}
          <div className="p-3.5 rounded-xl bg-[#F3EFFF] border border-[#D6CFFF]/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#7464B8] shrink-0 mt-0.5" />
            <div className="text-xs text-[#171522] space-y-1">
              <p className="font-semibold text-[#171522]">Desktop Festive Banner is 100% Image-Only (16:4)</p>
              <p className="text-[11px] text-[#6F6B78] leading-relaxed">
                The desktop storefront displays strictly the campaign artwork with no text, buttons, coupons, or gradient overlays. Clicking anywhere on the banner navigates directly to <code className="font-mono text-[#7464B8]">/collections</code>. The copy fields below are preserved in storage for campaign records and mobile fallbacks.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={festiveForm.campaignName}
                  onChange={(e) => setFestiveForm({ ...festiveForm, campaignName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Badge / Eyebrow <span className="text-[10px] text-gray-400 font-normal">(Mobile only)</span>
                </label>
                <input
                  type="text"
                  value={festiveForm.eyebrow}
                  onChange={(e) => setFestiveForm({ ...festiveForm, eyebrow: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Headline Part 1 <span className="text-[10px] text-gray-400 font-normal">(Mobile only)</span>
                </label>
                <input
                  type="text"
                  value={festiveForm.title}
                  onChange={(e) => setFestiveForm({ ...festiveForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Headline Part 2 (Italic) <span className="text-[10px] text-gray-400 font-normal">(Mobile only)</span>
                </label>
                <input
                  type="text"
                  value={festiveForm.highlightTitle}
                  onChange={(e) => setFestiveForm({ ...festiveForm, highlightTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Offer / Discount Text <span className="text-[10px] text-gray-400 font-normal">(Mobile only)</span>
                </label>
                <input
                  type="text"
                  value={festiveForm.offerText}
                  onChange={(e) => setFestiveForm({ ...festiveForm, offerText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Coupon Code <span className="text-[10px] text-gray-400 font-normal">(Mobile only)</span>
                </label>
                <input
                  type="text"
                  value={festiveForm.couponCode}
                  onChange={(e) => setFestiveForm({ ...festiveForm, couponCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">
                Supporting Description <span className="text-[10px] text-gray-400 font-normal">(Mobile only)</span>
              </label>
              <textarea
                rows={2}
                value={festiveForm.description}
                onChange={(e) => setFestiveForm({ ...festiveForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D6CFFF]/20">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  CTA Button Text <span className="text-[10px] text-gray-400 font-normal">(Mobile only)</span>
                </label>
                <input
                  type="text"
                  value={festiveForm.ctaText}
                  onChange={(e) => setFestiveForm({ ...festiveForm, ctaText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Desktop Banner Click Link
                </label>
                <input
                  type="text"
                  value={festiveForm.destinationUrl || '/collections'}
                  onChange={(e) => setFestiveForm({ ...festiveForm, destinationUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono"
                  placeholder="/collections"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7464B8]" /> Start Date
                </label>
                <input
                  type="date"
                  value={festiveForm.startDate}
                  onChange={(e) => setFestiveForm({ ...festiveForm, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7464B8]" /> End Date
                </label>
                <input
                  type="date"
                  value={festiveForm.endDate}
                  onChange={(e) => setFestiveForm({ ...festiveForm, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Festive Image Upload & Live Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20">
              Festive Campaign Artwork
            </h3>

            <DragDropImageUpload
              label="Festive Banner Background Image"
              value={festiveForm.image}
              onChange={(val) => setFestiveForm({ ...festiveForm, image: val })}
              aspectRatio="aspect-[16/4]"
              helperText="Recommended: 16:4 aspect ratio (e.g. 1920x480). PNG, JPG, or WebP up to 10MB"
            />
          </div>

          {/* Quick Preview Card (16:4 Desktop Storefront Snapshot) */}
          <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#7464B8]" />
                Live Festive Snapshot (Desktop 16:4)
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Live on Storefront
              </span>
            </div>

            {/* Exact 16:4 Image-Only Live Preview */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/4] bg-[#0d2e2b] border border-[#D6CFFF]/40 shadow-xs">
              <img
                src={festiveForm.image || teejBannerAsset}
                alt="Festive Desktop Banner Preview"
                className="w-full h-full object-cover"
                style={{ width: '100%', aspectRatio: '16 / 4', objectFit: 'cover' }}
              />
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/50 text-[11px] text-[#6F6B78] flex items-center justify-between">
              <span>Clicks anywhere to open: <strong className="text-[#171522] font-mono">{festiveForm.destinationUrl || '/collections'}</strong></span>
              <span className="text-[10px] font-semibold text-[#7464B8] uppercase tracking-wider">Image-Only (4:1)</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
