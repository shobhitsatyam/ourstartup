import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchOverlay from './components/SearchOverlay';
import LuxuryLoader from './components/LuxuryLoader';
import MobileBottomNav from './components/MobileBottomNav';
import FloatingSocialButton from './components/FloatingSocialButton';
import { ProtectedRoute } from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AccountPage from './pages/AccountPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [showIntroLoader, setShowIntroLoader] = useState(true);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9FF] selection:bg-[#D6CFFF] selection:text-[#17151F]">
      {/* 1. Luxury Initial Loading Screen */}
      {showIntroLoader && (
        <LuxuryLoader onComplete={() => setShowIntroLoader(false)} />
      )}

      {/* 2. Frosted Floating Navbar */}
      <Navbar onOpenSearch={() => setSearchOverlayOpen(true)} />

      {/* 3. Slide-out Cart Drawer */}
      <CartDrawer />

      {/* 4. Fullscreen Search Overlay */}
      <SearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
      />

      {/* 5. Main Content Routes */}
      <main className="flex-1">
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage onOpenSearch={() => setSearchOverlayOpen(true)} />} />

          {/* Men Category & Subcategories */}
          <Route path="/men" element={<ProductListingPage fixedGender="men" />} />
          <Route path="/men/:category" element={<ProductListingPage fixedGender="men" />} />

          {/* Women Category & Subcategories */}
          <Route path="/women" element={<ProductListingPage fixedGender="women" />} />
          <Route path="/women/:category" element={<ProductListingPage fixedGender="women" />} />

          {/* Collections & Curated Hubs */}
          <Route path="/shop" element={<ProductListingPage />} />
          <Route path="/collections" element={<ProductListingPage />} />
          <Route path="/new-arrivals" element={<ProductListingPage isNew={true} />} />
          <Route path="/bestsellers" element={<ProductListingPage isBest={true} />} />

          {/* Product Detail Page */}
          <Route path="/products/:slug" element={<ProductDetailPage />} />

          {/* Cart & Wishlist */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Checkout & Orders */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* User Account & Authentication Portals */}
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<AccountPage initialAuthMode="login" />} />
          <Route path="/signup" element={<AccountPage initialAuthMode="register" />} />
          <Route path="/register" element={<AccountPage initialAuthMode="register" />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Brand & Editorial */}
          <Route path="/about" element={<AboutPage />} />

          {/* Admin Control Center */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Lost at Sea */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* 6. Fixed Luxury Mobile Bottom Navigation Bar (Hidden on Desktop) */}
      <MobileBottomNav />

      {/* 7. Floating Social Button (Fixed Bottom-Left, Desktop Only) */}
      <FloatingSocialButton />

      {/* 8. Luxury Footer */}
      <Footer />
    </div>
  );
}
