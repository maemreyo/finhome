// src/components/expenses/RecurringTransactionsList.tsx
// Component for displaying and managing recurring transactions
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { 
  Repeat,
  Plus,
  Minus,
  ArrowRightLeft,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Wallet,
  Play,
  Pause,
  Eye,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RecurringTransactionForm } from './RecurringTransactionForm'

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
  expense_category?: Category
  income_category?: Category
  wallet?: Wallet
  transfer_wallet?: Wallet
  created_transactions?: Array<{
    id: string
    amount: number
    transaction_date: string
    created_at: string
  }>
}

interface RecurringTransactionsListProps {
  wallets: Wallet[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  className?: string
}

export function RecurringTransactionsList({
  wallets,
  expenseCategories,
  incomeCategories,
  className
}: RecurringTransactionsListProps) {
  const t = useTranslations('RecurringTransactionsList')
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<RecurringTransaction | null>(null)
  const [viewingTransaction, setViewingTransaction] = useState<RecurringTransaction | null>(null)

  const loadRecurringTransactions = async () => {
    try {
      const response = await fetch('/api/expenses/recurring')
      if (!response.ok) {
        throw new Error('Failed to fetch recurring transactions')
      }
      const data = await response.json()
      setRecurringTransactions(data.recurringTransactions || [])
    } catch (error) {
      console.error('Error loading recurring transactions:', error)
      toast.error('Failed to load recurring transactions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecurringTransactions()
  }, [])

  const handleCreateSuccess = (transaction: RecurringTransaction) => {
    setRecurringTransactions(prev => [transaction, ...prev])
    setShowCreateForm(false)
    toast.success('Recurring transaction created successfully!')
  }

  const handleEditSuccess = (transaction: RecurringTransaction) => {
    setRecurringTransactions(prev => 
      prev.map(t => t.id === transaction.id ? transaction : t)
    )
    setEditingTransaction(null)
    toast.success('Recurring transaction updated successfully!')
  }

  const handleDelete = async (transaction: RecurringTransaction) => {
    try {
      const response = await fetch(`/api/expenses/recurring/${transaction.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recurring transaction')
      }

      setRecurringTransactions(prev => prev.filter(t => t.id !== transaction.id))
      setDeletingTransaction(null)
      toast.success('Recurring transaction deleted successfully!')
    } catch (error) {
      console.error('Error deleting recurring transaction:', error)
      toast.error('Failed to delete recurring transaction')
    }
  }

  const handleToggleActive = async (transaction: RecurringTransaction) => {
    try {
      const response = await fetch(`/api/expenses/recurring/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !transaction.is_active
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update recurring transaction')
      }

      const { recurringTransaction: updatedTransaction } = await response.json()
      setRecurringTransactions(prev => 
        prev.map(t => t.id === transaction.id ? updatedTransaction : t)
      )
      
      toast.success(
        updatedTransaction.is_active 
          ? 'Recurring transaction activated' 
          : 'Recurring transaction paused'
      )
    } catch (error) {
      console.error('Error toggling recurring transaction:', error)
      toast.error('Failed to update recurring transaction')
    }
  }

  const getFrequencyText = (frequency: string, interval: number) => {
    if (interval === 1) {
      switch (frequency) {
        case 'daily': return 'Daily'
        case 'weekly': return 'Weekly'
        case 'monthly': return 'Monthly'
        case 'yearly': return 'Yearly'
        default: return frequency
      }
    } else {
      switch (frequency) {
        case 'daily': return `Every ${interval} days`
        case 'weekly': return `Every ${interval} weeks`
        case 'monthly': return `Every ${interval} months`
        case 'yearly': return `Every ${interval} years`
        default: return `Every ${interval} ${frequency}`
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusColor = (transaction: RecurringTransaction) => {
    if (!transaction.is_active) return 'bg-gray-500'
    
    if (transaction.next_due_date) {
      const nextDue = new Date(transaction.next_due_date)
      const today = new Date()
      const diffTime = nextDue.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'bg-red-500' // Overdue
      if (diffDays === 0) return 'bg-orange-500' // Due today
      if (diffDays <= 3) return 'bg-yellow-500' // Due soon
    }
    
    return 'bg-green-500' // Active and future
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recurring Transactions</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Repeat className="h-5 w-5 text-blue-500" />
          Recurring Transactions
        </h2>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Recurring Transaction
        </Button>
      </div>

      {recurringTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recurring Transactions</h3>
            <p className="text-muted-foreground mb-4">
              Set up recurring transactions to automate your regular income and expenses.
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Recurring Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recurringTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-2 h-2 rounded-full", getStatusColor(transaction))} />
                      
                      {transaction.transaction_type === 'expense' && (
                        <Minus className="h-4 w-4 text-red-500" />
                      )}
                      {transaction.transaction_type === 'income' && (
                        <Plus className="h-4 w-4 text-green-500" />
                      )}
                      {transaction.transaction_type === 'transfer' && (
                        <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                      )}
                      
                      <h3 className="font-medium">{transaction.name}</h3>
                      
                      {!transaction.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Paused
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">
                          {transaction.amount.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Frequency</p>
                        <p className="font-medium">
                          {getFrequencyText(transaction.frequency, transaction.frequency_interval)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Next Due</p>
                        <p className="font-medium">
                          {transaction.next_due_date ? formatDate(transaction.next_due_date) : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{transaction.occurrences_created} times</p>
                      </div>
                    </div>

                    {transaction.description && (
                      <p className="text-sm text-muted-foreground mt-2">{transaction.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingTransaction(transaction)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(transaction)}
                    >
                      {transaction.is_active ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingTransaction(transaction)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Recurring Transaction</DialogTitle>
          </DialogHeader>
          <RecurringTransactionForm
            wallets={wallets}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recurring Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <RecurringTransactionForm
              wallets={wallets}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              recurringTransaction={editingTransaction}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTransaction} onOpenChange={() => setDeletingTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Recurring Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTransaction?.name}"? This action cannot be undone.
              Any transactions already created from this recurring transaction will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTransaction && handleDelete(deletingTransaction)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-blue-500" />
              {viewingTransaction?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex items-center gap-2">
                    {viewingTransaction.transaction_type === 'expense' && (
                      <Minus className="h-4 w-4 text-red-500" />
                    )}
                    {viewingTransaction.transaction_type === 'income' && (
                      <Plus className="h-4 w-4 text-green-500" />
                    )}
                    {viewingTransaction.transaction_type === 'transfer' && (
                      <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="capitalize">{viewingTransaction.transaction_type}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">
                    {viewingTransaction.amount.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p>{getFrequencyText(viewingTransaction.frequency, viewingTransaction.frequency_interval)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={viewingTransaction.is_active ? "default" : "secondary"}>
                    {viewingTransaction.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p>{formatDate(viewingTransaction.start_date)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Next Due</p>
                  <p>{viewingTransaction.next_due_date ? formatDate(viewingTransaction.next_due_date) : 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Occurrences Created</p>
                <p>{viewingTransaction.occurrences_created} transactions</p>
              </div>

              {viewingTransaction.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{viewingTransaction.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}