// src/components/expenses/EnhancedQuickTransactionForm.tsx
// Enhanced wrapper with tag suggestions and smart defaults
'use client'

import { useState, useEffect } from 'react'
import { QuickTransactionForm } from './QuickTransactionForm'
import { useTagSuggestions } from '@/hooks/useTagSuggestions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Zap, Settings, Hash } from 'lucide-react'

interface Wallet {
  id: string
  name: string
  balance: number
  currency: string
  icon: string
  color: string
  wallet_type: string
}

interface Category {
  id: string
  name_en: string
  name_vi: string
  icon: string
  color: string
  category_key: string
}

interface EnhancedQuickTransactionFormProps {
  wallets: Wallet[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  userId?: string
  defaultQuickMode?: boolean
}

export function EnhancedQuickTransactionForm({
  wallets,
  expenseCategories,
  incomeCategories,
  onSuccess,
  onCancel,
  className,
  userId,
  defaultQuickMode = false
}: EnhancedQuickTransactionFormProps) {
  const [quickMode, setQuickMode] = useState(defaultQuickMode)
  const [showSettings, setShowSettings] = useState(false)
  
  const { 
    suggestions, 
    loading, 
    addTagToSuggestions, 
    getFilteredSuggestions 
  } = useTagSuggestions({ userId })

  const handleSuccess = () => {
    onSuccess?.()
  }

  const handleTagCreated = (newTag: string) => {
    addTagToSuggestions(newTag)
  }

  return (
    <div className={className}>
      {/* Mode Toggle and Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="quick-mode"
              checked={quickMode}
              onCheckedChange={setQuickMode}
            />
            <Label htmlFor="quick-mode" className="flex items-center gap-1.5 text-sm">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick Mode
            </Label>
          </div>
          
          {suggestions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Hash className="h-3 w-3 mr-1" />
              {suggestions.length} saved tags
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transaction Entry Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Quick Mode</Label>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Streamlined UI for faster entry with keyboard shortcuts and commonly used amounts.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Your Most Used Tags</Label>
                {loading ? (
                  <div className="text-xs text-muted-foreground">Loading tags...</div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {suggestions.slice(0, 10).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Hash className="h-2.5 w-2.5 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Keyboard Shortcuts (Quick Mode):</strong></p>
                <ul className="space-y-0.5 pl-2">
                  <li>• ⌘/Ctrl + Enter: Save transaction</li>
                  <li>• ⌘/Ctrl + 1/2/3: Switch transaction type</li>
                  <li>• ↓ in tag field: Show suggestions</li>
                  <li>• Tab: Navigate between fields</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Form */}
      <QuickTransactionForm
        wallets={wallets}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onSuccess={handleSuccess}
        onCancel={onCancel}
        suggestedTags={suggestions}
        quickMode={quickMode}
      />

      {/* Quick Mode Tips */}
      {quickMode && !showSettings && (
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro tip:</strong> Use ⌘+Enter to save quickly, or toggle Quick Mode off for more options
          </p>
        </div>
      )}
    </div>
  )
}