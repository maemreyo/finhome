// src/lib/storage/receiptUpload.ts
// Utility functions for handling receipt image uploads to Supabase Storage

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface ReceiptUploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
}

export interface ReceiptFile {
  file: File
  preview: string
  id: string
}

/**
 * Upload a receipt image to Supabase Storage
 */
export async function uploadReceiptImage(
  file: File, 
  userId: string,
  transactionId?: string
): Promise<ReceiptUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Only image files are allowed'
      }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 5MB'
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = transactionId 
      ? `${userId}/${transactionId}/receipt_${timestamp}.${fileExt}`
      : `${userId}/temp/receipt_${timestamp}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
      fileName: fileName
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Delete a receipt image from Supabase Storage
 */
export async function deleteReceiptImage(fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('receipts')
      .remove([fileName])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Move temporary receipt images to permanent location after transaction is created
 */
export async function moveReceiptsToTransaction(
  tempFileNames: string[],
  userId: string,
  transactionId: string
): Promise<string[]> {
  const movedUrls: string[] = []

  for (const tempFileName of tempFileNames) {
    try {
      // Download the temp file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('receipts')
        .download(tempFileName)

      if (downloadError) {
        console.error('Error downloading temp file:', downloadError)
        continue
      }

      // Generate new permanent filename
      const timestamp = Date.now()
      const fileExt = tempFileName.split('.').pop()
      const permanentFileName = `${userId}/${transactionId}/receipt_${timestamp}.${fileExt}`

      // Upload to permanent location
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(permanentFileName, fileData, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading to permanent location:', uploadError)
        continue
      }

      // Get public URL for permanent file
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(permanentFileName)

      movedUrls.push(publicUrl)

      // Delete temporary file
      await deleteReceiptImage(tempFileName)

    } catch (error) {
      console.error('Error moving receipt:', error)
    }
  }

  return movedUrls
}

/**
 * Validate image file before upload
 */
export function validateReceiptImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed' }
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, WebP, GIF' }
  }

  return { valid: true }
}

/**
 * Create preview URL for image file
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Compress image before upload (optional optimization)
 */
export function compressImage(
  file: File, 
  maxWidth: number = 1200, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Canvas to Blob conversion failed'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Image loading failed'))
    img.src = URL.createObjectURL(file)
  })
}