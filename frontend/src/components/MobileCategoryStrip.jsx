import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function MobileCategoryStrip({ activeGender = 'women', onGenderChange }) {
  const womenCategories = [
    {
      name: 'Rings',
      link: '/women/rings',
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Earrings',
      link: '/women/earrings',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Necklaces',
      link: '/women/necklaces-chokers',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Bracelets',
      link: '/women/bracelets-bangles',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Anklets',
      link: '/women/anklets',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Saree Pins',
      link: '/women/saree-accessories',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Mangalsutras',
      link: '/women/mangalsutras',
      image: 'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'New Drops',
      link: '/new-arrivals',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80',
      badge: 'New',
    },
  ];

  const menCategories = [
    {
      name: 'Chains',
      link: '/men/chains',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Kada & Cuffs',
      link: '/men/bracelets-kada',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Rings & Bands',
      link: '/men/rings',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Ear Studs',
      link: '/men/ear-studs',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Pendants',
      link: '/men/pendants',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Cufflinks',
      link: '/men/cufflinks',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Belts',
      link: '/men/belts',
      image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'New Drops',
      link: '/new-arrivals',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=300&q=80',
      badge: 'New',
    },
  ];

  const currentCategories = activeGender === 'men' ? menCategories : womenCategories;

  return (
    <div className="py-2 px-4 lg:hidden">
      {/* 1. LUXURY MEN / WOMEN SEGMENTED TOGGLE (JUST ABOVE EXPLORE CATEGORIES) */}
      <div className="mb-3.5 flex justify-center">
        <div className="bg-[#FAF9FF] p-1 rounded-2xl border border-[#D6CFFF]/60 shadow-xs flex items-center w-full max-w-[320px]">
          {/* WOMEN TAB (DEFAULT) */}
          <button
            onClick={() => onGenderChange?.('women')}
            className={`relative flex-1 py-2 rounded-xl text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none ${
              activeGender === 'women'
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-[#17151F]'
            }`}
          >
            {activeGender === 'women' && (
              <motion.div
                layoutId="activeGenderPill"
                className="absolute inset-0 bg-[#17151F] rounded-xl"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Sparkles className={`w-3 h-3 ${activeGender === 'women' ? 'text-[#D6CFFF]' : 'text-gray-400'}`} />
              <span>WOMEN</span>
            </span>
          </button>

          {/* MEN TAB */}
          <button
            onClick={() => onGenderChange?.('men')}
            className={`relative flex-1 py-2 rounded-xl text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none ${
              activeGender === 'men'
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-[#17151F]'
            }`}
          >
            {activeGender === 'men' && (
              <motion.div
                layoutId="activeGenderPill"
                className="absolute inset-0 bg-[#17151F] rounded-xl"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Sparkles className={`w-3 h-3 ${activeGender === 'men' ? 'text-[#D6CFFF]' : 'text-gray-400'}`} />
              <span>MEN</span>
            </span>
          </button>
        </div>
      </div>

      {/* 2. EXPLORE CATEGORIES HEADER */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7464B8] flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>{activeGender === 'men' ? "Men's Categories" : "Women's Categories"}</span>
        </span>
        <Link
          to={activeGender === 'men' ? '/men' : '/women'}
          className="text-[10px] font-semibold text-gray-500 hover:text-[#7464B8] transition-colors"
        >
          View All &rarr;
        </Link>
      </div>

      {/* 3. DYNAMIC HORIZONTAL CATEGORY CIRCLES */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGender}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex items-start gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {currentCategories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.link}
              className="flex flex-col items-center gap-1.5 shrink-0 snap-start group"
            >
              <div className="relative">
                <div className="w-[62px] h-[62px] sm:w-[68px] sm:h-[68px] rounded-full p-0.5 bg-gradient-to-tr from-[#D6CFFF] via-white to-[#7464B8] shadow-sm group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>

                {cat.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#17151F] text-white text-[8px] font-bold tracking-wider uppercase border border-white">
                    {cat.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-medium text-[#171522] group-hover:text-[#7464B8] tracking-tight text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

