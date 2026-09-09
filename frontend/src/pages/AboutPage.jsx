import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Droplets,
  Flame,
  Award,
  ArrowRight,
  Check,
  X,
  Gem,
  RotateCcw,
  Feather,
  HeartHandshake
} from 'lucide-react';
import TrustBadgeSection from '../components/TrustBadgeSection';

export default function AboutPage() {
  const comparisonItems = [
    {
      feature: 'Bonding Technology',
      traditional: 'Chemical dipping (Electroplating)',
      oceanJewel: 'Vacuum PVD Molecular Deposition',
      highlight: true
    },
    {
      feature: 'Base Metal Core',
      traditional: 'Brass, Zinc alloy or Nickel',
      oceanJewel: '316L Medical Grade Stainless Steel',
      highlight: true
    },
    {
      feature: 'Water & Sweat Contact',
      traditional: 'Tarnishes & oxidizes in 2-4 weeks',
      oceanJewel: '100% Waterproof & Sweatproof',
      highlight: false
    },
    {
      feature: 'Perfume & Lotion Resistance',
      traditional: 'Peels and turns skin green',
      oceanJewel: 'Impervious to everyday cosmetics',
      highlight: false
    },
    {
      feature: 'Skin Safety',
      traditional: 'Often causes allergies & rashes',
      oceanJewel: '100% Hypoallergenic & Nickel-Free',
      highlight: false
    },
    {
      feature: 'Cost & Everyday Utility',
      traditional: 'Fragile, locked away in bank lockers',
      oceanJewel: 'High luxury everyday wearability',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* Editorial Hero Header */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE6FD] text-[#7464B8] text-[11px] font-bold uppercase tracking-[0.25em]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Ocean Jewel Manifesto</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[#17151F] leading-tight tracking-tight">
          WHERE SCIENCE MEETS <br />
          <span className="italic font-normal text-[#7464B8]">TIMELESS INDIAN LUXURY.</span>
        </h1>
        <p className="text-xs sm:text-base text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
          For generations, Indian women were told fine jewellery belongs in bank lockers, while daily wear pieces tarnish within weeks. We founded Ocean Jewel to rewrite this story: heirloom aesthetics engineered with space-grade metallurgy.
        </p>
      </section>

      {/* Editorial Visual Trio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group rounded-3xl overflow-hidden aspect-[4/5] shadow-lg border border-white/60 relative">
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
              alt="Freshwater pearls"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6CFFF]">Sourcing</span>
                <h3 className="font-serif text-lg text-white font-medium">Cultured Freshwater Pearls</h3>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl overflow-hidden aspect-[4/5] shadow-xl border border-white/60 md:-translate-y-6 relative">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
              alt="Temple Gold craftsmanship"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6CFFF]">Heirloom Design</span>
                <h3 className="font-serif text-lg text-white font-medium">18K Pure Gold PVD Luster</h3>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl overflow-hidden aspect-[4/5] shadow-lg border border-white/60 relative">
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
              alt="18K Gold Cuban link chain"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6CFFF]">Engineering</span>
                <h3 className="font-serif text-lg text-white font-medium">316L Surgical Grade Core</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Science: PVD Vacuum Deposition */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#D6CFFF]/60 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7464B8]">
              Advanced Metallurgy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#17151F]">
              THE PVD VACUUM SCIENCE
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              How our jewellery withstands monsoon rains, gym sessions, and daily perfumes without tarnishing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            <div className="space-y-3 p-6 rounded-2xl bg-[#FFF9F9] border border-rose-100">
              <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs uppercase tracking-wider">
                <X className="w-4 h-4 text-rose-500" />
                <span>The Electroplating Flaw</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900">Why Street Jewellery Turns Green</h3>
              <p>
                Standard gold-plated ornaments use chemical electroplating, dipping base zinc or brass into a liquid bath to deposit a fragile 0.1-micron film. The moment it meets skin sweat, perfumes, or water, the plating dissolves, unleashing allergic reactions and ugly black discoloration.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-[#F8F7FF] border border-[#D6CFFF]/60">
              <div className="flex items-center gap-2 text-[#7464B8] font-semibold text-xs uppercase tracking-wider">
                <Check className="w-4 h-4 text-[#7464B8]" />
                <span>The Ocean Jewel Innovation</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900">Molecular Vacuum Deposition</h3>
              <p>
                We vaporize authentic 18-karat gold within a sealed high-temperature vacuum chamber. The gold vaporizes into plasma and fuses at the molecular level with hypoallergenic 316L medical stainless steel. The result is a bond 10x harder than conventional plating that never peels or tarnishes.
              </p>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Traditional Plated Jewellery</th>
                  <th className="py-3 px-4 bg-[#F2EFFE] text-[#17151F] font-bold rounded-t-xl">Ocean Jewel Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-3.5 px-4 text-gray-500 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>{row.traditional}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 bg-[#F8F7FF]">
                      <div className="flex items-center gap-1.5 text-[#17151F]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{row.oceanJewel}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Everyday Luxury */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7464B8]">
            Built For Real Life
          </span>
          <h2 className="font-serif text-3xl font-light text-[#17151F]">
            ZERO COMPROMISE WEARABILITY
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/50 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] text-[#7464B8] flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-semibold text-gray-900">100% Waterproof</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Wear your necklaces and earrings in the shower, swimming pool, or during beach getaways without worry.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/50 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] text-[#7464B8] flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-semibold text-gray-900">Sweat & Heat Proof</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Designed for the Indian climate. From high-intensity pilates to summer weddings, sweat will never dull your shine.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/50 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] text-[#7464B8] flex items-center justify-center">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-semibold text-gray-900">Cosmetic Resistant</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Spritz your favorite perfumes, lotions, and sunscreens freely. The PVD barrier repels alcohol and essential oils.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/50 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] text-[#7464B8] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-semibold text-gray-900">Hypoallergenic</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Crafted on surgical grade steel cores with 0% nickel, lead, or cadmium. Safe for the most sensitive Indian skin.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Sourcing & Craftsmanship */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#17151F] text-white rounded-3xl p-8 sm:p-14 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D6CFFF]">
              Ethical Heritage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light leading-tight">
              HONEST MATERIALS. CONSCIOUS LUXURY.
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              We exclusively use responsibly cultured freshwater pearls, precision-cut lab cubic zirconia that rivals mined brilliance, and recycled 316L medical stainless steel. No mining exploitation, no toxic nickel runoff.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#D6CFFF]" />
                <span>Zero Nickel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#D6CFFF]" />
                <span>Zero Cadmium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#D6CFFF]" />
                <span>Conflict-Free</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D6CFFF]/20 text-[#D6CFFF] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-white">7-Day Hassle-Free Return Guarantee</h4>
                <p className="text-[11px] text-gray-400">Experience the quality in person, risk-free</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              If your Ocean Jewel piece does not match your expectations of luster and quality, return it within 7 days in its original packaging for an easy refund or exchange.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgeSection />

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center pb-8 space-y-4">
        <h3 className="font-serif text-2xl sm:text-4xl font-light text-[#17151F]">
          EXPERIENCE THE LUXURY IN PERSON
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Explore our handcrafted collections across 13 Indian categories, backed by our anti-tarnish guarantee.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#17151F] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] shadow-xl btn-shine transition-all"
        >
          <span>Explore All Collections</span>
          <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
        </Link>
      </section>
    </div>
  );
}
