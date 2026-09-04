import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••••••',
  required = false,
  label = 'Password',
  rightAction = null,
  error = null,
  autoComplete = 'current-password',
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        {label && (
          <label
            htmlFor={id}
            className="font-bold uppercase tracking-wider text-gray-700 block text-[11px]"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        {rightAction}
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full h-12 px-3.5 pr-11 bg-[#FBFBFF] border rounded-2xl text-xs sm:text-sm text-[#17151F] placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-150 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
              : 'border-gray-200 hover:border-gray-300 focus:border-[#7464B8] focus:ring-2 focus:ring-[#7464B8]/15'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#17151F] focus:outline-none rounded-lg hover:bg-gray-100/60 transition-colors cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-gray-600" />
          ) : (
            <Eye className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-600 font-medium tracking-tight mt-1 flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
