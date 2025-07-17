// src/components/scenarios/InteractiveParameterSliders.tsx
// Interactive sliders for real-time scenario parameter adjustment

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Calendar,
  Home,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { FinancialScenario, ScenarioParameters } from '@/types/scenario'

interface InteractiveParameterSlidersProps {
  baseScenario: FinancialScenario
  onParametersChange: (parameters: ScenarioParameters) => void
  onScenarioUpdate: (scenario: FinancialScenario) => void
  realTimeMode?: boolean
  className?: string
}

interface SliderConfig {
  key: keyof ScenarioParameters
  label: string
  min: number
  max: number
  step: number
  unit: string
  icon: React.ReactNode
  format: (value: number) => string
  description: string
}

const SLIDER_CONFIGS: SliderConfig[] = [
  {
    key: 'purchasePrice',
    label: 'Giá mua',
    min: 500000000, // 500M VND
    max: 20000000000, // 20B VND
    step: 100000000,
    unit: 'VND',
    icon: <Home className="w-4 h-4" />,
    format: (value) => formatCurrency(value, { compact: true }),
    description: 'Giá mua bất động sản'
  },
  {
    key: 'downPayment',
    label: 'Tiền trả trước',
    min: 0,
    max: 50, // Percentage
    step: 5,
    unit: '%',
    icon: <DollarSign className="w-4 h-4" />,
    format: (value) => `${value}%`,
    description: 'Phần trăm tiền trả trước'
  },
  {
    key: 'interestRate',
    label: 'Lãi suất',
    min: 5,
    max: 15,
    step: 0.1,
    unit: '%',
    icon: <Percent className="w-4 h-4" />,
    format: (value) => `${value.toFixed(1)}%`,
    description: 'Lãi suất vay hàng năm'
  },
  {
    key: 'loanTermYears',
    label: 'Thời hạn vay',
    min: 5,
    max: 30,
    step: 1,
    unit: 'năm',
    icon: <Calendar className="w-4 h-4" />,
    format: (value) => `${value} năm`,
    description: 'Thời gian vay tính bằng năm'
  },
  {
    key: 'monthlyIncome',
    label: 'Thu nhập tháng',
    min: 10000000, // 10M VND
    max: 200000000, // 200M VND
    step: 5000000,
    unit: 'VND',
    icon: <TrendingUp className="w-4 h-4" />,
    format: (value) => formatCurrency(value, { compact: true }),
    description: 'Thu nhập hàng tháng'
  },
  {
    key: 'monthlyExpenses',
    label: 'Chi phí tháng',
    min: 5000000, // 5M VND
    max: 100000000, // 100M VND
    step: 2500000,
    unit: 'VND',
    icon: <TrendingDown className="w-4 h-4" />,
    format: (value) => formatCurrency(value, { compact: true }),
    description: 'Chi phí sinh hoạt hàng tháng'
  }
]

