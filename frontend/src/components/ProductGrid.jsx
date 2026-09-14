import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, onQuickView, columns = 4, priorityCount = 0 }) {
  const isSixCol = columns === 6;
  const isEightCol = columns === 8;

  const gridClass = isSixCol
    ? 'lg:grid-cols-6 lg:gap-3 xl:gap-3.5'
    : isEightCol
    ? 'lg:grid-cols-8 lg:gap-2.5 xl:gap-3'
    : 'lg:grid-cols-4 lg:gap-5 xl:gap-6';

  if (loading) {
    const skeletonCount = isSixCol ? 12 : isEightCol ? 16 : 8;
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 ${gridClass} w-full`}>
        {[...Array(skeletonCount)].map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl bg-white p-2.5 sm:p-3 shadow-sm border border-[#D6CFFF]/30 animate-pulse"
          >
            <div className="aspect-[4/5] bg-gray-200 rounded-xl mb-3" />
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
    <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 ${gridClass} w-full`}>
      {products.map((product, idx) => (
        <div
          key={product._id ? `${product._id}-${idx}` : idx}
          className="w-full"
        >
          <ProductCard product={product} onQuickView={onQuickView} priority={idx < priorityCount} />
        </div>
      ))}
    </div>
  );
}
