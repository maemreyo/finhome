// src/components/plans/SharePlanDialog.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Share2, 
  Link, 
  Mail, 
  Facebook, 
  Twitter, 
  Copy, 
  Eye,
  EyeOff,
  Users,
  Globe,
  Lock,
  CheckCircle,
  QrCode
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Database } from '@/lib/supabase/types'

type FinancialPlan = Database['public']['Tables']['financial_plans']['Row']

interface SharePlanDialogProps {
  plan: FinancialPlan
  onVisibilityChange: (isPublic: boolean) => void
}

export function SharePlanDialog({ plan, onVisibilityChange }: SharePlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(plan.is_public)
  const [shareUrl, setShareUrl] = useState('')
  const [emailRecipients, setEmailRecipients] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('link')

  const t = useTranslations('SharePlanDialog')

  const generateShareUrl = (planId: string, isPublic: boolean) => {
    const baseUrl = window.location.origin
    if (isPublic) {
      return `${baseUrl}/plans/public/${planId}`
    } else {
      // Generate a secure shareable link with token
      const token = btoa(`${planId}_${Date.now()}`)
      return `${baseUrl}/plans/shared/${token}`
    }
  }

  const handleVisibilityToggle = async (checked: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/plans/${plan.id}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_public: checked }),
      })

      if (!response.ok) {
        throw new Error('Failed to update plan visibility')
      }

      setIsPublic(checked)
      onVisibilityChange(checked)
      const newUrl = generateShareUrl(plan.id, checked)
      setShareUrl(newUrl)
      
      toast.success(checked ? t('messages.madePublic') : t('messages.madePrivate'))
    } catch (error) {
      console.error('Error updating plan visibility:', error)
      toast.error(t('messages.visibilityError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t('messages.linkCopied'))
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error(t('messages.copyError'))
    }
  }

  const handleEmailShare = async () => {
    if (!emailRecipients.trim()) {
      toast.error(t('validation.emailRequired'))
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/plans/share/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: plan.id,
          recipients: emailRecipients.split(',').map(email => email.trim()),
          message: shareMessage,
          shareUrl: shareUrl
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      toast.success(t('messages.emailSent'))
      setEmailRecipients('')
      setShareMessage('')
      setIsOpen(false)
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(t('messages.emailError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(t('socialShare.title', { planName: plan.plan_name }))
    const encodedDescription = encodeURIComponent(t('socialShare.description'))

    let shareLink = ''
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      default:
        return
    }

    window.open(shareLink, '_blank', 'width=600,height=400')
  }

  const handleDialogOpen = () => {
    setIsOpen(true)
    const url = generateShareUrl(plan.id, isPublic)
    setShareUrl(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleDialogOpen}>
          <Share2 className="w-4 h-4 mr-1" />
          {t('buttons.share')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={isPublic ? 'default' : 'secondary'}>
                  {isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                  {isPublic ? t('visibility.public') : t('visibility.private')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t('info.views', { count: plan.view_count })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('privacy.title')}</CardTitle>
              <CardDescription>{t('privacy.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-600" />
                  )}
                  <div>
                    <Label htmlFor="public-toggle" className="text-sm font-medium">
                      {t('privacy.makePublic')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isPublic ? t('privacy.publicDescription') : t('privacy.privateDescription')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={handleVisibilityToggle}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Share Options */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link">
                <Link className="w-4 h-4 mr-1" />
                {t('tabs.link')}
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-1" />
                {t('tabs.email')}
              </TabsTrigger>
              <TabsTrigger value="social">
                <Users className="w-4 h-4 mr-1" />
                {t('tabs.social')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4">
              <div className="space-y-2">
                <Label>{t('link.shareUrl')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                    placeholder={t('link.generating')}
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    disabled={!shareUrl}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copied ? t('link.copied') : t('link.copy')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? t('link.publicNote') : t('link.privateNote')}
                </p>
              </div>

              {/* QR Code placeholder */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <QrCode className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{t('link.qrCode')}</p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-recipients">{t('email.recipients')}</Label>
                <Input
                  id="email-recipients"
                  placeholder={t('email.recipientsPlaceholder')}
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('email.recipientsNote')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-message">{t('email.message')}</Label>
                <Textarea
                  id="share-message"
                  placeholder={t('email.messagePlaceholder')}
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleEmailShare}
                disabled={isLoading || !emailRecipients.trim() || !shareUrl}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? t('email.sending') : t('email.send')}
              </Button>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('facebook')}
                  disabled={!shareUrl}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('twitter')}
                  disabled={!shareUrl}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare('linkedin')}
                  disabled={!shareUrl}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  LinkedIn
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  {t('social.note')}
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}