// src/components/expenses/ConversationalTransactionDialog.tsx
// Confirmation dialog for AI-parsed transactions with editable fields
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { 
  Brain, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles, 
  Hash, 
  Wallet,
  DollarSign,
  Tag,
  Calendar,
  FileText,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Transaction validation schema
const transactionSchema = z.object({
  transaction_type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive(),
  description: z.string().min(1),
  expense_category_id: z.string().optional(),
  income_category_id: z.string().optional(),
  wallet_id: z.string().min(1),
  tags: z.array(z.string()).default([]),
  transaction_date: z.string().optional(),
  notes: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface ParsedTransaction {
  transaction_type: 'expense' | 'income' | 'transfer'
  amount: number
  description: string
  suggested_category_id?: string
  suggested_category_name?: string
  suggested_tags: string[]
  suggested_wallet_id?: string
  confidence_score: number
  extracted_merchant?: string
  extracted_date?: string
  notes?: string
  is_unusual?: boolean
  unusual_reasons?: string[]
  parsing_context?: {
    original_text: string
    processing_timestamp: string
    user_id: string
  }
}

interface ParsedData {
  transactions: ParsedTransaction[]
  analysis_summary?: string
  metadata?: {
    total_transactions: number
    processing_time: string
    ai_model: string
  }
}

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

interface ConversationalTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  parsedData: ParsedData | null
  wallets: Wallet[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  onConfirm: (transactions: TransactionFormData[]) => void
  onCorrection?: (correction: any) => void
  originalText: string
}

export function ConversationalTransactionDialog({
  isOpen,
  onClose,
  parsedData,
  wallets,
  expenseCategories,
  incomeCategories,
  onConfirm,
  onCorrection,
  originalText
}: ConversationalTransactionDialogProps) {
  const t = useTranslations('UnifiedTransactionForm')
  const [editingTransactions, setEditingTransactions] = useState<TransactionFormData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Initialize editing transactions when parsedData changes
  useEffect(() => {
    if (parsedData?.transactions) {
      const initialTransactions = parsedData.transactions.map(transaction => ({
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        description: transaction.description,
        expense_category_id: transaction.transaction_type === 'expense' ? transaction.suggested_category_id : undefined,
        income_category_id: transaction.transaction_type === 'income' ? transaction.suggested_category_id : undefined,
        wallet_id: transaction.suggested_wallet_id || wallets[0]?.id || '',
        tags: transaction.suggested_tags || [],
        transaction_date: transaction.extracted_date || new Date().toISOString().split('T')[0],
        notes: transaction.notes || '',
      }))
      setEditingTransactions(initialTransactions)
    }
  }, [parsedData, wallets])

  const updateTransaction = (index: number, field: keyof TransactionFormData, value: any) => {
    setEditingTransactions(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      // Track corrections for learning
      if (parsedData?.transactions[index] && onCorrection) {
        const original = parsedData.transactions[index]
        const correctionType = determineCorrectionType(field, original, updated[index])
        
        onCorrection({
          input_text: originalText,
          original_suggestion: original,
          corrected_data: updated[index],
          correction_type: correctionType,
        })
      }
      
      return updated
    })
  }

  const determineCorrectionType = (field: keyof TransactionFormData, original: ParsedTransaction, corrected: TransactionFormData): string => {
    switch (field) {
      case 'expense_category_id':
      case 'income_category_id':
        return 'category_change'
      case 'amount':
        return 'amount_change'
      case 'description':
        return 'description_change'
      case 'transaction_type':
        return 'transaction_type_change'
      case 'tags':
        return 'tags_change'
      case 'wallet_id':
        return 'wallet_change'
      default:
        return 'multiple_changes'
    }
  }

  const getCurrentCategories = (transactionType: string) => {
    return transactionType === 'expense' ? expenseCategories : incomeCategories
  }

  const addTag = (transactionIndex: number, tag: string) => {
    if (tag.trim() && !editingTransactions[transactionIndex]?.tags.includes(tag)) {
      const newTags = [...(editingTransactions[transactionIndex]?.tags || []), tag.trim()]
      updateTransaction(transactionIndex, 'tags', newTags)
    }
  }

  const removeTag = (transactionIndex: number, tagToRemove: string) => {
    const newTags = editingTransactions[transactionIndex]?.tags.filter(tag => tag !== tagToRemove) || []
    updateTransaction(transactionIndex, 'tags', newTags)
  }

  const handleConfirm = async () => {
    if (!editingTransactions.length) return

    try {
      setIsSubmitting(true)
      
      // Validate all transactions
      const validatedTransactions = editingTransactions.map((transaction, index) => {
        try {
          return transactionSchema.parse(transaction)
        } catch (error) {
          throw new Error(`Transaction ${index + 1}: ${error instanceof z.ZodError ? error.issues[0].message : 'Invalid data'}`)
        }
      })

      await onConfirm(validatedTransactions)
      onClose()
      
    } catch (error) {
      console.error('Error confirming transactions:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to confirm transactions')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalAmount = () => {
    return editingTransactions.reduce((total, transaction) => {
      return transaction.transaction_type === 'expense' 
        ? total - transaction.amount 
        : total + transaction.amount
    }, 0)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (!parsedData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Transaction Analysis
            <Badge variant="secondary" className="ml-2">
              {parsedData.transactions.length} transaction{parsedData.transactions.length !== 1 ? 's' : ''} found
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {/* Analysis Summary */}
            {parsedData.analysis_summary && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Analysis:</strong> {parsedData.analysis_summary}
                </AlertDescription>
              </Alert>
            )}

            {/* Original Text Display */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Your Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">"{originalText}"</p>
              </CardContent>
            </Card>

            {/* Advanced Options Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="advanced-options"
                  checked={showAdvancedOptions}
                  onCheckedChange={setShowAdvancedOptions}
                />
                <Label htmlFor="advanced-options" className="text-sm">
                  Show advanced editing options
                </Label>
              </div>
            </div>

            {/* Transaction Cards */}
            <div className="space-y-4">
              {parsedData.transactions.map((original, index) => {
                const editing = editingTransactions[index]
                if (!editing) return null

                return (
                  <Card key={index} className={cn(
                    "border-2 transition-all duration-200",
                    original.is_unusual 
                      ? "border-red-400 bg-red-50/30 dark:bg-red-900/10 shadow-red-100 dark:shadow-red-900/20 shadow-lg" 
                      : "border-gray-200 dark:border-gray-700"
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            editing.transaction_type === 'expense' ? "bg-red-100 text-red-700" :
                            editing.transaction_type === 'income' ? "bg-green-100 text-green-700" :
                            "bg-blue-100 text-blue-700"
                          )}>
                            {index + 1}
                          </div>
                          {editing.transaction_type === 'expense' ? 'Expense' : 
                           editing.transaction_type === 'income' ? 'Income' : 'Transfer'}
                        </CardTitle>
                        
                        <Badge className={cn("text-xs", getConfidenceColor(original.confidence_score))}>
                          <Brain className="h-3 w-3 mr-1" />
                          {Math.round(original.confidence_score * 100)}% confident
                        </Badge>
                      </div>
                    </CardHeader>

                    {/* UNUSUAL TRANSACTION WARNING - Most Important */}
                    {original.is_unusual && (
                      <div className="mx-6 -mt-2 mb-4">
                        <Alert variant="destructive" className="border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
                          <AlertCircle className="h-5 w-5" />
                          <AlertDescription className="font-semibold">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-red-800 dark:text-red-200 text-base font-bold">
                                ⚠️ UNUSUAL TRANSACTION DETECTED
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                VERIFY CAREFULLY
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              {original.unusual_reasons?.map((reason, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-red-600 dark:text-red-400">•</span>
                                  <span className="text-red-700 dark:text-red-300">{reason}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-300">
                              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                                <Sparkles className="h-4 w-4" />
                                Please double-check the amount: <span className="font-bold text-lg">{editing.amount.toLocaleString('vi-VN')} VND</span>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <CardContent className="space-y-6">
                      {/* CRITICAL SECTION: Amount - Most Important Field */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                        <Label className="text-base font-bold text-primary flex items-center gap-2 mb-3">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                          Amount (VND)
                          <Badge variant="outline" className="ml-2 text-xs border-orange-300 text-orange-700 bg-orange-50">
                            Critical - Verify carefully
                          </Badge>
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={editing.amount}
                            onChange={(e) => updateTransaction(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="text-2xl font-bold h-14 text-center border-2 focus:border-blue-500"
                            style={{ fontSize: '1.5rem' }}
                          />
                          <div className="text-lg font-semibold text-muted-foreground">
                            = {editing.amount.toLocaleString('vi-VN')} VND
                          </div>
                        </div>
                        {/* Visual comparison with original if different */}
                        {original.amount !== editing.amount && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                              <AlertCircle className="h-4 w-4" />
                              Original AI suggestion: {original.amount.toLocaleString('vi-VN')} VND
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Transaction Type & Wallet - Secondary Important */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border">
                          <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <div className={cn(
                              "w-4 h-4 rounded-full",
                              editing.transaction_type === 'expense' ? "bg-red-500" :
                              editing.transaction_type === 'income' ? "bg-green-500" :
                              "bg-blue-500"
                            )} />
                            Transaction Type
                          </Label>
                          <div className={cn(
                            "mt-2 py-2 px-3 rounded-md text-center font-bold text-sm",
                            editing.transaction_type === 'expense' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" :
                            editing.transaction_type === 'income' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" :
                            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                          )}>
                            {editing.transaction_type === 'expense' ? '💸 EXPENSE' : 
                             editing.transaction_type === 'income' ? '💰 INCOME' : '🔄 TRANSFER'}
                          </div>
                        </div>

                        {/* Wallet */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border">
                          <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Wallet className="h-4 w-4 text-blue-600" />
                            Wallet Source
                          </Label>
                          <Select 
                            value={editing.wallet_id} 
                            onValueChange={(value) => updateTransaction(index, 'wallet_id', value)}
                          >
                            <SelectTrigger className="mt-2 h-10 font-medium">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: wallet.color }}
                                    />
                                    <span className="font-medium">{wallet.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {wallet.balance.toLocaleString('vi-VN')} VND
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Description - Important Field */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                        <Label className="text-sm font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Edit3 className="h-4 w-4 text-blue-600" />
                          Transaction Description
                          <Badge variant="outline" className="ml-2 text-xs border-blue-300 text-blue-700 bg-blue-50">
                            Important
                          </Badge>
                        </Label>
                        <Input
                          value={editing.description}
                          onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                          className="mt-2 h-10 font-medium text-base"
                          placeholder="What was this transaction for?"
                        />
                        {/* Show AI suggestion if different */}
                        {original.description !== editing.description && (
                          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                            💡 AI suggested: "{original.description}"
                          </div>
                        )}
                      </div>

                      {/* Category - Important Field */}
                      {editing.transaction_type !== 'transfer' && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <Label className="text-sm font-semibold flex items-center gap-2 text-green-800 dark:text-green-200">
                            <Tag className="h-4 w-4 text-green-600" />
                            Category
                            <Badge variant="outline" className="ml-2 text-xs border-green-300 text-green-700 bg-green-50">
                              Important
                            </Badge>
                            {original.suggested_category_name && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                💡 AI suggested: {original.suggested_category_name}
                              </Badge>
                            )}
                          </Label>
                          <Select 
                            value={editing.transaction_type === 'expense' ? editing.expense_category_id : editing.income_category_id} 
                            onValueChange={(value) => {
                              const field = editing.transaction_type === 'expense' ? 'expense_category_id' : 'income_category_id'
                              updateTransaction(index, field, value)
                            }}
                          >
                            <SelectTrigger className="mt-2 h-10 font-medium">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCurrentCategories(editing.transaction_type).map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="font-medium">{category.name_vi}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Tags */}
                      <div>
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Tags
                          {original.suggested_tags.length > 0 && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              AI suggested {original.suggested_tags.length} tags
                            </Badge>
                          )}
                        </Label>
                        
                        {/* Current Tags */}
                        {editing.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                            {editing.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs pr-1">
                                {tag}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0.5 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => removeTag(index, tag)}
                                >
                                  <X className="h-2.5 w-2.5" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* AI Suggested Tags (if different from current) */}
                        {original.suggested_tags.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">AI suggestions:</p>
                            <div className="flex flex-wrap gap-1">
                              {original.suggested_tags
                                .filter(tag => !editing.tags.includes(tag))
                                .map((tag, tagIndex) => (
                                <Button
                                  key={tagIndex}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addTag(index, tag)}
                                  className="h-6 px-2 text-xs border-dashed hover:border-solid"
                                >
                                  <Hash className="h-2.5 w-2.5 mr-1" />
                                  {tag}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Advanced Options */}
                      {showAdvancedOptions && (
                        <div className="space-y-3 pt-2 border-t">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Transaction Date */}
                            <div>
                              <Label className="text-sm font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Date
                              </Label>
                              <Input
                                type="date"
                                value={editing.transaction_date}
                                onChange={(e) => updateTransaction(index, 'transaction_date', e.target.value)}
                                className="mt-1"
                              />
                            </div>

                            {/* Transaction Type */}
                            <div>
                              <Label className="text-sm font-medium">Transaction Type</Label>
                              <Select 
                                value={editing.transaction_type} 
                                onValueChange={(value: 'expense' | 'income' | 'transfer') => {
                                  updateTransaction(index, 'transaction_type', value)
                                  // Clear category when changing type
                                  updateTransaction(index, 'expense_category_id', undefined)
                                  updateTransaction(index, 'income_category_id', undefined)
                                }}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="expense">Expense</SelectItem>
                                  <SelectItem value="income">Income</SelectItem>
                                  <SelectItem value="transfer">Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <Label className="text-sm font-medium">Notes</Label>
                            <Textarea
                              value={editing.notes || ''}
                              onChange={(e) => updateTransaction(index, 'notes', e.target.value)}
                              className="mt-1"
                              placeholder="Additional notes..."
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Summary */}
            {editingTransactions.length > 1 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Impact:</span>
                    <div className={cn(
                      "font-bold text-lg",
                      getTotalAmount() >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {getTotalAmount() >= 0 ? '+' : ''}{getTotalAmount().toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || !editingTransactions.length}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Confirm {editingTransactions.length} Transaction{editingTransactions.length !== 1 ? 's' : ''}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}