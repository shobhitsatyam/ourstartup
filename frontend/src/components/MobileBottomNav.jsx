import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { wishlistCount } = useWishlist();
  const { totalItemsCount } = useCart();
  const { isAuthenticated } = useAuth();

  // Mobile & Tablet: Hide bottom navigation on transactional and auth pages
  const hiddenRoutes = [
    '/cart',
    '/checkout',
    '/payment',
    '/order-success',
    '/login',
    '/signup',
    '/register',
    '/auth/callback',
  ];

  const isExplicitHiddenRoute = hiddenRoutes.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );
  // When not authenticated, /account renders the Login/Signup screen, so hide bottom nav
  const isAuthPortal = location.pathname === '/account' && !isAuthenticated;
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isExplicitHiddenRoute || isAuthPortal || isAdminRoute) {
    return null;
  }

  const navTabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      active: location.pathname === '/',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: LayoutGrid,
      path: '/collections',
      active: location.pathname.startsWith('/collections') || location.pathname.startsWith('/women') || location.pathname.startsWith('/men'),
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      path: '/wishlist',
      badge: wishlistCount > 0 ? wishlistCount : null,
      active: location.pathname === '/wishlist',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      path: isAuthenticated ? '/account?tab=orders' : '/cart',
      badge: totalItemsCount > 0 ? totalItemsCount : null,
      active: location.pathname === '/cart' || (location.pathname === '/account' && location.search.includes('orders')),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/account',
      active: location.pathname === '/account' && !location.search.includes('orders'),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#D6CFFF]/40 shadow-[0_-4px_25px_rgba(23,21,31,0.08)] lg:hidden px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.active;

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-3 relative transition-all duration-200 group ${
                isActive ? 'text-[#7464B8]' : 'text-gray-500 hover:text-[#17151F]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />

                {/* Notification Badge */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] rounded-full bg-[#7464B8] text-white text-[9px] font-bold flex items-center justify-center px-1 border border-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 font-medium ${
                  isActive ? 'text-[#7464B8] font-bold' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="w-1 h-1 rounded-full bg-[#7464B8] mt-0.5"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
