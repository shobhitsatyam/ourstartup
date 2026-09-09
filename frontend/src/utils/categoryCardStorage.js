/**
 * Ocean Jewel Category Card Storage & Management Layer
 * Provides persistent database sync via MongoDB Atlas & Cloudinary for the homepage Shop by Category cards.
 */
import api from '../services/api';

export const DEFAULT_CATEGORY_CARDS = [
  {
    id: 'cat_rings',
    name: 'RINGS',
    gender: 'women',
    desc: 'Solitaires, stackables & adjustable 18K gold bands',
    img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
    link: '/women/rings',
    order: 1,
    active: true,
  },
  {
    id: 'cat_earrings',
    name: 'EARRINGS & CHANDBALIS',
    gender: 'women',
    desc: 'Traditional jhumkas, modern studs & ear cuffs',
    img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    link: '/women/earrings',
    order: 2,
    active: true,
  },
  {
    id: 'cat_chains',
    name: 'CUBAN & BYZANTINE CHAINS',
    gender: 'men',
    desc: 'Heavy waterproof Cuban links & Byzantine statement chains',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    link: '/men/chains',
    order: 3,
    active: true,
  },
  {
    id: 'cat_bracelets',
    name: 'BRACELETS & CUFFS',
    gender: 'unisex',
    desc: 'Tennis bracelets, kada cuffs & charm chains',
    img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80',
    link: '/women/bracelets-bangles',
    order: 4,
    active: true,
  },
  {
    id: 'cat_anklets',
    name: 'WATERPROOF ANKLETS',
    gender: 'women',
    desc: 'Delicate payals engineered for pools and beaches',
    img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80',
    link: '/women/anklets',
    order: 5,
    active: true,
  },
  {
    id: 'cat_saree_pins',
    name: 'SAREE ACCESSORIES & PINS',
    gender: 'women',
    desc: 'Luxury brooches, saree clips & waist chains',
    img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    link: '/women/saree-accessories',
    order: 6,
    active: true,
  },
];

// Curated luxury jewellery preset images for instant 1-click admin preview/selection
export const LUXURY_PRESET_IMAGES = [
  {
    label: 'Solitaire Gold Ring',
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Heritage Kundan Earrings',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Men’s 18K Cuban Chain',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Diamond Kada Cuff',
    url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Gold Payal Anklet',
    url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Royal Emerald Brooch',
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Freshwater Pearl Necklace',
    url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Diamond Tennis Bracelet',
    url: 'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?auto=format&fit=crop&w=600&q=80',
  },
];

const STORAGE_KEY = 'oceanjewel_category_cards';
const UPDATE_EVENT = 'oceanjewel_category_updated';

function mergeCardsWithDefaults(parsed) {
  if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CATEGORY_CARDS;
  return DEFAULT_CATEGORY_CARDS.map((def) => {
    const match = parsed.find((p) => p.name === def.name || p.id === def.id);
    return match ? { ...def, ...match } : def;
  });
}

/**
 * Retrieve current category cards from localStorage cache, fallback to defaults
 */
export function getCategoryCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORY_CARDS;
    const parsed = JSON.parse(raw);
    return mergeCardsWithDefaults(parsed);
  } catch (e) {
    console.warn('Failed to parse category cards from cache:', e);
    return DEFAULT_CATEGORY_CARDS;
  }
}

/**
 * Asynchronously fetches live category cards from MongoDB database.
 */
export async function fetchCategoryCards() {
  try {
    const res = await api.get(`/cms/category_cards?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (res.data?.success && res.data?.data && Array.isArray(res.data.data)) {
      const merged = mergeCardsWithDefaults(res.data.data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: merged }));
      }
      return merged;
    } else {
      return DEFAULT_CATEGORY_CARDS;
    }
  } catch (err) {
    console.warn('Failed fetching category cards from database:', err.message);
    return getCategoryCards();
  }
}

/**
 * Asynchronously persists category cards to MongoDB database.
 */
export async function saveCategoryCardsApi(cards) {
  try {
    const res = await api.put('/cms/category_cards', { data: cards });
    if (res.data?.success) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: cards }));
      }
      return { success: true, data: cards };
    }
    throw new Error(res.data?.message || 'Server did not acknowledge category cards save');
  } catch (err) {
    console.error('Failed saving category cards to database:', err);
    throw err;
  }
}

/**
 * Resets category cards in database back to brand defaults.
 */
export async function resetCategoryCardsApi() {
  try {
    await api.delete('/cms/category_cards');
  } catch (err) {
    console.warn('Failed deleting category cards CMS config:', err.message);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: DEFAULT_CATEGORY_CARDS }));
  }
  return DEFAULT_CATEGORY_CARDS;
}

/**
 * Update the image of a specific category card and persist to database
 */
export async function updateCategoryCardImageApi(identifier, newImageUrl) {
  const cards = getCategoryCards();
  const updated = cards.map((cat) => {
    if (cat.id === identifier || cat.name === identifier) {
      return { ...cat, img: newImageUrl };
    }
    return cat;
  });
  await saveCategoryCardsApi(updated);
  return updated;
}

/**
 * Backwards compatibility wrappers
 */
export function saveCategoryCards(cards) {
  saveCategoryCardsApi(cards).catch((e) => console.error('saveCategoryCards async error:', e));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: cards }));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function updateCategoryCardImage(identifier, newImageUrl) {
  const cards = getCategoryCards();
  const updated = cards.map((cat) => {
    if (cat.id === identifier || cat.name === identifier) {
      return { ...cat, img: newImageUrl };
    }
    return cat;
  });
  saveCategoryCards(updated);
  return updated;
}
