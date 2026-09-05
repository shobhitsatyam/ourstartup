import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Award,
  LogOut,
  LayoutDashboard,
  Bell,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar({ onOpenSearch }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menDropdownOpen, setMenDropdownOpen] = useState(false);
  const [womenDropdownOpen, setWomenDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Mobile Drawer accordions
  const [mobileMenExpanded, setMobileMenExpanded] = useState(false);
  const [mobileWomenExpanded, setMobileWomenExpanded] = useState(false);

  // Mobile/Tablet Notifications Popover State
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Complimentary Express Delivery ⚡',
      message: 'Orders above ₹999 qualify for express pan-India insured shipping.',
      time: 'Just now',
      read: false,
    },
    {
      id: 2,
      title: 'Ocean Royalty Rewards ✨',
      message: 'Earn 1 Ocean Point for every ₹100 spent. Redeem at checkout.',
      time: '1h ago',
      read: false,
    },
    {
      id: 3,
      title: 'New Anti-Tarnish Arrivals 💎',
      message: 'Handcrafted 18K gold-plated jewellery collection now live.',
      time: '1d ago',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount, setIsDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll event for shadow & padding effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer & popovers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMenDropdownOpen(false);
    setWomenDropdownOpen(false);
    setUserDropdownOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle ESC key to close drawer/popovers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setNotificationOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menCategories = [
    { name: 'Ear Studs', path: '/men/ear-studs' },
    { name: 'Chains', path: '/men/chains' },
    { name: 'Bracelets', path: '/men/bracelets' },
    { name: 'Belts', path: '/men/belts' },
    { name: 'Rings', path: '/men/rings' },
  ];

  const womenCategories = [
    { name: 'Earrings', path: '/women/earrings' },
    { name: 'Saree Accessories', path: '/women/saree-accessories' },
    { name: 'Anklets', path: '/women/anklets' },
    { name: 'Jeans Adjuster', path: '/women/jeans-adjuster' },
    { name: 'Bracelets & Bangles', path: '/women/bracelets-bangles' },
    { name: 'Upper Lobe', path: '/women/upper-lobe-earrings' },
    { name: 'Rings', path: '/women/rings' },
    { name: 'Nose Rings', path: '/women/nose-rings' },
  ];

  const dropdownMotion = {
    initial: { opacity: 0, y: 6, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 4, scale: 0.98 },
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  };

  return (
    <>
      {/* Top Luxury Announcement Banner (Shared) */}
      <div className="bg-[#17151F] text-[#E8E3FF] text-[10px] sm:text-xs py-2 px-3 sm:px-4 text-center tracking-widest uppercase font-medium flex items-center justify-center gap-1.5 sm:gap-2 border-b border-[#D6CFFF]/15 relative z-50">
        <Sparkles className="w-3.5 h-3.5 text-[#D6CFFF] animate-pulse flex-shrink-0" />
        <span className="truncate">Complimentary Express Delivery Across India on Orders Above ₹999 &bull; Code: <strong>WELCOME10</strong></span>
        <Sparkles className="w-3.5 h-3.5 text-[#D6CFFF] animate-pulse flex-shrink-0 hidden xs:inline-block" />
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET NAVBAR (0px - 1024px) */}
      {/* Layout: [ HAMBURGER + GREETING/BRAND/TAGLINE (Left) ]  [ NOTIFICATION + POINTS (Right) ] */}
      {/* ========================================================================= */}
      <div className="block min-[1025px]:hidden sticky top-0 z-40">
        <header
          className={`bg-white/95 backdrop-blur-md border-b border-[#D6CFFF]/35 transition-all duration-300 ${
            isScrolled ? 'py-2 shadow-md' : 'py-2.5 shadow-sm'
          }`}
        >
          <div className="w-full px-3 sm:px-6 flex items-center justify-between gap-2 max-w-7xl mx-auto">
            {/* LEFT GROUP: Hamburger + Brand Block (Greeting, Logo, Tagline - Left-Aligned) */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/60 text-[#17151F] hover:text-[#7464B8] hover:bg-[#F3EFFF] active:scale-95 transition-all flex items-center justify-center shadow-xs focus:outline-none shrink-0"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Brand Block: Immediately to the right of Hamburger, left-aligned */}
              <Link to="/" className="flex flex-col items-start text-left min-w-0 group">
                {/* Line 1: Personalized Greeting */}
                <span className="text-[9.5px] xs:text-[10px] sm:text-xs font-medium text-gray-500 tracking-wide truncate max-w-[160px] xs:max-w-[200px] sm:max-w-xs group-hover:text-[#7464B8] transition-colors leading-tight">
                  {isAuthenticated && user?.name
                    ? `Hello, ${user.name.split(' ')[0]} ✨`
                    : 'Hello, Jewellery Lover ✨'}
                </span>

                {/* Line 2: Prominent Brand Typography */}
                <span className="font-serif text-[14.5px] xs:text-[16.5px] sm:text-2xl font-normal tracking-[0.14em] xs:tracking-[0.18em] sm:tracking-[0.22em] text-[#17151F] leading-tight group-hover:text-[#7464B8] transition-colors my-0.5 truncate">
                  OCEAN JEWEL
                </span>

                {/* Line 3: Luxury Tagline */}
                <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] tracking-[0.20em] xs:tracking-[0.26em] sm:tracking-[0.32em] uppercase font-semibold text-[#7464B8] leading-tight truncate">
                  Indian Luxury Jewellery
                </span>
              </Link>
            </div>

            {/* RIGHT GROUP: Notification Bell & Ocean Points (Far Right) */}
            <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2.5">
              {/* Notification Bell Button */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/60 text-[#17151F] hover:text-[#7464B8] hover:bg-[#F3EFFF] active:scale-95 transition-all flex items-center justify-center shadow-xs relative focus:outline-none"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 stroke-[1.8]" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-[#7464B8] text-white text-[9px] font-bold flex items-center justify-center px-1 border border-white shadow-xs"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>

                {/* Notification Dropdown Popover */}
                <AnimatePresence>
                  {notificationOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/10"
                        onClick={() => setNotificationOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_16px_40px_rgba(23,21,31,0.12)] border border-[#D6CFFF]/50 text-[#17151F] z-50"
                      >
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#D6CFFF]/25 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-[#7464B8]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#17151F]">Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-[10px] text-[#7464B8] hover:underline font-semibold"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-xl border text-xs transition-colors ${
                                n.read
                                  ? 'bg-gray-50/70 border-gray-100 text-gray-500'
                                  : 'bg-[#F8F7FF] border-[#D6CFFF]/40 text-[#17151F]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="font-semibold text-xs leading-snug">{n.title}</p>
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#7464B8] shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1 leading-normal">{n.message}</p>
                              <span className="text-[9px] text-gray-400 mt-1.5 block">{n.time}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-[#D6CFFF]/25 text-center">
                          <Link
                            to="/account?tab=orders"
                            onClick={() => setNotificationOpen(false)}
                            className="text-[11px] font-semibold text-[#7464B8] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Track Orders & Updates</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Ocean Points / Rewards Button */}
              <Link
                to="/account?tab=rewards"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-gradient-to-br from-[#17151F] to-[#2A2635] text-[#D6CFFF] hover:text-white active:scale-95 transition-all flex items-center justify-center shadow-xs relative border border-[#D6CFFF]/30"
                aria-label="Ocean Points Rewards"
                title="Ocean Points Rewards"
              >
                <Award className="w-5 h-5 stroke-[2] text-[#D6CFFF]" />
                {isAuthenticated && (
                  <span className="absolute -bottom-1 -right-1 bg-[#7464B8] text-white text-[8px] font-bold px-1 rounded-full border border-white">
                    {user?.oceanPoints || 0}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP NAVBAR (1025px+) — 100% UNTOUCHED & PRESERVED EXACTLY AS BEFORE   */}
      {/* ========================================================================= */}
      <div className="hidden min-[1025px]:block">
        <header
          className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D6CFFF]/30 transition-all duration-300 ${
            isScrolled ? 'py-3 shadow-md' : 'py-3.5 shadow-sm'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Desktop Brand Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex flex-col items-center group">
                <span className="font-serif text-[20px] xl:text-[22px] font-light tracking-[0.22em] text-[#17151F] group-hover:text-[#7464B8] transition-colors leading-tight">
                  OCEAN JEWEL
                </span>
                <span className="text-[7.5px] xl:text-[8px] tracking-[0.42em] uppercase font-semibold text-[#7464B8]">
                  Indian Luxury
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-7 text-[12px] font-medium tracking-wider uppercase text-[#2A2635]">
              <Link
                to="/"
                className={`transition-colors hover:text-[#7464B8] ${
                  location.pathname === '/' ? 'text-[#7464B8] font-semibold' : ''
                }`}
              >
                Home
              </Link>

              {/* MEN COMPACT LUXURY DROPDOWN */}
              <div
                className="relative py-1"
                onMouseEnter={() => setMenDropdownOpen(true)}
                onMouseLeave={() => setMenDropdownOpen(false)}
              >
                <Link
                  to="/men"
                  className={`flex items-center gap-1 transition-colors py-1 hover:text-[#7464B8] ${
                    location.pathname.startsWith('/men') ? 'text-[#7464B8] font-semibold' : ''
                  }`}
                >
                  Men
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${menDropdownOpen ? 'rotate-180 text-[#7464B8]' : 'text-gray-400'}`} />
                </Link>

                <AnimatePresence>
                  {menDropdownOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute top-full -left-2 w-52 p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(23,21,31,0.08)] border border-[#D6CFFF]/40 mt-0.5 text-[#17151F] z-50"
                    >
                      <div className="text-[10px] font-semibold text-[#7464B8] tracking-[0.2em] uppercase px-2 py-1.5 border-b border-[#D6CFFF]/20 mb-1 flex items-center justify-between">
                        <span>Men's Fine</span>
                        <Link to="/men" className="hover:underline text-[9px] font-normal lowercase first-letter:uppercase text-gray-500 hover:text-[#7464B8]">View All &rarr;</Link>
                      </div>
                      <div className="space-y-0.5">
                        {menCategories.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#2A2635] hover:text-[#7464B8] hover:bg-[#FAF9FF] transition-all group font-normal"
                          >
                            <span>{item.name}</span>
                            <span className="text-[10px] text-[#D6CFFF] group-hover:text-[#7464B8] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5">&rarr;</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* WOMEN COMPACT LUXURY DROPDOWN (2-COLUMN SLEEK) */}
              <div
                className="relative py-1"
                onMouseEnter={() => setWomenDropdownOpen(true)}
                onMouseLeave={() => setWomenDropdownOpen(false)}
              >
                <Link
                  to="/women"
                  className={`flex items-center gap-1 transition-colors py-1 hover:text-[#7464B8] ${
                    location.pathname.startsWith('/women') ? 'text-[#7464B8] font-semibold' : ''
                  }`}
                >
                  Women
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${womenDropdownOpen ? 'rotate-180 text-[#7464B8]' : 'text-gray-400'}`} />
                </Link>

                <AnimatePresence>
                  {womenDropdownOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute top-full -left-10 w-[290px] p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(23,21,31,0.08)] border border-[#D6CFFF]/40 mt-0.5 text-[#17151F] z-50"
                    >
                      <div className="text-[10px] font-semibold text-[#7464B8] tracking-[0.2em] uppercase px-2 py-1.5 border-b border-[#D6CFFF]/20 mb-1.5 flex items-center justify-between">
                        <span>Women's Signature</span>
                        <Link to="/women" className="hover:underline text-[9px] font-normal lowercase first-letter:uppercase text-gray-500 hover:text-[#7464B8]">View All &rarr;</Link>
                      </div>
                      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                        {womenCategories.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-[#2A2635] hover:text-[#7464B8] hover:bg-[#FAF9FF] transition-all group font-normal truncate"
                          >
                            <span className="truncate">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/new-arrivals"
                className={`transition-colors hover:text-[#7464B8] ${
                  location.pathname === '/new-arrivals' ? 'text-[#7464B8] font-semibold' : ''
                }`}
              >
                New Arrivals
              </Link>

              <Link
                to="/collections"
                className={`transition-colors hover:text-[#7464B8] ${
                  location.pathname === '/collections' ? 'text-[#7464B8] font-semibold' : ''
                }`}
              >
                Collections
              </Link>

              <Link
                to="/about"
                className={`transition-colors hover:text-[#7464B8] ${
                  location.pathname === '/about' ? 'text-[#7464B8] font-semibold' : ''
                }`}
              >
                About
              </Link>
            </nav>

            {/* Desktop Action Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 text-[#17151F] hover:text-[#7464B8] hover:bg-[#D6CFFF]/20 rounded-full transition-all"
                title="Search Jewellery"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="p-2 text-[#17151F] hover:text-[#7464B8] hover:bg-[#D6CFFF]/20 rounded-full transition-all relative"
                title="My Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#17151F] text-[#E8E3FF] text-[9px] font-bold flex items-center justify-center border border-[#D6CFFF]"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* User Account Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setUserDropdownOpen(true)}
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/account');
                  }}
                  className="p-2 text-[#17151F] hover:text-[#7464B8] hover:bg-[#D6CFFF]/20 rounded-full transition-all flex items-center gap-1"
                  title={isAuthenticated ? user?.name : 'Account'}
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute right-0 top-full w-52 p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(23,21,31,0.08)] border border-[#D6CFFF]/40 mt-1 text-xs text-[#17151F] z-50"
                    >
                      {isAuthenticated ? (
                        <div>
                          <div className="px-2.5 py-1.5 border-b border-[#D6CFFF]/20 mb-1.5">
                            <p className="font-semibold text-[#17151F] text-xs">{user.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#7464B8] font-bold">
                              <Sparkles className="w-3 h-3" />
                              <span>{user.oceanPoints || 0} Ocean Points</span>
                            </div>
                          </div>

                          <Link
                            to="/account"
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9FF] text-[#17151F] font-normal"
                          >
                            <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                            My Profile & Orders
                          </Link>

                          <Link
                            to="/account?tab=rewards"
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9FF] text-[#17151F] font-normal"
                          >
                            <Award className="w-3.5 h-3.5 text-[#7464B8]" />
                            Ocean Points (₹{(user.oceanPoints || 0)} Value)
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#17151F] hover:text-white text-[#17151F] font-medium mt-1"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-[#D6CFFF]" />
                              Admin Control Panel
                            </Link>
                          )}

                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-normal mt-1 text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <div className="p-2 space-y-2 text-center">
                          <p className="text-[11px] text-gray-500 mb-1">Access your luxury account & rewards</p>
                          <Link
                            to="/account"
                            className="block w-full py-1.5 bg-[#17151F] text-white rounded-xl text-xs font-medium hover:bg-[#2A2635] transition-colors btn-shine"
                          >
                            Sign In / Register
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-[#17151F] hover:text-[#7464B8] hover:bg-[#D6CFFF]/20 rounded-full transition-all relative"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7464B8] text-white text-[9px] font-bold flex items-center justify-center border border-white shadow"
                  >
                    {totalItemsCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET NAVIGATION DRAWER                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 min-[1025px]:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#FAF9FF] z-50 p-5 sm:p-6 overflow-y-auto shadow-2xl flex flex-col justify-between border-r border-[#D6CFFF]/40 min-[1025px]:hidden"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#D6CFFF]/40">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex flex-col">
                    <span className="font-serif text-xl tracking-[0.2em] font-light text-[#17151F]">
                      OCEAN JEWEL
                    </span>
                    <span className="text-[8px] tracking-[0.3em] uppercase font-semibold text-[#7464B8]">
                      Indian Luxury
                    </span>
                  </Link>

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-2xl bg-white border border-[#D6CFFF]/50 text-gray-600 hover:text-black hover:bg-gray-50 flex items-center justify-center transition-colors"
                    aria-label="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Action Buttons Strip */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSearch();
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#D6CFFF]/40 flex flex-col items-center justify-center text-gray-700 hover:text-[#7464B8] hover:border-[#7464B8]/40 transition-all text-center group"
                  >
                    <Search className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium">Search</span>
                  </button>

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white border border-[#D6CFFF]/40 flex flex-col items-center justify-center text-gray-700 hover:text-[#7464B8] hover:border-[#7464B8]/40 transition-all text-center group relative"
                  >
                    <Heart className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#17151F] text-[#E8E3FF] text-[8px] font-bold flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsDrawerOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#D6CFFF]/40 flex flex-col items-center justify-center text-gray-700 hover:text-[#7464B8] hover:border-[#7464B8]/40 transition-all text-center group relative"
                  >
                    <ShoppingBag className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium">Cart</span>
                    {totalItemsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#7464B8] text-white text-[8px] font-bold flex items-center justify-center">
                        {totalItemsCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Primary Navigation Links & Accordions */}
                <div className="space-y-1 text-xs font-semibold tracking-wider uppercase text-[#17151F]">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white transition-colors"
                  >
                    <span>Home</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  {/* MEN ACCORDION */}
                  <div className="rounded-xl overflow-hidden bg-white/60 border border-[#D6CFFF]/30">
                    <button
                      onClick={() => setMobileMenExpanded(!mobileMenExpanded)}
                      className="w-full flex items-center justify-between py-2.5 px-3 text-left hover:bg-white transition-colors"
                    >
                      <span className="font-semibold text-xs tracking-wider uppercase text-[#17151F]">Men's Collection</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          mobileMenExpanded ? 'rotate-180 text-[#7464B8]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {mobileMenExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-3 pb-3 pt-1 border-t border-[#D6CFFF]/20 bg-[#FAF9FF]"
                        >
                          <div className="grid grid-cols-1 gap-1 normal-case font-normal text-xs text-gray-700">
                            {menCategories.map((c) => (
                              <Link
                                key={c.path}
                                to={c.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-2 px-2.5 rounded-lg hover:bg-white hover:text-[#7464B8] flex items-center justify-between transition-colors"
                              >
                                <span>{c.name}</span>
                                <span className="text-[10px] text-gray-400">&rarr;</span>
                              </Link>
                            ))}
                            <Link
                              to="/men"
                              onClick={() => setMobileMenuOpen(false)}
                              className="mt-1 py-1.5 px-2.5 rounded-lg bg-[#D6CFFF]/20 text-[#7464B8] font-semibold text-[11px] text-center hover:bg-[#D6CFFF]/35 transition-colors uppercase tracking-wider"
                            >
                              View All Men's Fine &rarr;
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* WOMEN ACCORDION */}
                  <div className="rounded-xl overflow-hidden bg-white/60 border border-[#D6CFFF]/30">
                    <button
                      onClick={() => setMobileWomenExpanded(!mobileWomenExpanded)}
                      className="w-full flex items-center justify-between py-2.5 px-3 text-left hover:bg-white transition-colors"
                    >
                      <span className="font-semibold text-xs tracking-wider uppercase text-[#17151F]">Women's Collection</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          mobileWomenExpanded ? 'rotate-180 text-[#7464B8]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {mobileWomenExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-3 pb-3 pt-1 border-t border-[#D6CFFF]/20 bg-[#FAF9FF]"
                        >
                          <div className="grid grid-cols-1 gap-1 normal-case font-normal text-xs text-gray-700">
                            {womenCategories.map((c) => (
                              <Link
                                key={c.path}
                                to={c.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-2 px-2.5 rounded-lg hover:bg-white hover:text-[#7464B8] flex items-center justify-between transition-colors"
                              >
                                <span>{c.name}</span>
                                <span className="text-[10px] text-gray-400">&rarr;</span>
                              </Link>
                            ))}
                            <Link
                              to="/women"
                              onClick={() => setMobileMenuOpen(false)}
                              className="mt-1 py-1.5 px-2.5 rounded-lg bg-[#D6CFFF]/20 text-[#7464B8] font-semibold text-[11px] text-center hover:bg-[#D6CFFF]/35 transition-colors uppercase tracking-wider"
                            >
                              View All Women's Signature &rarr;
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/new-arrivals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white transition-colors"
                  >
                    <span>New Arrivals</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  <Link
                    to="/bestsellers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white transition-colors"
                  >
                    <span>Bestsellers</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  <Link
                    to="/collections"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white transition-colors"
                  >
                    <span>Collections</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  <Link
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white transition-colors"
                  >
                    <span>About Us</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Mobile Drawer Bottom User Info */}
              <div className="pt-5 mt-4 border-t border-[#D6CFFF]/40">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-white border border-[#D6CFFF]/40 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-[#17151F]">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">Balance</span>
                        <span className="text-xs font-bold text-[#7464B8]">{user.oceanPoints || 0} Pts</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider bg-[#17151F] text-white rounded-xl hover:bg-[#2A2635] transition-colors"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/account?tab=rewards"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider bg-[#FAF9FF] border border-[#D6CFFF]/60 text-[#7464B8] rounded-xl hover:bg-[#F3EFFF] transition-colors"
                      >
                        Ocean Points
                      </Link>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider bg-[#7464B8] text-white rounded-xl shadow-xs"
                      >
                        Admin Control Center
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="text-center">
                      <p className="text-xs font-serif text-[#17151F]">Ocean Royalty Club</p>
                      <p className="text-[11px] text-gray-500">Sign in to earn & redeem points</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center text-xs font-semibold uppercase tracking-widest bg-[#17151F] text-white rounded-2xl shadow-lg btn-shine"
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

