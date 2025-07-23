// src/components/expenses/IntelligentExampleUsage.tsx
// Example showcasing intelligent transaction suggestions and learning capabilities
'use client'

import { useState, useEffect } from 'react'
import { UnifiedTransactionForm } from './UnifiedTransactionForm'
import { TransactionsList } from './TransactionsList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Plus, Brain, TrendingUp, Target, Zap, Sparkles } from 'lucide-react'

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
  { id: '3', name_en: 'Shopping', name_vi: 'Mua sắm', icon: 'shopping-bag', color: '#8B5CF6', category_key: 'shopping' },
  { id: '4', name_en: 'Bills & Utilities', name_vi: 'Hóa đơn', icon: 'file-text', color: '#EF4444', category_key: 'bills_utilities' }
]

const mockIncomeCategories = [
  { id: '1', name_en: 'Salary', name_vi: 'Lương', icon: 'briefcase', color: '#10B981', category_key: 'salary' },
  { id: '2', name_en: 'Freelance', name_vi: 'Freelance', icon: 'users', color: '#8B5CF6', category_key: 'freelance' }
]

// Mock AI stats for demonstration
const mockAIStats = {
  patternsLearned: 127,
  suggestionsOffered: 43,
  accuracyRate: 87.3,
  timesSaved: '2h 15m'
}

export function IntelligentExampleUsage() {
  const [transactions, setTransactions] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [aiStatsVisible, setAiStatsVisible] = useState(true)

  // Mock function to fetch transactions
  const fetchTransactions = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleTransactionSuccess = () => {
    setShowForm(false)
    fetchTransactions()
    // Update mock AI stats
    mockAIStats.patternsLearned += 1
    mockAIStats.suggestionsOffered += Math.floor(Math.random() * 3) + 1
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Intelligent Transaction Entry
          </h1>
          <p className="text-muted-foreground">AI-powered expense tracking that learns from your habits</p>
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
          
          <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Hide Smart Form' : 'Try Smart Entry'}
          </Button>
        </div>
      </div>

      {/* AI Stats Dashboard */}
      {aiStatsVisible && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Learning Progress
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAiStatsVisible(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{mockAIStats.patternsLearned}</div>
                <div className="text-sm text-muted-foreground">Patterns Learned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{mockAIStats.suggestionsOffered}</div>
                <div className="text-sm text-muted-foreground">Suggestions Offered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{mockAIStats.accuracyRate}%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{mockAIStats.timesSaved}</div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Learning Progress</span>
                <span>{Math.min(Math.floor(mockAIStats.patternsLearned / 5), 100)}%</span>
              </div>
              <Progress value={Math.min(Math.floor(mockAIStats.patternsLearned / 5), 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                The AI gets smarter with each transaction. Try entering some common expenses to see suggestions improve!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🧠 Intelligent Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium">Smart Autocomplete</h4>
              </div>
              <p className="text-muted-foreground">
                Type "Highlands" and watch the AI automatically suggest "Ăn uống" category and typical amounts
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Pattern Recognition</h4>
              </div>
              <p className="text-muted-foreground">
                AI learns that "Grab" usually means transportation and suggests ~50k VND amounts
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Smart Amounts</h4>
              </div>
              <p className="text-muted-foreground">
                Frequently used amounts appear as purple buttons - 25k for coffee, 100k for lunch
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">Auto-Tagging</h4>
              </div>
              <p className="text-muted-foreground">
                Enter "Circle K" and AI suggests ["convenient store", "fuel", "snacks"] tags
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <h4 className="font-medium">Context Awareness</h4>
              </div>
              <p className="text-muted-foreground">
                AI considers time, location, and spending patterns to make better suggestions
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-indigo-500" />
                <h4 className="font-medium">Continuous Learning</h4>
              </div>
              <p className="text-muted-foreground">
                Every transaction makes the AI smarter - accuracy improves over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Smart Entry Form</TabsTrigger>
          <TabsTrigger value="list">Transaction History</TabsTrigger>
          <TabsTrigger value="demo">Live Demo Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          {showForm ? (
            <div className="space-y-4">
              <Card className="border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <Badge variant="secondary" className="mb-2">
                      <Brain className="h-3 w-3 mr-1" />
                      AI-Powered Form
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Try typing common places like "Highlands Coffee", "Grab", or "Circle K"
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <UnifiedTransactionForm
                wallets={mockWallets}
                expenseCategories={mockExpenseCategories}
                incomeCategories={mockIncomeCategories}
                onSuccess={handleTransactionSuccess}
                onCancel={() => setShowForm(false)}
                userId="demo-user-id"
                defaultQuickMode={true}
                defaultAiMode={true}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="h-10 w-10 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Experience the Future of Expense Tracking</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Try Smart Entry" to see AI suggestions in action
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Badge variant="secondary">Auto-Complete</Badge>
                    <Badge variant="secondary">Smart Categories</Badge>
                    <Badge variant="secondary">Amount Prediction</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list">
          <TransactionsList
            transactions={transactions}
            loading={refreshing}
            onRefresh={fetchTransactions}
          />
        </TabsContent>

        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Try These Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Coffee Shop Test</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Type "Highlands" in description → Watch AI suggest "Ăn uống" category + 45k amount
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-medium text-green-700 dark:text-green-300">Transportation Test</h4>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Type "Grab" in merchant → AI predicts "Đi lại" category + common ride amounts
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <h4 className="font-medium text-purple-700 dark:text-purple-300">Learning Demonstration</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Enter the same merchant 2-3 times → Notice suggestions become more accurate
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <h4 className="font-medium text-orange-700 dark:text-orange-300">Smart Tags</h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Type "Circle K" → AI suggests related tags like "convenience store", "fuel"
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>How the AI learns:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Analyzes your last 1000 transactions for patterns</li>
                  <li>Groups similar descriptions/merchants with their categories</li>
                  <li>Calculates confidence scores based on frequency and recency</li>
                  <li>Suggests amounts based on historical data for similar contexts</li>
                  <li>Learns tag associations to improve future suggestions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}