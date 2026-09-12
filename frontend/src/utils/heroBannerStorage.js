/**
 * Zivana Jewels Hero Banner Storage & Management Layer
 *
 * Provides persistent database sync via MongoDB Atlas & Cloudinary for homepage hero banner settings
 * across both the Admin Panel and Storefront, supporting completely independent Desktop (16:5 ratio)
 * and Mobile/Tablet (16:10 ratio) configurations, real-time event broadcasting, and global multi-device persistence.
 */
import defaultHeroBannerAsset1 from '../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';
import defaultHeroBannerAsset2 from '../assets/teej_festive_offer_banner.png';
import defaultHeroBannerAsset3 from '../assets/new_arrivals_hero_banner.jpg';
import defaultHeroBannerAsset4 from '../assets/luxury_editorial_hero_banner_4.jpg';
import api from '../services/api';

export const HERO_STORAGE_KEY = 'oceanjewel_hero_banner_config_v5';
export const HERO_UPDATE_EVENT = 'oceanjewel_hero_banner_updated';

export const DEFAULT_DESKTOP_SLIDES = [
  {
    id: 'desktop-slide-1',
    title: 'THE ROYAL ANTI-TARNISH COLLECTION',
    subtitle: 'Handcrafted with 18K Real Gold PVD coating & guaranteed zero tarnish',
    ctaText: 'Shop Women',
    image: defaultHeroBannerAsset1,
    destinationUrl: '/women',
    active: true,
  },
  {
    id: 'desktop-slide-2',
    title: 'THE FESTIVE & ROYAL EDIT',
    subtitle: 'Celebrate traditions with handcrafted Kundan motifs and waterproof brilliance',
    ctaText: 'Shop Festive',
    image: defaultHeroBannerAsset2,
    destinationUrl: '/collections',
    active: true,
  },
  {
    id: 'desktop-slide-3',
    title: 'AUTUMN RADIANCE NEW ARRIVALS',
    subtitle: 'Featuring freshwater pearls, emerald drops, and architectural statement heirlooms',
    ctaText: 'Explore New Arrivals',
    image: defaultHeroBannerAsset3,
    destinationUrl: '/new-arrivals',
    active: true,
  },
  {
    id: 'desktop-slide-4',
    title: 'MOST COVETED BESTSELLERS',
    subtitle: 'Discover daily waterproof bracelets, rings, and tennis chains loved across India',
    ctaText: 'Shop Bestsellers',
    image: defaultHeroBannerAsset4,
    destinationUrl: '/bestsellers',
    active: true,
  },
];

export const DEFAULT_MOBILE_SLIDES = [
  {
    id: 'mobile-slide-1',
    title: 'THE ROYAL ANTI-TARNISH COLLECTION',
    subtitle: 'Handcrafted with 18K Real Gold PVD coating & guaranteed zero tarnish',
    ctaText: 'Shop Women',
    image: defaultHeroBannerAsset1,
    destinationUrl: '/women',
    active: true,
  },
  {
    id: 'mobile-slide-2',
    title: 'THE FESTIVE & ROYAL EDIT',
    subtitle: 'Celebrate traditions with handcrafted Kundan motifs and waterproof brilliance',
    ctaText: 'Shop Festive',
    image: defaultHeroBannerAsset2,
    destinationUrl: '/collections',
    active: true,
  },
  {
    id: 'mobile-slide-3',
    title: 'AUTUMN RADIANCE NEW ARRIVALS',
    subtitle: 'Featuring freshwater pearls, emerald drops, and architectural statement heirlooms',
    ctaText: 'Explore New Arrivals',
    image: defaultHeroBannerAsset3,
    destinationUrl: '/new-arrivals',
    active: true,
  },
  {
    id: 'mobile-slide-4',
    title: 'MOST COVETED BESTSELLERS',
    subtitle: 'Discover daily waterproof bracelets, rings, and tennis chains loved across India',
    ctaText: 'Shop Bestsellers',
    image: defaultHeroBannerAsset4,
    destinationUrl: '/bestsellers',
    active: true,
  },
];

// Backwards-compatibility alias
export const DEFAULT_HERO_SLIDES = DEFAULT_DESKTOP_SLIDES;

export const DEFAULT_HERO_CONFIG = {
  active: true,
  autoplayInterval: 4500, // 4.5 seconds
  desktop: {
    active: true,
    aspectRatio: '16/5',
    slides: DEFAULT_DESKTOP_SLIDES,
  },
  mobile: {
    active: true,
    aspectRatio: '16/10',
    slides: DEFAULT_MOBILE_SLIDES,
  },
  // Legacy backward-compatibility mirror
  slides: DEFAULT_DESKTOP_SLIDES,
  updatedAt: Date.now(),
};

/**
 * Helper to deep clone slide lists with fallback preservation
 */
