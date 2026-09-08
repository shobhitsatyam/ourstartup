import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroBannerImage from '../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';
import MobileHeroCarousel from './MobileHeroCarousel';
import { getHeroConfig, HERO_UPDATE_EVENT } from '../utils/heroBannerStorage';

export default function Hero() {
  const [heroConfig, setHeroConfig] = useState(() => getHeroConfig());

  // Listen for real-time hero banner updates from Admin Panel & cross-tab storage
  useEffect(() => {
    const handleUpdate = () => {
      setHeroConfig(getHeroConfig());
    };
    window.addEventListener(HERO_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(HERO_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE & TABLET HERO BANNER CAROUSEL (0px - 1024px)                       */}
      {/* 100% UNTOUCHED LUXURY EDITORIAL CAROUSEL DESIGN                           */}
      {/* ========================================================================= */}
      <div className="block min-[1025px]:hidden">
        <MobileHeroCarousel />
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP HERO BANNER (1025px+) — 16:6 IMAGE-ONLY CLICKABLE BANNER          */}
      {/* Clean image-only presentation: no text, no overlay, click anywhere to shop */}
      {/* ========================================================================= */}
      {heroConfig.active !== false && (
        <div className="hidden min-[1025px]:block">
          <section className="relative w-full bg-[#120F1D] border-b border-[#D6CFFF]/30 overflow-hidden">
            <Link
              to={heroConfig.destinationUrl || '/shop'}
              className="group relative block w-full lg:aspect-[16/6] lg:min-h-0 overflow-hidden cursor-pointer bg-[#120F1D]"
              style={{ aspectRatio: '16 / 6' }}
              title="Explore Ocean Jewel Collection"
            >
              <img
                src={heroConfig.desktopImage || heroBannerImage}
                alt="Ocean Jewel Luxury Collection"
                className="w-full h-full object-cover object-[center_32%] select-none transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                loading="eager"
                fetchPriority="high"
              />
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
