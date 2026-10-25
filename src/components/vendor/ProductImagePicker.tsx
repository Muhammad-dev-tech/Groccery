'use client';

import * as React from 'react';
import { Camera, Image as ImageIcon, Upload, X, RefreshCw, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadProductImageAction } from '@/app/vendor/products/actions';

interface ProductImagePickerProps {
  initialImageUrl?: string | null;
  name?: string;
}

export function ProductImagePicker({ initialImageUrl, name = 'imageUrl' }: ProductImagePickerProps) {
  const [imageUrl, setImageUrl] = React.useState<string>(initialImageUrl || '');
  const [previewUrl, setPreviewUrl] = React.useState<string>(initialImageUrl || '');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [mode, setMode] = React.useState<'upload' | 'url'>('upload');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync if initialImageUrl changes (e.g. when editing)
  React.useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
      setPreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleFileSelect = async (file: File) => {
    setUploadError(null);

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    // Immediate local preview (Instagram / Facebook post style)
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProductImageAction(formData);

      if (result.success && result.url) {
        setImageUrl(result.url);
        setPreviewUrl(result.url);
      } else {
        setUploadError(result.error || 'Failed to upload image. You can still paste an image link.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error uploading photo. Please try again or paste a link.');
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else if (file) {
      setUploadError('Please drop an image file (JPG, PNG, WebP).');
    }
  };

  const handleRemove = () => {
    setImageUrl('');
    setPreviewUrl('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Hidden input passed with form data */}
      <input type="hidden" name={name} value={imageUrl} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Product Photo
          </label>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Optional
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'upload' ? 'url' : 'upload');
            setUploadError(null);
          }}
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
        >
          {mode === 'upload' ? (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Use image link</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>Upload photo</span>
            </>
          )}
        </button>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              placeholder="https://example.com/item.jpg"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreviewUrl(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          {previewUrl && (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <img
                src={previewUrl}
                alt="Product preview"
                className="w-full h-full object-cover"
                onError={() => setUploadError('Could not load image from this URL.')}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Social Media / Instagram / Facebook Style Upload Card */
        <div>
          {previewUrl ? (
            /* Selected Image Preview with Post-style Controls */
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
                  <img
                    src={previewUrl}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-[10px] font-semibold">Uploading...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{isUploading ? 'Uploading to Catalog...' : 'Photo Attached'}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    This photo will be displayed to shoppers in the Kano marketplace and price comparison.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Dropzone (Instagram / Facebook Style) */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="mx-auto flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Tap to add product photo
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Drag and drop or select from your camera / gallery
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    JPG, PNG, WebP up to 5MB
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={onFileInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
