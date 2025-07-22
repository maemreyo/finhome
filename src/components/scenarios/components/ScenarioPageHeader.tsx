// src/components/scenarios/components/ScenarioPageHeader.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Download,
  RefreshCw,
  Sparkles,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FeatureGate } from '@/components/subscription/FeatureGate'
import { FeatureBadge } from '@/components/subscription/SubscriptionBadge'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import ScenarioParameterEditor from '@/components/scenarios/ScenarioParameterEditor'
import ExportModal from './ExportModal'
import type { TimelineScenario } from '@/types/scenario'

interface ScenarioPageHeaderProps {
  filteredScenariosCount: number
  selectedScenarioIds: string[]
  maxScenarios: number | null
  userSubscriptionTier?: string
  scenarioLimitReached: boolean
  smartScenariosLoading: boolean
  isCreateDialogOpen: boolean
  editingScenario: TimelineScenario | null
  scenarios: TimelineScenario[]
  onGenerateSmartScenarios: () => Promise<void>
  onCreateDialogChange: (open: boolean) => void
  onScenarioChange: (scenario: TimelineScenario) => void
  onSaveScenario: (scenario: TimelineScenario) => void
  onDeleteScenario?: (scenarioId: string) => void
}

const ScenarioPageHeader: React.FC<ScenarioPageHeaderProps> = ({
  filteredScenariosCount,
  selectedScenarioIds,
  maxScenarios,
  userSubscriptionTier,
  scenarioLimitReached,
  smartScenariosLoading,
  isCreateDialogOpen,
  editingScenario,
  scenarios,
  onGenerateSmartScenarios,
  onCreateDialogChange,
  onScenarioChange,
  onSaveScenario,
  onDeleteScenario
}) => {
  const t = useTranslations('ScenarioPageHeader')
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false)

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
            {t('description')}
          </p>
          
          {/* Quick stats with subscription info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              {filteredScenariosCount} {t('scenarios')}
              {maxScenarios && (
                <span className="text-blue-600">/ {maxScenarios}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              {selectedScenarioIds.length} {t('selected')}
            </div>
            {userSubscriptionTier && (
              <div className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium",
                userSubscriptionTier === 'basic' ? 'bg-gray-100 text-gray-700' :
                userSubscriptionTier === 'premium' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              )}>
                <span className="capitalize">{userSubscriptionTier}</span>
              </div>
            )}
            {scenarioLimitReached && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs sm:text-sm">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('limitReached')}</span>
                <span className="sm:hidden">Limit</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <FeatureGate featureKey="smart_scenarios" promptStyle="inline">
            <Button
              variant="outline"
              onClick={onGenerateSmartScenarios}
              disabled={smartScenariosLoading}
              size="sm"
              className="shadow-sm hover:shadow-md transition-shadow text-xs sm:text-sm"
            >
              {smartScenariosLoading ? (
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              )}
              <span className="hidden sm:inline">{t('generateSmartScenarios')}</span>
              <span className="sm:hidden">Smart</span>
              <FeatureBadge featureKey="smart_scenarios" />
            </Button>
          </FeatureGate>
          
          <Button
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
            disabled={selectedScenarioIds.length === 0}
            size="sm"
            className="shadow-sm hover:shadow-md transition-shadow text-xs sm:text-sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            {t('export')}
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogChange}>
            <DialogTrigger asChild>
              <Button 
                disabled={scenarioLimitReached}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-xs sm:text-sm"
                title={scenarioLimitReached ? t('limitReachedTooltip', { maxScenarios: maxScenarios || 0 }) : undefined}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">
                  {scenarioLimitReached ? t('limitReachedButton', { maxScenarios: maxScenarios || 0 }) : t('createScenario')}
                </span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className=" overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingScenario ? t('editScenario') : t('createNewScenario')}
                </DialogTitle>
              </DialogHeader>
              <ErrorBoundary>
                <ScenarioParameterEditor
                  initialScenario={editingScenario || undefined}
                  onScenarioChange={onScenarioChange}
                  onSaveScenario={onSaveScenario}
                  onDeleteScenario={editingScenario ? onDeleteScenario : undefined}
                />
              </ErrorBoundary>
            </DialogContent>
          </Dialog>

          {/* Export Modal */}
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            scenarios={scenarios}
            selectedScenarioIds={selectedScenarioIds}
          />
        </div>
      </div>
  )
}

export default ScenarioPageHeader