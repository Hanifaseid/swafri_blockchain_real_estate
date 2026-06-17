'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Upload, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { appConfig } from '@/config/app.config';
import type { PropertyPhoto } from './types';

/**
 * PhotoGallery — dual-mode image component.
 *
 * mode="view"   — lightbox-style gallery for the listing detail page.
 * mode="upload" — dropzone + preview grid for the listing creation wizard.
 */

// ── View mode ─────────────────────────────────────────────────────────────────

interface ViewGalleryProps {
  photos: PropertyPhoto[];
  title: string;
}

export function PhotoGallery({ photos, title }: ViewGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);

  if (photos.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        No photos
      </div>
    );
  }

  const prev = () => setActive((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setActive((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Main image + thumbnails */}
      <div className="flex flex-col gap-3">
        {/* Main */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={photos[active].url}
            alt={photos[active].alt ?? `${title} photo ${active + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover cursor-zoom-in"
            priority
            onClick={() => setLightbox(true)}
          />

          {photos.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow transition hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow transition hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>

              {/* Counter pill */}
              <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                {active + 1} / {photos.length}
              </span>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setActive(i)}
                aria-label={`View photo ${i + 1}`}
                aria-pressed={i === active}
                className={cn(
                  'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  i === active
                    ? 'border-emerald-500 opacity-100'
                    : 'border-transparent opacity-70 hover:opacity-100'
                )}
              >
                <Image src={photo.url} alt={photo.alt ?? `Thumbnail ${i + 1}`} fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close lightbox"
            onClick={() => setLightbox(false)}
          >
            <X size={20} />
          </button>

          <div className="relative h-[80vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[active].url}
              alt={photos[active].alt ?? `${title} photo ${active + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous photo"
                className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                <ChevronLeft size={22} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next photo"
                className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── Upload mode ───────────────────────────────────────────────────────────────

interface UploadGalleryProps {
  /** Controlled list of uploaded photo URLs */
  photos: string[];
  onChange: (photos: string[]) => void;
  /** Called with each File — parent handles the actual upload and gets back a URL */
  onUpload: (file: File) => Promise<string>;
  uploading?: boolean;
  error?: string;
}

export function PhotoUploadGallery({
  photos,
  onChange,
  onUpload,
  uploading,
  error,
}: UploadGalleryProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: appConfig.upload.maxFileSizeBytes,
    maxFiles: appConfig.upload.maxPhotos - photos.length,
    disabled: uploading || photos.length >= appConfig.upload.maxPhotos,
    onDropAccepted: async (files) => {
      for (const file of files) {
        const url = await onUpload(file);
        onChange([...photos, url]);
      }
    },
  });

  const remove = (index: number) =>
    onChange(photos.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-4">
      {/* Dropzone */}
      {photos.length < appConfig.upload.maxPhotos && (
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            isDragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50',
            uploading && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} aria-label="Upload photos" />
          <Upload size={24} className="text-gray-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop photos here' : 'Drag & drop or click to upload'}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              JPEG, PNG, WebP · max {appConfig.upload.maxFileSizeBytes / 1024 / 1024}MB each
              · up to {appConfig.upload.maxPhotos} photos
            </p>
          </div>
        </div>
      )}

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image src={url} alt={`Uploaded photo ${i + 1}`} fill sizes="150px" className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="opacity-0 text-white hover:bg-red-500/80 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
