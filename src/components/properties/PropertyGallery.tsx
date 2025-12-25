'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PropertyImage } from '@/types'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No images available</p>
        </div>
      </div>
    )
  }

  const currentImage = sortedImages[selectedIndex]

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.alt || title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                  index === selectedIndex
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${title} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close gallery"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {sortedImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
              }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={currentImage.url}
              alt={currentImage.alt || title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next Button */}
          {sortedImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
              }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Next image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        </div>
      )}
    </>
  )
}
