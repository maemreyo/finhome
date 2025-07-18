// User profile page with locale support

'use client'

import { useState, use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslations } from 'next-intl';
import { useAuth, useProfile } from '@/hooks/useAuth'
import { Loader2, Upload } from 'lucide-react'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
  company: z.string().optional(),
  location: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const t = useTranslations('Dashboard.Profile');
  const { user } = useAuth()
  const { profile, loading, updateProfile } = useProfile()
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || '',
      website: profile?.website || '',
      bio: profile?.bio || '',
      company: profile?.company || '',
      location: profile?.location || '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setIsUpdating(true)
    
    const { error } = await updateProfile(data)
    
    if (!error) {
      reset(data) // Reset form with new values to clear isDirty state
    }
    
    setIsUpdating(false)
  }

  if (loading) {
    return (
      <DashboardShell title={t('title')} description={t('description')}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell 
      title={t('title')} 
      description={t('description')}
    >
      <div className="grid gap-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>{t('picture.title')}</CardTitle>
            <CardDescription>
              {t('picture.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url} 
                  alt={profile?.full_name || user?.email || 'User'} 
                />
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                {t('picture.upload')}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('picture.comingSoon')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('info.title')}</CardTitle>
            <CardDescription>
              {t('info.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('info.name')}</Label>
                  <Input
                    id="full_name"
                    placeholder={t('info.namePlaceholder')}
                    {...register('full_name')}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('info.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('info.emailDescription')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">{t('info.company')}</Label>
                  <Input
                    id="company"
                    placeholder={t('info.companyPlaceholder')}
                    {...register('company')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('info.location')}</Label>
                  <Input
                    id="location"
                    placeholder={t('info.locationPlaceholder')}
                    {...register('location')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t('info.website')}</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('info.bio')}</Label>
                <Textarea
                  id="bio"
                  placeholder={t('info.bioPlaceholder')}
                  className="resize-none"
                  rows={3}
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('info.bioDescription')}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!isDirty || isUpdating}
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('info.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('account.title')}</CardTitle>
            <CardDescription>
              {t('account.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t('account.created')}</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : t('account.unknown')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('account.userId')}</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {user?.id}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}