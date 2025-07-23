// src/components/expenses/ExampleUsage.tsx
// Example implementation showing how to use the enhanced quick transaction form
'use client'

import { useState, useEffect } from 'react'
import { UnifiedTransactionForm } from './UnifiedTransactionForm'
import { TransactionsList } from './TransactionsList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Plus } from 'lucide-react'

// Mock data for demonstration
const mockWallets = [
  { 
    id: '1', 
    name: 'Ví Chính', 
    balance: 5000000, 
    currency: 'VND', 
    icon: 'wallet', 
    color: '#3B82F6', 
    wallet_type: 'cash' 
  },
  { 
    id: '2', 
    name: 'Techcombank', 
    balance: 15000000, 
    currency: 'VND', 
    icon: 'credit-card', 
    color: '#10B981', 
    wallet_type: 'bank_account' 
  }
]

const mockExpenseCategories = [
  { id: '1', name_en: 'Food & Dining', name_vi: 'Ăn uống', icon: 'utensils', color: '#F59E0B', category_key: 'food_dining' },
  { id: '2', name_en: 'Transportation', name_vi: 'Đi lại', icon: 'car', color: '#3B82F6', category_key: 'transportation' },
  { id: '3', name_en: 'Shopping', name_vi: 'Mua sắm', icon: 'shopping-bag', color: '#8B5CF6', category_key: 'shopping' }
]

const mockIncomeCategories = [
  { id: '1', name_en: 'Salary', name_vi: 'Lương', icon: 'briefcase', color: '#10B981', category_key: 'salary' },
  { id: '2', name_en: 'Freelance', name_vi: 'Freelance', icon: 'users', color: '#8B5CF6', category_key: 'freelance' }
]

export function ExampleUsage() {
  const [transactions, setTransactions] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Mock function to fetch transactions
  const fetchTransactions = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real implementation, this would fetch from /api/expenses
    setRefreshing(false)
  }

  const handleTransactionSuccess = () => {
    setShowForm(false)
    fetchTransactions() // Refresh the list
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quick Transaction Entry - Enhanced</h1>
          <p className="text-muted-foreground">Streamlined expense tracking with intelligent suggestions</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchTransactions}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Hide Form' : 'Add Transaction'}
          </Button>
        </div>
      </div>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">✨ New Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🚀 Quick Mode</h4>
              <p className="text-muted-foreground">Compact UI for 2-3 click entry with keyboard shortcuts</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🏷️ Smart Tags</h4>
              <p className="text-muted-foreground">Auto-suggestions based on your transaction history</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Power User Features</h4>
              <p className="text-muted-foreground">Keyboard shortcuts, quick amounts, and smart defaults</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Transaction Entry</TabsTrigger>
          <TabsTrigger value="list">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          {showForm ? (
            <UnifiedTransactionForm
              wallets={mockWallets}
              expenseCategories={mockExpenseCategories}
              incomeCategories={mockIncomeCategories}
              onSuccess={handleTransactionSuccess}
              onCancel={() => setShowForm(false)}
              userId="mock-user-id"
              defaultQuickMode={true}
              defaultAiMode={false}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ready to track expenses?</h3>
                    <p className="text-sm text-muted-foreground">Click 'Add Transaction' to start using the enhanced form</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Badge variant="secondary">Quick Mode</Badge>
                    <Badge variant="secondary">Smart Tags</Badge>
                    <Badge variant="secondary">Keyboard Shortcuts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Implementation Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Implementation Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <h4 className="font-medium">Basic Usage:</h4>
                <pre className="bg-muted p-3 rounded mt-1 text-xs overflow-x-auto">
{`<UnifiedTransactionForm
  wallets={wallets}
  expenseCategories={expenseCategories}
  incomeCategories={incomeCategories}
  onSuccess={() => refreshTransactions()}
  userId={user.id}
  defaultQuickMode={true}
  defaultAiMode={false}
/>`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium">Key Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Auto-loading tag suggestions from user history</li>
                  <li>Quick mode toggle for streamlined entry</li>
                  <li>Keyboard shortcuts for power users</li>
                  <li>Smart amount presets based on common transactions</li>
                  <li>Real-time tag filtering and creation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <TransactionsList
            transactions={transactions}
            loading={refreshing}
            onRefresh={fetchTransactions}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}