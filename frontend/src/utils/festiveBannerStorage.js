/**
 * Ocean Jewel Festive Season Banner Storage & Management Layer
 *
 * Provides persistent database sync via MongoDB Atlas & Cloudinary for festive banner configuration
 * across both the Admin Panel and Storefront, with real-time event broadcasting
 * and global multi-device persistence.
 */
import defaultFestiveBannerAsset from '../assets/teej_festive_offer_banner.png';
import api from '../services/api';

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
 * Safely merges configuration with default structure
 */
function mergeFestiveWithDefaults(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return DEFAULT_FESTIVE_CONFIG;
  }
  return {
    ...DEFAULT_FESTIVE_CONFIG,
    ...rawConfig,
    image: rawConfig.image || defaultFestiveBannerAsset,
    destinationUrl: rawConfig.destinationUrl || '/collections',
  };
}

/**
 * Synchronously retrieves current festive configuration from cache or defaults.
 */
export function getFestiveConfig() {
  if (typeof window === 'undefined') return DEFAULT_FESTIVE_CONFIG;
  try {
    const raw = localStorage.getItem(FESTIVE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return mergeFestiveWithDefaults(parsed);
    }
  } catch (e) {
    console.warn('Failed reading festive banner config from cache:', e);
  }
  return DEFAULT_FESTIVE_CONFIG;
}

/**
 * Asynchronously fetches live Festive Banner configuration from MongoDB database.
 */
export async function fetchFestiveConfig() {
  try {
    const res = await api.get(`/cms/festive_banner?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (res.data?.success && res.data?.data) {
      const merged = mergeFestiveWithDefaults(res.data.data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(FESTIVE_STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent(FESTIVE_UPDATE_EVENT, { detail: merged }));
      }
      return merged;
    } else {
      return DEFAULT_FESTIVE_CONFIG;
    }
  } catch (err) {
    console.warn('Failed fetching festive banner config from database:', err.message);
    return getFestiveConfig();
  }
}

/**
 * Asynchronously persists the Festive Banner configuration to the MongoDB database.
 */
export async function saveFestiveConfigApi(config) {
  const dataToSave = {
    ...DEFAULT_FESTIVE_CONFIG,
    ...config,
    updatedAt: Date.now(),
  };

  try {
    const res = await api.put('/cms/festive_banner', { data: dataToSave });
    if (res.data?.success) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(FESTIVE_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent(FESTIVE_UPDATE_EVENT, { detail: dataToSave }));
      }
      return { success: true, data: dataToSave };
    }
    throw new Error(res.data?.message || 'Server did not acknowledge festive CMS save');
  } catch (err) {
    console.error('Failed saving festive banner config to database:', err);
    throw err;
  }
}

/**
 * Resets festive banner configuration in database back to brand defaults.
 */
export async function resetFestiveConfigApi() {
  try {
    await api.delete('/cms/festive_banner');
  } catch (err) {
    console.warn('Failed deleting festive CMS config from database:', err.message);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(FESTIVE_STORAGE_KEY);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent(FESTIVE_UPDATE_EVENT, { detail: DEFAULT_FESTIVE_CONFIG }));
  }
  return DEFAULT_FESTIVE_CONFIG;
}

/**
 * Backwards compatibility wrappers
 */
export function saveFestiveConfig(config) {
  saveFestiveConfigApi(config).catch((e) => console.error('saveFestiveConfig async error:', e));
  return { ...DEFAULT_FESTIVE_CONFIG, ...config, updatedAt: Date.now() };
}

export function resetFestiveConfig() {
  resetFestiveConfigApi().catch((e) => console.error('resetFestiveConfig async error:', e));
  return DEFAULT_FESTIVE_CONFIG;
}
