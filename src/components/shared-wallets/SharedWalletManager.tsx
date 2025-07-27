// src/components/shared-wallets/SharedWalletManager.tsx
// Main component for managing shared wallets

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Users, 
  Plus, 
  Settings, 
  Wallet,
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Target,
  DollarSign,
  Calendar,
  UserPlus,
  Crown,
  Shield,
  Eye,
  RefreshCw,
  PiggyBank
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CreateSharedWalletForm } from './CreateSharedWalletForm'
import { SharedWalletDetails } from './SharedWalletDetails'
import { InviteMemberForm } from './InviteMemberForm'

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
  member_count: number
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
  created_at: string
  updated_at: string
}

interface SharedWalletManagerProps {
  className?: string
}

export function SharedWalletManager({ className }: SharedWalletManagerProps) {
  const t = useTranslations('SharedWallets')
  const [wallets, setWallets] = useState<SharedWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<SharedWallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchSharedWallets()
  }, [])

  const fetchSharedWallets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/shared-wallets')
      if (!response.ok) {
        throw new Error('Failed to fetch shared wallets')
      }
      
      const data = await response.json()
      setWallets(data.wallets || [])
    } catch (error) {
      console.error('Error fetching shared wallets:', error)
      setError('Failed to load shared wallets')
    } finally {
      setLoading(false)
    }
  }

  const refreshWallets = async () => {
    setRefreshing(true)
    await fetchSharedWallets()
    setRefreshing(false)
  }

  const handleCreateWallet = async (walletData: any) => {
    try {
      const response = await fetch('/api/shared-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletData),
      })

      if (!response.ok) {
        throw new Error('Failed to create wallet')
      }

      await fetchSharedWallets()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      case 'member': return 'outline'
      case 'viewer': return 'outline'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ví chung</h2>
            <p className="text-muted-foreground">Quản lý ví chung với gia đình và bạn bè</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchSharedWallets}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ví chung</h2>
          <p className="text-muted-foreground">
            Quản lý ví chung với gia đình và bạn bè ({wallets.length} ví)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshWallets} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Làm mới
          </Button>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo ví chung
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo ví chung mới</DialogTitle>
              </DialogHeader>
              <CreateSharedWalletForm 
                onSubmit={handleCreateWallet}
                onCancel={() => setShowCreateForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Chưa có ví chung nào</h3>
            <p className="text-muted-foreground mb-6">
              Tạo ví chung để quản lý ngân sách cùng gia đình và bạn bè
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo ví chung đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => {
            const budgetSummary = wallet.budget_summary
            const budgetProgress = budgetSummary && budgetSummary.total_budget_amount > 0
              ? (budgetSummary.total_spent_amount / budgetSummary.total_budget_amount) * 100
              : 0

            return (
              <Card 
                key={wallet.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedWallet(wallet)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${wallet.color}20` }}
                      >
                        <Wallet className="h-5 w-5" style={{ color: wallet.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleIcon(wallet.user_role)}
                          <Badge variant={getRoleBadgeVariant(wallet.user_role)}>
                            {wallet.user_role === 'owner' ? 'Chủ sở hữu' :
                             wallet.user_role === 'admin' ? 'Quản trị' :
                             wallet.user_role === 'member' ? 'Thành viên' : 'Người xem'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          setSelectedWallet(wallet)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {(wallet.user_role === 'owner' || wallet.user_role === 'admin') && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            setShowInviteForm(true)
                          }}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Mời thành viên
                          </DropdownMenuItem>
                        )}
                        {(wallet.user_role === 'owner' || wallet.user_role === 'admin') && (
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Settings className="h-4 w-4 mr-2" />
                            Cài đặt ví
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Balance */}
                  <div>
                    <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(wallet.balance)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  {/* Members */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{wallet.member_count} thành viên</span>
                    </div>
                    <span className="text-muted-foreground">
                      {format(new Date(wallet.updated_at), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  
                  {/* Budget Summary */}
                  {budgetSummary && budgetSummary.active_budgets > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>{budgetSummary.active_budgets} ngân sách</span>
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            budgetProgress > 90 ? "text-red-600" : 
                            budgetProgress > 80 ? "text-yellow-600" : "text-green-600"
                          )}>
                            {budgetProgress.toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <Progress 
                            value={Math.min(budgetProgress, 100)} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatCurrency(budgetSummary.total_spent_amount)}</span>
                            <span>{formatCurrency(budgetSummary.total_budget_amount)}</span>
                          </div>
                        </div>
                        
                        {budgetSummary.budgets_over_threshold > 0 && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{budgetSummary.budgets_over_threshold} ngân sách vượt ngưỡng</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Description */}
                  {wallet.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {wallet.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Shared Wallet Details Dialog */}
      {selectedWallet && (
        <Dialog open={!!selectedWallet} onOpenChange={() => setSelectedWallet(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <SharedWalletDetails 
              wallet={selectedWallet}
              onClose={() => setSelectedWallet(null)}
              onUpdate={refreshWallets}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời thành viên mới</DialogTitle>
          </DialogHeader>
          <InviteMemberForm 
            walletId={selectedWallet?.id || ''}
            onSubmit={async () => {
              setShowInviteForm(false)
              await refreshWallets()
            }}
            onCancel={() => setShowInviteForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}