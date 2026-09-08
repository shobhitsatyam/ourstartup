/**
 * Ocean Jewel Hero Banner Storage & Management Layer
 *
 * Provides a single, centralized source of truth for homepage hero banner settings
 * across both the Admin Panel and Storefront, with real-time event broadcasting
 * and persistent storage.
 */
import defaultHeroBannerAsset from '../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';

export const HERO_STORAGE_KEY = 'oceanjewel_hero_banner_config_v2';
export const HERO_UPDATE_EVENT = 'oceanjewel_hero_banner_updated';

export const DEFAULT_HERO_CONFIG = {
  active: true,
  // Desktop
  desktopImage: defaultHeroBannerAsset,
  destinationUrl: '/shop', // Click anywhere destination URL on desktop
  // Mobile (Optional custom override)
  mobileImage: '',
  mobileDestinationUrl: '/shop',
  updatedAt: Date.now(),
};

/**
 * Retrieves the current hero configuration.
 */
export function getHeroConfig() {
  if (typeof window === 'undefined') return DEFAULT_HERO_CONFIG;
  try {
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_HERO_CONFIG,
        ...parsed,
        desktopImage: parsed.desktopImage || defaultHeroBannerAsset,
      };
    }
  } catch (e) {
    console.error('Failed reading hero banner config from storage:', e);
  }
  return DEFAULT_HERO_CONFIG;
}

/**
 * Saves the hero configuration to storage and broadcasts the update event.
 */
export function saveHeroConfig(config) {
  if (typeof window === 'undefined') return DEFAULT_HERO_CONFIG;
  try {
    const dataToSave = {
      ...DEFAULT_HERO_CONFIG,
      ...config,
      updatedAt: Date.now(),
    };
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent(HERO_UPDATE_EVENT, { detail: dataToSave }));
    return dataToSave;
  } catch (e) {
    console.error('Failed saving hero banner config to storage:', e);
    return null;
  }
}

/**
 * Resets hero configuration to initial factory defaults.
 */
export function resetHeroConfig() {
  if (typeof window === 'undefined') return DEFAULT_HERO_CONFIG;
  try {
    localStorage.removeItem(HERO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(HERO_UPDATE_EVENT, { detail: DEFAULT_HERO_CONFIG }));
  } catch (e) {
    console.error('Failed resetting hero banner config:', e);
  }
  return DEFAULT_HERO_CONFIG;
}
