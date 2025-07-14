// src/app/(dashboard)/dashboard/scenarios/page.tsx
// Scenario comparison and management page

'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { ScenarioComparison } from '@/components/scenarios/ScenarioComparison'
import { useScenarios, LoanScenario } from '@/hooks/useScenarios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, TrendingUp, Calculator, AlertCircle } from 'lucide-react'

// Mock data for demonstration
const mockScenarios: LoanScenario[] = [
  {
    id: 'scenario-1',
    name: 'Bảo Thủ - 30% vốn tự có',
    downPaymentPercent: 30,
    loanTermYears: 15,
    interestRate: 8.0,
    propertyPrice: 2500000000,
    downPayment: 750000000,
    loanAmount: 1750000000,
    monthlyPayment: 16729000,
    totalInterest: 1261220000,
    totalPayment: 3011220000,
    monthlyIncome: 45000000,
    monthlyExpenses: 18000000,
    netCashFlow: 10271000,
    riskLevel: 'low',
    recommendation: 'safe',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'scenario-2',
    name: 'Cân Bằng - 20% vốn tự có',
    downPaymentPercent: 20,
    loanTermYears: 20,
    interestRate: 8.5,
    propertyPrice: 2500000000,
    downPayment: 500000000,
    loanAmount: 2000000000,
    monthlyPayment: 17234000,
    totalInterest: 2136160000,
    totalPayment: 4136160000,
    monthlyIncome: 45000000,
    monthlyExpenses: 18000000,
    netCashFlow: 9766000,
    riskLevel: 'low',
    recommendation: 'optimal',
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'scenario-3',
    name: 'Tích Cực - 15% vốn tự có',
    downPaymentPercent: 15,
    loanTermYears: 25,
    interestRate: 9.0,
    propertyPrice: 2500000000,
    downPayment: 375000000,
    loanAmount: 2125000000,
    monthlyPayment: 17820000,
    totalInterest: 3221000000,
    totalPayment: 5346000000,
    monthlyIncome: 45000000,
    monthlyExpenses: 18000000,
    netCashFlow: 9180000,
    riskLevel: 'medium',
    recommendation: 'aggressive',
    createdAt: new Date('2024-01-17')
  },
  {
    id: 'scenario-4',
    name: 'Rủi Ro Cao - 10% vốn tự có',
    downPaymentPercent: 10,
    loanTermYears: 30,
    interestRate: 10.0,
    propertyPrice: 2500000000,
    downPayment: 250000000,
    loanAmount: 2250000000,
    monthlyPayment: 19747000,
    totalInterest: 4908920000,
    totalPayment: 7158920000,
    monthlyIncome: 45000000,
    monthlyExpenses: 18000000,
    netCashFlow: 7253000,
    riskLevel: 'high',
    recommendation: 'risky',
    createdAt: new Date('2024-01-18')
  }
]

export default function ScenariosPage() {
  const {
    scenarios,
    loading,
    error,
    createScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario
  } = useScenarios(mockScenarios)
  
  const [selectedScenario, setSelectedScenario] = useState<LoanScenario | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleScenarioSelect = (scenario: LoanScenario) => {
    setSelectedScenario(scenario)
    // In a real app, this would navigate to a detailed view or apply the scenario
    console.log('Selected scenario:', scenario)
  }

  const handleCreateNewScenario = () => {
    setShowCreateModal(true)
    // In a real app, this would open a scenario creation modal/form
    console.log('Create new scenario')
  }

  const optimalScenarios = scenarios.filter(s => s.recommendation === 'optimal')
  const totalScenarios = scenarios.length
  const avgMonthlyPayment = scenarios.reduce((sum, s) => sum + s.monthlyPayment, 0) / totalScenarios

  if (loading) {
    return (
      <div className="space-y-6">
        <Header 
          title="So Sánh Kịch Bản" 
          description="Phân tích và so sánh các tùy chọn vay khác nhau"
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header 
          title="So Sánh Kịch Bản" 
          description="Phân tích và so sánh các tùy chọn vay khác nhau"
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
        title="So Sánh Kịch Bản" 
        description="Phân tích và so sánh các tùy chọn vay khác nhau"
      />
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Kịch Bản</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScenarios}</div>
              <p className="text-xs text-muted-foreground">
                Các tùy chọn đã tạo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kịch Bản Tối Ưu</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{optimalScenarios.length}</div>
              <p className="text-xs text-muted-foreground">
                Được đánh giá tốt nhất
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trả Trung Bình</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(avgMonthlyPayment)}
              </div>
              <p className="text-xs text-muted-foreground">
                Hàng tháng
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hành Động</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateNewScenario}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo Mới
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Scenario Comparison Component */}
        {scenarios.length > 0 ? (
          <ScenarioComparison
            scenarios={scenarios}
            onScenarioSelect={handleScenarioSelect}
            onCreateNewScenario={handleCreateNewScenario}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Chưa có kịch bản nào</CardTitle>
              <CardDescription>
                Tạo kịch bản đầu tiên để bắt đầu so sánh các tùy chọn vay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateNewScenario} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo Kịch Bản Đầu Tiên
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Selected Scenario Details */}
        {selectedScenario && (
          <Card>
            <CardHeader>
              <CardTitle>Kịch Bản Đã Chọn</CardTitle>
              <CardDescription>
                Chi tiết về kịch bản: {selectedScenario.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông Tin Cơ Bản</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Giá nhà:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact'
                        }).format(selectedScenario.propertyPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vốn tự có:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact'
                        }).format(selectedScenario.downPayment)} ({selectedScenario.downPaymentPercent}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số tiền vay:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact'
                        }).format(selectedScenario.loanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời gian vay:</span>
                      <span className="font-medium">{selectedScenario.loanTermYears} năm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lãi suất:</span>
                      <span className="font-medium">{selectedScenario.interestRate}%/năm</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tài Chính Hàng Tháng</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Thu nhập:</span>
                      <span className="font-medium text-green-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact'
                        }).format(selectedScenario.monthlyIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chi phí sinh hoạt:</span>
                      <span className="font-medium text-red-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact'
                        }).format(selectedScenario.monthlyExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trả vay hàng tháng:</span>
                      <span className="font-medium text-blue-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact'
                        }).format(selectedScenario.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Dòng tiền ròng:</span>
                      <span className={`font-bold ${selectedScenario.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedScenario.netCashFlow >= 0 ? '+' : ''}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact'
                        }).format(selectedScenario.netCashFlow)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}