import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, MapPin } from 'lucide-react';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const INDIAN_UNION_TERRITORIES = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export default function StateSelectDropdown({ value, onChange, disabled = false, error = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const filteredUTs = INDIAN_UNION_TERRITORIES.filter((u) =>
    u.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSelect = (selectedState) => {
    onChange(selectedState);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Dropdown Toggle Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF9FF] border transition-all text-left ${
          error
            ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
            : isOpen
            ? 'border-[#7464B8] ring-1 ring-[#7464B8] bg-white'
            : 'border-[#D6CFFF]/60 hover:border-[#7464B8]/60'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={value ? 'text-[#17151F] font-medium' : 'text-slate-400 font-light'}>
          {value || 'Select Indian State / UT'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#7464B8]' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu with Search */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#D6CFFF]/70 rounded-2xl shadow-xl overflow-hidden max-h-72 flex flex-col"
          >
            {/* Search Box */}
            <div className="p-2 border-b border-[#D6CFFF]/40 bg-[#FAF9FF]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search state or union territory..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-[#D6CFFF]/60 focus:outline-none focus:border-[#7464B8] text-[#17151F]"
                />
              </div>
            </div>

            {/* Scrollable Options List */}
            <div className="overflow-y-auto p-1.5 space-y-2 text-xs divide-y divide-[#D6CFFF]/20">
              {/* States Group */}
              {filteredStates.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-[#7464B8]">
                    States ({filteredStates.length})
                  </div>
                  {filteredStates.map((state) => {
                    const isSelected = value === state;
                    return (
                      <button
                        key={state}
                        type="button"
                        onClick={() => handleSelect(state)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                          isSelected
                            ? 'bg-[#17151F] text-white font-semibold'
                            : 'text-[#17151F] hover:bg-[#F3EFFF]'
                        }`}
                      >
                        <span>{state}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D6CFFF]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Union Territories Group */}
              {filteredUTs.length > 0 && (
                <div className="pt-1.5">
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-[#7464B8]">
                    Union Territories ({filteredUTs.length})
                  </div>
                  {filteredUTs.map((ut) => {
                    const isSelected = value === ut;
                    return (
                      <button
                        key={ut}
                        type="button"
                        onClick={() => handleSelect(ut)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                          isSelected
                            ? 'bg-[#17151F] text-white font-semibold'
                            : 'text-[#17151F] hover:bg-[#F3EFFF]'
                        }`}
                      >
                        <span>{ut}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D6CFFF]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredStates.length === 0 && filteredUTs.length === 0 && (
                <div className="py-6 text-center text-slate-400">
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs">No matching Indian state found.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
