/**
 * Ocean Jewel Category & Gender Configuration
 * Standardized across Admin Panel and Storefront.
 */

export const MEN_CATEGORIES = [
  'Ear Studs',
  'Chains',
  'Bracelets',
  'Belts',
  'Rings',
];

export const WOMEN_CATEGORIES = [
  'Earrings',
  'Anklets',
  'Bracelets & Bangles',
  'Rings',
  'Saree Accessories',
  'Jeans Adjuster',
  'Upper Lobe',
  'Nose Rings',
];

export const UNISEX_CATEGORIES = [
  'Rings',
  'Chains',
  'Bracelets',
  'Belts',
];

export const GENDER_OPTIONS = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'unisex', label: 'Unisex' },
];

export const ALL_CATEGORIES = [
  ...new Set([...WOMEN_CATEGORIES, ...MEN_CATEGORIES, ...UNISEX_CATEGORIES]),
];

/**
 * Returns available categories based on selected gender.
 * If an existing product being edited contains a legacy/custom category,
 * it is gracefully prepended to prevent losing existing database values.
 * 
 * @param {string} gender - 'women' | 'men' | 'unisex'
 * @param {string} [currentCategory] - existing product category if editing
 * @returns {string[]}
 */
export const getCategoriesForGender = (gender = 'women', currentCategory = '') => {
  const normGender = String(gender || 'women').toLowerCase().trim();
  let baseList;
  if (normGender === 'men') {
    baseList = [...MEN_CATEGORIES];
  } else if (normGender === 'unisex') {
    baseList = [...UNISEX_CATEGORIES];
  } else {
    baseList = [...WOMEN_CATEGORIES];
  }

  if (currentCategory && currentCategory.trim() && !baseList.includes(currentCategory)) {
    return [currentCategory, ...baseList];
  }
  return baseList;
};
