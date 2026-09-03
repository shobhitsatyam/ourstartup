import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function CategoryShowcase() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const cards = [
    {
      title: 'Women’s Signature',
      subtitle: 'Chandbalis, Saree Pins, Payals & Solitaires',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      link: '/women',
      tag: 'Couture Collection',
    },
    {
      title: 'Men’s Vanguard',
      subtitle: 'Heavy Cuban Chains, Obsidian Studs & Belts',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      link: '/men',
      tag: 'Raw Elegance',
    },
    {
      title: 'New Arrivals',
      subtitle: 'Fresh Indian designs handcrafted for the season',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      link: '/new-arrivals',
      tag: 'Just Landed',
    },
    {
      title: 'Most Loved Bestsellers',
      subtitle: 'Rated 4.9 Stars by over 15,000 clients',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
      link: '/bestsellers',
      tag: 'Trending Now',
    },
  ];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Center Aligned */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 relative">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7464B8]">
            <Sparkles className="w-3 h-3 text-[#7464B8]" />
            <span>Curated Universes</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-light text-[#17151F] mt-1 tracking-tight">
            EXPLORE THE SHOWROOM
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-500 font-light mt-1">
            Immerse in handcrafted jewellery realms curated for timeless presence.
          </p>
          <div className="w-10 h-0.5 bg-[#D6CFFF] mx-auto mt-2.5" />

          {/* Desktop Navigation Floating Arrows */}
          <div className="hidden sm:flex items-center gap-2 absolute right-0 bottom-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${
                canScrollLeft
                  ? 'bg-white border-[#D6CFFF] text-[#17151F] hover:bg-[#17151F] hover:text-white shadow-sm'
                  : 'bg-white/50 border-[#D6CFFF]/30 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${
                canScrollRight
                  ? 'bg-white border-[#D6CFFF] text-[#17151F] hover:bg-[#17151F] hover:text-white shadow-sm'
                  : 'bg-white/50 border-[#D6CFFF]/30 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Aligned Carousel Cards */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="w-[280px] sm:w-[320px] lg:w-[305px] xl:w-[310px] shrink-0 snap-start"
            >
              <Link
                to={card.link}
                className="group relative block rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-white/80 aspect-[4/5] sm:h-[360px] bg-[#17151F] transition-all duration-500 transform hover:-translate-y-1"
              >
                {/* Background Image with Slow Smooth Zoom */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#130E20]/90 via-[#130E20]/35 via-45% to-black/20 group-hover:from-[#130E20]/95 transition-all" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-white">
                  {/* Top Tag Pill */}
                  <div className="flex justify-between items-start">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-widest uppercase bg-black/35 backdrop-blur-md border border-white/25 text-[#E8E3FF]">
                      {card.tag}
                    </span>
                  </div>

                  {/* Bottom Text & Action Icon */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="space-y-0.5">
                      <h3 className="font-serif text-lg sm:text-xl font-light tracking-wide text-white group-hover:text-[#D6CFFF] transition-colors leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-[#E8E3FF]/80 font-light line-clamp-1">
                        {card.subtitle}
                      </p>
                    </div>

                    {/* Circular Action Button */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/35 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#17151F] group-hover:scale-110 transition-all shrink-0 shadow-sm">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
