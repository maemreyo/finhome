// src/components/admin/PropertyImageUpload.tsx
// Property image upload component with Supabase Storage integration

'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyImageUploadProps {
  propertyId?: string
  existingImages?: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxFileSize?: number // in MB
}

interface UploadedImage {
  url: string
  file?: File
  isUploading?: boolean
  error?: string
}

export default function PropertyImageUpload({
  propertyId,
  existingImages = [],
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5
}: PropertyImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    existingImages.map(url => ({ url }))
  )
  const [isUploading, setIsUploading] = useState(false)
  
  const supabase = createClientComponentClient()

  // Upload file to Supabase Storage
  const uploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${propertyId || 'temp'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `properties/${fileName}`

    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Remove image from storage
  const removeFromStorage = async (url: string) => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/property-images/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage
          .from('property-images')
          .remove([filePath])
      }
    } catch (error) {
      console.error('Failed to remove image from storage:', error)
    }
  }

  // Handle file drops
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`Chỉ được tải lên tối đa ${maxImages} hình ảnh`)
      return
    }

    setIsUploading(true)

    // Add files to state with uploading status
    const newImages: UploadedImage[] = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isUploading: true
    }))

    setImages(prev => [...prev, ...newImages])

    // Upload files sequentially
    const uploadPromises = acceptedFiles.map(async (file, index) => {
      try {
        const uploadedUrl = await uploadToStorage(file)
        
        setImages(prev => prev.map((img, imgIndex) => {
          const targetIndex = prev.length - acceptedFiles.length + index
          if (imgIndex === targetIndex && img.file === file) {
            // Clean up blob URL
            URL.revokeObjectURL(img.url)
            return { url: uploadedUrl, isUploading: false }
          }
          return img
        }))

        return uploadedUrl
      } catch (error) {
        console.error('Upload error:', error)
        setImages(prev => prev.map((img, imgIndex) => {
          const targetIndex = prev.length - acceptedFiles.length + index
          if (imgIndex === targetIndex && img.file === file) {
            return { ...img, isUploading: false, error: 'Upload failed' }
          }
          return img
        }))
        
        toast.error(`Không thể tải lên ${file.name}`)
        return null
      }
    })

    try {
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(Boolean) as string[]
      
      if (successfulUploads.length > 0) {
        const allImageUrls = [
          ...existingImages,
          ...images.filter(img => !img.isUploading && !img.error).map(img => img.url),
          ...successfulUploads
        ]
        onImagesChange(allImageUrls)
        toast.success(`Đã tải lên ${successfulUploads.length} hình ảnh thành công`)
      }
    } catch (error) {
      console.error('Upload batch error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [images, maxImages, propertyId, existingImages, onImagesChange, supabase])

  // Remove image
  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove]
    
    // Remove from storage if it's not a temporary URL
    if (imageToRemove.url.startsWith('http')) {
      await removeFromStorage(imageToRemove.url)
    } else {
      // Clean up blob URL
      URL.revokeObjectURL(imageToRemove.url)
    }

    const updatedImages = images.filter((_, index) => index !== indexToRemove)
    setImages(updatedImages)
    
    const imageUrls = updatedImages
      .filter(img => !img.isUploading && !img.error && img.url.startsWith('http'))
      .map(img => img.url)
    
    onImagesChange(imageUrls)
    toast.success('Đã xóa hình ảnh')
  }

  // Retry failed upload
  const retryUpload = async (index: number) => {
    const image = images[index]
    if (!image.file) return

    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, isUploading: true, error: undefined } : img
    ))

    try {
      const uploadedUrl = await uploadToStorage(image.file)
      
      setImages(prev => prev.map((img, i) => 
        i === index ? { url: uploadedUrl, isUploading: false } : img
      ))

      const allImageUrls = [
        ...existingImages,
        ...images.filter((img, i) => i !== index && !img.isUploading && !img.error).map(img => img.url),
        uploadedUrl
      ]
      onImagesChange(allImageUrls)
      toast.success('Đã tải lên hình ảnh thành công')
    } catch (error) {
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, isUploading: false, error: 'Upload failed' } : img
      ))
      toast.error('Không thể tải lên hình ảnh')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: maxFileSize * 1024 * 1024,
    disabled: isUploading || images.length >= maxImages
  })

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
          (isUploading || images.length >= maxImages) && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent className="p-6">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Thả hình ảnh vào đây...' : 'Tải lên hình ảnh bất động sản'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Kéo thả hoặc nhấp để chọn hình ảnh
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
              <Badge variant="outline">JPG, PNG, WEBP</Badge>
              <Badge variant="outline">Tối đa {maxFileSize}MB</Badge>
              <Badge variant="outline">Tối đa {maxImages} hình</Badge>
            </div>
            {images.length >= maxImages && (
              <p className="text-sm text-orange-600 mt-2">
                Đã đạt giới hạn tối đa {maxImages} hình ảnh
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Hình ảnh đã tải lên ({images.length}/{maxImages})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  {image.isUploading ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : image.error ? (
                    <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center p-2">
                      <ImageIcon className="h-8 w-8 text-red-400 mb-2" />
                      <p className="text-xs text-red-600 text-center">{image.error}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(index)}
                        className="mt-2 text-xs"
                      >
                        Thử lại
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Remove button */}
                  {!image.isUploading && (
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Primary image indicator */}
                  {index === 0 && !image.isUploading && !image.error && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-blue-600 text-white text-xs">
                        Ảnh chính
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500">
            Hình ảnh đầu tiên sẽ được sử dụng làm ảnh chính cho bất động sản
          </p>
        </div>
      )}
    </div>
  )
}