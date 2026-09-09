import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Truck,
  Sparkles,
  Phone,
  Mail,
  Award,
  RefreshCw,
  Banknote,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function StoreSettingsManager() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'Ocean Jewel — Indian Luxury',
    announcementText: 'Complimentary Express Delivery Across India on Orders Above ₹799 • Code: WELCOME10',
    welcomeCoupon: 'WELCOME10',
    freeShippingThreshold: 799,
    standardShippingFee: 99,
    codHandlingFee: 15,
    pointsPerRupee: 0.1, // 1 point per ₹10
    currencySymbol: '₹',
    supportEmail: 'concierge@oceanjewel.in',
    supportPhone: '+91 98765 43210',
    instagramHandle: '@oceanjewel.luxury',
    enableGstInvoice: true,
  });

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cms/store_settings?t=${Date.now()}`);
      if (res.data?.success && res.data?.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.data,
          freeShippingThreshold: Number(res.data.data.freeShippingThreshold) || 799,
          standardShippingFee: Number(res.data.data.standardShippingFee) || 99,
          codHandlingFee: Number(res.data.data.codHandlingFee) ?? 15,
        }));
      }
    } catch (err) {
      console.warn('Using default store settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        freeShippingThreshold: Number(settings.freeShippingThreshold) || 799,
        standardShippingFee: Number(settings.standardShippingFee) || 99,
        codHandlingFee: Number(settings.codHandlingFee) ?? 15,
        updatedAt: Date.now(),
      };

      const res = await api.put('/cms/store_settings', { data: payload });
      if (res.data?.success) {
        setSaved(true);
        addToast('Store settings globally saved & synchronized!', 'success');
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(res.data?.message || 'Failed saving settings');
      }
    } catch (err) {
      console.error('Error saving store settings:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to save store settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
        <RefreshCw className="w-7 h-7 text-[#7464B8] animate-spin" />
        <span className="text-xs uppercase tracking-wider">Loading Store Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">Store & Global Settings</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">
            Configure storewide announcement bars, shipping thresholds, COD fees, rewards, and support channels.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchStoreSettings}
            disabled={saving}
            className="p-2.5 rounded-xl border border-[#D6CFFF]/60 text-gray-600 hover:bg-[#FAF9FF] transition-all"
            title="Reload from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4 text-[#D6CFFF]" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : saved ? 'Saved to Cloud' : 'Save Settings'}</span>
          </button>
        </div>
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

        {/* Card 2: Shipping, COD & Delivery Rules */}
        <div className="bg-white p-6 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7464B8] pb-2 border-b border-[#D6CFFF]/20 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipping & COD Handling Rules
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Free Delivery Min (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">Std Shipping Fee (₹)</label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#171522] mb-1">COD Fee (₹)</label>
              <input
                type="number"
                value={settings.codHandlingFee}
                onChange={(e) => setSettings({ ...settings, codHandlingFee: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8F7FF] border border-[#D6CFFF]/40 text-[11px] text-gray-600 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>COD handling fee is non-refundable and added to COD orders only. Prepaid orders have ₹0 COD fee.</span>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
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
            <label className="block text-xs font-semibold text-[#171522] mb-1">Points Rate (e.g. 0.1 = 1 Point per ₹10)</label>
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
