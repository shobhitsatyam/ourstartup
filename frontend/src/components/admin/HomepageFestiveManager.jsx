import React, { useState } from 'react';
import { Sparkles, Save, Eye, CheckCircle2, Calendar, Tag } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import { useToast } from '../../context/ToastContext';
import teejBannerAsset from '../../assets/teej_festive_offer_banner.png';

export default function HomepageFestiveManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);

  const [festiveForm, setFestiveForm] = useState({
    active: true,
    campaignName: 'Teej Festive Edit',
    campaignPreset: 'teej',
    image: teejBannerAsset,
    eyebrow: 'THE TEEJ EDIT',
    title: 'Celebrate traditions.',
    highlightTitle: 'Wear your story.',
    description: 'Curated jewellery for every Teej celebration.',
    offerText: 'Flat ₹500 OFF on orders above ₹2,499',
    couponCode: 'TEEJ500',
    minOrderValue: 2499,
    ctaText: 'SHOP THE TEEJ EDIT',
    ctaLink: '/collections',
    startDate: '2026-08-01',
    endDate: '2026-10-31',
  });

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
    e.preventDefault();
    setSaved(true);
    addToast('Festive Campaign updated successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">Festival Offer Management</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">Control seasonal festive campaigns (Teej, Diwali, Rakhi, etc.) on the homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D6CFFF]/60 shadow-xs">
            <input
              type="checkbox"
              checked={festiveForm.active}
              onChange={(e) => setFestiveForm({ ...festiveForm, active: e.target.checked })}
              className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
            />
            <span className="text-xs font-semibold text-[#171522]">
              {festiveForm.active ? 'Campaign: Live' : 'Campaign: Disabled'}
            </span>
          </label>
          <button
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
        {/* Left Column: Campaign Details */}
        <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20">
            Campaign Information
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={festiveForm.campaignName}
                  onChange={(e) => setFestiveForm({ ...festiveForm, campaignName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Badge / Eyebrow</label>
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
                <label className="block text-xs font-semibold text-[#171522] mb-1">Headline Part 1</label>
                <input
                  type="text"
                  value={festiveForm.title}
                  onChange={(e) => setFestiveForm({ ...festiveForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Headline Part 2 (Italic)</label>
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
                <label className="block text-xs font-semibold text-[#171522] mb-1">Offer / Discount Text</label>
                <input
                  type="text"
                  value={festiveForm.offerText}
                  onChange={(e) => setFestiveForm({ ...festiveForm, offerText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={festiveForm.couponCode}
                  onChange={(e) => setFestiveForm({ ...festiveForm, couponCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Supporting Description</label>
              <textarea
                rows={2}
                value={festiveForm.description}
                onChange={(e) => setFestiveForm({ ...festiveForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D6CFFF]/20">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={festiveForm.ctaText}
                  onChange={(e) => setFestiveForm({ ...festiveForm, ctaText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">CTA Destination Link</label>
                <input
                  type="text"
                  value={festiveForm.ctaLink}
                  onChange={(e) => setFestiveForm({ ...festiveForm, ctaLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
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

            <ImageUploadField
              label="Festive Banner Background Image"
              value={festiveForm.image}
              onChange={(val) => setFestiveForm({ ...festiveForm, image: val })}
              helperText="High-res banner with space for left-aligned offer copy"
            />
          </div>

          {/* Quick Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#7464B8]" />
                Live Festive Snapshot
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Live on Homepage
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0d2e2b] border border-[#D6CFFF]/40">
              <img
                src={festiveForm.image || teejBannerAsset}
                alt="Festive Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent p-3 flex flex-col justify-end text-white">
                <p className="text-[8px] font-semibold tracking-wider text-[#D6CFFF] uppercase">{festiveForm.eyebrow}</p>
                <p className="font-serif text-xs font-light">{festiveForm.title} {festiveForm.highlightTitle}</p>
                <p className="text-[9px] text-[#E8E3FF]">{festiveForm.offerText}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
