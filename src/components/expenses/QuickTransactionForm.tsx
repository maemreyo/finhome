// src/components/expenses/QuickTransactionForm.tsx
'use client'

import { useState, useEffect } from 'react'
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
  X
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
}

export function QuickTransactionForm({
  wallets,
  expenseCategories,
  incomeCategories,
  onSuccess,
  onCancel,
  className
}: QuickTransactionFormProps) {
  const t = useTranslations('QuickTransactionForm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense')

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

  const addTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()]
      setSelectedTags(newTags)
      setValue('tags', newTags)
      setCustomTag('')
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
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {transactionType === 'expense' && <Minus className="h-5 w-5 text-red-500" />}
          {transactionType === 'income' && <Plus className="h-5 w-5 text-green-500" />}
          {transactionType === 'transfer' && <ArrowRightLeft className="h-5 w-5 text-blue-500" />}
          {transactionType === 'expense' && t('expense')}
          {transactionType === 'income' && t('income')}
          {transactionType === 'transfer' && t('transfer')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type Toggle */}
          <div className="flex rounded-lg bg-muted p-1">
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
                  "flex-1 rounded-md py-2 px-3 text-sm font-medium transition-all",
                  "flex items-center justify-center gap-1",
                  transactionType === type
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === 'expense' && <Minus className="h-4 w-4" />}
                {type === 'income' && <Plus className="h-4 w-4" />}
                {type === 'transfer' && <ArrowRightLeft className="h-4 w-4" />}
                {type === 'expense' && t('expense')}
                {type === 'income' && t('income')}
                {type === 'transfer' && t('transfer')}
              </button>
            ))}
          </div>

          {/* Amount Input with Quick Buttons */}
          <div className="space-y-2">
            <Label>{t('amount')}</Label>
            <div className="relative">
              <Input
                type="number"
                step="1000"
                min="0"
                placeholder="0"
                {...form.register('amount', { valueAsNumber: true })}
                className="text-xl font-semibold pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {t('currency')}
              </div>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-1">
              {[10000, 20000, 50000, 100000, 200000, 500000].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className="text-xs px-2 py-1 h-7"
                >
                  +{(amount / 1000)}k
                </Button>
              ))}
            </div>
          </div>

          {/* Wallet Selection */}
          <div className="space-y-2">
            <Label>
              <Wallet className="inline h-4 w-4 mr-1" />
              {transactionType === 'transfer' ? t('fromWallet') : t('wallet')}
            </Label>
            <Select onValueChange={(value) => setValue('wallet_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('wallet')} />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: wallet.color }}
                      />
                      <span>{wallet.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {wallet.balance.toLocaleString('vi-VN')} {wallet.currency}
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

          {/* Category Selection */}
          {transactionType !== 'transfer' && (
            <div className="space-y-2">
              <Label>{t('category')}</Label>
              <Select onValueChange={(value) => setValue(getCategoryFieldName(), value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {getCurrentCategories().map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
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

          {/* Description */}
          <div className="space-y-2">
            <Label>{t('description')}</Label>
            <Input
              placeholder={t('descriptionPlaceholder')}
              {...form.register('description')}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              <Tag className="inline h-4 w-4 mr-1" />
              {t('tags')}
            </Label>
            <div className="flex gap-1">
              <Input
                placeholder={t('addTagPlaceholder')}
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                {t('cancel')}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('saving')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t('saveTransaction')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}