// src/app/test-recurring/page.tsx
// Test page for recurring transactions functionality (development only)
'use client'

import { useState, useEffect } from 'react'
import { RecurringTransactionForm } from '@/components/expenses/RecurringTransactionForm'
import { RecurringTransactionsList } from '@/components/expenses/RecurringTransactionsList'
import { RecurringTransactionStatusWidget } from '@/components/expenses/RecurringTransactionStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

// Mock data for testing
const mockWallets = [
  {
    id: '1',
    name: 'Main Cash',
    balance: 1000000,
    currency: 'VND',
    icon: 'wallet',
    color: '#3B82F6',
    wallet_type: 'cash'
  },
  {
    id: '2',
    name: 'Savings Account',
    balance: 5000000,
    currency: 'VND',
    icon: 'bank',
    color: '#10B981',
    wallet_type: 'bank_account'
  }
]

const mockExpenseCategories = [
  {
    id: '1',
    name_en: 'Food & Dining',
    name_vi: 'Ăn uống',
    icon: 'utensils',
    color: '#F59E0B',
    category_key: 'food_dining'
  },
  {
    id: '2',
    name_en: 'Transportation',
    name_vi: 'Đi lại',
    icon: 'car',
    color: '#3B82F6',
    category_key: 'transportation'
  }
]

const mockIncomeCategories = [
  {
    id: '1',
    name_en: 'Salary',
    name_vi: 'Lương',
    icon: 'briefcase',
    color: '#10B981',
    category_key: 'salary'
  }
]

export default function TestRecurringPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcessRecurring = async () => {
    if (process.env.NODE_ENV === 'production') {
      toast.error('This is a development-only feature')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/expenses/recurring/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_RECURRING_PROCESSOR_API_KEY || 'recurring_processor_secret_key_2025'}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to process recurring transactions')
      }

      const result = await response.json()
      toast.success(`Processed ${result.processedCount} recurring transactions`)
      
      if (result.errors.length > 0) {
        toast.error(`${result.errorCount} errors occurred`)
      }
    } catch (error) {
      console.error('Error processing recurring transactions:', error)
      toast.error('Failed to process recurring transactions')
    } finally {
      setIsProcessing(false)
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-semibold mb-2">Test Page Not Available</h1>
            <p className="text-muted-foreground">
              This test page is only available in development mode.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recurring Transactions Test</h1>
        <p className="text-muted-foreground">
          Development test page for recurring transactions functionality
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">List & Management</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="status">Status Widget</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <RecurringTransactionsList
            wallets={mockWallets}
            expenseCategories={mockExpenseCategories}
            incomeCategories={mockIncomeCategories}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <RecurringTransactionForm
            wallets={mockWallets}
            expenseCategories={mockExpenseCategories}
            incomeCategories={mockIncomeCategories}
            onSuccess={(transaction) => {
              toast.success('Recurring transaction created!')
              setActiveTab('list')
            }}
          />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RecurringTransactionStatusWidget
              onViewAll={() => setActiveTab('list')}
            />
            <Card>
              <CardHeader>
                <CardTitle>Widget Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This widget shows the status of recurring transactions and can be embedded
                  in dashboards or other pages. It displays due transactions and upcoming
                  transactions for the next 7 days.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                In production, this would be handled by a scheduled job or cron. 
                For testing, you can manually trigger the processing here.
              </p>
              <Button 
                onClick={handleProcessRecurring}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Process Due Recurring Transactions'}
              </Button>
              <div className="text-xs text-muted-foreground">
                <p><strong>Note:</strong> This will create actual transactions for any due recurring transactions.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}