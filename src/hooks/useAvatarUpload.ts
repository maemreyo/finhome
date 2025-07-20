// src/hooks/useAvatarUpload.ts
'use client'

import { useState } from 'react'
import { useAuth, useProfile } from './useAuth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UseAvatarUploadReturn {
  uploading: boolean
  uploadAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  deleteAvatar: () => Promise<{ success: boolean; error?: string }>
}

export function useAvatarUpload(): UseAvatarUploadReturn {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfile()
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Please select an image file' }
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' }
    }

    setUploading(true)

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Delete existing avatar if it exists
      if (profile?.avatar_url) {
        try {
          const existingPath = profile.avatar_url.split('/').pop()
          if (existingPath) {
            await supabase.storage
              .from('avatars')
              .remove([`${user.id}/${existingPath}`])
          }
        } catch (error) {
          console.warn('Could not delete existing avatar:', error)
        }
      }

      // Upload the new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

      // Update the user profile with the new avatar URL
      const { error: profileError } = await updateProfile({
        avatar_url: publicUrl
      })

      if (profileError) {
        throw new Error('Failed to update profile with new avatar URL')
      }

      toast.success('Avatar uploaded successfully!')
      return { success: true, url: publicUrl }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }

  const deleteAvatar = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user || !profile?.avatar_url) {
      return { success: false, error: 'No avatar to delete' }
    }

    setUploading(true)

    try {
      // Extract filename from URL
      const urlParts = profile.avatar_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${user.id}/${fileName}`

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) {
        throw deleteError
      }

      // Update profile to remove avatar URL
      const { error: profileError } = await updateProfile({
        avatar_url: null
      })

      if (profileError) {
        throw new Error('Failed to update profile')
      }

      toast.success('Avatar deleted successfully!')
      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete avatar'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }

  return {
    uploading,
    uploadAvatar,
    deleteAvatar
  }
}