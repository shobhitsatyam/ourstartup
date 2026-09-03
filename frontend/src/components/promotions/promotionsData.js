import teejBannerImage from '../../assets/teej_festive_offer_banner.png';

/**
 * Ocean Jewel Promotional Data Layer
 * Designed for immediate static rendering and seamless future Admin Panel / Backend API integration.
 */

export const festivePromotionData = {
  id: 'festive-teej-2026',
  enabled: true,
  type: 'festive',
  campaignName: 'Teej Festive Edit',
  eyebrow: 'THE TEEJ EDIT',
  title: 'Celebrate traditions.\nWear your story.',
  subtitle: 'Curated jewellery for every Teej celebration.',
  offerText: 'Flat ₹500 OFF on orders above ₹2,499',
  couponCode: 'TEEJ500',
  ctaText: 'SHOP THE TEEJ EDIT',
  link: '/collections',
  image: teejBannerImage,
  startDate: '2026-08-01T00:00:00Z',
  endDate: '2026-10-31T23:59:59Z',
  priority: 1,
};

export const permanentPromotionData = {
  id: 'permanent-welcome-10',
  enabled: true,
  type: 'permanent',
  eyebrow: 'A LITTLE EXTRA, JUST FOR YOU',
  title: '10% OFF YOUR FIRST ORDER',
  description: 'Begin your Ocean Jewel journey with a little something extra.',
  couponCode: 'WELCOME10',
  ctaText: 'SHOP NOW',
  link: '/shop',
  highlightBadge: 'Exclusive Welcome Benefit',
};

/**
 * Utility helper to verify if a campaign is currently active
 */
export function isPromotionActive(promotion) {
  if (!promotion || !promotion.enabled) return false;
  if (!promotion.startDate && !promotion.endDate) return true;

  const now = new Date();
  if (promotion.startDate && new Date(promotion.startDate) > now) return false;
  if (promotion.endDate && new Date(promotion.endDate) < now) return false;

  return true;
}
