// src/components/admin/AdminPageActions.tsx
'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Download, Upload, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminPageActionsProps {
  entityType: 'users' | 'rates' | 'banks' | 'notifications' | 'achievements'
  totalCount: number
  onAdd?: () => void
  onExport?: (format: 'csv' | 'json') => void
  onImport?: () => void
}

export function AdminPageActions({
  entityType,
  totalCount,
  onAdd,
  onExport,
  onImport
}: AdminPageActionsProps) {
  const t = useTranslations(`Admin.${entityType}`)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      if (onExport) {
        await onExport(format)
        toast.success(t('exportSuccess'))
      } else {
        // Default export implementation
        toast.info('Export functionality coming soon')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error(t('exportError'))
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    try {
      if (onImport) {
        await onImport()
        toast.success(t('importSuccess'))
      } else {
        // Default import implementation - trigger file input
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv,.json'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            toast.info(`Selected file: ${file.name}. Import functionality coming soon.`)
          }
        }
        input.click()
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error(t('importError'))
    }
  }

  const handleAdd = () => {
    if (onAdd) {
      onAdd()
    } else {
      toast.info(`Add ${entityType} functionality coming soon`)
    }
  }

  const getBadgeColor = () => {
    switch (entityType) {
      case 'users': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'rates': return 'bg-green-50 text-green-700 border-green-200'
      case 'banks': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'notifications': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'achievements': return 'bg-purple-50 text-purple-700 border-purple-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getCountLabel = () => {
    switch (entityType) {
      case 'users': return t('totalUsers')
      case 'rates': return t('currentRates')
      case 'banks': return t('totalBanks')
      case 'notifications': return t('totalNotifications')
      case 'achievements': return t('totalAchievements')
      default: return 'Total'
    }
  }

  const getAddLabel = () => {
    switch (entityType) {
      case 'users': return t('addUser')
      case 'rates': return t('addRate')
      case 'banks': return t('addBank')
      case 'notifications': return t('addNotification')
      case 'achievements': return t('addAchievement')
      default: return 'Add'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={getBadgeColor()}>
        {totalCount} {getCountLabel()}
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? t('exporting') : t('export')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileText className="w-4 h-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" onClick={handleImport}>
        <Upload className="w-4 h-4 mr-2" />
        {t('import')}
      </Button>
      
      <Button size="sm" onClick={handleAdd}>
        <Plus className="w-4 h-4 mr-2" />
        {getAddLabel()}
      </Button>
    </div>
  )
}