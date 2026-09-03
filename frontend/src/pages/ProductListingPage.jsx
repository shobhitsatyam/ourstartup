import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import QuickViewModal from '../components/QuickViewModal';
import api from '../services/api';

export default function ProductListingPage({ fixedGender, isNew, isBest }) {
  const { category: urlCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const [selectedGender, setSelectedGender] = useState(fixedGender || 'all');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [onlyAntiTarnish, setOnlyAntiTarnish] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (fixedGender) setSelectedGender(fixedGender);
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [fixedGender, urlCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (selectedGender && selectedGender !== 'all') params.append('gender', selectedGender);
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);

        if (priceRange === 'under1000') {
          params.append('maxPrice', '1000');
        } else if (priceRange === '1000to2000') {
          params.append('minPrice', '1000');
          params.append('maxPrice', '2000');
        } else if (priceRange === 'above2000') {
          params.append('minPrice', '2000');
        }

        if (minRating > 0) params.append('rating', minRating.toString());
        if (onlyAntiTarnish) params.append('isAntiTarnish', 'true');
        if (isNew) params.append('isNewArrival', 'true');
        if (isBest) params.append('isBestseller', 'true');
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort', sortBy);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data?.success) {
          setProducts(res.data.data.products || []);
          setTotalCount(res.data.data.total || 0);
        }
      } catch (e) {
        console.error('Failed fetching products:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedGender, selectedCategory, priceRange, minRating, onlyAntiTarnish, sortBy, searchQuery, isNew, isBest]);

  const menCategoriesList = ['Ear Studs', 'Chains', 'Bracelets', 'Belts', 'Rings'];
  const womenCategoriesList = [
    'Earrings',
    'Saree Accessories',
    'Anklets',
    'Jeans Adjuster',
    'Bracelets & Bangles',
    'Upper Lobe Earrings',
    'Rings',
    'Nose Rings',
  ];

  const activeCategories =
    selectedGender === 'men'
      ? menCategoriesList
      : selectedGender === 'women'
      ? womenCategoriesList
      : [...new Set([...womenCategoriesList, ...menCategoriesList])];

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange('all');
    setMinRating(0);
    setOnlyAntiTarnish(false);
    setSortBy('featured');
  };

  const getPageTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (isNew) return 'New Arrivals Collection';
    if (isBest) return 'Most Loved Bestsellers';
    if (urlCategory) return urlCategory.replace(/-/g, ' ').toUpperCase();
    if (fixedGender === 'men') return "Men's Fine Jewellery";
    if (fixedGender === 'women') return "Women's Signature Heirlooms";
    return 'The Complete Jewellery Collection';
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          {fixedGender && (
            <>
              <Link to={`/${fixedGender}`} className="hover:text-black capitalize">{fixedGender}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#17151F] font-semibold">{getPageTitle()}</span>
        </div>

        {/* Header Title & Sorting Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#D6CFFF]/40 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#17151F] capitalize">
              {getPageTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-1">
              Showing {totalCount} exquisite anti-tarnish creations
            </p>
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#D6CFFF]/60 text-xs font-semibold shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#7464B8]" />
              <span>Filters</span>
            </button>

            {/* Sort Select */}
            <div className="relative flex items-center bg-white rounded-2xl border border-[#D6CFFF]/60 px-3 py-2 text-xs shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-[#17151F] font-medium pr-6 cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Best Rated</option>
                <option value="bestseller">Bestsellers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 rounded-3xl bg-white p-6 border border-[#D6CFFF]/40 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/30">
              <span className="font-semibold text-xs uppercase tracking-wider text-[#17151F]">Filters</span>
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-[#7464B8] hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Gender Filter */}
            {!fixedGender && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">Gender</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'women', 'men', 'unisex'].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedGender(g);
                        setSelectedCategory('all');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                        selectedGender === g
                          ? 'bg-[#17151F] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">Category</h4>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#F3EFFF] text-[#7464B8] font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {activeCategories.map((c) => {
                  const slug = c.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                  const isSelected = selectedCategory === slug || selectedCategory === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#F3EFFF] text-[#7464B8] font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">Price in INR</h4>
              <div className="space-y-1 text-xs text-gray-700">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under1000', label: 'Under ₹1,000' },
                  { id: '1000to2000', label: '₹1,000 - ₹2,000' },
                  { id: 'above2000', label: 'Above ₹2,000' },
                ].map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === p.id}
                      onChange={() => setPriceRange(p.id)}
                      className="accent-[#17151F]"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Anti-Tarnish Feature Toggle */}
            <div className="pt-2 border-t border-[#D6CFFF]/30">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs font-semibold text-gray-900">Anti-Tarnish Only</span>
                <input
                  type="checkbox"
                  checked={onlyAntiTarnish}
                  onChange={(e) => setOnlyAntiTarnish(e.target.checked)}
                  className="w-4 h-4 rounded text-[#17151F] accent-[#17151F]"
                />
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-9">
            <ProductGrid
              products={products}
              loading={loading}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="font-serif text-lg font-medium text-gray-900">Filter Pieces</span>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Mobile Price */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">Price</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under1000', label: 'Under ₹1,000' },
                    { id: '1000to2000', label: '₹1,000 - ₹2,000' },
                    { id: 'above2000', label: 'Above ₹2,000' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriceRange(p.id)}
                      className={`p-2.5 rounded-xl border text-center font-medium ${
                        priceRange === p.id
                          ? 'bg-[#17151F] text-white border-[#17151F]'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 bg-gray-100 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-wider btn-shine"
                >
                  Show ({totalCount}) Pieces
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
