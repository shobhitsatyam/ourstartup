/**
 * Ocean Jewel Hero Banner Storage & Management Layer
 *
 * Provides persistent database sync via MongoDB Atlas & Cloudinary for homepage hero banner settings
 * across both the Admin Panel and Storefront, supporting 3 desktop slideshow images (16:5 ratio),
 * individual slide click destinations, real-time event broadcasting, and global multi-device persistence.
 */
import defaultHeroBannerAsset1 from '../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';
import defaultHeroBannerAsset2 from '../assets/teej_festive_offer_banner.png';
import defaultHeroBannerAsset3 from '../assets/new_arrivals_hero_banner.jpg';
import defaultHeroBannerAsset4 from '../assets/luxury_editorial_hero_banner_4.jpg';
import api from '../services/api';

export const HERO_STORAGE_KEY = 'oceanjewel_hero_banner_config_v4';
export const HERO_UPDATE_EVENT = 'oceanjewel_hero_banner_updated';

export const DEFAULT_HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'THE ROYAL ANTI-TARNISH COLLECTION',
    subtitle: 'Handcrafted with 18K Real Gold PVD coating & guaranteed zero tarnish',
    ctaText: 'Shop Women',
    image: defaultHeroBannerAsset1,
    destinationUrl: '/women',
    active: true,
  },
  {
    id: 'slide-2',
    title: 'THE FESTIVE & ROYAL EDIT',
    subtitle: 'Celebrate traditions with handcrafted Kundan motifs and waterproof brilliance',
    ctaText: 'Shop Festive',
    image: defaultHeroBannerAsset2,
    destinationUrl: '/collections',
    active: true,
  },
  {
    id: 'slide-3',
    title: 'AUTUMN RADIANCE NEW ARRIVALS',
    subtitle: 'Featuring freshwater pearls, emerald drops, and architectural statement heirlooms',
    ctaText: 'Explore New Arrivals',
    image: defaultHeroBannerAsset3,
    destinationUrl: '/new-arrivals',
    active: true,
  },
  {
    id: 'slide-4',
    title: 'MOST COVETED BESTSELLERS',
    subtitle: 'Discover daily waterproof bracelets, rings, and tennis chains loved across India',
    ctaText: 'Shop Bestsellers',
    image: defaultHeroBannerAsset4,
    destinationUrl: '/bestsellers',
    active: true,
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

  let slides = DEFAULT_HERO_SLIDES;
  if (Array.isArray(rawConfig.slides) && rawConfig.slides.length > 0) {
    slides = rawConfig.slides.map((s, idx) => {
      const def = DEFAULT_HERO_SLIDES[idx] || DEFAULT_HERO_SLIDES[0];
      return {
        id: s.id || `slide-${idx + 1}`,
        title: s.title || def.title,
        subtitle: s.subtitle !== undefined ? s.subtitle : def.subtitle,
        ctaText: s.ctaText || def.ctaText || 'Shop Now',
        image: s.image || def.image,
        destinationUrl: s.destinationUrl || def.destinationUrl,
        active: s.active !== false,
      };
    });
  }

  return {
    ...DEFAULT_HERO_CONFIG,
    ...rawConfig,
    slides,
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
