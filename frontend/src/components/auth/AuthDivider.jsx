import React from 'react';

export default function AuthDivider({ text = 'OR' }) {
  return (
    <div className="relative flex items-center justify-center my-4 sm:my-5">
      <div className="grow border-t border-gray-200/80" />
      <span className="shrink-0 px-3.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 bg-transparent select-none">
        {text}
      </span>
      <div className="grow border-t border-gray-200/80" />
    </div>
  );
}
