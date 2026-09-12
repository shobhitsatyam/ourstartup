import CmsContent from '../models/CmsContent.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

// Set aggressive no-cache headers for all CMS read endpoints
const setNoCacheHeaders = (res) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
};

// @desc    Get all CMS contents
// @route   GET /api/cms
// @access  Public
export const getAllCms = async (req, res) => {
  try {
    setNoCacheHeaders(res);

    if (isMongoConnected) {
      const records = await CmsContent.find({});
      const cmsMap = {};
      records.forEach((doc) => {
        cmsMap[doc.key] = doc.key === 'hero_banner' ? normalizeHeroBannerData(doc.data) : doc.data;
      });
      return res.json({
        success: true,
        data: cmsMap,
        records,
      });
    } else {
      const cmsMap = {};
      Object.keys(mockStore.cmsContent || {}).forEach((k) => {
        cmsMap[k] = k === 'hero_banner' ? normalizeHeroBannerData(mockStore.cmsContent[k]) : mockStore.cmsContent[k];
      });
      return res.json({
        success: true,
        data: cmsMap,
        records: [],
      });
    }
  } catch (error) {
    console.error('Error in getAllCms:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Safe default fallbacks for independent desktop and mobile hero configurations
const DEFAULT_DESKTOP_FALLBACK_SLIDES = [
  {
    id: 'desktop-slide-1',
    title: 'THE ROYAL ANTI-TARNISH COLLECTION',
    subtitle: 'Handcrafted with 18K Real Gold PVD coating & guaranteed zero tarnish',
    ctaText: 'Shop Women',
    image: 'https://res.cloudinary.com/akkplnbl/image/upload/v1788931451/ocean_jewel/products/uwii64unuj9ro5q6hnor.webp',
    destinationUrl: '/women',
    active: true,
  },
  {
    id: 'desktop-slide-2',
    title: 'THE FESTIVE & ROYAL EDIT',
    subtitle: 'Celebrate traditions with handcrafted Kundan motifs and waterproof brilliance',
    ctaText: 'Shop Festive',
    image: 'https://res.cloudinary.com/akkplnbl/image/upload/v1788915888/ocean_jewel/products/bqoiij36nsae6vihcpya.webp',
    destinationUrl: '/collections',
    active: true,
  },
  {
    id: 'desktop-slide-3',
    title: 'AUTUMN RADIANCE NEW ARRIVALS',
    subtitle: 'Featuring freshwater pearls, emerald drops, and architectural statement heirlooms',
    ctaText: 'Explore New Arrivals',
    image: 'https://res.cloudinary.com/akkplnbl/image/upload/v1788915901/ocean_jewel/products/upla2cmd3c6xfvn4cehb.webp',
    destinationUrl: '/new-arrivals',
    active: true,
  },
];

const DEFAULT_MOBILE_FALLBACK_SLIDES = [
  {
    id: 'mobile-slide-1',
    title: 'THE ROYAL ANTI-TARNISH COLLECTION',
    subtitle: 'Handcrafted with 18K Real Gold PVD coating & guaranteed zero tarnish',
    ctaText: 'Shop Women',
    image: 'https://res.cloudinary.com/akkplnbl/image/upload/v1788931451/ocean_jewel/products/uwii64unuj9ro5q6hnor.webp',
    destinationUrl: '/women',
    active: true,
  },
  {
    id: 'mobile-slide-2',
    title: 'THE FESTIVE & ROYAL EDIT',
    subtitle: 'Celebrate traditions with handcrafted Kundan motifs and waterproof brilliance',
    ctaText: 'Shop Festive',
    image: 'https://res.cloudinary.com/akkplnbl/image/upload/v1788915888/ocean_jewel/products/bqoiij36nsae6vihcpya.webp',
    destinationUrl: '/collections',
    active: true,
  },
  {
    id: 'mobile-slide-3',
    title: 'AUTUMN RADIANCE NEW ARRIVALS',
    subtitle: 'Featuring freshwater pearls, emerald drops, and architectural statement heirlooms',
    ctaText: 'Explore New Arrivals',
    image: 'https://res.cloudinary.com/akkplnbl/image/upload/v1788915901/ocean_jewel/products/upla2cmd3c6xfvn4cehb.webp',
    destinationUrl: '/new-arrivals',
    active: true,
  },
  {
    id: 'mobile-slide-4',
    title: 'MOST COVETED BESTSELLERS',
    subtitle: 'Discover daily waterproof bracelets, rings, and tennis chains loved across India',
    ctaText: 'Shop Bestsellers',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80',
    destinationUrl: '/bestsellers',
    active: true,
  },
];

// Helper to deep-clone an array of slide objects ensuring clean value-level detachment
const cloneSlideArray = (sourceList, prefix = 'slide') => {
  if (!Array.isArray(sourceList)) return [];
  return sourceList.map((item, idx) => ({
    id: item.id ? String(item.id) : `${prefix}-${idx + 1}-${Date.now()}`,
    title: item.title !== undefined ? String(item.title) : '',
    subtitle: item.subtitle !== undefined ? String(item.subtitle) : '',
    ctaText: item.ctaText !== undefined ? String(item.ctaText) : 'Shop Now',
    image: item.image !== undefined ? String(item.image) : '',
    destinationUrl: item.destinationUrl !== undefined ? String(item.destinationUrl) : '/collections',
    active: item.active !== false,
  }));
};

// Helper to normalize hero_banner CMS structure ensuring desktop and mobile independence
export const normalizeHeroBannerData = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return {
      active: true,
      autoplayInterval: 4500,
      desktop: {
        active: true,
        aspectRatio: '16/5',
        slides: cloneSlideArray(DEFAULT_DESKTOP_FALLBACK_SLIDES, 'desktop-slide'),
        banners: cloneSlideArray(DEFAULT_DESKTOP_FALLBACK_SLIDES, 'desktop-slide'),
      },
      mobile: {
        active: true,
        aspectRatio: '16/10',
        slides: cloneSlideArray(DEFAULT_MOBILE_FALLBACK_SLIDES, 'mobile-slide'),
        banners: cloneSlideArray(DEFAULT_MOBILE_FALLBACK_SLIDES, 'mobile-slide'),
      },
      slides: cloneSlideArray(DEFAULT_DESKTOP_FALLBACK_SLIDES, 'desktop-slide'),
      updatedAt: Date.now(),
    };
  }

  // 1. Resolve Desktop Slides
  let desktopSlides;
  if (Array.isArray(rawData.desktop?.slides) && rawData.desktop.slides.length > 0) {
    desktopSlides = cloneSlideArray(rawData.desktop.slides, 'desktop-slide');
  } else if (Array.isArray(rawData.desktop?.banners) && rawData.desktop.banners.length > 0) {
    desktopSlides = cloneSlideArray(rawData.desktop.banners, 'desktop-slide');
  } else if (Array.isArray(rawData.slides) && rawData.slides.length > 0) {
    desktopSlides = cloneSlideArray(rawData.slides, 'desktop-slide');
  } else {
    desktopSlides = cloneSlideArray(DEFAULT_DESKTOP_FALLBACK_SLIDES, 'desktop-slide');
  }

  // 2. Resolve Mobile Slides (MUST NEVER FALLBACK TO DESKTOP SLIDES)
  let mobileSlides;
  if (Array.isArray(rawData.mobile?.slides) && rawData.mobile.slides.length > 0) {
    mobileSlides = cloneSlideArray(rawData.mobile.slides, 'mobile-slide');
  } else if (Array.isArray(rawData.mobile?.banners) && rawData.mobile.banners.length > 0) {
    mobileSlides = cloneSlideArray(rawData.mobile.banners, 'mobile-slide');
  } else {
    // Dedicated mobile fallback only — never overwrite mobile with desktop banners!
    mobileSlides = cloneSlideArray(DEFAULT_MOBILE_FALLBACK_SLIDES, 'mobile-slide');
  }

  // Ensure unique IDs across devices if existing mobile slides had identical IDs to desktop
  mobileSlides = mobileSlides.map((s, idx) => {
    const isSharedId = desktopSlides.some((ds) => ds.id === s.id);
    return {
      ...s,
      id: (isSharedId || !s.id.startsWith('mobile-')) ? `mobile-slide-${idx + 1}` : s.id,
    };
  });

  desktopSlides = desktopSlides.map((s, idx) => {
    return {
      ...s,
      id: !s.id.startsWith('desktop-') ? `desktop-slide-${idx + 1}` : s.id,
    };
  });

  const desktopConfig = {
    active: rawData.desktop?.active !== false,
    aspectRatio: rawData.desktop?.aspectRatio || '16/5',
    slides: desktopSlides,
    banners: cloneSlideArray(desktopSlides, 'desktop-slide'),
  };

  const mobileConfig = {
    active: rawData.mobile?.active !== false,
    aspectRatio: rawData.mobile?.aspectRatio || '16/10',
    slides: mobileSlides,
    banners: cloneSlideArray(mobileSlides, 'mobile-slide'),
  };

  return {
    ...rawData,
    active: rawData.active !== false,
    autoplayInterval: rawData.autoplayInterval || 4500,
    desktop: desktopConfig,
    mobile: mobileConfig,
    // Backwards-compatibility mirror of desktop slides for legacy endpoints
    slides: cloneSlideArray(desktopSlides, 'desktop-slide'),
    updatedAt: rawData.updatedAt || Date.now(),
  };
};

// @desc    Get CMS content by key
// @route   GET /api/cms/:key
// @access  Public
export const getCmsByKey = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    const key = req.params.key?.toLowerCase()?.trim();

    if (!key) {
      return res.status(400).json({ success: false, message: 'CMS key is required' });
    }

    if (isMongoConnected) {
      const record = await CmsContent.findOne({ key });
      if (!record) {
        return res.json({
          success: true,
          key,
          data: null,
          message: `No custom CMS configuration found for key '${key}', use defaults`,
        });
      }

      const responseData = key === 'hero_banner' ? normalizeHeroBannerData(record.data) : record.data;

      return res.json({
        success: true,
        key: record.key,
        data: responseData,
        updatedAt: record.updatedAt,
      });
    } else {
      const memoryData = mockStore.cmsContent?.[key] ?? null;
      const responseData = (key === 'hero_banner' && memoryData) ? normalizeHeroBannerData(memoryData) : memoryData;
      return res.json({
        success: true,
        key,
        data: responseData,
      });
    }
  } catch (error) {
    console.error(`Error in getCmsByKey (${req.params.key}):`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update or create CMS content by key
// @route   PUT /api/cms/:key or PUT /api/admin/cms/:key
// @access  Private / Admin
export const updateCmsByKey = async (req, res) => {
  try {
    const key = req.params.key?.toLowerCase()?.trim();
    const { data } = req.body;

    if (!key) {
      return res.status(400).json({ success: false, message: 'CMS key is required' });
    }

    if (data === undefined) {
      return res.status(400).json({ success: false, message: 'Data payload is required' });
    }

    let dataToSave = data;

    // Special handling for hero_banner: enforce complete independence between desktop and mobile
    if (key === 'hero_banner' && typeof data === 'object' && data !== null) {
      let existingData = null;
      if (isMongoConnected) {
        const existingRecord = await CmsContent.findOne({ key });
        existingData = existingRecord?.data;
      } else {
        existingData = mockStore.cmsContent?.[key];
      }

      const normalizedExisting = existingData ? normalizeHeroBannerData(existingData) : normalizeHeroBannerData(null);

      const targetDevice = data.targetDevice?.toLowerCase()?.trim(); // 'desktop' | 'mobile' | undefined

      let finalDesktopConfig;
      let finalMobileConfig;

      if (targetDevice === 'desktop') {
        // Targeted Desktop Save: update Desktop ONLY, protect Mobile from any change
        const incomingDesktop = data.desktop || (Array.isArray(data.slides) ? { slides: data.slides } : null);
        const incomingDesktopSlides = incomingDesktop?.slides || incomingDesktop?.banners;

        finalDesktopConfig = {
          active: incomingDesktop?.active !== undefined ? incomingDesktop.active : (data.active !== undefined ? data.active : normalizedExisting.desktop.active),
          aspectRatio: incomingDesktop?.aspectRatio || normalizedExisting.desktop.aspectRatio || '16/5',
          slides: Array.isArray(incomingDesktopSlides)
            ? cloneSlideArray(incomingDesktopSlides, 'desktop-slide')
            : cloneSlideArray(normalizedExisting.desktop.slides, 'desktop-slide'),
        };
        finalDesktopConfig.banners = cloneSlideArray(finalDesktopConfig.slides, 'desktop-slide');

        // Mobile remains 100% UNTOUCHED
        finalMobileConfig = {
          ...normalizedExisting.mobile,
          slides: cloneSlideArray(normalizedExisting.mobile.slides, 'mobile-slide'),
          banners: cloneSlideArray(normalizedExisting.mobile.banners || normalizedExisting.mobile.slides, 'mobile-slide'),
        };
      } else if (targetDevice === 'mobile') {
        // Targeted Mobile Save: update Mobile ONLY, protect Desktop from any change
        const incomingMobile = data.mobile || (Array.isArray(data.slides) ? { slides: data.slides } : null);
        const incomingMobileSlides = incomingMobile?.slides || incomingMobile?.banners;

        finalMobileConfig = {
          active: incomingMobile?.active !== undefined ? incomingMobile.active : (data.active !== undefined ? data.active : normalizedExisting.mobile.active),
          aspectRatio: incomingMobile?.aspectRatio || normalizedExisting.mobile.aspectRatio || '16/10',
          slides: Array.isArray(incomingMobileSlides)
            ? cloneSlideArray(incomingMobileSlides, 'mobile-slide')
            : cloneSlideArray(normalizedExisting.mobile.slides, 'mobile-slide'),
        };
        finalMobileConfig.banners = cloneSlideArray(finalMobileConfig.slides, 'mobile-slide');

        // Desktop remains 100% UNTOUCHED
        finalDesktopConfig = {
          ...normalizedExisting.desktop,
          slides: cloneSlideArray(normalizedExisting.desktop.slides, 'desktop-slide'),
          banners: cloneSlideArray(normalizedExisting.desktop.banners || normalizedExisting.desktop.slides, 'desktop-slide'),
        };
      } else {
        // Both or untargeted: process desktop and mobile independently
        const hasIncomingDesktop = Boolean(data.desktop || (!data.mobile && Array.isArray(data.slides)));
        const hasIncomingMobile = Boolean(data.mobile);

        if (hasIncomingDesktop) {
          const incomingDesktopSlides = data.desktop?.slides || data.desktop?.banners || data.slides;
          finalDesktopConfig = {
            active: data.desktop?.active !== undefined ? data.desktop.active : normalizedExisting.desktop.active,
            aspectRatio: data.desktop?.aspectRatio || normalizedExisting.desktop.aspectRatio || '16/5',
            slides: Array.isArray(incomingDesktopSlides)
              ? cloneSlideArray(incomingDesktopSlides, 'desktop-slide')
              : cloneSlideArray(normalizedExisting.desktop.slides, 'desktop-slide'),
          };
        } else {
          finalDesktopConfig = {
            ...normalizedExisting.desktop,
            slides: cloneSlideArray(normalizedExisting.desktop.slides, 'desktop-slide'),
          };
        }
        finalDesktopConfig.banners = cloneSlideArray(finalDesktopConfig.slides, 'desktop-slide');

        if (hasIncomingMobile) {
          const incomingMobileSlides = data.mobile?.slides || data.mobile?.banners;
          finalMobileConfig = {
            active: data.mobile?.active !== undefined ? data.mobile.active : normalizedExisting.mobile.active,
            aspectRatio: data.mobile?.aspectRatio || normalizedExisting.mobile.aspectRatio || '16/10',
            slides: Array.isArray(incomingMobileSlides)
              ? cloneSlideArray(incomingMobileSlides, 'mobile-slide')
              : cloneSlideArray(normalizedExisting.mobile.slides, 'mobile-slide'),
          };
        } else {
          finalMobileConfig = {
            ...normalizedExisting.mobile,
            slides: cloneSlideArray(normalizedExisting.mobile.slides, 'mobile-slide'),
          };
        }
        finalMobileConfig.banners = cloneSlideArray(finalMobileConfig.slides, 'mobile-slide');
      }

      dataToSave = {
        active: data.active !== undefined ? data.active : normalizedExisting.active,
        autoplayInterval: data.autoplayInterval || normalizedExisting.autoplayInterval || 4500,
        desktop: finalDesktopConfig,
        mobile: finalMobileConfig,
        // Mirror desktop slides for backward-compatibility only
        slides: cloneSlideArray(finalDesktopConfig.slides, 'desktop-slide'),
        updatedAt: Date.now(),
      };
    }

    if (isMongoConnected) {
      const updatedRecord = await CmsContent.findOneAndUpdate(
        { key },
        {
          key,
          data: dataToSave,
          updatedBy: req.user?._id || null,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`✅ [Ocean Jewel CMS] Persisted live configuration for '${key}' to MongoDB Atlas`);

      return res.json({
        success: true,
        message: `CMS configuration for '${key}' successfully saved`,
        key: updatedRecord.key,
        data: updatedRecord.data,
        updatedAt: updatedRecord.updatedAt,
      });
    } else {
      if (!mockStore.cmsContent) mockStore.cmsContent = {};
      mockStore.cmsContent[key] = dataToSave;

      return res.json({
        success: true,
        message: `CMS configuration for '${key}' saved in mock memory`,
        key,
        data: dataToSave,
      });
    }
  } catch (error) {
    console.error(`Error in updateCmsByKey (${req.params.key}):`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset CMS content by key (deletes custom configuration to restore defaults)
// @route   DELETE /api/cms/:key or DELETE /api/admin/cms/:key
// @access  Private / Admin
export const resetCmsByKey = async (req, res) => {
  try {
    const key = req.params.key?.toLowerCase()?.trim();

    if (!key) {
      return res.status(400).json({ success: false, message: 'CMS key is required' });
    }

    if (isMongoConnected) {
      await CmsContent.findOneAndDelete({ key });
      console.log(`ℹ️ [Ocean Jewel CMS] Cleared custom configuration for '${key}', reverting to system defaults`);
    } else if (mockStore.cmsContent) {
      delete mockStore.cmsContent[key];
    }

    return res.json({
      success: true,
      message: `CMS configuration for '${key}' reset to defaults`,
      key,
    });
  } catch (error) {
    console.error(`Error in resetCmsByKey (${req.params.key}):`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
