// src/components/ui/receipt-image-upload.tsx
// Component for receipt image upload with preview and management
'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileImage,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  validateReceiptImage, 
  createPreviewUrl, 
  revokePreviewUrl,
  uploadReceiptImage,
  compressImage
} from '@/lib/storage/receiptUpload'

export interface ReceiptImage {
  id: string
  file: File
  preview: string
  uploaded?: boolean
  uploading?: boolean
  error?: string
  url?: string
}

interface ReceiptImageUploadProps {
  images: ReceiptImage[]
  onImagesChange: (images: ReceiptImage[]) => void
  userId: string
  maxImages?: number
  showUploadProgress?: boolean
  autoUpload?: boolean
  className?: string
}

export function ReceiptImageUpload({
  images,
  onImagesChange,
  userId,
  maxImages = 5,
  showUploadProgress = true,
  autoUpload = false,
  className
}: ReceiptImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return

    const newImages: ReceiptImage[] = []
    const currentCount = images.length

    for (let i = 0; i < files.length && currentCount + newImages.length < maxImages; i++) {
      const file = files[i]
      const validation = validateReceiptImage(file)
      
      if (!validation.valid) {
        // Create error image entry
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: createPreviewUrl(file),
          error: validation.error
        })
        continue
      }

      try {
        // Compress image if it's large
        let processedFile = file
        if (file.size > 1024 * 1024) { // 1MB threshold
          processedFile = await compressImage(file, 1200, 0.8)
        }

        const imageEntry: ReceiptImage = {
          id: Math.random().toString(36).substr(2, 9),
          file: processedFile,
          preview: createPreviewUrl(processedFile),
          uploading: autoUpload
        }

        newImages.push(imageEntry)

        // Auto upload if enabled
        if (autoUpload) {
          uploadImage(imageEntry)
        }
      } catch (error) {
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: createPreviewUrl(file),
          error: 'Failed to process image'
        })
      }
    }

    onImagesChange([...images, ...newImages])
  }, [images, maxImages, autoUpload, onImagesChange])

  const uploadImage = async (imageEntry: ReceiptImage) => {
    if (imageEntry.uploaded || imageEntry.uploading) return

    // Update uploading state
    const updatedImages = images.map(img => 
      img.id === imageEntry.id 
        ? { ...img, uploading: true, error: undefined }
        : img
    )
    onImagesChange(updatedImages)

    if (showUploadProgress) {
      setUploadProgress(prev => ({ ...prev, [imageEntry.id]: 0 }))
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[imageEntry.id] || 0
          if (current < 90) {
            return { ...prev, [imageEntry.id]: current + 10 }
          }
          return prev
        })
      }, 100)

      setTimeout(() => clearInterval(progressInterval), 900)
    }

    try {
      const result = await uploadReceiptImage(imageEntry.file, userId)

      const finalImages = images.map(img => 
        img.id === imageEntry.id 
          ? { 
              ...img, 
              uploading: false, 
              uploaded: result.success,
              url: result.url,
              error: result.success ? undefined : result.error
            }
          : img
      )
      onImagesChange(finalImages)

      if (showUploadProgress) {
        setUploadProgress(prev => ({ ...prev, [imageEntry.id]: 100 }))
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev }
            delete updated[imageEntry.id]
            return updated
          })
        }, 1000)
      }

    } catch (error) {
      const errorImages = images.map(img => 
        img.id === imageEntry.id 
          ? { ...img, uploading: false, error: 'Upload failed' }
          : img
      )
      onImagesChange(errorImages)

      if (showUploadProgress) {
        setUploadProgress(prev => {
          const updated = { ...prev }
          delete updated[imageEntry.id]
          return updated
        })
      }
    }
  }

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId)
    if (imageToRemove) {
      revokePreviewUrl(imageToRemove.preview)
    }
    onImagesChange(images.filter(img => img.id !== imageId))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const canAddMore = images.length < maxImages

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
            dragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <Camera className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Upload Receipt Images</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to select • Max {maxImages} images • 5MB each
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {images.length}/{maxImages} uploaded
            </Badge>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image) => (
            <Card key={image.id} className="relative overflow-hidden">
              <CardContent className="p-2">
                <div className="aspect-square relative bg-muted rounded overflow-hidden">
                  <img
                    src={image.preview}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay for status */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-2">
                      {image.error && <AlertCircle className="h-4 w-4 text-red-400" />}
                      {image.uploading && <Loader2 className="h-4 w-4 text-white animate-spin" />}
                      {image.uploaded && <Check className="h-4 w-4 text-green-400" />}
                      {!image.error && !image.uploading && !image.uploaded && (
                        <FileImage className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Status and progress */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{image.file.name}</span>
                    {image.uploaded && <Check className="h-3 w-3 text-green-500" />}
                    {image.uploading && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>

                  {image.error && (
                    <p className="text-xs text-red-500">{image.error}</p>
                  )}

                  {showUploadProgress && uploadProgress[image.id] !== undefined && (
                    <Progress value={uploadProgress[image.id]} className="h-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manual upload button for non-auto upload mode */}
      {!autoUpload && images.some(img => !img.uploaded && !img.uploading && !img.error) && (
        <Button
          onClick={() => {
            images.forEach(image => {
              if (!image.uploaded && !image.uploading && !image.error) {
                uploadImage(image)
              }
            })
          }}
          className="w-full"
          size="sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload All Images
        </Button>
      )}

      {/* File size info */}
      {images.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Total size: {(images.reduce((sum, img) => sum + img.file.size, 0) / (1024 * 1024)).toFixed(1)} MB
        </div>
      )}
    </div>
  )
}