import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7464B8]">
            Curated Heirlooms
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#17151F] mt-1">
            MY WISHLIST ({wishlistCount})
          </h1>
          <p className="text-xs text-gray-500 font-light mt-2">
            Your saved pieces with instant 1-click checkout.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D6CFFF]/60 max-w-lg mx-auto p-8 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#D6CFFF]/30 text-rose-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h3 className="font-serif text-2xl font-light text-[#17151F]">Your Wishlist is Empty</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Save your favorite anti-tarnish Indian jewellery designs to inspect or purchase anytime.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#2A2635] btn-shine"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
