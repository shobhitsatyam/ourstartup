import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  // Mobile Accordion state
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sec) => {
    setOpenSection(openSection === sec ? null : sec);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    addToast('Welcome to the Ocean VIP Circle! Check your email for code: FESTIVE500', 'success');
  };

  return (
    <footer className="bg-[#17151F] text-[#F8F7FF] pt-12 sm:pt-16 pb-28 lg:pb-12 border-t border-[#D6CFFF]/20 relative overflow-hidden">
      {/* Subtle Background Glow Orb */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#D6CFFF]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Trust Features Row — 2 by 2 Premium Luxury Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 pb-8 sm:pb-12 border-b border-white/10">
          {/* Card 1: Lifetime Anti-Tarnish */}
          <div className="group relative p-3 xs:p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#231E30]/90 via-[#1D1828]/90 to-[#181422]/95 border border-[#D6CFFF]/15 hover:border-[#7464B8]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_25px_rgba(116,100,184,0.18)] flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D6CFFF]/25 to-transparent pointer-events-none" />
            <div className="w-8.5 h-8.5 xs:w-9.5 xs:h-9.5 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#2E283F] to-[#1F192C] border border-[#D6CFFF]/25 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#7464B8] transition-all duration-300 shadow-inner">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#D6CFFF] group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10.5px] xs:text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white leading-tight">
                Lifetime Anti-Tarnish
              </h4>
              <p className="text-[9px] xs:text-[9.5px] sm:text-[11px] text-white/55 mt-0.5 font-light leading-tight">
                Waterproof & sweat resistant
              </p>
            </div>
          </div>

          {/* Card 2: Express Delivery */}
          <div className="group relative p-3 xs:p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#231E30]/90 via-[#1D1828]/90 to-[#181422]/95 border border-[#D6CFFF]/15 hover:border-[#7464B8]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_25px_rgba(116,100,184,0.18)] flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D6CFFF]/25 to-transparent pointer-events-none" />
            <div className="w-8.5 h-8.5 xs:w-9.5 xs:h-9.5 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#2E283F] to-[#1F192C] border border-[#D6CFFF]/25 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#7464B8] transition-all duration-300 shadow-inner">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#D6CFFF] group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10.5px] xs:text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white leading-tight">
                Express Delivery
              </h4>
              <p className="text-[9px] xs:text-[9.5px] sm:text-[11px] text-white/55 mt-0.5 font-light leading-tight">
                Dispatched in 24 hours
              </p>
            </div>
          </div>

          {/* Card 3: Hassle-Free Returns */}
          <div className="group relative p-3 xs:p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#231E30]/90 via-[#1D1828]/90 to-[#181422]/95 border border-[#D6CFFF]/15 hover:border-[#7464B8]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_25px_rgba(116,100,184,0.18)] flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D6CFFF]/25 to-transparent pointer-events-none" />
            <div className="w-8.5 h-8.5 xs:w-9.5 xs:h-9.5 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#2E283F] to-[#1F192C] border border-[#D6CFFF]/25 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#7464B8] transition-all duration-300 shadow-inner">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#D6CFFF] group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10.5px] xs:text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white leading-tight">
                Hassle-Free Returns
              </h4>
              <p className="text-[9px] xs:text-[9.5px] sm:text-[11px] text-white/55 mt-0.5 font-light leading-tight">
                7 days replacement policy
              </p>
            </div>
          </div>

          {/* Card 4: 24/7 Concierge */}
          <div className="group relative p-3 xs:p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#231E30]/90 via-[#1D1828]/90 to-[#181422]/95 border border-[#D6CFFF]/15 hover:border-[#7464B8]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_25px_rgba(116,100,184,0.18)] flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D6CFFF]/25 to-transparent pointer-events-none" />
            <div className="w-8.5 h-8.5 xs:w-9.5 xs:h-9.5 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#2E283F] to-[#1F192C] border border-[#D6CFFF]/25 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#7464B8] transition-all duration-300 shadow-inner">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-[#D6CFFF] group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10.5px] xs:text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white leading-tight">
                24/7 Concierge
              </h4>
              <p className="text-[9px] xs:text-[9.5px] sm:text-[11px] text-white/55 mt-0.5 font-light leading-tight">
                VIP Customer Support
              </p>
            </div>
          </div>
        </div>

        {/* Brand & Newsletter Section (Mobile & Desktop) */}
        <div className="py-8 border-b border-white/10 md:border-none md:pb-0">
          <div className="max-w-md space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl tracking-[0.25em] font-light text-white">OCEAN JEWEL</span>
              <span className="block text-[9px] tracking-[0.45em] text-[#D6CFFF] uppercase font-semibold">Indian Luxury</span>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Crafted for modern Indian style. 18K gold PVD nano-coating, authentic freshwater pearls, and skin-friendly surgical steel.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#D6CFFF] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Join the Ocean VIP Club
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#D6CFFF] bg-[#2A2635] p-3 rounded-xl border border-[#D6CFFF]/30">
                  <CheckCircle2 className="w-4 h-4 text-[#D6CFFF]" />
                  <span>You're subscribed! Enjoy ₹500 off code: <strong>FESTIVE500</strong></span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 bg-[#2A2635] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#D6CFFF]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-[#D6CFFF] to-[#E8E3FF] text-[#17151F] font-semibold text-xs rounded-xl hover:opacity-95 transition-opacity btn-shine shrink-0 flex items-center gap-1"
                  >
                    Join
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Accordion Links (Only on Mobile screens < md) */}
        <div className="md:hidden divide-y divide-white/10 my-4">
          {/* Group 1: Men's Fine */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('men')}
              className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D6CFFF]"
            >
              <span>Men's Fine Collection</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'men' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {openSection === 'men' && (
              <ul className="pt-3 space-y-2 text-xs text-white/60">
                <li><Link to="/men/ear-studs" className="block py-1 hover:text-white">Ear Studs</Link></li>
                <li><Link to="/men/chains" className="block py-1 hover:text-white">Cuban & Byzantine Chains</Link></li>
                <li><Link to="/men/bracelets" className="block py-1 hover:text-white">Leather & Steel Bracelets</Link></li>
                <li><Link to="/men/belts" className="block py-1 hover:text-white">Automatic Leather Belts</Link></li>
                <li><Link to="/men/rings" className="block py-1 hover:text-white">Signet & Obsidian Rings</Link></li>
                <li><Link to="/men" className="block py-1 text-[#D6CFFF] font-medium">Explore All Men &rarr;</Link></li>
              </ul>
            )}
          </div>

          {/* Group 2: Women's Signature */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('women')}
              className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D6CFFF]"
            >
              <span>Women's Signature Collection</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'women' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {openSection === 'women' && (
              <ul className="pt-3 space-y-2 text-xs text-white/60">
                <li><Link to="/women/earrings" className="block py-1 hover:text-white">Chandbalis & Earrings</Link></li>
                <li><Link to="/women/saree-accessories" className="block py-1 hover:text-white">Saree Brooches & Kamarbandhs</Link></li>
                <li><Link to="/women/anklets" className="block py-1 hover:text-white">Waterproof Payals</Link></li>
                <li><Link to="/women/jeans-adjuster" className="block py-1 hover:text-white">Pearl Jeans Adjusters</Link></li>
                <li><Link to="/women/bracelets-bangles" className="block py-1 hover:text-white">Tennis Bracelets & Bangles</Link></li>
                <li><Link to="/women/rings" className="block py-1 hover:text-white">Solitaire & Eternity Rings</Link></li>
                <li><Link to="/women/nose-rings" className="block py-1 hover:text-white">Clip-on Bridal Naths</Link></li>
              </ul>
            )}
          </div>

          {/* Group 3: Client Support */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('support')}
              className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D6CFFF]"
            >
              <span>Client Care & Concierge</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'support' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {openSection === 'support' && (
              <ul className="pt-3 space-y-2 text-xs text-white/60">
                <li><Link to="/account" className="block py-1 hover:text-white">Track Your Order</Link></li>
                <li><Link to="/about" className="block py-1 hover:text-white">The Anti-Tarnish Guarantee</Link></li>
                <li><Link to="/about" className="block py-1 hover:text-white">Jewellery Care Guide</Link></li>
                <li><Link to="/account?tab=rewards" className="block py-1 hover:text-white">Ocean Points Rewards</Link></li>
                <li><span className="block py-1 text-white/40">Email: concierge@oceanjewel.in</span></li>
                <li><span className="block py-1 text-white/40">WhatsApp: +91 98765 43210</span></li>
              </ul>
            )}
          </div>
        </div>

        {/* Desktop 3-Column Links (Shown on Desktop screens md and above) */}
        <div className="hidden md:grid md:grid-cols-3 gap-10 py-10 border-t border-white/10">
          {/* Men's Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#D6CFFF] mb-4">Men's Fine</h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><Link to="/men/ear-studs" className="hover:text-white transition-colors">Ear Studs</Link></li>
              <li><Link to="/men/chains" className="hover:text-white transition-colors">Cuban & Byzantine Chains</Link></li>
              <li><Link to="/men/bracelets" className="hover:text-white transition-colors">Leather & Steel Bracelets</Link></li>
              <li><Link to="/men/belts" className="hover:text-white transition-colors">Automatic Leather Belts</Link></li>
              <li><Link to="/men/rings" className="hover:text-white transition-colors">Signet & Obsidian Rings</Link></li>
              <li><Link to="/men" className="hover:text-[#D6CFFF] transition-colors font-medium">Explore All Men &rarr;</Link></li>
            </ul>
          </div>

          {/* Women's Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#D6CFFF] mb-4">Women's Signature</h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><Link to="/women/earrings" className="hover:text-white transition-colors">Chandbalis & Earrings</Link></li>
              <li><Link to="/women/saree-accessories" className="hover:text-white transition-colors">Saree Brooches & Kamarbandhs</Link></li>
              <li><Link to="/women/anklets" className="hover:text-white transition-colors">Waterproof Payals</Link></li>
              <li><Link to="/women/jeans-adjuster" className="hover:text-white transition-colors">Pearl Jeans Adjusters</Link></li>
              <li><Link to="/women/bracelets-bangles" className="hover:text-white transition-colors">Tennis Bracelets & Bangles</Link></li>
              <li><Link to="/women/rings" className="hover:text-white transition-colors">Solitaire & Eternity Rings</Link></li>
              <li><Link to="/women/nose-rings" className="hover:text-white transition-colors">Clip-on Bridal Naths</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#D6CFFF] mb-4">Client Support</h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><Link to="/account" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">The Anti-Tarnish Guarantee</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Jewellery Care Guide</Link></li>
              <li><Link to="/account?tab=rewards" className="hover:text-white transition-colors">Ocean Points Rewards</Link></li>
              <li><span className="text-white/40">Email: concierge@oceanjewel.in</span></li>
              <li><span className="text-white/40">WhatsApp: +91 98765 43210</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Indian Payment Badges and Copyright */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-white/40 text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} OCEAN JEWEL Inc. All Rights Reserved. Handcrafted in India.
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <span className="text-[10px] tracking-widest uppercase text-white/40">100% Secure Payments:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2A2635] rounded-lg border border-white/10 text-[10px] font-semibold text-[#D6CFFF]">
              <span>UPI</span>
              <span>&bull;</span>
              <span>RuPay</span>
              <span>&bull;</span>
              <span>Cards</span>
              <span>&bull;</span>
              <span>NetBanking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
