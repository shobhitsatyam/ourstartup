/**
 * Ocean Jewel Hero Banner Storage & Management Layer
 *
 * Provides a single, centralized source of truth for homepage hero banner settings
 * across both the Admin Panel and Storefront, supporting 3 desktop slideshow images (16:5 ratio),
 * individual slide click destinations, real-time event broadcasting, and persistent storage.
 */
import defaultHeroBannerAsset1 from '../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';
import defaultHeroBannerAsset2 from '../assets/new_arrivals_hero_banner.jpg';
import defaultHeroBannerAsset3 from '../assets/bestsellers_hero_banner.jpg';

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
 * Retrieves the current hero configuration.
 */
export function getHeroConfig() {
  if (typeof window === 'undefined') return DEFAULT_HERO_CONFIG;
  try {
    // 1. Try v3 configuration
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const mergedSlides = DEFAULT_HERO_SLIDES.map((defSlide, idx) => {
        const savedSlide = parsed.slides && parsed.slides[idx] ? parsed.slides[idx] : {};
        return {
          ...defSlide,
          ...savedSlide,
          image: savedSlide.image || defSlide.image,
          destinationUrl: savedSlide.destinationUrl || defSlide.destinationUrl,
        };
      });

      return {
        ...DEFAULT_HERO_CONFIG,
        ...parsed,
        slides: mergedSlides,
      };
    }

    // 2. Migration from v2 (single image)
    const legacyRaw = localStorage.getItem('oceanjewel_hero_banner_config_v2');
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      const migratedSlides = [...DEFAULT_HERO_SLIDES];
      if (legacyParsed.desktopImage) {
        migratedSlides[0] = {
          ...migratedSlides[0],
          image: legacyParsed.desktopImage,
          destinationUrl: legacyParsed.destinationUrl || '/collections',
        };
      }
      const migratedConfig = {
        ...DEFAULT_HERO_CONFIG,
        active: legacyParsed.active !== false,
        slides: migratedSlides,
        mobileImage: legacyParsed.mobileImage || '',
        mobileDestinationUrl: legacyParsed.mobileDestinationUrl || '/shop',
      };
      // Save forward to v3
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(migratedConfig));
      return migratedConfig;
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
    localStorage.removeItem('oceanjewel_hero_banner_config_v2');
    window.dispatchEvent(new CustomEvent(HERO_UPDATE_EVENT, { detail: DEFAULT_HERO_CONFIG }));
  } catch (e) {
    console.error('Failed resetting hero banner config:', e);
  }
  return DEFAULT_HERO_CONFIG;
}

