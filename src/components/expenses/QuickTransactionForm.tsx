// src/components/expenses/QuickTransactionForm.tsx
// UPDATED: Enhanced UI/UX for 2-3 click transaction entry and flexible tagging
'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
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
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'

const quickTransactionSchema = z.object({
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

type FormData = z.infer<typeof quickTransactionSchema>

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

interface QuickTransactionFormProps {
  wallets: Wallet[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  suggestedTags?: string[] // Previously used tags for suggestions
  quickMode?: boolean // Compact mode for faster entry
}

export function QuickTransactionForm({
  wallets,
  expenseCategories,
  incomeCategories,
  onSuccess,
  onCancel,
  className,
  suggestedTags = [],
  quickMode = false
}: QuickTransactionFormProps) {
  const t = useTranslations('QuickTransactionForm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [tagInputOpen, setTagInputOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestedTags)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(quickTransactionSchema),
    defaultValues: {
      transaction_type: 'expense',
      amount: 0,
      transaction_date: new Date().toISOString().split('T')[0],
      tags: [],
    }
  })

  const { watch, setValue, getValues } = form

  const currentTransactionType = watch('transaction_type')
  const selectedWalletId = watch('wallet_id')
  const selectedWallet = wallets.find(w => w.id === selectedWalletId)

  useEffect(() => {
    setTransactionType(currentTransactionType)
  }, [currentTransactionType])

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
      setTagInputOpen(false)
      
      // Add to local suggestions if it's a new tag
      if (!suggestedTags.includes(tagValue)) {
        setFilteredSuggestions(prev => [tagValue, ...prev])
      }
    }
  }

  const handleTagInputChange = (value: string) => {
    setCustomTag(value)
    // Filter suggestions based on input
    const filtered = suggestedTags.filter(tag => 
      tag.toLowerCase().includes(value.toLowerCase()) &&
      !selectedTags.includes(tag)
    )
    setFilteredSuggestions(filtered)
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

      const result = await response.json()

      toast.success(
        transactionType === 'expense' 
          ? t('expenseRecorded') 
          : transactionType === 'income'
          ? t('incomeRecorded')
          : t('transferRecorded')
      )

      form.reset()
      setSelectedTags([])
      onSuccess?.()

    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error(error instanceof Error ? error.message : t('errorRecording'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentCategories = () => {
    return transactionType === 'expense' ? expenseCategories : incomeCategories
  }

  const getCategoryFieldName = () => {
    return transactionType === 'expense' ? 'expense_category_id' : 'income_category_id'
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", quickMode && "shadow-sm", className)}>
      <CardHeader className={cn("pb-3", quickMode && "pb-2 pt-4")}>
        <CardTitle className={cn("flex items-center gap-2", quickMode ? "text-base" : "text-lg")}>
          <Zap className={cn("text-amber-500", quickMode ? "h-4 w-4" : "h-5 w-5")} />
          <span>Quick Entry</span>
          {!quickMode && (
            <>
              {transactionType === 'expense' && <Minus className="h-5 w-5 text-red-500" />}
              {transactionType === 'income' && <Plus className="h-5 w-5 text-green-500" />}
              {transactionType === 'transfer' && <ArrowRightLeft className="h-5 w-5 text-blue-500" />}
              {transactionType === 'expense' && t('expense')}
              {transactionType === 'income' && t('income')}
              {transactionType === 'transfer' && t('transfer')}
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className={cn(quickMode && "px-4 pb-4")}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className={cn(quickMode ? "space-y-2" : "space-y-4")}
          onKeyDown={(e) => {
            // Keyboard shortcuts for power users
            if (e.ctrlKey || e.metaKey) {
              switch (e.key) {
                case 'Enter':
                  e.preventDefault()
                  form.handleSubmit(onSubmit)()
                  break
                case '1':
                  e.preventDefault()
                  setValue('transaction_type', 'expense')
                  break
                case '2':
                  e.preventDefault()
                  setValue('transaction_type', 'income')
                  break
                case '3':
                  e.preventDefault()
                  setValue('transaction_type', 'transfer')
                  break
              }
            }
          }}
        >
          {/* Transaction Type Toggle - Enhanced for Quick Mode */}
          <div className={cn("flex rounded-lg bg-muted p-1", quickMode && "p-0.5")}>
            {(['expense', 'income', 'transfer'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setValue('transaction_type', type)
                  // Reset category when switching types
                  setValue('expense_category_id', undefined)
                  setValue('income_category_id', undefined)
                  setValue('transfer_to_wallet_id', undefined)
                }}
                className={cn(
                  "flex-1 rounded-md font-medium transition-all",
                  "flex items-center justify-center gap-1",
                  quickMode ? "py-1.5 px-2 text-xs" : "py-2 px-3 text-sm",
                  transactionType === type
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

          {/* Amount Input with Quick Buttons - Enhanced */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn(quickMode && "text-sm")}>{t('amount')}</Label>
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
            
            {/* Quick Amount Buttons - Optimized for frequent amounts */}
            <div className="flex gap-1 flex-wrap">
              {(quickMode 
                ? [10000, 25000, 50000, 100000, 200000] // More common amounts for quick mode
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
            </div>
          </div>

          {/* Wallet Selection - Optimized */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-1", quickMode && "text-sm")}>
              <Wallet className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {quickMode 
                ? (transactionType === 'transfer' ? 'From' : 'Wallet')
                : (transactionType === 'transfer' ? t('fromWallet') : t('wallet'))
              }
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

          {/* Transfer Destination Wallet */}
          {transactionType === 'transfer' && (
            <div className="space-y-2">
              <Label>{t('toWallet')}</Label>
              <Select onValueChange={(value) => setValue('transfer_to_wallet_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectDestinationWallet')} />
                </SelectTrigger>
                <SelectContent>
                  {wallets
                    .filter(w => w.id !== selectedWalletId)
                    .map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: wallet.color }}
                        />
                        <span>{wallet.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Selection - Enhanced with Search */}
          {transactionType !== 'transfer' && (
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
                    .sort((a, b) => a.name_vi.localeCompare(b.name_vi)) // Sort alphabetically
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

          {/* Description - Optional in Quick Mode */}
          {!quickMode && (
            <div className="space-y-2">
              <Label>{t('description')}</Label>
              <Input
                placeholder={t('descriptionPlaceholder')}
                {...form.register('description')}
              />
            </div>
          )}
          
          {/* Compact Description for Quick Mode */}
          {quickMode && (
            <div className="space-y-1">
              <Input
                placeholder="Description (optional)"
                {...form.register('description')}
                className="h-8 text-sm"
              />
            </div>
          )}

          {/* Enhanced Tags with Suggestions */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-1", quickMode && "text-sm")}>
              <Hash className={cn("text-muted-foreground", quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {quickMode ? 'Tags' : t('tags')}
            </Label>
            
            {/* Tag Input with Suggestions */}
            <Popover open={tagInputOpen} onOpenChange={setTagInputOpen}>
              <div className="flex gap-1">
                <PopoverTrigger asChild>
                  <div className="flex-1 relative">
                    <Input
                      ref={tagInputRef}
                      placeholder={quickMode ? "Add tag..." : t('addTagPlaceholder')}
                      value={customTag}
                      onChange={(e) => handleTagInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
                          e.preventDefault()
                          setTagInputOpen(true)
                        }
                      }}
                      onFocus={() => customTag && setTagInputOpen(true)}
                      className={cn(quickMode && "h-8 text-sm")}
                    />
                    {(filteredSuggestions.length > 0 || customTag) && (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </PopoverTrigger>
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
              
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or create tag..." 
                    value={customTag}
                    onValueChange={handleTagInputChange}
                  />
                  <CommandEmpty>
                    {customTag && (
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => addTag()}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Create "{customTag}"
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                  {filteredSuggestions.length > 0 && (
                    <CommandGroup heading="Suggested tags">
                      <ScrollArea className="max-h-32">
                        {filteredSuggestions.slice(0, 8).map((tag) => (
                          <CommandItem
                            key={tag}
                            onSelect={() => addTag(tag)}
                            className="text-sm"
                          >
                            <Hash className="h-3 w-3 mr-2 text-muted-foreground" />
                            {tag}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            
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
            
            {/* Quick Tag Suggestions */}
            {selectedTags.length === 0 && suggestedTags.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Quick add:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.slice(0, 5).map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      className={cn(
                        "h-6 px-2 text-xs border-dashed hover:border-solid",
                        quickMode && "h-5"
                      )}
                    >
                      <Hash className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Optimized */}
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
                  {quickMode ? 'Save' : t('saveTransaction')}
                  {quickMode && (
                    <kbd className="ml-1 px-1 py-0.5 text-xs bg-black/10 rounded border">
                      ⌘↵
                    </kbd>
                  )}
                </div>
              )}
            </Button>
          </div>
          
          {/* Quick Mode Tips */}
          {quickMode && (
            <div className="text-xs text-muted-foreground text-center pt-1 border-t">
              <p>Tips: ⌘+1/2/3 to switch type • ⌘+Enter to save • ↓ for tag suggestions</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}