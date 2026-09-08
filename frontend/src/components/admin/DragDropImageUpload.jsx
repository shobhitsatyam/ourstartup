import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { compressImages } from '../../utils/imageCompressor';

/**
 * Reusable Drag & Drop Image Upload Component for Admin CMS
 *
 * Supports:
 * - Direct drag & drop of image files
 * - Native file picker dialog (Choose File)
 * - Direct HTTP(S) image URL input
 * - Instant visual preview with replace capability
 * - Robust error handling for invalid types and file sizes (> 10MB)
 * - Automatic client compression and base64/Cloudinary resilience
 */
export default function DragDropImageUpload({
  label = 'Image Upload',
  value,
  onChange,
  aspectRatio = 'aspect-[4/5]',
  helperText = 'Recommended: PNG, JPG, or WebP up to 10MB',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleProcessFile = async (file) => {
    if (!file) return;
    setError(null);

    // 1. File Type Validation
    const isImage = file.type.startsWith('image/');
    const isValidExt = /\.(jpe?g|png|webp|svg)$/i.test(file.name);
    if (!isImage && !isValidExt) {
      setError('Invalid file type. Please upload a valid image (PNG, JPG, or WebP).');
      return;
    }

    // 2. File Size Validation (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    try {
      setIsUploading(true);

      // Instant local preview via FileReader
      const readerPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });

      // Compress client-side
      let compressedFile = file;
      try {
        const compressedList = await compressImages([file]);
        if (compressedList && compressedList[0]) {
          compressedFile = compressedList[0];
        }
      } catch (compErr) {
        console.warn('Compression skipped, using original file:', compErr);
      }

      // Try uploading to backend /api/admin/upload -> Cloudinary
      let uploadedUrl = null;
      try {
        const formData = new FormData();
        formData.append('images', compressedFile);
        const res = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.success && res.data?.urls?.[0]) {
          uploadedUrl = res.data.urls[0];
        }
      } catch (uploadErr) {
        console.warn('Server upload unavailable, falling back to local data URL:', uploadErr);
      }

      // If server upload succeeded, use permanent CDN URL; otherwise use high-res data URL
      const finalUrl = uploadedUrl || (await readerPromise);
      onChange(finalUrl);
    } catch (err) {
      setError(err.message || 'Image processing failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image')) {
      setError('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }
    setError(null);
    onChange(urlInput.trim());
    setUrlInput('');
    setUrlMode(false);
  };

  return (
    <div className="space-y-2">
      {/* Label and Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#171522]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setUrlMode(!urlMode);
            setError(null);
          }}
          className="text-[11px] text-[#7464B8] hover:text-[#5f509e] font-semibold flex items-center gap-1 transition-colors"
        >
          {urlMode ? (
            <>
              <UploadCloud className="w-3 h-3" />
              <span>Switch to File Upload</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" />
              <span>Enter Image URL</span>
            </>
          )}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="flex-1 font-medium">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* URL Input Form */}
      {urlMode ? (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#7464B8] text-white rounded-xl text-xs font-semibold hover:bg-[#5f509e] transition-colors"
          >
            Apply URL
          </button>
        </form>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#7464B8] bg-[#F3EFFF] ring-2 ring-[#7464B8]/20 scale-[0.99]'
              : 'border-[#D6CFFF]/80 bg-[#FAF9FF]/60 hover:bg-[#FAF9FF] hover:border-[#7464B8]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {isUploading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#7464B8]" />
              <p className="text-xs font-semibold text-[#171522]">Optimizing & uploading image...</p>
            </div>
          ) : value ? (
            /* Current Image Preview & Replace Prompt */
            <div className="flex items-center gap-3.5 text-left">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-[#D6CFFF]/60 shadow-xs`}>
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#171522] truncate">Active Image Configured</p>
                <p className="text-[10px] text-[#7464B8] font-medium mt-0.5">Click or drag a new image here to replace</p>
                <p className="text-[9px] text-gray-400 mt-1">{helperText}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D6CFFF] text-[10px] font-bold text-[#171522] hover:bg-[#FAF9FF] shadow-2xs shrink-0 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-[#7464B8]" />
                <span>Replace</span>
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="py-5 flex flex-col items-center justify-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-[#D6CFFF]/60 flex items-center justify-center text-[#7464B8]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#171522]">
                Drag & drop image here, or <span className="text-[#7464B8] underline underline-offset-2">Choose File</span>
              </p>
              <p className="text-[10px] text-gray-500 font-light">{helperText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
