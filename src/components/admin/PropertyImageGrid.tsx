// src/components/admin/PropertyImageGrid.tsx
// Property image display grid for property listings

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyImageGridProps {
  images: string[]
  title: string
  className?: string
  showCount?: boolean
  maxVisible?: number
}

export default function PropertyImageGrid({
  images = [],
  title,
  className,
  showCount = true,
  maxVisible = 4
}: PropertyImageGridProps) {
  const visibleImages = images.slice(0, maxVisible)
  const remainingCount = Math.max(0, images.length - maxVisible)

  if (images.length === 0) {
    return (
      <div className={cn("aspect-square rounded-lg bg-gray-100 flex items-center justify-center", className)}>
        <div className="text-center">
          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chưa có hình ảnh</p>
        </div>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={cn("aspect-square rounded-lg overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={cn("aspect-square rounded-lg overflow-hidden relative", className)}>
      {/* Main image grid layout */}
      <div className="grid grid-cols-2 gap-1 h-full">
        {visibleImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden",
              index === 0 && visibleImages.length === 3 ? "row-span-2" : "",
              index === 0 && visibleImages.length > 2 ? "col-span-1" : ""
            )}
          >
            <img
              src={image}
              alt={`${title} - Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay for last image if there are more */}
            {index === maxVisible - 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image count badge */}
      {showCount && images.length > 1 && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-black bg-opacity-70 text-white border-0">
            {images.length} ảnh
          </Badge>
        </div>
      )}
    </div>
  )
}