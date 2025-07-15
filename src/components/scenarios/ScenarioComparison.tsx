// src/components/scenarios/ScenarioComparison.tsx
// Head-to-Head scenario comparison tool

'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoanScenario } from '@/hooks/useScenarios'

interface ScenarioMetrics {
  affordability: number // 0-100
  riskLevel: number // 0-100
  equityBuildingSpeed: number // 0-100
  flexibility: number // 0-100
  totalCost: number // 0-100 (inverted - lower is better)
}

interface ScenarioComparisonProps {
  scenarios: LoanScenario[]
  onScenarioSelect?: (scenario: LoanScenario) => void
  onCreateNewScenario?: () => void
  className?: string
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  onScenarioSelect,
  onCreateNewScenario,
  className
}) => {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    scenarios.slice(0, 3).map(s => s.id)
  )
  const [viewMode, setViewMode] = useState<'table' | 'radar' | 'detailed'>('table')

  // Calculate metrics for each scenario
  const scenarioMetrics = useMemo(() => {
    const metrics: Record<string, ScenarioMetrics> = {}
    
    scenarios.forEach(scenario => {
      // Calculate affordability (higher is better)
      const debtToIncome = (scenario.monthlyPayment / scenario.monthlyIncome) * 100
      const affordability = Math.max(0, 100 - (debtToIncome - 30) * 2) // 30% DTI is ideal
      
      // Calculate risk level (lower is better, but we'll invert for display)
      const riskFactors = [
        debtToIncome > 40 ? 30 : 0,
        scenario.netCashFlow < 0 ? 25 : 0,
        scenario.downPaymentPercent < 20 ? 20 : 0,
        scenario.loanTermYears > 25 ? 15 : 0,
        scenario.interestRate > 10 ? 10 : 0
      ]
      const riskLevel = Math.max(0, 100 - riskFactors.reduce((a, b) => a + b, 0))
      
      // Calculate equity building speed (higher is better)
      const equityBuildingSpeed = Math.max(0, 100 - (scenario.loanTermYears - 15) * 3)
      
      // Calculate flexibility (higher down payment = more flexibility)
      const flexibility = Math.min(100, scenario.downPaymentPercent * 2)
      
      // Calculate total cost (inverted - lower total cost is better)
      const costRatio = scenario.totalInterest / scenario.loanAmount
      const totalCost = Math.max(0, 100 - costRatio * 50)
      
      metrics[scenario.id] = {
        affordability,
        riskLevel,
        equityBuildingSpeed,
        flexibility,
        totalCost
      }
    })
    
    return metrics
  }, [scenarios])

  // Get scenarios for comparison
  const comparisonScenarios = scenarios.filter(s => selectedScenarios.includes(s.id))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const getRecommendationConfig = (recommendation: LoanScenario['recommendation']) => {
    switch (recommendation) {
      case 'optimal':
        return {
          icon: Target,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Tối Ưu',
          description: 'Cân bằng tốt nhất'
        }
      case 'safe':
        return {
          icon: Shield,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'An Toàn',
          description: 'Rủi ro thấp'
        }
      case 'aggressive':
        return {
          icon: Zap,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Tích Cực',
          description: 'Tăng trưởng nhanh'
        }
      case 'risky':
        return {
          icon: AlertTriangle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rủi Ro',
          description: 'Cần cân nhắc'
        }
    }
  }

  const getRiskLevelColor = (riskLevel: LoanScenario['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            So Sánh Kịch Bản
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Phân tích và so sánh các tùy chọn vay khác nhau
          </p>
        </div>
        
        <Button onClick={onCreateNewScenario} className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Tạo Kịch Bản Mới
        </Button>
      </div>

      {/* View Mode Selector */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="table">Bảng So Sánh</TabsTrigger>
          <TabsTrigger value="radar">Biểu Đồ Radar</TabsTrigger>
          <TabsTrigger value="detailed">Chi Tiết</TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>So Sánh Trực Tiếp</CardTitle>
              <CardDescription>
                Chọn tối đa 3 kịch bản để so sánh chi tiết
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparisonScenarios.map((scenario) => {
                  const recommendation = getRecommendationConfig(scenario.recommendation)
                  const RecommendationIcon = recommendation.icon
                  
                  return (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      {/* Scenario Header */}
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{scenario.name}</h3>
                        <p className="text-sm text-gray-600">
                          {scenario.downPaymentPercent}% - {scenario.loanTermYears} năm
                        </p>
                      </div>

                      {/* Monthly Payment */}
                      <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(scenario.monthlyPayment)}
                        </div>
                        <p className="text-sm text-gray-600">Trả hàng tháng</p>
                      </div>

                      {/* Cash Flow */}
                      <div className="text-center">
                        <div className={cn(
                          "text-lg font-semibold",
                          scenario.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {scenario.netCashFlow >= 0 ? '+' : ''}
                          {formatCurrency(scenario.netCashFlow)}
                        </div>
                        <p className="text-sm text-gray-600">Dòng tiền ròng</p>
                      </div>

                      {/* Recommendation Badge */}
                      <div className="flex justify-center">
                        <Badge 
                          variant="outline"
                          className={cn("flex items-center gap-1", recommendation.color)}
                        >
                          <RecommendationIcon className="w-3 h-3" />
                          {recommendation.label}
                        </Badge>
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tổng lãi vay:</span>
                          <span className="font-medium">{formatCurrency(scenario.totalInterest)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mức rủi ro:</span>
                          <span className={cn("font-medium", getRiskLevelColor(scenario.riskLevel))}>
                            {scenario.riskLevel === 'low' ? 'Thấp' : 
                             scenario.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => onScenarioSelect?.(scenario)}
                        className="w-full"
                        variant={scenario.recommendation === 'optimal' ? 'default' : 'outline'}
                      >
                        {scenario.recommendation === 'optimal' ? 'Chọn Tối Ưu' : 'Chọn Kịch Bản'}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar Chart View */}
        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biểu Đồ Radar So Sánh</CardTitle>
              <CardDescription>
                Trực quan hóa các chỉ số quan trọng của từng kịch bản
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metrics Legend */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Chỉ Số Đánh Giá</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <div>
                        <div className="font-medium">Khả Năng Chi Trả</div>
                        <div className="text-sm text-gray-600">Tỷ lệ thu nhập/chi phí</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div>
                        <div className="font-medium">Mức Độ An Toàn</div>
                        <div className="text-sm text-gray-600">Rủi ro tài chính</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <div>
                        <div className="font-medium">Tốc Độ Tích Lũy</div>
                        <div className="text-sm text-gray-600">Xây dựng tài sản</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <div>
                        <div className="font-medium">Tính Linh Hoạt</div>
                        <div className="text-sm text-gray-600">Khả năng điều chỉnh</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <div>
                        <div className="font-medium">Hiệu Quả Chi Phí</div>
                        <div className="text-sm text-gray-600">Tổng chi phí thấp</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Metrics Bars */}
                <div className="space-y-6">
                  {comparisonScenarios.map((scenario) => {
                    const metrics = scenarioMetrics[scenario.id]
                    
                    return (
                      <div key={scenario.id} className="space-y-3">
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">Khả năng chi trả</div>
                            <Progress value={metrics.affordability} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.affordability)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">An toàn</div>
                            <Progress value={metrics.riskLevel} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.riskLevel)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">Tích lũy</div>
                            <Progress value={metrics.equityBuildingSpeed} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.equityBuildingSpeed)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">Linh hoạt</div>
                            <Progress value={metrics.flexibility} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.flexibility)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">Hiệu quả</div>
                            <Progress value={metrics.totalCost} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.totalCost)}%</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed View */}
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {comparisonScenarios.map((scenario) => {
              const recommendation = getRecommendationConfig(scenario.recommendation)
              const RecommendationIcon = recommendation.icon
              const metrics = scenarioMetrics[scenario.id]
              
              return (
                <Card key={scenario.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {scenario.name}
                      <Badge 
                        variant="outline"
                        className={cn("flex items-center gap-1", recommendation.color)}
                      >
                        <RecommendationIcon className="w-3 h-3" />
                        {recommendation.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {recommendation.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Financial Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Giá nhà:</span>
                        <span className="text-sm">{formatCurrency(scenario.propertyPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Vốn tự có:</span>
                        <span className="text-sm">{formatCurrency(scenario.downPayment)} ({scenario.downPaymentPercent}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Số tiền vay:</span>
                        <span className="text-sm">{formatCurrency(scenario.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Lãi suất:</span>
                        <span className="text-sm">{scenario.interestRate}%/năm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Thời gian vay:</span>
                        <span className="text-sm">{scenario.loanTermYears} năm</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Trả hàng tháng:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(scenario.monthlyPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Dòng tiền ròng:</span>
                        <span className={cn(
                          "text-lg font-bold",
                          scenario.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {scenario.netCashFlow >= 0 ? '+' : ''}{formatCurrency(scenario.netCashFlow)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tổng lãi vay:</span>
                        <span className="text-sm">{formatCurrency(scenario.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tổng thanh toán:</span>
                        <span className="text-sm">{formatCurrency(scenario.totalPayment)}</span>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Đánh giá rủi ro:</span>
                        <span className={cn("text-sm font-medium", getRiskLevelColor(scenario.riskLevel))}>
                          {scenario.riskLevel === 'low' ? 'Thấp' : 
                           scenario.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {(scenario.monthlyPayment / scenario.monthlyIncome) <= 0.4 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs">
                            DTI: {Math.round((scenario.monthlyPayment / scenario.monthlyIncome) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {scenario.netCashFlow >= 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs">
                            Dòng tiền {scenario.netCashFlow >= 0 ? 'dương' : 'âm'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {scenario.downPaymentPercent >= 20 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs">
                            Vốn tự có {scenario.downPaymentPercent >= 20 ? 'đủ' : 'thấp'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => onScenarioSelect?.(scenario)}
                      className="w-full mt-4"
                      variant={scenario.recommendation === 'optimal' ? 'default' : 'outline'}
                    >
                      {scenario.recommendation === 'optimal' ? 'Chọn Tối Ưu' : 'Chọn Kịch Bản'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ScenarioComparison