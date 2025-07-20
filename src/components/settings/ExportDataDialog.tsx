// src/components/settings/ExportDataDialog.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardService } from '@/lib/services/dashboardService'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf'
  includeProfiles: boolean
  includePlans: boolean
  includePreferences: boolean
  includeActivities: boolean
  includeAchievements: boolean
}

export function ExportDataDialog() {
  const t = useTranslations('Dashboard.Settings.account.exportDialog')
  const tAccount = useTranslations('Dashboard.Settings.account')
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeProfiles: true,
    includePlans: true,
    includePreferences: true,
    includeActivities: false,
    includeAchievements: false,
  })

  const handleExport = async () => {
    if (!user) return

    setIsExporting(true)
    
    try {
      const exportData: any = {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        email: user.email,
      }

      // Fetch data based on selected options
      if (options.includeProfiles) {
        try {
          const profile = await DashboardService.getUserProfile(user.id)
          exportData.profile = profile
        } catch (error) {
          console.warn('Could not fetch profile data:', error)
        }
      }

      if (options.includePlans) {
        try {
          const plans = await DashboardService.getFinancialPlans(user.id)
          exportData.financialPlans = plans
        } catch (error) {
          console.warn('Could not fetch plans data:', error)
        }
      }

      if (options.includePreferences) {
        try {
          const preferences = await DashboardService.getUserPreferences(user.id)
          exportData.preferences = preferences
        } catch (error) {
          console.warn('Could not fetch preferences data:', error)
        }
      }

      if (options.includeActivities) {
        try {
          const activities = await DashboardService.getUserActivities(user.id)
          exportData.activities = activities
        } catch (error) {
          console.warn('Could not fetch activities data:', error)
        }
      }

      if (options.includeAchievements) {
        try {
          const achievements = await DashboardService.getUserAchievements(user.id)
          exportData.achievements = achievements
        } catch (error) {
          console.warn('Could not fetch achievements data:', error)
        }
      }

      // Generate and download file based on format
      const timestamp = new Date().toISOString().split('T')[0]
      let blob: Blob
      let filename: string

      switch (options.format) {
        case 'json':
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
          filename = `finhome-data-${timestamp}.json`
          break
          
        case 'csv':
          // Convert to CSV (simplified for key data)
          const csvData = []
          csvData.push('Data Type,Key,Value')
          
          Object.entries(exportData).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              csvData.push(`${key},${key},${JSON.stringify(value)}`)
            } else {
              csvData.push(`${key},${key},${value}`)
            }
          })
          
          blob = new Blob([csvData.join('\n')], { type: 'text/csv' })
          filename = `finhome-data-${timestamp}.csv`
          break
          
        case 'pdf':
          // For PDF, we'll use JSON format for now
          // In a real app, you'd want to format this properly for PDF
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/pdf' })
          filename = `finhome-data-${timestamp}.pdf`
          break
          
        default:
          throw new Error('Unsupported format')
      }

      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
      setIsOpen(false)
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {tAccount('exportDataButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="format">{t('formatLabel')}</Label>
            <Select value={options.format} onValueChange={(value: 'json' | 'csv' | 'pdf') => updateOption('format', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('formatPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>{t('dataToInclude')}</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeProfiles"
                  checked={options.includeProfiles}
                  onCheckedChange={(checked) => updateOption('includeProfiles', checked)}
                />
                <Label htmlFor="includeProfiles" className="text-sm font-normal">
                  {t('profileInformation')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePlans"
                  checked={options.includePlans}
                  onCheckedChange={(checked) => updateOption('includePlans', checked)}
                />
                <Label htmlFor="includePlans" className="text-sm font-normal">
                  {t('financialPlans')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePreferences"
                  checked={options.includePreferences}
                  onCheckedChange={(checked) => updateOption('includePreferences', checked)}
                />
                <Label htmlFor="includePreferences" className="text-sm font-normal">
                  {t('preferencesSettings')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeActivities"
                  checked={options.includeActivities}
                  onCheckedChange={(checked) => updateOption('includeActivities', checked)}
                />
                <Label htmlFor="includeActivities" className="text-sm font-normal">
                  {t('activityHistory')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAchievements"
                  checked={options.includeAchievements}
                  onCheckedChange={(checked) => updateOption('includeAchievements', checked)}
                />
                <Label htmlFor="includeAchievements" className="text-sm font-normal">
                  {t('achievements')}
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('exportData')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}