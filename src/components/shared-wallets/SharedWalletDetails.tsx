// src/components/shared-wallets/SharedWalletDetails.tsx
// Detailed view for a specific shared wallet

'use client'

import { useState, useEffect } from 'react'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Settings, 
  Wallet,
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  DollarSign,
  RefreshCw,
  Plus,
  UserPlus,
  PiggyBank,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Shield,
  Eye
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface SharedWallet {
  id: string
  name: string
  description?: string
  balance: number
  currency: string
  color: string
  icon: string
  user_role: 'owner' | 'admin' | 'member' | 'viewer'
  user_permissions: {
    can_add_transactions: boolean
    can_edit_transactions: boolean
    can_delete_transactions: boolean
    can_manage_budget: boolean
  }
  budget_summary?: {
    total_budgets: number
    active_budgets: number
    total_budget_amount: number
    total_spent_amount: number
    budgets_over_threshold: number
  }
  active_members: Array<{
    id: string
    user_id: string
    role: string
    user: {
      full_name: string
      avatar_url?: string
    }
    joined_at: string
  }>
  recent_transactions: Array<{
    id: string
    transaction_type: string
    amount: number
    description: string
    transaction_date: string
    is_approved: boolean
    requires_approval: boolean
    user: {
      full_name: string
      avatar_url?: string
    }
    expense_category?: {
      name_vi: string
      color: string
      icon: string
    }
  }>
}

interface SharedWalletDetailsProps {
  wallet: SharedWallet
  onClose: () => void
  onUpdate: () => void
}

export function SharedWalletDetails({ wallet, onClose, onUpdate }: SharedWalletDetailsProps) {
  const [detailedWallet, setDetailedWallet] = useState<any>(null)
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchWalletDetails()
    fetchWalletBudgets()
  }, [wallet.id])

  const fetchWalletDetails = async () => {
    try {
      const response = await fetch(`/api/shared-wallets/${wallet.id}`)
      if (response.ok) {
        const data = await response.json()
        setDetailedWallet(data.wallet)
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletBudgets = async () => {
    try {
      const response = await fetch(`/api/shared-wallets/${wallet.id}/budgets`)
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets || [])
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      case 'member': return <Users className="h-4 w-4 text-green-500" />
      case 'viewer': return <Eye className="h-4 w-4 text-gray-500" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Chủ sở hữu'
      case 'admin': return 'Quản trị'
      case 'member': return 'Thành viên'
      case 'viewer': return 'Người xem'
      default: return role
    }
  }

  if (loading || !detailedWallet) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const budgetSummary = detailedWallet.budget_summary
  const budgetProgress = budgetSummary && budgetSummary.total_budget_amount > 0
    ? (budgetSummary.total_spent_amount / budgetSummary.total_budget_amount) * 100
    : 0

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${wallet.color}20` }}
          >
            <Wallet className="h-6 w-6" style={{ color: wallet.color }} />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-xl">{wallet.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              {getRoleIcon(wallet.user_role)}
              <Badge variant="outline">
                {getRoleLabel(wallet.user_role)}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {detailedWallet.active_members?.length || 0} thành viên
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(wallet.balance)}
            </p>
          </div>
        </div>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          <TabsTrigger value="budgets">Ngân sách</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin ví</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Loại ví</p>
                  <p className="font-medium">Ví chung</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiền tệ</p>
                  <p className="font-medium">{wallet.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tạo lúc</p>
                  <p className="font-medium">
                    {format(new Date(detailedWallet.created_at), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật</p>
                  <p className="font-medium">
                    {format(new Date(detailedWallet.updated_at), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
              </div>
              
              {wallet.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Mô tả</p>
                  <p className="text-sm">{wallet.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Overview */}
          {budgetSummary && budgetSummary.active_budgets > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tổng quan ngân sách
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{budgetSummary.active_budgets}</p>
                    <p className="text-sm text-muted-foreground">Ngân sách hoạt động</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(budgetSummary.total_budget_amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">Tổng ngân sách</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(budgetSummary.total_spent_amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">Đã chi</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {budgetSummary.budgets_over_threshold}
                    </p>
                    <p className="text-sm text-muted-foreground">Vượt ngưỡng</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ tổng thể</span>
                    <span className={cn(
                      "font-medium",
                      budgetProgress > 90 ? "text-red-600" : 
                      budgetProgress > 80 ? "text-yellow-600" : "text-green-600"
                    )}>
                      {budgetProgress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(budgetProgress, 100)} className="h-2" />
                </div>
                
                {budgetSummary.budgets_over_threshold > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Có {budgetSummary.budgets_over_threshold} ngân sách vượt quá ngưỡng cảnh báo
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Giao dịch gần đây
                </div>
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detailedWallet.recent_transactions?.length > 0 ? (
                <div className="space-y-4">
                  {detailedWallet.recent_transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          transaction.transaction_type === 'expense' ? 'bg-red-100' : 'bg-green-100'
                        )}>
                          {transaction.transaction_type === 'expense' ? 
                            <TrendingDown className="h-5 w-5 text-red-600" /> :
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.user.full_name}</span>
                            <span>•</span>
                            <span>{format(new Date(transaction.transaction_date), 'dd/MM', { locale: vi })}</span>
                            {transaction.requires_approval && (
                              <Badge variant={transaction.is_approved ? "default" : "secondary"} className="text-xs">
                                {transaction.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold",
                          transaction.transaction_type === 'expense' ? 'text-red-600' : 'text-green-600'
                        )}>
                          {transaction.transaction_type === 'expense' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.expense_category && (
                          <p className="text-xs text-muted-foreground">
                            {transaction.expense_category.name_vi}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có giao dịch nào
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Quản lý giao dịch</h3>
                <p className="text-muted-foreground mb-4">
                  Xem và quản lý tất cả giao dịch của ví chung
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm giao dịch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <PiggyBank className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Quản lý ngân sách</h3>
                <p className="text-muted-foreground mb-4">
                  Tạo và theo dõi ngân sách chung cho ví
                </p>
                {wallet.user_permissions.can_manage_budget ? (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo ngân sách mới
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Bạn không có quyền quản lý ngân sách
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thành viên ({detailedWallet.active_members?.length || 0})
                </div>
                {(wallet.user_role === 'owner' || wallet.user_role === 'admin') && (
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Mời thành viên
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailedWallet.active_members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {member.user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Tham gia {format(new Date(member.joined_at), 'dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <Badge variant="outline">
                        {getRoleLabel(member.role)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        {(wallet.user_role === 'owner' || wallet.user_role === 'admin') && (
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt ví
          </Button>
        )}
      </div>
    </div>
  )
}