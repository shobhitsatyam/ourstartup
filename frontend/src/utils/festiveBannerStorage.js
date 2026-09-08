/**
 * Ocean Jewel Festive Season Banner Storage & Management Layer
 *
 * Provides a single, centralized source of truth for festive banner configuration
 * across both the Admin Panel and Storefront, with real-time event broadcasting
 * and persistent storage.
 */
import defaultFestiveBannerAsset from '../assets/teej_festive_offer_banner.png';

export const FESTIVE_STORAGE_KEY = 'oceanjewel_festive_banner_config_v1';
export const FESTIVE_UPDATE_EVENT = 'oceanjewel_festive_banner_updated';

export const DEFAULT_FESTIVE_CONFIG = {
  active: true,
  image: defaultFestiveBannerAsset,
  destinationUrl: '/collections',
  campaignName: 'Teej Festive Edit',
  campaignPreset: 'teej',
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
  updatedAt: Date.now(),
};

/**
 * Retrieves the current festive configuration from persistent storage.
 */
export function getFestiveConfig() {
  if (typeof window === 'undefined') return DEFAULT_FESTIVE_CONFIG;
  try {
    const raw = localStorage.getItem(FESTIVE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_FESTIVE_CONFIG,
        ...parsed,
        image: parsed.image || defaultFestiveBannerAsset,
        destinationUrl: parsed.destinationUrl || '/collections',
      };
    }
  } catch (e) {
    console.error('Failed reading festive banner config from storage:', e);
  }
  return DEFAULT_FESTIVE_CONFIG;
}

/**
 * Saves the festive configuration to persistent storage and broadcasts the update event.
 */
export function saveFestiveConfig(config) {
  if (typeof window === 'undefined') return DEFAULT_FESTIVE_CONFIG;
  try {
    const dataToSave = {
      ...DEFAULT_FESTIVE_CONFIG,
      ...config,
      updatedAt: Date.now(),
    };
    localStorage.setItem(FESTIVE_STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent(FESTIVE_UPDATE_EVENT, { detail: dataToSave }));
    return dataToSave;
  } catch (e) {
    console.error('Failed saving festive banner config to storage:', e);
    return null;
  }
}

/**
 * Resets festive configuration to initial brand defaults.
 */
export function resetFestiveConfig() {
  if (typeof window === 'undefined') return DEFAULT_FESTIVE_CONFIG;
  try {
    localStorage.removeItem(FESTIVE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(FESTIVE_UPDATE_EVENT, { detail: DEFAULT_FESTIVE_CONFIG }));
  } catch (e) {
    console.error('Failed resetting festive banner config:', e);
  }
  return DEFAULT_FESTIVE_CONFIG;
}
