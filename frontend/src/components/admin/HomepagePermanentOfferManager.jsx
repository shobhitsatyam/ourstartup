import React, { useState } from 'react';
import { Gift, Save, Eye, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function HomepagePermanentOfferManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);

  const [permanentForm, setPermanentForm] = useState({
    active: true,
    eyebrow: 'A LITTLE EXTRA, JUST FOR YOU',
    title: '10% OFF YOUR FIRST ORDER',
    description: 'Begin your Ocean Jewel journey with a little something extra.',
    couponCode: 'WELCOME10',
    discountAmount: 10,
    ctaText: 'SHOP NOW',
    ctaLink: '/shop',
    highlightBadge: 'Exclusive Welcome Benefit',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    addToast('Permanent Offer settings saved successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">Permanent First-Order Offer</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">Control the standard first-order welcome benefit card on the homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D6CFFF]/60 shadow-xs">
            <input
              type="checkbox"
              checked={permanentForm.active}
              onChange={(e) => setPermanentForm({ ...permanentForm, active: e.target.checked })}
              className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
            />
            <span className="text-xs font-semibold text-[#171522]">
              {permanentForm.active ? 'Status: Active' : 'Status: Inactive'}
            </span>
          </label>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved' : 'Save Offer'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20">
            Welcome Card Configuration
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Badge / Eyebrow</label>
                <input
                  type="text"
                  value={permanentForm.eyebrow}
                  onChange={(e) => setPermanentForm({ ...permanentForm, eyebrow: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={permanentForm.couponCode}
                  onChange={(e) => setPermanentForm({ ...permanentForm, couponCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Main Headline</label>
              <input
                type="text"
                value={permanentForm.title}
                onChange={(e) => setPermanentForm({ ...permanentForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Description Text</label>
              <textarea
                rows={2}
                value={permanentForm.description}
                onChange={(e) => setPermanentForm({ ...permanentForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D6CFFF]/20">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={permanentForm.ctaText}
                  onChange={(e) => setPermanentForm({ ...permanentForm, ctaText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">CTA Destination Link</label>
                <input
                  type="text"
                  value={permanentForm.ctaLink}
                  onChange={(e) => setPermanentForm({ ...permanentForm, ctaLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#7464B8]" />
                Live Card Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Active
              </span>
            </div>

            <div className="rounded-2xl p-6 text-center bg-gradient-to-b from-[#FAF9FF] via-white to-[#F3EFFF] border border-[#D6CFFF]/60 shadow-xs space-y-3">
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white border border-[#D6CFFF]/60 text-[9px] font-semibold uppercase tracking-wider text-[#7464B8]">
                <Gift className="w-2.5 h-2.5" />
                <span>{permanentForm.eyebrow}</span>
              </div>
              <h4 className="font-serif text-lg font-light text-[#171522]">{permanentForm.title}</h4>
              <p className="text-xs text-gray-500 font-light">{permanentForm.description}</p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-white rounded-lg border border-[#D6CFFF] text-xs font-mono font-bold text-[#171522]">
                  Code: {permanentForm.couponCode}
                </span>
                <span className="px-3.5 py-1 bg-[#171522] text-white rounded-lg text-xs font-medium">
                  {permanentForm.ctaText} &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