function cloneSlides(slideList, defaultList, prefix = 'slide') {
  const source = Array.isArray(slideList) && slideList.length > 0 ? slideList : defaultList;
  return source.map((s, idx) => {
    const def = defaultList[idx] || defaultList[0] || {};
    return {
      id: s.id || `${prefix}-${idx + 1}-${Date.now()}`,
      title: s.title !== undefined ? s.title : (def.title || ''),
      subtitle: s.subtitle !== undefined ? s.subtitle : (def.subtitle || ''),
      ctaText: s.ctaText || def.ctaText || 'Shop Now',
      image: s.image || def.image || '',
      destinationUrl: s.destinationUrl || def.destinationUrl || '/collections',
      active: s.active !== false,
    };
  });
}

/**
 * Helper to safely merge arbitrary payload with independent desktop & mobile hero structures
 */
export function mergeHeroWithDefaults(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_HERO_CONFIG));
  }

  // 1. Resolve Desktop Slides
  const desktopRawSlides = (Array.isArray(rawConfig.desktop?.slides) && rawConfig.desktop.slides.length > 0)
    ? rawConfig.desktop.slides
    : ((Array.isArray(rawConfig.desktop?.banners) && rawConfig.desktop.banners.length > 0)
        ? rawConfig.desktop.banners
        : (Array.isArray(rawConfig.slides) && rawConfig.slides.length > 0
            ? rawConfig.slides
            : DEFAULT_DESKTOP_SLIDES));

  // 2. Resolve Mobile Slides (MUST NEVER FALLBACK TO DESKTOP SLIDES)
  const mobileRawSlides = (Array.isArray(rawConfig.mobile?.slides) && rawConfig.mobile.slides.length > 0)
    ? rawConfig.mobile.slides
    : ((Array.isArray(rawConfig.mobile?.banners) && rawConfig.mobile.banners.length > 0)
        ? rawConfig.mobile.banners
        : DEFAULT_MOBILE_SLIDES);

  const desktopSlides = cloneSlides(desktopRawSlides, DEFAULT_DESKTOP_SLIDES, 'desktop-slide');
  let mobileSlides = cloneSlides(mobileRawSlides, DEFAULT_MOBILE_SLIDES, 'mobile-slide');

  // Enforce distinct IDs between desktop and mobile so keys never collide
  mobileSlides = mobileSlides.map((s, idx) => {
    const isSharedId = desktopSlides.some((ds) => ds.id === s.id);
    return {
      ...s,
      id: (isSharedId || !s.id.startsWith('mobile-')) ? `mobile-slide-${idx + 1}` : s.id,
    };
  });

  const desktopConfig = {
    active: rawConfig.desktop?.active !== false,
    aspectRatio: rawConfig.desktop?.aspectRatio || '16/5',
    slides: desktopSlides,
    banners: cloneSlides(desktopSlides, DEFAULT_DESKTOP_SLIDES, 'desktop-slide'),
  };

  const mobileConfig = {
    active: rawConfig.mobile?.active !== false,
    aspectRatio: rawConfig.mobile?.aspectRatio || '16/10',
    slides: mobileSlides,
    banners: cloneSlides(mobileSlides, DEFAULT_MOBILE_SLIDES, 'mobile-slide'),
  };

  return {
    ...JSON.parse(JSON.stringify(DEFAULT_HERO_CONFIG)),
    active: rawConfig.active !== false,
    autoplayInterval: rawConfig.autoplayInterval || 4500,
    desktop: desktopConfig,
    mobile: mobileConfig,
    // Backwards-compatibility mirror
    slides: cloneSlides(desktopSlides, DEFAULT_DESKTOP_SLIDES, 'desktop-slide'),
    updatedAt: rawConfig.updatedAt || Date.now(),
  };
}

/**
 * Synchronously retrieves cached or default hero configuration.
 */
export function getHeroConfig() {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(DEFAULT_HERO_CONFIG));
  try {
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return mergeHeroWithDefaults(parsed);
    }
  } catch (e) {
    console.warn('Failed reading hero banner config from cache:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_HERO_CONFIG));
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
      return JSON.parse(JSON.stringify(DEFAULT_HERO_CONFIG));
    }
  } catch (err) {
    console.warn('Failed to fetch hero banner config from database, using fallback:', err.message);
    return getHeroConfig();
  }
}

/**
 * Asynchronously persists the Hero Banner configuration to the MongoDB database.
 * Supports targeted saving per device ('desktop' | 'mobile') to guarantee 100% independence.
 */
export async function saveHeroConfigApi(config, targetDevice = null) {
  const merged = mergeHeroWithDefaults(config);
  const dataToSave = {
    ...merged,
    targetDevice: targetDevice || config?.targetDevice || null,
    updatedAt: Date.now(),
  };

  try {
    const res = await api.put('/cms/hero_banner', { data: dataToSave });
    if (res.data?.success) {
      const serverData = res.data.data ? mergeHeroWithDefaults(res.data.data) : dataToSave;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(serverData));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent(HERO_UPDATE_EVENT, { detail: serverData }));
      }
      return { success: true, data: serverData };
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
      localStorage.removeItem('oceanjewel_hero_banner_config_v4');
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
  return mergeHeroWithDefaults(config);
}

export function resetHeroConfig() {
  resetHeroConfigApi().catch((e) => console.error('resetHeroConfig async error:', e));
  return DEFAULT_HERO_CONFIG;
}
