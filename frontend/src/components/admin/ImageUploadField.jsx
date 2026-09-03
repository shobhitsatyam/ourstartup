import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X, RefreshCw, AlertCircle } from 'lucide-react';

export default function ImageUploadField({
  label = 'Image Upload',
  value, // string for single or array of strings for multiple
  onChange,
  multiple = false,
  maxFiles = 5,
  helperText = 'Supports PNG, JPG, WebP up to 5MB',
}) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const images = multiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ? [value] : []);

  const handleFileSelect = (files) => {
    setError(null);
    const validFiles = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files (JPEG, PNG, WebP) are supported.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        if (multiple) {
          const updated = [...images, dataUrl].slice(0, maxFiles);
          onChange(updated);
        } else {
          onChange(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    setError(null);
    if (!urlInput.trim()) return;

    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image')) {
      setError('Please enter a valid HTTP(S) image URL.');
      return;
    }

    if (multiple) {
      const updated = [...images, urlInput.trim()].slice(0, maxFiles);
      onChange(updated);
    } else {
      onChange(urlInput.trim());
    }
    setUrlInput('');
  };

  const handleRemove = (indexToRemove) => {
    if (multiple) {
      const updated = images.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#171522]">
          {label}
        </label>
        {multiple && (
          <span className="text-[11px] text-[#6F6B78]">
            {images.length} / {maxFiles} images
          </span>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Preview Grid (if images exist) */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden border border-[#D6CFFF]/60 bg-[#FAF9FF] aspect-square shadow-sm"
            >
              <img
                src={img}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-white text-[#171522] hover:bg-[#FAF9FF] shadow transition-all"
                  title="Replace Image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow transition-all"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone (shown if single and empty, or multiple and under maxFiles) */}
      {(!multiple && images.length === 0) || (multiple && images.length < maxFiles) ? (
        <div className="space-y-3">
          {/* Drag & Drop Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center transition-all ${
              isDragging
                ? 'border-[#7464B8] bg-[#7464B8]/10'
                : 'border-[#D6CFFF] bg-[#FAF9FF]/60 hover:bg-[#FAF9FF] hover:border-[#7464B8]/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              accept="image/jpeg,image/png,image/webp"
              multiple={multiple}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#D6CFFF]/60 shadow-sm flex items-center justify-center text-[#7464B8]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#171522]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-[#7464B8] hover:underline"
                >
                  Choose file
                </button>{' '}
                or drag & drop
              </div>
              <p className="text-[10px] text-[#6F6B78]">{helperText}</p>
            </div>
          </div>

          {/* URL Input Form */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white border border-[#D6CFFF]/60 focus:border-[#7464B8] focus:ring-1 focus:ring-[#7464B8] outline-hidden text-[#171522]"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D6CFFF] hover:bg-[#FAF9FF] hover:border-[#7464B8] text-[#171522] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              Add URL
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
