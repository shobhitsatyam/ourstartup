import React from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function MobileSearchBar({ onOpenSearch }) {
  return (
    <div className="px-4 py-3 lg:hidden bg-transparent">
      <div
        onClick={onOpenSearch}
        className="w-full bg-white rounded-2xl border border-[#D6CFFF]/60 shadow-[0_4px_16px_rgba(23,21,31,0.04)] px-4 py-3 flex items-center justify-between cursor-pointer hover:border-[#7464B8] transition-all group"
      >
        <div className="flex items-center gap-3 text-gray-400">
          <Search className="w-4 h-4 text-[#7464B8] group-hover:scale-110 transition-transform" />
          <span className="text-xs text-gray-400 font-light tracking-wide">
            Search fine jewellery, rings, chains...
          </span>
        </div>

        <div className="w-7 h-7 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/50 flex items-center justify-center text-[#7464B8] shadow-2xs">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
