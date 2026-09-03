import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Truck, Sparkles, Phone, Mail, Award } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function StoreSettingsManager() {
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'Ocean Jewel — Indian Luxury',
    announcementText: 'Complimentary Express Delivery Across India on Orders Above ₹999 • Code: WELCOME10',
    welcomeCoupon: 'WELCOME10',
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    pointsPerRupee: 0.1, // 1 point per ₹10
    currencySymbol: '₹',
    supportEmail: 'concierge@oceanjewel.in',
    supportPhone: '+91 98765 43210',
    instagramHandle: '@oceanjewel.luxury',
    enableGstInvoice: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    addToast('Store settings saved successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">Store & Global Settings</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">Configure storewide announcement bars, shipping thresholds, rewards, and support channels.</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Announcement Bar & Coupons */}
        <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Announcement Bar & Promotion
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Top Announcement Banner Text</label>
              <textarea
                rows={2}
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Default Welcome Code</label>
              <input
                type="text"
                value={settings.welcomeCoupon}
                onChange={(e) => setSettings({ ...settings, welcomeCoupon: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Shipping & Delivery Rules */}
        <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipping & Checkout Rules
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={settings.enableGstInvoice}
                onChange={(e) => setSettings({ ...settings, enableGstInvoice: e.target.checked })}
                className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
              />
              <span className="text-xs font-semibold text-[#171522]">Generate GST Compliant Invoices</span>
            </label>
          </div>
        </div>

        {/* Card 3: Loyalty & Rewards */}
        <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Ocean Points Loyalty Rewards
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#171522] mb-1">Points Rate (e.g. 1 Point per ₹10)</label>
            <input
              type="number"
              step="0.01"
              value={settings.pointsPerRupee}
              onChange={(e) => setSettings({ ...settings, pointsPerRupee: parseFloat(e.target.value) || 0.1 })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
            />
            <p className="text-[10px] text-gray-500 mt-1">Clients earn points automatically upon order confirmation.</p>
          </div>
        </div>

        {/* Card 4: Support & Concierge Info */}
        <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Concierge & Support Contact
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">WhatsApp Helpline</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
