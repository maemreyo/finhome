// src/app/[locale]/dashboard/scenarios/page.tsx
// Scenario comparison and management page with i18n support

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/dashboard/Header'
import { ScenarioComparison } from '@/components/scenarios/ScenarioComparison'
import { useScenarios, LoanScenario } from '@/hooks/useScenarios'
import { useBankRates } from '@/hooks/useBankRates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, TrendingUp, Calculator, AlertCircle, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { calculateMonthlyPayment } from '@/lib/financial/calculations'

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

interface ScenarioGeneratorForm {
  propertyPrice: number
  monthlyIncome: number
  monthlyExpenses: number
  loanType: 'home_purchase' | 'investment' | 'commercial'
}

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
  
  const { rates, isLoading: ratesLoading, getRates } = useBankRates()
  const [selectedScenario, setSelectedScenario] = useState<LoanScenario | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [generatorForm, setGeneratorForm] = useState<ScenarioGeneratorForm>({
    propertyPrice: 2500000000,
    monthlyIncome: 45000000,
    monthlyExpenses: 18000000,
    loanType: 'home_purchase'
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleScenarioSelect = (scenario: LoanScenario) => {
    setSelectedScenario(scenario)
    // In a real app, this would navigate to a detailed view or apply the scenario
    console.log('Selected scenario:', scenario)
  }

  const handleCreateNewScenario = () => {
    setShowCreateModal(true)
    // Load latest bank rates when opening the modal
    getRates({ loanType: generatorForm.loanType, isActive: true })
  }

  const generateSmartScenarios = async () => {
    setIsGenerating(true)
    try {
      // Get current bank rates for the loan type
      await getRates({ 
        loanType: generatorForm.loanType, 
        isActive: true,
        minAmount: generatorForm.propertyPrice * 0.7, // Assume 70% loan amount
        maxAmount: generatorForm.propertyPrice * 0.9  // Max 90% loan amount
      })

      // Create scenarios with different down payment percentages
      const downPaymentOptions = [10, 15, 20, 25, 30]
      const loanTermOptions = [15, 20, 25, 30]
      
      const generatedScenarios: LoanScenario[] = []
      let scenarioId = 1

      for (const downPaymentPercent of downPaymentOptions) {
        for (const loanTermYears of loanTermOptions) {
          if (generatedScenarios.length >= 6) break // Limit to 6 scenarios

          const downPayment = Math.round(generatorForm.propertyPrice * (downPaymentPercent / 100))
          const loanAmount = generatorForm.propertyPrice - downPayment

          // Use rates from bank data or fallback to market average
          const applicableRates = rates.filter(rate => 
            (rate.min_amount || 0) <= loanAmount && 
            (rate.max_amount || Infinity) >= loanAmount &&
            (rate.min_term_months || 0) <= loanTermYears * 12 &&
            (rate.max_term_months || Infinity) >= loanTermYears * 12
          )

          const bestRate = applicableRates.length > 0 ? 
            Math.min(...applicableRates.map(r => r.promotional_rate || r.base_rate)) :
            8.5 + (loanTermYears > 20 ? 1.0 : 0) + (downPaymentPercent < 20 ? 0.5 : 0)

          const monthlyPayment = calculateMonthlyPayment({
            principal: loanAmount,
            annualRate: bestRate,
            termMonths: loanTermYears * 12
          })

          const totalPayment = monthlyPayment * loanTermYears * 12
          const totalInterest = totalPayment - loanAmount
          const netCashFlow = generatorForm.monthlyIncome - generatorForm.monthlyExpenses - monthlyPayment

          // Determine risk level and recommendation
          const debtToIncomeRatio = (monthlyPayment / generatorForm.monthlyIncome) * 100
          let riskLevel: 'low' | 'medium' | 'high' = 'low'
          let recommendation: 'optimal' | 'safe' | 'aggressive' | 'risky' = 'safe'

          if (debtToIncomeRatio > 45 || netCashFlow < 0 || downPaymentPercent < 15) {
            riskLevel = 'high'
            recommendation = 'risky'
          } else if (debtToIncomeRatio > 35 || downPaymentPercent < 20) {
            riskLevel = 'medium'
            recommendation = 'aggressive'
          } else if (debtToIncomeRatio <= 30 && downPaymentPercent >= 20 && netCashFlow > 5000000) {
            recommendation = 'optimal'
          }

          const scenario: LoanScenario = {
            id: `generated-${scenarioId++}`,
            name: `${downPaymentPercent}% vốn tự có - ${loanTermYears} năm`,
            downPaymentPercent,
            loanTermYears,
            interestRate: bestRate,
            propertyPrice: generatorForm.propertyPrice,
            downPayment,
            loanAmount,
            monthlyPayment: Math.round(monthlyPayment),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            monthlyIncome: generatorForm.monthlyIncome,
            monthlyExpenses: generatorForm.monthlyExpenses,
            netCashFlow: Math.round(netCashFlow),
            riskLevel,
            recommendation,
            createdAt: new Date()
          }

          generatedScenarios.push(scenario)
        }
        if (generatedScenarios.length >= 6) break
      }

      // Sort by recommendation priority and add to scenarios
      const sortedScenarios = generatedScenarios.sort((a, b) => {
        const priority = { optimal: 4, safe: 3, aggressive: 2, risky: 1 }
        return priority[b.recommendation] - priority[a.recommendation]
      })

      // Clear existing scenarios and add new ones
      scenarios.forEach(scenario => deleteScenario(scenario.id))
      sortedScenarios.forEach(scenario => createScenario(scenario))

      setShowCreateModal(false)
      toast.success(`Generated ${sortedScenarios.length} scenarios based on current market rates!`)
      
    } catch (error) {
      console.error('Error generating scenarios:', error)
      toast.error('Failed to generate scenarios. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Load bank rates on component mount
  useEffect(() => {
    getRates({ loanType: 'home_purchase', isActive: true })
  }, [])

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
            <CardContent className="space-y-2">
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={handleCreateNewScenario}
                    className="w-full"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tạo Thông Minh
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      Tạo Kịch Bản Thông Minh
                    </DialogTitle>
                    <DialogDescription>
                      Sử dụng lãi suất thị trường thực tế để tạo các kịch bản tối ưu
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyPrice">Giá bất động sản (VNĐ)</Label>
                      <Input
                        id="propertyPrice"
                        type="number"
                        value={generatorForm.propertyPrice}
                        onChange={(e) => setGeneratorForm(prev => ({ 
                          ...prev, 
                          propertyPrice: Number(e.target.value) 
                        }))}
                        placeholder="2,500,000,000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Thu nhập hàng tháng (VNĐ)</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={generatorForm.monthlyIncome}
                        onChange={(e) => setGeneratorForm(prev => ({ 
                          ...prev, 
                          monthlyIncome: Number(e.target.value) 
                        }))}
                        placeholder="45,000,000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyExpenses">Chi phí hàng tháng (VNĐ)</Label>
                      <Input
                        id="monthlyExpenses"
                        type="number"
                        value={generatorForm.monthlyExpenses}
                        onChange={(e) => setGeneratorForm(prev => ({ 
                          ...prev, 
                          monthlyExpenses: Number(e.target.value) 
                        }))}
                        placeholder="18,000,000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanType">Loại vay</Label>
                      <Select
                        value={generatorForm.loanType}
                        onValueChange={(value: any) => setGeneratorForm(prev => ({ 
                          ...prev, 
                          loanType: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home_purchase">Mua nhà ở</SelectItem>
                          <SelectItem value="investment">Đầu tư</SelectItem>
                          <SelectItem value="commercial">Thương mại</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {ratesLoading && (
                      <Alert>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <AlertDescription>
                          Đang tải lãi suất thị trường...
                        </AlertDescription>
                      </Alert>
                    )}

                    {rates.length > 0 && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          Tìm thấy {rates.length} lãi suất áp dụng cho kịch bản của bạn
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowCreateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={generateSmartScenarios}
                      disabled={isGenerating || ratesLoading}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Tạo Kịch Bản
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Badge variant="outline" className="w-full justify-center text-xs">
                {rates.length} lãi suất có sẵn
              </Badge>
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