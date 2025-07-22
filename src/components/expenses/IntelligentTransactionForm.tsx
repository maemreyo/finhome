// src/components/expenses/IntelligentTransactionForm.tsx
// Enhanced transaction form with intelligent suggestions based on user patterns
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useIntelligentSuggestions } from '@/hooks/useIntelligentSuggestions'
import { useTagSuggestions } from '@/hooks/useTagSuggestions'
import { 
  Calculator, 
  Camera, 
  MapPin, 
  Plus, 
  Minus, 
  ArrowRightLeft,
  Wallet,
  Tag,
  Clock,
  Check,
  X,
  ChevronDown,
  Zap,
  Hash,
  Brain,
  TrendingUp,
  Sparkles,
  Target,
  History,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'

const intelligentTransactionSchema = z.object({
  wallet_id: z.string().min(1, 'Please select a wallet'),
  transaction_type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  notes: z.string().optional(),
  expense_category_id: z.string().optional(),
  income_category_id: z.string().optional(),
  transfer_to_wallet_id: z.string().optional(),
  transfer_fee: z.number().min(0).optional(),
  transaction_date: z.string().optional(),
  merchant_name: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof intelligentTransactionSchema>

interface Category {
  id: string
  name_en: string
  name_vi: string
  icon: string
  color: string
  category_key: string
}

interface Wallet {
  id: string
  name: string
  balance: number
  currency: string
  icon: string
  color: string
  wallet_type: string
}

interface IntelligentTransactionFormProps {
  wallets: Wallet[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  userId?: string
  quickMode?: boolean
}

export function IntelligentTransactionForm({
  wallets,
  expenseCategories,
  incomeCategories,
  onSuccess,
  onCancel,
  className,
  userId,
  quickMode = false
}: IntelligentTransactionFormProps) {
  const t = useTranslations('QuickTransactionForm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionType, setSuggestionType] = useState<'description' | 'merchant' | null>(null)
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true)
  
  // Form references
  const descriptionInputRef = useRef<HTMLInputElement>(null)
  const merchantInputRef = useRef<HTMLInputElement>(null)
  
  const form = useForm<FormData>({
    resolver: zodResolver(intelligentTransactionSchema),
    defaultValues: {
      transaction_type: 'expense',
      amount: 0,
      transaction_date: new Date().toISOString().split('T')[0],
      tags: [],
    }
  })

  const { watch, setValue, getValues } = form
  const currentTransactionType = watch('transaction_type')
  const currentDescription = watch('description') || ''
  const currentMerchant = watch('merchant_name') || ''
  const selectedWalletId = watch('wallet_id')
  
  // Hooks for intelligent suggestions
  const {
    suggestions,
    loading: suggestionsLoading,
    getDescriptionSuggestions,
    getMerchantSuggestions,
    getAmountSuggestions,
    predictCategory,
    predictAmount,
    getRelatedTags,
    applySuggestion,
    clearSuggestions
  } = useIntelligentSuggestions({ transactionType: currentTransactionType })
  
  const { suggestions: tagSuggestions, addTagToSuggestions } = useTagSuggestions({ userId })

  useEffect(() => {
    setTransactionType(currentTransactionType)
    clearSuggestions() // Clear suggestions when transaction type changes
  }, [currentTransactionType, clearSuggestions])

  // Auto-suggest category based on description/merchant
  const handleAutoSuggestCategory = useCallback((input: string, type: 'description' | 'merchant') => {
    if (!autoSuggestEnabled || !input.trim()) return
    
    const categoryPrediction = predictCategory(input)
    if (categoryPrediction && categoryPrediction.confidence > 0.5) {
      const categoryField = currentTransactionType === 'expense' ? 'expense_category_id' : 'income_category_id'
      setValue(categoryField, categoryPrediction.predicted_category?.id)
      
      // Also suggest amount if available
      if (categoryPrediction.predicted_amount) {
        setValue('amount', categoryPrediction.predicted_amount)
      }
      
      // Suggest related tags
      if (categoryPrediction.related_tags && categoryPrediction.related_tags.length > 0) {
        const newTags = [...selectedTags, ...categoryPrediction.related_tags.slice(0, 3)]
        const uniqueTags = [...new Set(newTags)]
        setSelectedTags(uniqueTags)
        setValue('tags', uniqueTags)
      }
    }
  }, [autoSuggestEnabled, predictCategory, currentTransactionType, setValue, selectedTags])

  // Handle description input changes
  const handleDescriptionChange = useCallback((value: string) => {
    setValue('description', value)
    if (value.length >= 2) {
      getDescriptionSuggestions(value)
      handleAutoSuggestCategory(value, 'description')
    } else {
      clearSuggestions()
    }
  }, [setValue, getDescriptionSuggestions, handleAutoSuggestCategory, clearSuggestions])

  // Handle merchant input changes
  const handleMerchantChange = useCallback((value: string) => {
    setValue('merchant_name', value)
    if (value.length >= 2) {
      getMerchantSuggestions(value)
      handleAutoSuggestCategory(value, 'merchant')
    } else {
      clearSuggestions()
    }
  }, [setValue, getMerchantSuggestions, handleAutoSuggestCategory, clearSuggestions])

  // Apply suggestion to form
  const handleApplySuggestion = useCallback((suggestion: any) => {
    const updates = applySuggestion(suggestion)
    
    Object.entries(updates).forEach(([field, value]) => {
      if (field === 'suggested_tags') {
        const newTags = [...selectedTags, ...(value as string[])]
        const uniqueTags = [...new Set(newTags)]
        setSelectedTags(uniqueTags)
        setValue('tags', uniqueTags)
      } else {
        setValue(field as any, value)
      }
    })
    
    setShowSuggestions(false)
  }, [applySuggestion, selectedTags, setValue])

  // Load amount suggestions on mount
  useEffect(() => {
    if (currentTransactionType !== 'transfer') {
      getAmountSuggestions()
    }
  }, [currentTransactionType, getAmountSuggestions])

  const handleQuickAmount = (amount: number) => {
    const currentAmount = getValues('amount') || 0
    setValue('amount', currentAmount + amount)
  }

  const addTag = (tagToAdd?: string) => {
    const tagValue = tagToAdd || customTag.trim()
    if (tagValue && !selectedTags.includes(tagValue)) {
      const newTags = [...selectedTags, tagValue]
      setSelectedTags(newTags)
      setValue('tags', newTags)
      setCustomTag('')
      addTagToSuggestions(tagValue)
    }
  }

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag)
    setSelectedTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tags: selectedTags,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }

      toast.success(
        currentTransactionType === 'expense' 
          ? t('expenseRecorded') 
          : currentTransactionType === 'income'
          ? t('incomeRecorded')
          : t('transferRecorded')
      )

      form.reset()
      setSelectedTags([])
      clearSuggestions()
      onSuccess?.()

    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error(error instanceof Error ? error.message : t('errorRecording'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get filtered suggestions for current context
  const getContextualSuggestions = () => {
    if (suggestionType === 'description') {
      return suggestions.filter(s => s.type === 'description')
    } else if (suggestionType === 'merchant') {
      return suggestions.filter(s => s.type === 'merchant')
    }
    return []
  }

  const getCurrentCategories = () => {
    return currentTransactionType === 'expense' ? expenseCategories : incomeCategories
  }

  const getCategoryFieldName = () => {
    return currentTransactionType === 'expense' ? 'expense_category_id' : 'income_category_id'
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", quickMode && "shadow-sm", className)}>
      <CardHeader className={cn("pb-3", quickMode && "pb-2 pt-4")}>
        <CardTitle className={cn("flex items-center gap-2", quickMode ? "text-base" : "text-lg")}>
          <Brain className={cn("text-purple-500", quickMode ? "h-4 w-4" : "h-5 w-5")} />
          <span>Smart Entry</span>
          {!quickMode && (
            <>
              {currentTransactionType === 'expense' && <Minus className="h-5 w-5 text-red-500" />}
              {currentTransactionType === 'income' && <Plus className="h-5 w-5 text-green-500" />}
              {currentTransactionType === 'transfer' && <ArrowRightLeft className="h-5 w-5 text-blue-500" />}
            </>
          )}
          {suggestionsLoading && (
            <div className="w-3 h-3 border border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className={cn(quickMode && "px-4 pb-4")}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn(quickMode ? "space-y-2" : "space-y-4")}>
          {/* AI Suggestions Status */}
          {autoSuggestEnabled && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md text-xs">
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span className="text-purple-700 dark:text-purple-300">
                AI suggestions enabled - Start typing for smart recommendations
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-auto"
                onClick={() => setAutoSuggestEnabled(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Transaction Type Toggle */}
          <div className={cn("flex rounded-lg bg-muted p-1", quickMode && "p-0.5")}>
            {(['expense', 'income', 'transfer'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setValue('transaction_type', type)
                  setValue('expense_category_id', undefined)
                  setValue('income_category_id', undefined)
                  setValue('transfer_to_wallet_id', undefined)
                }}
                className={cn(
                  "flex-1 rounded-md font-medium transition-all",
                  "flex items-center justify-center gap-1",
                  quickMode ? "py-1.5 px-2 text-xs" : "py-2 px-3 text-sm",
                  currentTransactionType === type
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === 'expense' && <Minus className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />}
                {type === 'income' && <Plus className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />}
                {type === 'transfer' && <ArrowRightLeft className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />}
                {!quickMode && (
                  <>
                    {type === 'expense' && t('expense')}
                    {type === 'income' && t('income')}
                    {type === 'transfer' && t('transfer')}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Smart Amount Input */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-2", quickMode && "text-sm")}>
              <Calculator className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {t('amount')}
              {suggestions.some(s => s.type === 'amount') && (
                <Badge variant="secondary" className="text-xs h-4">
                  <TrendingUp className="h-2.5 w-2.5 mr-1" />
                  Smart amounts
                </Badge>
              )}
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="1000"
                min="0"
                placeholder="0"
                {...form.register('amount', { valueAsNumber: true })}
                className={cn(
                  "font-semibold pr-16",
                  quickMode ? "text-lg h-10" : "text-xl"
                )}
                autoFocus={quickMode}
              />
              <div className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                quickMode ? "text-xs" : "text-sm"
              )}>
                VND
              </div>
            </div>
            
            {/* Smart Amount Suggestions */}
            <div className="flex gap-1 flex-wrap">
              {/* Regular quick amounts */}
              {(quickMode 
                ? [10000, 25000, 50000, 100000, 200000]
                : [10000, 20000, 50000, 100000, 200000, 500000]
              ).map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className={cn(
                    "text-xs px-2 py-1 h-6 min-w-0",
                    quickMode && "h-5"
                  )}
                >
                  +{amount >= 1000000 ? (amount / 1000000) + 'M' : (amount / 1000) + 'k'}
                </Button>
              ))}
              
              {/* AI suggested amounts */}
              {suggestions
                .filter(s => s.type === 'amount')
                .slice(0, 3)
                .map((suggestion) => (
                  <Button
                    key={suggestion.value}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setValue('amount', suggestion.value as number)}
                    className={cn(
                      "text-xs px-2 py-1 h-6 min-w-0 border-purple-200 bg-purple-50 hover:bg-purple-100",
                      quickMode && "h-5"
                    )}
                  >
                    <Brain className="h-2.5 w-2.5 mr-1" />
                    {(suggestion.value as number).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                  </Button>
                ))
              }
            </div>
          </div>

          {/* Smart Description Input */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-2", quickMode && "text-sm")}>
              <Lightbulb className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {quickMode ? 'Description' : t('description')}
              {suggestions.some(s => s.type === 'description' && s.confidence > 0.5) && (
                <Badge variant="secondary" className="text-xs h-4">
                  <Brain className="h-2.5 w-2.5 mr-1" />
                  {suggestions.filter(s => s.type === 'description').length} suggestions
                </Badge>
              )}
            </Label>
            
            <Popover open={showSuggestions && suggestionType === 'description'} onOpenChange={(open) => {
              if (!open) {
                setShowSuggestions(false)
                setSuggestionType(null)
              }
            }}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    ref={descriptionInputRef}
                    placeholder={quickMode ? "Coffee, groceries..." : t('descriptionPlaceholder')}
                    value={currentDescription}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.some(s => s.type === 'description')) {
                        setSuggestionType('description')
                        setShowSuggestions(true)
                      }
                    }}
                    className={cn(quickMode && "h-8 text-sm")}
                  />
                  {suggestions.some(s => s.type === 'description') && (
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </PopoverTrigger>
              
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search descriptions..." />
                  <CommandList>
                    <CommandEmpty>No suggestions found.</CommandEmpty>
                    <CommandGroup heading="Smart suggestions">
                      <ScrollArea className="max-h-32">
                        {getContextualSuggestions().map((suggestion) => (
                          <CommandItem
                            key={`${suggestion.type}-${suggestion.value}`}
                            onSelect={() => handleApplySuggestion(suggestion)}
                            className="text-sm"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <Brain className="h-3 w-3 text-purple-500" />
                                <span>{suggestion.value}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {suggestion.predicted_category && (
                                  <Badge variant="outline" className="text-xs px-1 h-4">
                                    {suggestion.predicted_category.name_vi}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1">
                                  <History className="h-2.5 w-2.5" />
                                  {suggestion.frequency}x
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Wallet Selection & Category Selection - simplified for space */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-1", quickMode && "text-sm")}>
              <Wallet className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {quickMode ? 'Wallet' : t('wallet')}
            </Label>
            <Select onValueChange={(value) => setValue('wallet_id', value)}>
              <SelectTrigger className={cn(quickMode && "h-8")}>
                <SelectValue placeholder={quickMode ? "Select wallet" : t('wallet')} />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: wallet.color }}
                      />
                      <span className="truncate">{wallet.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {wallet.balance.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          {currentTransactionType !== 'transfer' && (
            <div className={cn("space-y-2", quickMode && "space-y-1")}>
              <Label className={cn(quickMode && "text-sm")}>
                {quickMode ? 'Category' : t('category')}
              </Label>
              <Select onValueChange={(value) => setValue(getCategoryFieldName(), value)}>
                <SelectTrigger className={cn(quickMode && "h-8")}>
                  <SelectValue placeholder={quickMode ? "Select category" : t('category')} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {getCurrentCategories()
                    .sort((a, b) => a.name_vi.localeCompare(b.name_vi))
                    .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name_vi}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Enhanced Tags with AI suggestions */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-1", quickMode && "text-sm")}>
              <Hash className={cn("text-muted-foreground", quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {quickMode ? 'Tags' : t('tags')}
            </Label>
            
            <div className="flex gap-1">
              <Input
                placeholder={quickMode ? "Add tag..." : t('addTagPlaceholder')}
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className={cn(quickMode && "h-8 text-sm")}
              />
              <Button 
                type="button" 
                onClick={() => addTag()} 
                size={quickMode ? "sm" : "sm"}
                className={cn(quickMode && "h-8 px-2")}
                disabled={!customTag.trim()}
              >
                <Plus className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              </Button>
            </div>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className={cn(
                      "flex items-center gap-1 pr-1",
                      quickMode ? "text-xs py-0" : "text-xs"
                    )}
                  >
                    <Hash className="h-2.5 w-2.5" />
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* AI suggested tags */}
            {getRelatedTags(currentDescription || currentMerchant).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">AI suggested tags:</p>
                <div className="flex flex-wrap gap-1">
                  {getRelatedTags(currentDescription || currentMerchant).map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      className={cn(
                        "h-6 px-2 text-xs border-dashed hover:border-solid border-purple-200 bg-purple-50 hover:bg-purple-100",
                        quickMode && "h-5"
                      )}
                    >
                      <Brain className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={cn("flex gap-2", quickMode ? "pt-2" : "pt-4")}>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className={cn("flex-1", quickMode && "h-8 text-sm")}
              >
                {quickMode ? 'Cancel' : t('cancel')}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || !watch('wallet_id') || !watch('amount')} 
              className={cn("flex-1 font-medium", quickMode && "h-8 text-sm")}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "border-2 border-white border-t-transparent rounded-full animate-spin",
                    quickMode ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  {quickMode ? 'Saving...' : t('saving')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
                  <span>{quickMode ? 'Save' : t('saveTransaction')}</span>
                  {autoSuggestEnabled && (
                    <Brain className="h-3 w-3 text-purple-200" />
                  )}
                </div>
              )}
            </Button>
          </div>

          {/* AI Tips */}
          {quickMode && autoSuggestEnabled && (
            <div className="text-xs text-muted-foreground text-center pt-1 border-t">
              <p>💡 AI learns from your patterns - The more you use it, the smarter it gets!</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}