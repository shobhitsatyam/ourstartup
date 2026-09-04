import React from 'react';
import { motion } from 'framer-motion';

export default function AuthTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'login', label: 'Sign In' },
    { id: 'register', label: 'Create Account' },
  ];

  return (
    <div
      role="tablist"
      aria-label="Authentication Options"
      className="w-full flex rounded-2xl bg-[#F4F1FB] p-1.5 border border-[#E7E2F5] relative shadow-inner"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 relative py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none text-center ${
              isActive ? 'text-white' : 'text-gray-600 hover:text-[#17151F]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="authActivePill"
                className="absolute inset-0 rounded-xl bg-[#17151F] shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 tracking-wider uppercase text-[11px] sm:text-xs">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