export default function InteractiveParameterSliders({
  baseScenario,
  onParametersChange,
  onScenarioUpdate,
  realTimeMode = true,
  className
}: InteractiveParameterSlidersProps) {
  const [parameters, setParameters] = useState<ScenarioParameters>({
    planName: baseScenario.plan_name || 'Interactive Scenario',
    planType: baseScenario.plan_type,
    scenarioType: baseScenario.scenarioType,
    purchasePrice: baseScenario.purchase_price || 3000000000,
    downPayment: ((baseScenario.down_payment || 0) / (baseScenario.purchase_price || 1)) * 100,
    additionalCosts: 0,
    loanAmount: 0, // Will be calculated
    interestRate: 8.5,
    loanTermYears: 20,
    monthlyIncome: baseScenario.monthly_income || 50000000,
    monthlyExpenses: baseScenario.monthly_expenses || 20000000,
    currentSavings: baseScenario.current_savings || 0,
    otherDebts: 0,
    expectedRentalIncome: baseScenario.expected_rental_income,
    expectedAppreciationRate: 6.5,
    riskTolerance: 'moderate',
    investmentHorizonMonths: 240,
    emergencyFundTarget: 100000000,
    dependents: 0,
    targetTimeframeMonths: 240
  })

  const [isAutoUpdate, setIsAutoUpdate] = useState(realTimeMode)
  const [hasChanges, setHasChanges] = useState(false)

  // Calculate derived values
  const calculatedLoanAmount = parameters.purchasePrice - (parameters.purchasePrice * parameters.downPayment / 100)
  const monthlyPayment = calculateMonthlyPayment(calculatedLoanAmount, parameters.interestRate, parameters.loanTermYears * 12)
  const dtiRatio = (monthlyPayment / parameters.monthlyIncome) * 100

  function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
    if (annualRate === 0) return principal / termMonths
    const monthlyRate = annualRate / 100 / 12
    return principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / (Math.pow(1 + monthlyRate, termMonths) - 1)
  }

  // Update parameters and trigger scenario recalculation
  const updateParameter = useCallback((key: keyof ScenarioParameters, value: number) => {
    const newParameters = { ...parameters, [key]: value }
    
    // Calculate loan amount when purchase price or down payment changes
    if (key === 'purchasePrice' || key === 'downPayment') {
      newParameters.loanAmount = newParameters.purchasePrice - (newParameters.purchasePrice * newParameters.downPayment / 100)
    }
    
    setParameters(newParameters)
    setHasChanges(true)
    
    if (isAutoUpdate) {
      onParametersChange(newParameters)
      generateUpdatedScenario(newParameters)
    }
  }, [parameters, isAutoUpdate, onParametersChange])

  // Generate updated scenario based on new parameters
  const generateUpdatedScenario = useCallback((params: ScenarioParameters) => {
    const updatedScenario: FinancialScenario = {
      ...baseScenario,
      plan_name: params.planName,
      purchase_price: params.purchasePrice,
      down_payment: params.purchasePrice * params.downPayment / 100,
      monthly_income: params.monthlyIncome,
      monthly_expenses: params.monthlyExpenses,
      current_savings: params.currentSavings,
      expected_rental_income: params.expectedRentalIncome,
      calculatedMetrics: {
        monthlyPayment,
        totalInterest: monthlyPayment * params.loanTermYears * 12 - calculatedLoanAmount,
        totalCost: params.purchasePrice + (monthlyPayment * params.loanTermYears * 12 - calculatedLoanAmount),
        dtiRatio,
        ltvRatio: (calculatedLoanAmount / params.purchasePrice) * 100,
        affordabilityScore: Math.max(0, Math.min(100, 100 - dtiRatio)),
        payoffTimeMonths: params.loanTermYears * 12
      }
    }
    
    onScenarioUpdate(updatedScenario)
  }, [baseScenario, monthlyPayment, calculatedLoanAmount, dtiRatio, onScenarioUpdate])

  // Apply changes manually
  const applyChanges = () => {
    onParametersChange(parameters)
    generateUpdatedScenario(parameters)
    setHasChanges(false)
  }

  // Reset to original values
  const resetParameters = () => {
    const originalParameters = {
      ...parameters,
      purchasePrice: baseScenario.purchase_price || 3000000000,
      downPayment: ((baseScenario.down_payment || 0) / (baseScenario.purchase_price || 1)) * 100,
      monthlyIncome: baseScenario.monthly_income || 50000000,
      monthlyExpenses: baseScenario.monthly_expenses || 20000000,
      currentSavings: baseScenario.current_savings || 0
    }
    setParameters(originalParameters)
    setHasChanges(false)
    
    if (isAutoUpdate) {
      onParametersChange(originalParameters)
      generateUpdatedScenario(originalParameters)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Điều chỉnh tham số kịch bản</CardTitle>
              <CardDescription>
                Thay đổi các thông số để xem tác động đến kịch bản tài chính
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isAutoUpdate}
                  onCheckedChange={setIsAutoUpdate}
                  id="auto-update"
                />
                <Label htmlFor="auto-update" className="text-sm">
                  Cập nhật tự động
                </Label>
              </div>
              
              {!isAutoUpdate && hasChanges && (
                <Button onClick={applyChanges} size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Áp dụng thay đổi
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={resetParameters}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Đặt lại
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Display */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉ số tài chính hiện tại</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyPayment)}
              </div>
              <div className="text-sm text-gray-500">Thanh toán/tháng</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(calculatedLoanAmount)}
              </div>
              <div className="text-sm text-gray-500">Số tiền vay</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${dtiRatio > 40 ? 'text-red-600' : dtiRatio > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                {dtiRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Tỷ lệ DTI</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(0, Math.min(100, 100 - dtiRatio)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">Điểm khả năng</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameter Sliders */}
      <Card>
        <CardHeader>
          <CardTitle>Thông số điều chỉnh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {SLIDER_CONFIGS.map((config) => {
            const currentValue = parameters[config.key] as number
            
            return (
              <div key={config.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <Label className="font-medium">{config.label}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {config.format(currentValue)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      value={[currentValue]}
                      onValueChange={([value]) => updateParameter(config.key, value)}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{config.format(config.min)}</span>
                      <span>{config.format(config.max)}</span>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <Input
                      type="number"
                      value={currentValue}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (value >= config.min && value <= config.max) {
                          updateParameter(config.key, value)
                        }
                      }}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">{config.description}</p>
                
                {config.key !== SLIDER_CONFIGS[SLIDER_CONFIGS.length - 1].key && (
                  <Separator className="mt-4" />
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá rủi ro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tỷ lệ DTI</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${dtiRatio > 40 ? 'bg-red-500' : dtiRatio > 30 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="text-sm">
                  {dtiRatio > 40 ? 'Rủi ro cao' : dtiRatio > 30 ? 'Rủi ro trung bình' : 'Rủi ro thấp'}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  dtiRatio > 40 ? 'bg-red-500' : dtiRatio > 30 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, dtiRatio)}%` }}
              />
            </div>
            
            <div className="grid grid-cols-3 text-xs text-gray-500">
              <span>Thấp (&lt;30%)</span>
              <span className="text-center">Trung bình (30-40%)</span>
              <span className="text-right">Cao (&gt;40%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}