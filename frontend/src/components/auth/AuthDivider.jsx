import React from 'react';

export default function AuthDivider({ text = 'OR', className = '' }) {
  return (
    <div className={`relative flex items-center justify-center my-2.5 sm:my-3 ${className}`}>
      <div className="grow border-t border-gray-200/80" />
      <span className="shrink-0 px-3 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 bg-transparent select-none">
        {text}
      </span>
      <div className="grow border-t border-gray-200/80" />
    </div>
  );
}
