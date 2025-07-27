// src/components/expenses/RecurringTransactionForm.tsx
// Form component for creating and editing recurring transactions
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { 
  Calendar,
  Repeat,
  Plus,
  Minus,
  ArrowRightLeft,
  Wallet,
  Save,
  X,
  Clock,
  Hash,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const recurringTransactionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  wallet_id: z.string().min(1, 'Please select a wallet'),
  frequency_interval: z.number().min(1).max(365),
  transaction_type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  expense_category_id: z.string().optional(),
  income_category_id: z.string().optional(),
  transfer_to_wallet_id: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  auto_execute: z.boolean().optional(),
  reminder_enabled: z.boolean().optional(),
  max_occurrences: z.number().min(1).optional(),
  is_active: z.boolean().optional(),
})

type FormData = z.infer<typeof recurringTransactionSchema>

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

interface RecurringTransaction {
  id: string
  name: string
  wallet_id: string
  transaction_type: 'expense' | 'income' | 'transfer'
  amount: number
  description?: string
  expense_category_id?: string
  income_category_id?: string
  transfer_to_wallet_id?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  frequency_interval: number
  start_date: string
  end_date?: string
  max_occurrences?: number
  is_active: boolean
  next_due_date?: string
  occurrences_created: number
}

interface RecurringTransactionFormProps {
  wallets: Wallet[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  recurringTransaction?: RecurringTransaction // For editing
  onSuccess?: (transaction: RecurringTransaction) => void
  onCancel?: () => void
  className?: string
}

export function RecurringTransactionForm({
  wallets,
  expenseCategories,
  incomeCategories,
  recurringTransaction,
  onSuccess,
  onCancel,
  className
}: RecurringTransactionFormProps) {
  const t = useTranslations('RecurringTransactionForm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense')

  const form = useForm<FormData>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      transaction_type: 'expense',
      amount: 0,
      frequency: 'monthly',
      frequency_interval: 1,
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
      ...recurringTransaction
    }
  })

  const { watch, setValue, getValues } = form
  const currentTransactionType = watch('transaction_type')
  const selectedWalletId = watch('wallet_id')
  const frequency = watch('frequency')
  const frequencyInterval = watch('frequency_interval')

  useEffect(() => {
    setTransactionType(currentTransactionType)
  }, [currentTransactionType])

  const getCurrentCategories = () => {
    return transactionType === 'expense' ? expenseCategories : incomeCategories
  }

  const getCategoryFieldName = () => {
    return transactionType === 'expense' ? 'expense_category_id' : 'income_category_id'
  }

  const getFrequencyText = () => {
    const interval = frequencyInterval || 1
    const freq = frequency || 'monthly'
    
    if (interval === 1) {
      switch (freq) {
        case 'daily': return 'Daily'
        case 'weekly': return 'Weekly'
        case 'monthly': return 'Monthly'
        case 'yearly': return 'Yearly'
      }
    } else {
      switch (freq) {
        case 'daily': return `Every ${interval} days`
        case 'weekly': return `Every ${interval} weeks`
        case 'monthly': return `Every ${interval} months`
        case 'yearly': return `Every ${interval} years`
      }
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const url = recurringTransaction 
        ? `/api/expenses/recurring/${recurringTransaction.id}` 
        : '/api/expenses/recurring'
      
      const method = recurringTransaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save recurring transaction')
      }

      const result = await response.json()

      toast.success(
        recurringTransaction 
          ? 'Recurring transaction updated successfully!' 
          : 'Recurring transaction created successfully!'
      )

      form.reset()
      onSuccess?.( result.recurringTransaction)

    } catch (error) {
      console.error('Error saving recurring transaction:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save recurring transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-blue-500" />
          {recurringTransaction ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label>Transaction Name</Label>
            <Input
              placeholder="e.g., Monthly Rent, Weekly Groceries"
              {...form.register('name')}
              className="font-medium"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Transaction Type Toggle */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
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
                    "flex-1 rounded-md font-medium transition-all py-2 px-3 text-sm",
                    "flex items-center justify-center gap-2",
                    transactionType === type
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type === 'expense' && <Minus className="h-4 w-4" />}
                  {type === 'income' && <Plus className="h-4 w-4" />}
                  {type === 'transfer' && <ArrowRightLeft className="h-4 w-4" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <Input
                type="number"
                step="1000"
                min="0"
                placeholder="0"
                {...form.register('amount', { valueAsNumber: true })}
                className="font-semibold text-lg pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                VND
              </div>
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Wallet Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              {transactionType === 'transfer' ? 'From Wallet' : 'Wallet'}
            </Label>
            <Select onValueChange={(value) => setValue('wallet_id', value)} value={watch('wallet_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet" />
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
              <Label>To Wallet</Label>
              <Select onValueChange={(value) => setValue('transfer_to_wallet_id', value)} value={watch('transfer_to_wallet_id')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination wallet" />
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
              <Label>Category</Label>
              <Select onValueChange={(value) => setValue(getCategoryFieldName(), value)} value={watch(getCategoryFieldName())}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

          {/* Frequency Settings */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <Label className="flex items-center gap-1 text-base font-medium">
              <Clock className="h-4 w-4" />
              Frequency Settings
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Repeat</Label>
                <Select onValueChange={(value: any) => setValue('frequency', value)} value={frequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Every</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  {...form.register('frequency_interval', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-background p-2 rounded border">
              <strong>Summary:</strong> {getFrequencyText()}
            </div>
          </div>

          {/* Date Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                type="date"
                {...form.register('start_date')}
              />
              {form.formState.errors.start_date && (
                <p className="text-sm text-red-500">{form.formState.errors.start_date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                {...form.register('end_date')}
              />
            </div>
          </div>

          {/* Max Occurrences */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Max Occurrences (Optional)
            </Label>
            <Input
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
              {...form.register('max_occurrences', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              How many times should this transaction repeat? Leave empty for unlimited.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Additional details about this recurring transaction"
              {...form.register('description')}
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                When active, this transaction will be created automatically according to the schedule.
              </p>
            </div>
            <Switch
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
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
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {recurringTransaction ? 'Update' : 'Create'} Recurring Transaction
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}