// src/app/[locale]/dashboard/laboratory/page.tsx
// Financial Laboratory page for what-if analysis with i18n support

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/dashboard/Header'
import { FinancialLaboratory } from '@/components/laboratory/FinancialLaboratory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calculator, TrendingUp, AlertCircle, Plus, Beaker } from 'lucide-react'
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'

// Mock financial plans data
const mockPlans: FinancialPlanWithMetrics[] = [
  {
    id: '1',
    user_id: 'demo-user',
    plan_name: 'Mua nhà đầu tiên',
    description: null,
    plan_type: 'home_purchase',
    status: 'active',
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: null,
    monthly_income: 45000000,
    current_monthly_expenses: null,
    monthly_expenses: 18000000,
    current_savings: 600000000,
    dependents: 0,
    purchase_price: 2500000000,
    down_payment: 500000000,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: null,
    investment_horizon_months: null,
    expected_roi: null,
    preferred_banks: null,
    expected_rental_income: null,
    expected_appreciation_rate: null,
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    feasibility_score: null,
    recommended_adjustments: {},
    is_public: false,
    view_count: 0,
    cached_calculations: null,
    calculations_last_updated: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    completed_at: null,
    calculatedMetrics: {
      monthlyPayment: 0,
      totalInterest: 0,
      debtToIncomeRatio: 0,
      affordabilityScore: 8,
      roi: 8.5
    }
  },
  {
    id: '2',
    user_id: 'demo-user',
    plan_name: 'Đầu tư căn hộ cho thuê',
    description: null,
    plan_type: 'investment',
    status: 'completed',
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: null,
    monthly_income: 45000000,
    current_monthly_expenses: null,
    monthly_expenses: 18000000,
    current_savings: 500000000,
    dependents: 0,
    purchase_price: 1800000000,
    down_payment: 400000000,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: null,
    investment_horizon_months: null,
    expected_roi: null,
    preferred_banks: null,
    expected_rental_income: null,
    expected_appreciation_rate: null,
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    feasibility_score: null,
    recommended_adjustments: {},
    is_public: false,
    view_count: 0,
    cached_calculations: null,
    calculations_last_updated: null,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    completed_at: null,
    calculatedMetrics: {
      monthlyPayment: 0,
      totalInterest: 0,
      debtToIncomeRatio: 0,
      affordabilityScore: 7,
      roi: 12.3
    }
  }
]

// Calculate loan details from plan
const calculateLoanDetails = (plan: FinancialPlanWithMetrics) => {
  const principal = (plan.purchase_price || 0) - (plan.down_payment || 0)
  const interestRate = 8.5 // Default rate
  const termYears = 20 // Default term
  
  const monthlyRate = interestRate / 100 / 12
  const totalMonths = termYears * 12
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                        (Math.pow(1 + monthlyRate, totalMonths) - 1)
  const totalPayment = monthlyPayment * totalMonths
  const totalInterest = totalPayment - principal
  
  return {
    principal,
    interestRate,
    termYears,
    monthlyPayment,
    totalInterest,
    totalPayment
  }
}

export default function LaboratoryPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(mockPlans[0].id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPlan = mockPlans.find(p => p.id === selectedPlanId)
  const loanDetails = selectedPlan ? calculateLoanDetails(selectedPlan) : null

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId)
  }

  const handleCreateNewPlan = () => {
    // Navigate to create new plan page
    console.log('Navigate to create new plan')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Header 
          title="Phòng Thí Nghiệm Tài Chính" 
          description="Mô phỏng các tình huống để tối ưu kế hoạch tài chính"
        />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header 
          title="Phòng Thí Nghiệm Tài Chính" 
          description="Mô phỏng các tình huống để tối ưu kế hoạch tài chính"
        />
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Phòng Thí Nghiệm Tài Chính" 
        description="Mô phỏng các tình huống &quot;Điều gì sẽ xảy ra nếu?&quot; để tối ưu kế hoạch tài chính"
      />
      
      <div className="p-6 space-y-6">
        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Chọn Kế Hoạch Tài Chính
            </CardTitle>
            <CardDescription>
              Chọn kế hoạch tài chính để thực hiện phân tích what-if
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedPlanId} onValueChange={handlePlanChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kế hoạch tài chính" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{plan.plan_name}</span>
                          <span className="text-sm text-gray-500 ml-4">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                              notation: 'compact'
                            }).format(plan.purchase_price || 0)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateNewPlan} variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo Kế Hoạch Mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {selectedPlan && loanDetails && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-blue-500" />
                  <div className="text-sm font-medium">Kế Hoạch</div>
                </div>
                <div className="text-xl font-bold mt-1">{selectedPlan.plan_name}</div>
                <div className="text-sm text-gray-600">
                  {selectedPlan.plan_type === 'home_purchase' ? 'Mua nhà ở' : 
                   selectedPlan.plan_type === 'investment' ? 'Đầu tư' : 'Khác'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  <div className="text-sm font-medium">Số Tiền Vay</div>
                </div>
                <div className="text-xl font-bold mt-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(loanDetails.principal)}
                </div>
                <div className="text-sm text-gray-600">{loanDetails.interestRate}% - {loanDetails.termYears} năm</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <div className="text-sm font-medium">Trả Hàng Tháng</div>
                </div>
                <div className="text-xl font-bold mt-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(loanDetails.monthlyPayment)}
                </div>
                <div className="text-sm text-gray-600">
                  {((loanDetails.monthlyPayment / (selectedPlan.monthly_income || 1)) * 100).toFixed(1)}% thu nhập
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <div className="text-sm font-medium">Dòng Tiền Ròng</div>
                </div>
                <div className="text-xl font-bold mt-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format((selectedPlan.monthly_income || 0) - (selectedPlan.monthly_expenses || 0) - loanDetails.monthlyPayment)}
                </div>
                <div className="text-sm text-gray-600">
                  {(selectedPlan.monthly_income || 0) - (selectedPlan.monthly_expenses || 0) - loanDetails.monthlyPayment >= 0 ? 
                    'Dương tính' : 'Âm tính'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Laboratory Component */}
        {selectedPlan && loanDetails ? (
          <FinancialLaboratory
            initialLoan={loanDetails}
            monthlyIncome={selectedPlan.monthly_income || 0}
            monthlyExpenses={selectedPlan.monthly_expenses || 0}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Không có kế hoạch tài chính</CardTitle>
              <CardDescription>
                Bạn cần tạo ít nhất một kế hoạch tài chính để sử dụng phòng thí nghiệm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateNewPlan} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo Kế Hoạch Tài Chính Đầu Tiên
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Educational Content */}
        <Card>
          <CardHeader>
            <CardTitle>Hướng Dẫn Sử Dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-blue-500" />
                  Trả Nợ Sớm
                </div>
                <div className="text-sm text-gray-600">
                  Mô phỏng tác động của việc trả thêm tiền hàng tháng hoặc thanh toán một lần. 
                  Xem được tiết kiệm bao nhiều lãi và rút ngắn thời gian vay.
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  Tái Cơ Cấu
                </div>
                <div className="text-sm text-gray-600">
                  Phân tích hiệu quả khi tái cơ cấu khoản vay với lãi suất thấp hơn. 
                  Tính toán thời gian hòa vốn và tổng tiết kiệm.
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Kiểm Tra Stress
                </div>
                <div className="text-sm text-gray-600">
                  Đánh giá khả năng chi trả khi lãi suất tăng/giảm. 
                  Chuẩn bị kế hoạch dự phòng cho các tình huống bất lợi.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}