import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const trendingTags = [
    'Chandbalis',
    'Cuban Chains',
    'Saree Brooch',
    'Jeans Adjuster',
    'Tennis Bracelet',
    'Obsidian Studs',
    'Seashell Payal',
    'Signet Ring',
    'Clip-on Nath',
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery('');
      setSuggestions({ products: [], categories: [] });
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/search/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.data?.success) {
          setSuggestions(res.data.data);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const handleTagClick = (tag) => {
    onClose();
    navigate(`/shop?q=${encodeURIComponent(tag)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#17151F]/90 backdrop-blur-2xl flex flex-col justify-start p-4 sm:p-8"
        >
          {/* Header Close Button */}
          <div className="max-w-4xl mx-auto w-full flex justify-end">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium"
            >
              <span>ESC</span>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box Form */}
          <div className="max-w-3xl mx-auto w-full mt-6 sm:mt-12">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anti-tarnish Indian jewellery, chains, rings..."
                className="w-full bg-transparent text-white text-xl sm:text-3xl font-serif font-light pb-4 border-b-2 border-[#D6CFFF]/40 focus:border-[#D6CFFF] focus:outline-none placeholder:text-white/30 pr-12"
              />
              <button
                type="submit"
                className="absolute right-0 bottom-4 text-[#D6CFFF] hover:scale-110 transition-transform"
              >
                <Search className="w-7 h-7" />
              </button>
            </form>

            {/* Live Autocomplete Results */}
            {query.trim() ? (
              <div className="mt-8 space-y-6">
                {/* Categories */}
                {suggestions.categories.length > 0 && (
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#D6CFFF] font-semibold">
                      Matching Categories
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleTagClick(cat)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D6CFFF] font-semibold">
                    Product Suggestions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {suggestions.products.length > 0 ? (
                      suggestions.products.map((prod) => (
                        <Link
                          key={prod._id}
                          to={`/products/${prod.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors group"
                        >
                          <img
                            src={prod.images && prod.images[0] ? prod.images[0] : ''}
                            alt={prod.name}
                            className="w-14 h-14 rounded-xl object-cover bg-black/20"
                          />
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-white group-hover:text-[#D6CFFF] line-clamp-1">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] text-[#D6CFFF]/80 font-medium">
                              ₹{prod.price.toLocaleString('en-IN')} &bull; {prod.category}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all mr-2" />
                        </Link>
                      ))
                    ) : (
                      !loading && (
                        <p className="text-xs text-white/40 py-4 col-span-2">
                          No matching pieces found for "{query}". Try another keyword.
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Trending Searches */
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D6CFFF]">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending Indian Collections</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-[#D6CFFF] hover:text-[#17151F] text-white text-xs font-medium border border-white/15 transition-all transform hover:scale-105"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
