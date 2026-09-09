/**
 * Ocean Jewel Hero Banner Storage & Management Layer
 *
 * Provides persistent database sync via MongoDB Atlas & Cloudinary for homepage hero banner settings
 * across both the Admin Panel and Storefront, supporting 3 desktop slideshow images (16:5 ratio),
 * individual slide click destinations, real-time event broadcasting, and global multi-device persistence.
 */
import defaultHeroBannerAsset1 from '../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';
import defaultHeroBannerAsset2 from '../assets/new_arrivals_hero_banner.jpg';
import defaultHeroBannerAsset3 from '../assets/bestsellers_hero_banner.jpg';
import api from '../services/api';

export const HERO_STORAGE_KEY = 'oceanjewel_hero_banner_config_v3';
export const HERO_UPDATE_EVENT = 'oceanjewel_hero_banner_updated';

export const DEFAULT_HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Slide 1 — Signature Collection',
    image: defaultHeroBannerAsset1,
    destinationUrl: '/collections',
  },
  {
    id: 'slide-2',
    title: 'Slide 2 — New Arrivals',
    image: defaultHeroBannerAsset2,
    destinationUrl: '/new-arrivals',
  },
  {
    id: 'slide-3',
    title: 'Slide 3 — Royal Best Sellers',
    image: defaultHeroBannerAsset3,
    destinationUrl: '/bestsellers',
  },
];

export const DEFAULT_HERO_CONFIG = {
  active: true,
  aspectRatio: '16/5',
  autoplayInterval: 4500, // 4.5 seconds
  slides: DEFAULT_HERO_SLIDES,
  // Mobile (Optional custom override)
  mobileImage: '',
  mobileDestinationUrl: '/shop',
  updatedAt: Date.now(),
};

/**
 * Helper to safely merge arbitrary payload with default hero structure
 */
function mergeHeroWithDefaults(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return DEFAULT_HERO_CONFIG;
  }

  const mergedSlides = DEFAULT_HERO_SLIDES.map((defSlide, idx) => {
    const savedSlide = rawConfig.slides && rawConfig.slides[idx] ? rawConfig.slides[idx] : {};
    return {
      ...defSlide,
      ...savedSlide,
      image: savedSlide.image || defSlide.image,
      destinationUrl: savedSlide.destinationUrl || defSlide.destinationUrl,
    };
  });

  return {
    ...DEFAULT_HERO_CONFIG,
    ...rawConfig,
    slides: mergedSlides,
  };
}

/**
 * Synchronously retrieves cached or default hero configuration.
 */
export function getHeroConfig() {
  if (typeof window === 'undefined') return DEFAULT_HERO_CONFIG;
  try {
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return mergeHeroWithDefaults(parsed);
    }
  } catch (e) {
    console.warn('Failed reading hero banner config from cache:', e);
  }
  return DEFAULT_HERO_CONFIG;
}

/**
 * Asynchronously fetches the live Hero Banner configuration from the database.
 * Bypasses browser cache with timestamp & no-cache headers.
 */
export async function fetchHeroConfig() {
  try {
    const res = await api.get(`/cms/hero_banner?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (res.data?.success && res.data?.data) {
      const merged = mergeHeroWithDefaults(res.data.data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent(HERO_UPDATE_EVENT, { detail: merged }));
      }
      return merged;
    } else {
      // No custom DB config yet — fallback to default brand config
      return DEFAULT_HERO_CONFIG;
    }
  } catch (err) {
    console.warn('Failed to fetch hero banner config from database, using fallback:', err.message);
    return getHeroConfig();
  }
}

/**
 * Asynchronously persists the Hero Banner configuration to the MongoDB database.
 */
export async function saveHeroConfigApi(config) {
  const dataToSave = {
    ...DEFAULT_HERO_CONFIG,
    ...config,
    updatedAt: Date.now(),
  };

  try {
    const res = await api.put('/cms/hero_banner', { data: dataToSave });
    if (res.data?.success) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent(HERO_UPDATE_EVENT, { detail: dataToSave }));
      }
      return { success: true, data: dataToSave };
    }
    throw new Error(res.data?.message || 'Server did not acknowledge CMS save');
  } catch (err) {
    console.error('Failed saving hero banner config to database:', err);
    throw err;
  }
}

/**
 * Resets hero banner configuration in database back to brand defaults.
 */
export async function resetHeroConfigApi() {
  try {
    await api.delete('/cms/hero_banner');
  } catch (err) {
    console.warn('Failed deleting hero CMS config from database:', err.message);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(HERO_STORAGE_KEY);
      localStorage.removeItem('oceanjewel_hero_banner_config_v2');
    } catch (_) {}
    window.dispatchEvent(new CustomEvent(HERO_UPDATE_EVENT, { detail: DEFAULT_HERO_CONFIG }));
  }
  return DEFAULT_HERO_CONFIG;
}

/**
 * Backwards compatibility wrappers
 */
export function saveHeroConfig(config) {
  saveHeroConfigApi(config).catch((e) => console.error('saveHeroConfig async error:', e));
  return { ...DEFAULT_HERO_CONFIG, ...config, updatedAt: Date.now() };
}

export function resetHeroConfig() {
  resetHeroConfigApi().catch((e) => console.error('resetHeroConfig async error:', e));
  return DEFAULT_HERO_CONFIG;
}
