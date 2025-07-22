// src/components/expenses/TransactionsList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowUpDown, 
  Search, 
  Filter,
  Plus,
  Minus,
  ArrowRightLeft,
  Calendar,
  Edit,
  Trash2,
  Camera,
  MapPin,
  Tag,
  Wallet
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Transaction {
  id: string
  transaction_type: 'expense' | 'income' | 'transfer'
  amount: number
  description?: string
  notes?: string
  transaction_date: string
  merchant_name?: string
  tags?: string[]
  receipt_images?: string[]
  wallet: {
    id: string
    name: string
    icon: string
    color: string
  }
  transfer_wallet?: {
    id: string
    name: string
    icon: string
    color: string
  }
  expense_category?: {
    id: string
    name_vi: string
    name_en: string
    icon: string
    color: string
  }
  income_category?: {
    id: string
    name_vi: string
    name_en: string
    icon: string
    color: string
  }
  created_at: string
}

interface TransactionsListProps {
  transactions: Transaction[]
  loading?: boolean
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transactionId: string) => void
  onRefresh?: () => void
  className?: string
}

export function TransactionsList({
  transactions,
  loading = false,
  onEdit,
  onDelete,
  onRefresh,
  className
}: TransactionsListProps) {
  const t = useTranslations('TransactionsList')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    setFilteredTransactions(transactions)
  }, [transactions])

  useEffect(() => {
    let filtered = [...transactions]

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.transaction_type === typeFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.transaction_date)
        switch (dateFilter) {
          case 'today':
            return isToday(transactionDate)
          case 'yesterday':
            return isYesterday(transactionDate)
          case 'week':
            return isThisWeek(transactionDate, { locale: vi })
          case 'month':
            return isThisMonth(transactionDate)
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0
      
      if (sortBy === 'date') {
        compareValue = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
      } else if (sortBy === 'amount') {
        compareValue = a.amount - b.amount
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, typeFilter, dateFilter, sortBy, sortOrder])

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.transaction_type === 'expense') {
      return <Minus className="h-4 w-4 text-red-500" />
    } else if (transaction.transaction_type === 'income') {
      return <Plus className="h-4 w-4 text-green-500" />
    } else {
      return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
    }
  }

  const getAmountColor = (transaction: Transaction) => {
    if (transaction.transaction_type === 'expense') return 'text-red-600 dark:text-red-400'
    if (transaction.transaction_type === 'income') return 'text-green-600 dark:text-green-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  const getAmountPrefix = (transaction: Transaction) => {
    if (transaction.transaction_type === 'expense') return '-'
    if (transaction.transaction_type === 'income') return '+'
    return ''
  }

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups = transactions.reduce((acc, transaction) => {
      const date = transaction.transaction_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(transaction)
      return acc
    }, {} as Record<string, Transaction[]>)

    return Object.entries(groups).sort(([a], [b]) => 
      sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b)
    )
  }

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString)
    
    if (isToday(date)) return t('today')
    if (isYesterday(date)) return t('yesterday')
    
    return format(date, 'EEEE, dd MMMM yyyy', { locale: vi })
  }

  const calculateDayTotal = (dayTransactions: Transaction[]) => {
    return dayTransactions.reduce((total, transaction) => {
      if (transaction.transaction_type === 'expense') {
        return total - transaction.amount
      } else if (transaction.transaction_type === 'income') {
        return total + transaction.amount
      }
      return total // transfers don't affect total
    }, 0)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2 mt-1" />
                  </div>
                  <div className="h-5 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedTransactions = groupTransactionsByDate(filteredTransactions)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              {t('refresh')}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="expense">{t('expense')}</SelectItem>
                <SelectItem value="income">{t('income')}</SelectItem>
                <SelectItem value="transfer">{t('transfer')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="today">{t('today')}</SelectItem>
                <SelectItem value="yesterday">{t('yesterday')}</SelectItem>
                <SelectItem value="week">{t('thisWeek')}</SelectItem>
                <SelectItem value="month">{t('thisMonth')}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {groupedTransactions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Wallet className="h-8 w-8" />
              <p>{t('noTransactions')}</p>
              <p className="text-sm">{t('noTransactionsDescription')}</p>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {groupedTransactions.map(([date, dayTransactions]) => {
              const dayTotal = calculateDayTotal(dayTransactions)
              
              return (
                <div key={date} className="border-b border-border last:border-b-0">
                  {/* Date Header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{formatDateHeader(date)}</h4>
                      <div className={cn(
                        "text-sm font-medium",
                        dayTotal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
                      </div>
                    </div>
                  </div>

                  {/* Transactions for this day */}
                  <div className="divide-y divide-border">
                    {dayTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 hover:bg-muted/50">
                        <div className="flex items-start gap-3">
                          {/* Transaction Icon & Category */}
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full"
                                 style={{ 
                                   backgroundColor: (transaction.expense_category?.color || 
                                                   transaction.income_category?.color || 
                                                   '#3B82F6') + '20' 
                                 }}>
                              {getTransactionIcon(transaction)}
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm truncate">
                                  {transaction.description || 
                                   transaction.expense_category?.name_vi || 
                                   transaction.income_category?.name_vi ||
                                   (transaction.transaction_type === 'transfer' ? t('transfer') : t('transaction'))}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Wallet className="h-3 w-3" />
                                    <span>{transaction.wallet.name}</span>
                                  </div>
                                  
                                  {transaction.transfer_wallet && (
                                    <>
                                      <ArrowRightLeft className="h-3 w-3" />
                                      <span>{transaction.transfer_wallet.name}</span>
                                    </>
                                  )}
                                  
                                  <span>•</span>
                                  <span>{format(parseISO(transaction.transaction_date + 'T00:00:00'), 'HH:mm')}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className={cn("font-semibold", getAmountColor(transaction))}>
                                  {getAmountPrefix(transaction)}{formatCurrency(transaction.amount)}
                                </div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center gap-2 mt-2">
                              {transaction.merchant_name && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {transaction.merchant_name}
                                </Badge>
                              )}
                              
                              {transaction.receipt_images && transaction.receipt_images.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Camera className="h-3 w-3 mr-1" />
                                  {transaction.receipt_images.length}
                                </Badge>
                              )}

                              {transaction.tags && transaction.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {transaction.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                  {transaction.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{transaction.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {transaction.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {transaction.notes}
                              </p>
                            )}

                            {/* Action Buttons */}
                            {(onEdit || onDelete) && (
                              <div className="flex gap-1 mt-2">
                                {onEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => onEdit(transaction)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    {t('edit')}
                                  </Button>
                                )}
                                {onDelete && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                    onClick={() => onDelete(transaction.id)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    {t('delete')}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}