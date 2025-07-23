// src/components/expenses/RecurringTransactionStatus.tsx
// Dashboard widget showing recurring transaction status and due items
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  Repeat,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  ArrowRightLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { recurringTransactionScheduler, RecurringTransactionStatus } from '@/lib/services/recurringTransactionScheduler'

interface RecurringTransactionStatusProps {
  className?: string
  onViewAll?: () => void
}

export function RecurringTransactionStatusWidget({
  className,
  onViewAll
}: RecurringTransactionStatusProps) {
  const [status, setStatus] = useState<RecurringTransactionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadStatus = async () => {
    try {
      const statusData = await recurringTransactionScheduler.getRecurringTransactionStatus()
      setStatus(statusData)
    } catch (error) {
      console.error('Error loading recurring transaction status:', error)
      toast.error('Failed to load recurring transaction status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadStatus()
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadStatus()
    // Refresh every 5 minutes
    const interval = setInterval(loadStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`
    if (diffDays <= 7) return `${diffDays} days`
    
    return date.toLocaleDateString('vi-VN')
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'expense': return <Minus className="h-3 w-3 text-red-500" />
      case 'income': return <Plus className="h-3 w-3 text-green-500" />
      case 'transfer': return <ArrowRightLeft className="h-3 w-3 text-blue-500" />
      default: return null
    }
  }

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recurring Transactions</CardTitle>
          <Repeat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recurring Transactions</CardTitle>
          <Repeat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Failed to load status</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { dueTransactions, upcomingTransactions, processingStatus } = status

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Repeat className="h-4 w-4 text-blue-500" />
          Recurring Transactions
          {isRefreshing && <Loader2 className="h-3 w-3 animate-spin" />}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewAll}
          className="text-xs"
        >
          View All
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {processingStatus.hasDueTransactions && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">
                  {processingStatus.dueCount} due
                </span>
              </div>
            )}
            
            {processingStatus.upcomingCount > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  {processingStatus.upcomingCount} upcoming
                </span>
              </div>
            )}
            
            {!processingStatus.hasDueTransactions && processingStatus.upcomingCount === 0 && (
              <span className="text-sm text-muted-foreground">All up to date</span>
            )}
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <Clock className="h-3 w-3" />
          </Button>
        </div>

        {/* Due Transactions */}
        {dueTransactions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <h4 className="text-sm font-medium">Due Now</h4>
            </div>
            <div className="space-y-2">
              {dueTransactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.transaction_type)}
                    <span className="text-sm font-medium">{transaction.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {transaction.amount.toLocaleString('vi-VN')} VND
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.next_due_date)}
                    </p>
                  </div>
                </div>
              ))}
              {dueTransactions.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{dueTransactions.length - 3} more due transactions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Transactions */}
        {upcomingTransactions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium">Upcoming (Next 7 days)</h4>
            </div>
            <div className="space-y-1">
              {upcomingTransactions.slice(0, 2).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.transaction_type)}
                    <span className="text-sm">{transaction.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {transaction.amount.toLocaleString('vi-VN')} VND
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.next_due_date)}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingTransactions.length > 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{upcomingTransactions.length - 2} more upcoming
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!processingStatus.hasDueTransactions && processingStatus.upcomingCount === 0 && (
          <div className="text-center py-4">
            <Repeat className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recurring transactions scheduled</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}