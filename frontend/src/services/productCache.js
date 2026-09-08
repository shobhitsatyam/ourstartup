import api from './api';

const HIGHLIGHTS_STORAGE_KEY = 'ocean_curated_highlights_v2';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes client cache

// Fast in-memory singleton cache
let memoryHighlightsCache = null;
let memoryCacheTimestamp = 0;

// Shared in-flight promise to prevent duplicate requests
let inFlightHighlightsPromise = null;

/**
 * Synchronously retrieves cached curated highlights.
 * Checked first on mount to allow 0ms instantaneous product rendering without skeletons.
 */
export function getCachedCuratedHighlights() {
  // 1. In-memory check
  if (memoryHighlightsCache && (Date.now() - memoryCacheTimestamp < CACHE_TTL_MS)) {
    return memoryHighlightsCache;
  }

  // 2. SessionStorage check
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.data && (Date.now() - (parsed.time || 0) < CACHE_TTL_MS)) {
          memoryHighlightsCache = parsed.data;
          memoryCacheTimestamp = parsed.time;
          return parsed.data;
        }
      }
    } catch {
      // Storage unavailable or parsing error
    }
  }

  return null;
}

/**
 * Persists curated highlights into memory and sessionStorage.
 */
export function setCachedCuratedHighlights(data) {
  if (!data) return;
  memoryHighlightsCache = data;
  memoryCacheTimestamp = Date.now();

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(
        HIGHLIGHTS_STORAGE_KEY,
        JSON.stringify({
          data,
          time: memoryCacheTimestamp,
        })
      );
    } catch {
      // Storage quota or privacy mode error
    }
  }
}

/**
 * Fetches curated highlights with automatic deduplication,
 * stale-while-revalidate caching, and network error resilience.
 *
 * @param {boolean} forceRefresh - If true, bypasses cache to fetch fresh data from server
 * @returns {Promise<{newArrivals: Array, bestsellers: Array, trending: Array}>}
 */
export async function fetchCuratedHighlights(forceRefresh = false) {
  // Return fresh memory cache if not forced
  if (!forceRefresh) {
    const cached = getCachedCuratedHighlights();
    if (cached) {
      return cached;
    }
  }

  // Deduplicate in-flight requests (prevent parallel identical fetches)
  if (inFlightHighlightsPromise) {
    return inFlightHighlightsPromise;
  }

  inFlightHighlightsPromise = (async () => {
    try {
      const res = await api.get('/products/curated/highlights');
      if (res.data?.success && res.data.data) {
        const highlightsData = {
          newArrivals: res.data.data.newArrivals || [],
          bestsellers: res.data.data.bestsellers || [],
          trending: res.data.data.trending || [],
        };
        setCachedCuratedHighlights(highlightsData);
        return highlightsData;
      }
      throw new Error(res.data?.message || 'Failed to fetch highlights');
    } finally {
      inFlightHighlightsPromise = null;
    }
  })();

  return inFlightHighlightsPromise;
}

/**
 * Early background prefetch of curated highlights.
 * Can be called during app bootstrap so the HTTP round-trip overlaps with React hydration.
 */
export function prefetchCuratedHighlights() {
  const cached = getCachedCuratedHighlights();
  if (!cached) {
    fetchCuratedHighlights(false).catch(() => {
      // Background prefetch silent error handling
    });
  }
}
