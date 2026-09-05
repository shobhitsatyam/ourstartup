import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Quote, Sparkles, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export default function CustomerReviews() {
  const testimonials = [
    {
      name: 'Ananya Deshmukh',
      initials: 'AD',
      city: 'Mumbai',
      product: 'Celestial Aurora Pearl Chandbali',
      rating: 5,
      tag: '3-Day Wedding • Zero Tarnish',
      comment: 'Wore these for my sister’s 3-day destination wedding in Udaipur and then to my office dinner. Not a single trace of tarnish even with perfume and sweat! The packaging felt like Cartier.',
    },
    {
      name: 'Rohan Mehta',
      initials: 'RM',
      city: 'Delhi NCR',
      product: 'Ares 7mm Cuban Chain',
      rating: 5,
      tag: 'Daily Gym & Shower Tested',
      comment: 'I take showers and hit the gym with this chain on every single day. 4 months in and the champagne gold shine is as bright as day one. Best men’s accessory brand in India hands down.',
    },
    {
      name: 'Pooja Iyer',
      initials: 'PI',
      city: 'Bengaluru',
      product: 'Mayura Saree Waist Brooch & Payal',
      rating: 5,
      tag: 'Zero Snags on Silk Sarees',
      comment: 'The saree pleat pin solved my biggest headache during Diwali — zero snags on my Kanjeevaram silk saree! The payal is super comfortable and 100% water resistant.',
    },
    {
      name: 'Dr. Radhika Sen',
      initials: 'RS',
      city: 'Kolkata',
      product: 'Padmavati Emerald Choker Set',
      rating: 5,
      tag: 'Heirloom Finish • Flawless Fit',
      comment: 'Wore the Padmavati set for my reception. The deep green emerald stone against the champagne gold look was breathtaking. Received endless compliments from family.',
    },
    {
      name: 'Siddharth Rao',
      initials: 'SR',
      city: 'Hyderabad',
      product: 'Vanguard Obsidian Studs',
      rating: 5,
      tag: 'Daily Office & Travel',
      comment: 'Minimalist, masculine, and exceptionally well engineered. The screw-back design ensures they stay secure. Have worn them non-stop for three weeks without any skin reaction.',
    },
    {
      name: 'Meera Kapoor',
      initials: 'MK',
      city: 'Jaipur',
      product: 'Solitaire Eternity Band',
      rating: 5,
      tag: 'Zero Discoloration',
      comment: 'Replaced my everyday silver band with Ocean Jewel’s eternity band. I do daily pottery work and gardening, yet the luster remains completely unaffected.',
    },
    {
      name: 'Vikramaditya Joshi',
      initials: 'VJ',
      city: 'Pune',
      product: 'Imperial Byzantine Link Chain',
      rating: 5,
      tag: 'Substantial Weight & Craft',
      comment: 'The craftsmanship on the Byzantine links is phenomenal. Solid weight, premium clasp, and skin-friendly medical grade steel with zero irritation.',
    },
    {
      name: 'Tanya Singhania',
      initials: 'TS',
      city: 'Chandigarh',
      product: 'Waterproof Layered Payal Stack',
      rating: 5,
      tag: 'Monsoon & Beach Proof',
      comment: 'Wore these to Goa and through the monsoon season. Sand, saltwater, and humidity did nothing to the gold shine. Truly waterproof everyday luxury.',
    },
    {
      name: 'Alankrita Verma',
      initials: 'AV',
      city: 'Lucknow',
      product: 'Kundan Polki Saree Pin',
      rating: 5,
      tag: 'Silk-Safe Magnetic Clasp',
      comment: 'Finally a brooch pin that doesn’t pierce or snag my Chanderi sarees. Beautifully weighted and exudes timeless regal elegance with effortless clasping.',
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [desktopIdx, setDesktopIdx] = useState(0);
  const maxDesktopIdx = testimonials.length - 3;
  const carouselRef = useRef(null);

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const newIdx = Math.round(scrollLeft / (clientWidth * 0.8));
      setActiveIdx(Math.min(Math.max(0, newIdx), testimonials.length - 1));
    }
  };

  const scrollTo = (index) => {
    if (carouselRef.current) {
      const cards = carouselRef.current.children;
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setActiveIdx(index);
      }
    }
  };

  return (
    <section className="py-8 sm:py-10 lg:py-12 bg-[#FAF9FF] relative overflow-hidden border-t border-[#D6CFFF]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* 1. MOBILE & TABLET: ULTRA-PREMIUM REDESIGNED TESTIMONIALS     */}
        {/* ============================================================ */}
        <div className="block lg:hidden">
          {/* Header Area */}
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            {/* Luxury Rating Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E3DCFF] shadow-2xs mb-2.5">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-[#17151F]">
                4.9 / 5.0
              </span>
              <span className="text-[10px] text-[#7464B8] font-medium border-l border-[#D6CFFF] pl-2">
                50,000+ Patrons
              </span>
            </div>

            <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#7464B8]">
              Client Testimonials
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F] mt-1 tracking-tight">
              LOVED BY 50,000+ PATRONS
            </h2>
            <p className="text-[11.5px] sm:text-xs text-gray-500 mt-1 font-light max-w-sm mx-auto">
              Real stories from verified buyers across India.
            </p>

            {/* Premium Trust Markers Strip */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 text-[10px] sm:text-[11px] text-[#554E66]">
              <span className="inline-flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7464B8]" />
                Anti-Tarnish
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D6CFFF]" />
              <span className="inline-flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                18K PVD Gold
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D6CFFF]" />
              <span className="inline-flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Waterproof
              </span>
            </div>
          </div>

          {/* Testimonials Carousel (Touch-smooth Snap with Centered Peek) */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 sm:gap-5 pb-3 -mx-4 px-6 sm:mx-0 sm:px-2 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="w-[84vw] max-w-[340px] sm:w-[420px] sm:max-w-[440px] shrink-0 snap-center p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white via-[#FCFBFF] to-[#FAF8FF] border border-[#E7E1FB] shadow-[0_8px_30px_rgba(116,100,184,0.07)] flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle Luxury Watermark Quote */}
                <Quote className="w-12 h-12 text-[#EFEAFE]/70 absolute top-3 right-3 pointer-events-none" />

                <div>
                  {/* Patron Profile Row */}
                  <div className="flex items-center justify-between gap-2.5 mb-3.5 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7464B8] to-[#9A89E2] text-white flex items-center justify-center font-serif text-xs sm:text-sm font-semibold shadow-xs border border-white">
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#17151F] leading-tight">
                          {t.name}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 font-light">
                          {t.city} &bull; Verified Patron
                        </p>
                      </div>
                    </div>

                    {/* Verified Buyer Badge */}
                    <div className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10.5px] font-semibold text-emerald-700 bg-emerald-50/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200/80 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Rating Stars & Product Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3 relative z-10 flex-wrap">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] text-[#7464B8] font-medium bg-[#F3EFFF] border border-[#E4DDFF] px-2 py-0.5 rounded-md truncate max-w-[200px]">
                      ✨ {t.product}
                    </span>
                  </div>

                  {/* Review Text - Full & Beautifully Formatted */}
                  <p className="text-xs sm:text-[13px] text-[#2D2838] font-light leading-relaxed italic relative z-10">
                    "{t.comment}"
                  </p>
                </div>

                {/* Card Bottom: Highlight Tag */}
                <div className="pt-3.5 mt-3.5 border-t border-[#EDE7FA] flex items-center justify-between text-[10px] sm:text-[11px] relative z-10">
                  <span className="font-semibold text-[#7464B8] bg-[#FAF8FF] px-2.5 py-0.5 rounded-full border border-[#E7E0FA]">
                    {t.tag}
                  </span>
                  <span className="text-gray-400 font-light">
                    5.0 ★ Experience
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Carousel Interactive Controls (Dots & Navigation) */}
          <div className="mt-5 flex flex-col items-center gap-2">
            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIdx === i
                      ? 'w-6 bg-[#7464B8]'
                      : 'w-1.5 bg-[#D6CFFF] hover:bg-[#B5A7EB]'
                  }`}
                />
              ))}
            </div>

            {/* Quick arrows & hint */}
            <div className="flex items-center gap-3 text-[10.5px] text-gray-400 font-light">
              <button
                onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className="p-1 rounded-full bg-white border border-[#D6CFFF]/60 disabled:opacity-30 active:scale-95 transition-all text-[#17151F]"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>Swipe to read stories ({activeIdx + 1} of {testimonials.length})</span>
              <button
                onClick={() => scrollTo(Math.min(testimonials.length - 1, activeIdx + 1))}
                disabled={activeIdx === testimonials.length - 1}
                className="p-1 rounded-full bg-white border border-[#D6CFFF]/60 disabled:opacity-30 active:scale-95 transition-all text-[#17151F]"
                aria-label="Next review"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. DESKTOP (lg: / 1025px+): COMPACT HORIZONTAL CAROUSEL      */}
        {/* ============================================================ */}
        <div className="hidden lg:block">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-7 relative">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.35em] text-[#7464B8]">
              Client Testimonials
            </span>
            <h2 className="font-serif text-2xl lg:text-[28px] font-light text-[#17151F] mt-0.5 tracking-tight">
              LOVED BY 50,000+ PATRONS
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-light">
              Real stories from verified buyers across India.
            </p>
          </div>

          {/* 3-Card Sliding Window Carousel */}
          <div className="relative overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${desktopIdx * (100 / 3)}%)` }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="w-1/3 shrink-0 px-2.5 xl:px-3"
                >
                  <div className="p-5 xl:p-5.5 rounded-2xl bg-white border border-[#D6CFFF]/50 shadow-[0_2px_15px_rgba(23,21,31,0.03)] hover:shadow-[0_8px_25px_rgba(214,207,255,0.25)] hover:border-[#7464B8]/40 transition-all duration-300 flex flex-col justify-between h-full min-h-[250px] relative overflow-hidden group">
                    {/* Watermark Quote */}
                    <Quote className="w-7 h-7 text-[#EFEAFE]/80 absolute top-3 right-3 pointer-events-none group-hover:text-[#D6CFFF]/60 transition-colors" />

                    <div>
                      {/* Rating & Product Tag */}
                      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[9px] text-[#7464B8] font-medium bg-[#FAF8FF] border border-[#E7E0FA] px-2 py-0.5 rounded-md truncate max-w-[170px]">
                          ✨ {t.product}
                        </span>
                      </div>

                      {/* Review Comment */}
                      <p className="text-xs xl:text-[12.5px] text-[#2D2838] font-light leading-relaxed italic line-clamp-4 relative z-10">
                        "{t.comment}"
                      </p>
                    </div>

                    {/* Patron Profile & Verified Badge */}
                    <div className="pt-3 mt-3 border-t border-[#EDE7FA] flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7464B8] to-[#9A89E2] text-white flex items-center justify-center font-serif text-[10px] font-semibold">
                          {t.initials}
                        </div>
                        <div>
                          <h4 className="text-[11.5px] font-bold text-[#17151F] leading-tight">{t.name}</h4>
                          <p className="text-[9.5px] text-gray-500 font-light">{t.city} &bull; Verified Patron</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Carousel Indicators and Navigation Buttons */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setDesktopIdx((prev) => Math.max(0, prev - 1))}
              disabled={desktopIdx === 0}
              className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${
                desktopIdx > 0
                  ? 'bg-white border-[#D6CFFF] text-[#17151F] hover:bg-[#17151F] hover:text-white shadow-sm'
                  : 'bg-white/50 border-[#D6CFFF]/30 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-1.5">
              {[...Array(maxDesktopIdx + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDesktopIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    desktopIdx === i
                      ? 'w-6 bg-[#7464B8]'
                      : 'w-1.5 bg-[#D6CFFF] hover:bg-[#B5A7EB]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setDesktopIdx((prev) => Math.min(maxDesktopIdx, prev + 1))}
              disabled={desktopIdx >= maxDesktopIdx}
              className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${
                desktopIdx < maxDesktopIdx
                  ? 'bg-white border-[#D6CFFF] text-[#17151F] hover:bg-[#17151F] hover:text-white shadow-sm'
                  : 'bg-white/50 border-[#D6CFFF]/30 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
