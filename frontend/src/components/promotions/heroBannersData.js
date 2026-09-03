import heroBannerImage from '../../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';
import teejBannerImage from '../../assets/teej_festive_offer_banner.png';
import newArrivalsBannerImage from '../../assets/new_arrivals_hero_banner.jpg';
import bestsellersBannerImage from '../../assets/bestsellers_hero_banner.jpg';

/**
 * Ocean Jewel Hero Banners Data Layer
 * Structured for static initialization and direct binding to future Admin Panel / MongoDB APIs.
 */
export const initialHeroBanners = [
  {
    id: 'hero-banner-main',
    order: 1,
    active: true,
    eyebrow: 'The Royal Anti-Tarnish Collection • 2026',
    title: 'JEWELLERY THAT DEFINES YOU.',
    titleHighlight: 'THAT DEFINES',
    description: 'Timeless pieces designed for modern Indian elegance. Handcrafted with 18K Real Gold PVD coating and guaranteed zero tarnish.',
    primaryCta: {
      text: 'Shop Women',
      link: '/women',
    },
    secondaryCta: {
      text: 'Shop Men',
      link: '/men',
    },
    offerBadge: null,
    couponCode: null,
    image: heroBannerImage,
    imageAlt: 'Ocean Jewel Luxury Indian Jewellery Campaign featuring 18K Gold Heirlooms',
    align: 'left',
  },
  {
    id: 'hero-banner-teej',
    order: 2,
    active: true,
    eyebrow: 'The Festive Edit • Limited Edition',
    title: 'CELEBRATE TRADITIONS. WEAR YOUR STORY.',
    titleHighlight: 'WEAR YOUR STORY',
    description: 'Elevate your festive ensembles with handcrafted royal motifs, heritage Kundan styling, and waterproof brilliance.',
    primaryCta: {
      text: 'Shop The Teej Edit',
      link: '/collections',
    },
    secondaryCta: null,
    offerBadge: 'Flat ₹500 OFF on orders above ₹2,499',
    couponCode: 'TEEJ500',
    image: teejBannerImage,
    imageAlt: 'Ocean Jewel The Teej Festive Edit Jewellery Collection',
    align: 'left',
  },
  {
    id: 'hero-banner-new-arrivals',
    order: 3,
    active: true,
    eyebrow: 'Freshly Handcrafted Heirlooms',
    title: 'AUTUMN RADIANCE NEW ARRIVALS',
    titleHighlight: 'NEW ARRIVALS',
    description: 'Featuring uncut emerald drops, lustrous freshwater pearls, and architectural statement pieces for the connoisseur.',
    primaryCta: {
      text: 'Explore New Arrivals',
      link: '/new-arrivals',
    },
    secondaryCta: null,
    offerBadge: 'Complimentary Express Insured Delivery',
    couponCode: 'WELCOME10',
    image: newArrivalsBannerImage,
    imageAlt: 'Ocean Jewel Autumn Radiance Emerald & Gold Fine Jewellery',
    align: 'left',
  },
  {
    id: 'hero-banner-bestsellers',
    order: 4,
    active: true,
    eyebrow: 'Patron Favorites • Verified 5-Star Reviews',
    title: 'MOST COVETED BESTSELLERS',
    titleHighlight: 'BESTSELLERS',
    description: 'Discover the anti-tarnish rings, tennis bracelets, and daily statement chains loved by thousands across India.',
    primaryCta: {
      text: 'Shop Bestsellers',
      link: '/bestsellers',
    },
    secondaryCta: {
      text: 'Explore All',
      link: '/shop',
    },
    offerBadge: 'Up to 40% OFF + Extra 10% OFF',
    couponCode: 'WELCOME10',
    image: bestsellersBannerImage,
    imageAlt: 'Ocean Jewel Signature Anti-Tarnish Bestseller Pieces',
    align: 'left',
  },
];
