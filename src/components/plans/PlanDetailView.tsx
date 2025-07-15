// src/components/plans/PlanDetailView.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateMonthlyPayment } from '@/lib/utils'
import { Edit, Download, Share2 } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type FinancialPlanDetail = Database['public']['Tables']['financial_plans']['Row']

interface PlanDetailViewProps {
  plan: FinancialPlanDetail
}

const statusMap = {
  draft: { label: 'Bản nháp', variant: 'secondary' as const },
  active: { label: 'Đang hoạt động', variant: 'default' as const },
  completed: { label: 'Hoàn thành', variant: 'outline' as const },
  archived: { label: 'Lưu trữ', variant: 'destructive' as const },
}

const typeMap = {
  home_purchase: 'Mua nhà ở',
  investment: 'Đầu tư',
  upgrade: 'Nâng cấp',
  refinance: 'Tái cấu trúc',
}

export function PlanDetailView({ plan }: PlanDetailViewProps) {
  // Calculate monthly payment with default values since loan_terms table doesn't exist
  const loanAmount = (plan.purchase_price || 0) - (plan.down_payment || 0)
  const monthlyPayment = loanAmount > 0 ? 
    calculateMonthlyPayment(
      loanAmount,
      8.5, // Default interest rate
      240 // Default 20 year term
    ) : 0

  const netCashFlow = (plan.monthly_income || 0) - (plan.monthly_expenses || 0) - monthlyPayment + (plan.expected_rental_income || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{plan.plan_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={statusMap[plan.status].variant}>
              {statusMap[plan.status].label}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{typeMap[plan.plan_type]}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Tạo ngày {new Date(plan.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          {plan.description && (
            <p className="text-muted-foreground mt-2">{plan.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-1" />
            Chỉnh sửa
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Xuất file
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">Giá mua</div>
            <div className="metric-value">{formatCurrency(plan.purchase_price || 0)}</div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">Vốn tự có</div>
            <div className="metric-value">{formatCurrency(plan.down_payment || 0)}</div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">Trả góp hàng tháng</div>
            <div className="metric-value">{formatCurrency(monthlyPayment)}</div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">Dòng tiền ròng</div>
            <div className={`metric-value ${netCashFlow >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(netCashFlow)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Details - Using calculated values since loan_terms table doesn't exist */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết khoản vay</CardTitle>
          <CardDescription>
            Thông tin về điều kiện vay và lãi suất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Số tiền vay</div>
              <div className="text-xl font-semibold">{formatCurrency(loanAmount)}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">Thời gian vay</div>
              <div className="text-xl font-semibold">20 năm</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">Lãi suất</div>
              <div className="text-xl font-semibold">8.5% / năm</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">Ngân hàng</div>
              <div className="text-xl font-semibold">Chưa chọn</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt tài chính</CardTitle>
          <CardDescription>
            Phân tích thu chi và khả năng chi trả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">Thu nhập</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lương cơ bản</span>
                  <span className="font-medium">{formatCurrency(plan.monthly_income || 0)}</span>
                </div>
                {plan.expected_rental_income && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thu nhập cho thuê</span>
                    <span className="font-medium text-positive">
                      {formatCurrency(plan.expected_rental_income)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Tổng thu nhập</span>
                  <span>{formatCurrency((plan.monthly_income || 0) + (plan.expected_rental_income || 0))}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Chi phí</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sinh hoạt phí</span>
                  <span className="font-medium">{formatCurrency(plan.monthly_expenses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trả góp nhà</span>
                  <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Tổng chi phí</span>
                  <span>{formatCurrency((plan.monthly_expenses || 0) + monthlyPayment)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Dòng tiền ròng hàng tháng</span>
              <span className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(netCashFlow)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {netCashFlow >= 0 
                ? 'Dòng tiền dương - Tình hình tài chính ổn định'
                : 'Dòng tiền âm - Cần xem xét lại kế hoạch'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline hoàn thành</CardTitle>
          <CardDescription>
            Lộ trình thực hiện kế hoạch theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="chart-container flex items-center justify-center text-muted-foreground">
            Timeline sẽ được hiển thị ở đây
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ dòng tiền</CardTitle>
            <CardDescription>
              Dự báo dòng tiền theo từng tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container flex items-center justify-center text-muted-foreground">
              Biểu đồ dòng tiền sẽ được hiển thị ở đây
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ chi phí</CardTitle>
            <CardDescription>
              Tỷ lệ các khoản chi tiêu hàng tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container flex items-center justify-center text-muted-foreground">
              Biểu đồ phân bổ chi phí sẽ được hiển thị ở đây
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}