// src/components/plans/ExportPlanDialog.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  FileText, 
  Table, 
  FileSpreadsheet,
  FileImage,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Database } from '@/src/types/supabase'
import { formatCurrency } from '@/lib/utils'

type FinancialPlan = Database['public']['Tables']['financial_plans']['Row']

interface ExportPlanDialogProps {
  plan: FinancialPlan
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeCalculations: boolean
  includeLoanDetails: boolean
  includeTimeline: boolean
  includePersonalInfo: boolean
  language: 'vi' | 'en'
  template: 'detailed' | 'summary' | 'presentation'
}

export function ExportPlanDialog({ plan }: ExportPlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeCalculations: true,
    includeLoanDetails: true,
    includeTimeline: true,
    includePersonalInfo: false,
    language: 'vi',
    template: 'detailed'
  })

  const t = useTranslations('ExportPlanDialog')

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressSteps = [
        { step: 'Preparing data', progress: 20 },
        { step: 'Generating calculations', progress: 40 },
        { step: 'Creating charts', progress: 60 },
        { step: 'Formatting document', progress: 80 },
        { step: 'Finalizing export', progress: 100 }
      ]

      for (const { step, progress } of progressSteps) {
        setExportProgress(progress)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Make API call to export endpoint
      const response = await fetch('/api/plans/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: plan.id,
          ...options
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${plan.plan_name}_export.${options.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(t('messages.exportSuccess'))
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(t('messages.exportError'))
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />
      case 'csv':
        return <Table className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTemplateDescription = (template: string) => {
    switch (template) {
      case 'detailed':
        return t('templates.detailed.description')
      case 'summary':
        return t('templates.summary.description')
      case 'presentation':
        return t('templates.presentation.description')
      default:
        return ''
    }
  }

  const estimatedFileSize = () => {
    let size = 0.5 // Base size in MB
    if (options.includeCharts) size += 2
    if (options.includeCalculations) size += 1
    if (options.includeLoanDetails) size += 0.5
    if (options.includeTimeline) size += 1
    if (options.template === 'detailed') size *= 1.5
    return size.toFixed(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          {t('buttons.export')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('planInfo.purchasePrice')}:</span>
                  <div className="font-medium">{formatCurrency(plan.purchase_price || 0)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('planInfo.downPayment')}:</span>
                  <div className="font-medium">{formatCurrency(plan.down_payment || 0)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Tabs defaultValue="format" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">{t('tabs.format')}</TabsTrigger>
              <TabsTrigger value="content">{t('tabs.content')}</TabsTrigger>
              <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">{t('format.title')}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {['pdf', 'excel', 'csv'].map((format) => (
                    <Card 
                      key={format}
                      className={`cursor-pointer transition-colors ${
                        options.format === format ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setOptions(prev => ({ ...prev, format: format as any }))}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {getFormatIcon(format)}
                          <span className="text-sm font-medium">{format.toUpperCase()}</span>
                          <span className="text-xs text-muted-foreground">
                            {t(`format.${format}.description`)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">{t('templates.title')}</h4>
                <Select 
                  value={options.template} 
                  onValueChange={(value) => setOptions(prev => ({ ...prev, template: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">{t('templates.detailed.title')}</SelectItem>
                    <SelectItem value="summary">{t('templates.summary.title')}</SelectItem>
                    <SelectItem value="presentation">{t('templates.presentation.title')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getTemplateDescription(options.template)}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">{t('content.title')}</h4>
                <div className="space-y-3">
                  {[
                    { key: 'includeCharts', label: t('content.includeCharts') },
                    { key: 'includeCalculations', label: t('content.includeCalculations') },
                    { key: 'includeLoanDetails', label: t('content.includeLoanDetails') },
                    { key: 'includeTimeline', label: t('content.includeTimeline') },
                    { key: 'includePersonalInfo', label: t('content.includePersonalInfo') }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={options[key as keyof ExportOptions] as boolean}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('content.personalInfoWarning')}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select 
                    value={options.language} 
                    onValueChange={(value) => setOptions(prev => ({ ...prev, language: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.estimatedSize')}</Label>
                  <div className="text-sm text-muted-foreground">
                    {t('settings.fileSizeEstimate', { size: estimatedFileSize() })}
                  </div>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    {t('settings.processingNote')}
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{t('progress.title')}</div>
                <div className="text-sm text-muted-foreground">{exportProgress}%</div>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              {t('buttons.cancel')}
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-white" />
                  {t('buttons.exporting')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t('buttons.export')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}