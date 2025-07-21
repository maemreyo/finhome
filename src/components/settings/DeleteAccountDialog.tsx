// src/components/settings/DeleteAccountDialog.tsx
'use client'

import { useState } from 'react'
import { useAuth, useAuthActions } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export function DeleteAccountDialog() {
  const t = useTranslations('Dashboard.Settings.account.deleteDialog')
  const tAccount = useTranslations('Dashboard.Settings.account')
  const { user } = useAuth()
  const { signOut } = useAuthActions()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  
  const requiredText = 'DELETE'
  const canDelete = confirmText === requiredText && confirmChecked

  const handleDeleteAccount = async () => {
    if (!user || !canDelete) return

    setIsDeleting(true)
    
    try {
      // Call the delete account API endpoint
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          confirmation: confirmText
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Sign out the user
      await signOut()
      
      toast.success(tAccount('deleteSuccess'))
      
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error(tAccount('deleteError'))
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('deleteAccountButton')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {t('description')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t('dataList.plans')}</li>
              <li>{t('dataList.profile')}</li>
              <li>{t('dataList.achievements')}</li>
              <li>{t('dataList.favorites')}</li>
              <li>{t('dataList.activities')}</li>
            </ul>
            <p className="font-semibold text-destructive">
              {t('permanentWarning')}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmText">
              {t('confirmationLabel')}
            </Label>
            <Input
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t('confirmationPlaceholder')}
              className="font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirmCheckbox"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked === true)}
            />
            <Label htmlFor="confirmCheckbox" className="text-sm">
              {t('understandLabel')}
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={!canDelete || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('deleteAccount')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}