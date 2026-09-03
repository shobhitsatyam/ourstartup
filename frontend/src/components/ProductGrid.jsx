import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, onQuickView }) {
  if (loading) {
    return (
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-[185px] sm:w-[220px] md:w-[240px] lg:w-auto shrink-0 snap-start lg:shrink lg:snap-none rounded-2xl sm:rounded-3xl bg-white p-3 shadow-sm border border-[#D6CFFF]/30 animate-pulse"
          >
            <div className="aspect-[4/5] bg-gray-200 rounded-xl sm:rounded-2xl mb-3" />
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-5 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white/70 backdrop-blur-sm rounded-3xl max-w-lg mx-auto my-6 border border-[#D6CFFF]/40">
        <div className="w-14 h-14 rounded-full bg-[#FAF9FF] text-[#7464B8] border border-[#D6CFFF] flex items-center justify-center mx-auto mb-3 text-2xl">
          💎
        </div>
        <h3 className="font-serif text-lg font-light text-[#17151F]">No Pieces Found</h3>
        <p className="text-xs text-gray-500 mt-1">
          Explore our other signature collections or reset filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {products.map((product) => (
        <div
          key={product._id || product.id}
          className="w-[185px] sm:w-[220px] md:w-[240px] lg:w-auto shrink-0 snap-start lg:shrink lg:snap-none"
        >
          <ProductCard product={product} onQuickView={onQuickView} />
        </div>
      ))}
    </div>
  );
}
