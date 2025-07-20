// src/components/profile/AvatarUpload.tsx
'use client'

import { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth, useProfile } from '@/hooks/useAuth'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import { useTranslations } from 'next-intl'
import { Upload, Trash2, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg'
  showControls?: boolean
}

export function AvatarUpload({ size = 'md', showControls = true }: AvatarUploadProps) {
  const t = useTranslations('Dashboard.Profile.picture')
  const { user } = useAuth()
  const { profile } = useProfile()
  const { uploading, uploadAvatar, deleteAvatar } = useAvatarUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) return
    uploadAvatar(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const files = Array.from(event.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleFileSelect(imageFile)
    }
  }

  const handleDeleteAvatar = async () => {
    await deleteAvatar()
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'
  const initials = displayName
    .split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (!showControls) {
    return (
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Avatar with drag and drop */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full border-2 border-dashed transition-colors ${
          dragOver ? 'border-primary bg-primary/10' : 'border-transparent'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Avatar className={`${sizeClasses[size]} transition-opacity ${uploading ? 'opacity-50' : ''}`}>
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? t('uploading') : t('upload')}
          </Button>
          
          {avatarUrl && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={uploading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteDialog.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAvatar}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t('deleteDialog.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t('requirements')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('dragDropHint')}
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}