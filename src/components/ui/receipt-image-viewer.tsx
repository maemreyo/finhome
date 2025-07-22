// src/components/ui/receipt-image-viewer.tsx
// Modal component for viewing receipt images with navigation and zoom
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReceiptImageViewerProps {
  images: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIndex?: number
  title?: string
}

export function ReceiptImageViewer({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
  title = 'Receipt Images'
}: ReceiptImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const currentImage = images[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    resetTransforms()
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    resetTransforms()
  }

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const resetTransforms = () => {
    setZoom(1)
    setRotation(0)
  }

  const downloadImage = async () => {
    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  if (!images.length) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {images.length > 1 && (
                <Badge variant="secondary">
                  {currentIndex + 1} of {images.length}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Image Container */}
        <div className="flex-1 relative overflow-hidden rounded-lg bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={currentImage}
              alt={`Receipt ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetTransforms}
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadImage}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 pt-4 border-t overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  resetTransforms()
                }}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden",
                  "hover:border-primary transition-colors",
                  currentIndex === index ? "border-primary" : "border-muted"
                )}
              >
                <img
                  src={image}
                  alt={`Receipt ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}