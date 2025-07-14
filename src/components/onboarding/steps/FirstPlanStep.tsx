// src/components/onboarding/steps/FirstPlanStep.tsx
// First plan creation step for onboarding

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  Home, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Target,
  Info
} from 'lucide-react'
import { OnboardingStep } from '@/types/onboarding'

interface FirstPlanStepProps {
  step: OnboardingStep
  onComplete: () => void
  isCompleted: boolean
}

interface PlanData {
  propertyPrice: string
  downPayment: string
  loanTerm: string
  interestRate: string
}

export const FirstPlanStep: React.FC<FirstPlanStepProps> = ({
  step,
  onComplete,
  isCompleted
}) => {
  const [planData, setPlanData] = useState<PlanData>({
    propertyPrice: '',
    downPayment: '',
    loanTerm: '20',
    interestRate: '8.5'
  })
  
  const [currentMode, setCurrentMode] = useState<'simple' | 'detailed'>('simple')
  const [calculationResult, setCalculationResult] = useState<any>(null)

  const updatePlanData = (field: keyof PlanData, value: string) => {
    setPlanData(prev => ({ ...prev, [field]: value }))
  }

  const calculateBasicPlan = () => {
    const price = parseFloat(planData.propertyPrice) * 1000000 // Convert to VND
    const downPayment = parseFloat(planData.downPayment) * 1000000
    const loanAmount = price - downPayment
    const annualRate = parseFloat(planData.interestRate) / 100
    const termYears = parseInt(planData.loanTerm)
    
    const monthlyRate = annualRate / 12
    const totalMonths = termYears * 12
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1)
    
    const totalPayment = monthlyPayment * totalMonths
    const totalInterest = totalPayment - loanAmount

    setCalculationResult({
      propertyPrice: price,
      downPayment,
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalPayment
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const isFormValid = planData.propertyPrice && planData.downPayment
  const canComplete = isFormValid && calculationResult

  const handleCreatePlan = () => {
    if (!canComplete) return
    
    // Save plan data
    localStorage.setItem('onboarding_first_plan', JSON.stringify({
      planData,
      calculationResult,
      createdAt: new Date()
    }))
    
    onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg mb-4"
        >
          <Calculator className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Tạo Kế Hoạch Đầu Tiên
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Hãy bắt đầu với một kế hoạch đơn giản để làm quen với FinHome
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={currentMode === 'simple' ? 'default' : 'outline'}
          onClick={() => setCurrentMode('simple')}
          size="sm"
        >
          Đơn giản
        </Button>
        <Button
          variant={currentMode === 'detailed' ? 'default' : 'outline'}
          onClick={() => setCurrentMode('detailed')}
          size="sm"
        >
          Chi tiết
        </Button>
      </div>

      {/* Simple Mode */}
      {currentMode === 'simple' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Thông Tin Căn Bản
              </CardTitle>
              <CardDescription>
                Chỉ cần 2 thông tin chính để bắt đầu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyPrice">
                    Giá nhà muốn mua (triệu VNĐ)
                  </Label>
                  <Input
                    id="propertyPrice"
                    type="number"
                    value={planData.propertyPrice}
                    onChange={(e) => updatePlanData('propertyPrice', e.target.value)}
                    placeholder="2500"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ví dụ: 2500 = 2.5 tỷ VNĐ
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="downPayment">
                    Vốn tự có (triệu VNĐ)
                  </Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={planData.downPayment}
                    onChange={(e) => updatePlanData('downPayment', e.target.value)}
                    placeholder="500"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ví dụ: 500 = 500 triệu VNĐ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanTerm">Thời gian vay (năm)</Label>
                  <Select 
                    value={planData.loanTerm} 
                    onValueChange={(value) => updatePlanData('loanTerm', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 năm</SelectItem>
                      <SelectItem value="20">20 năm</SelectItem>
                      <SelectItem value="25">25 năm</SelectItem>
                      <SelectItem value="30">30 năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="interestRate">Lãi suất (%/năm)</Label>
                  <Select 
                    value={planData.interestRate} 
                    onValueChange={(value) => updatePlanData('interestRate', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7.5">7.5%</SelectItem>
                      <SelectItem value="8.0">8.0%</SelectItem>
                      <SelectItem value="8.5">8.5%</SelectItem>
                      <SelectItem value="9.0">9.0%</SelectItem>
                      <SelectItem value="9.5">9.5%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={calculateBasicPlan}
                disabled={!isFormValid}
                className="w-full flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Tính Toán Kế Hoạch
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Calculation Results */}
      {calculationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />
                Kết Quả Tính Toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Số tiền vay</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(calculationResult.loanAmount)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Calculator className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Trả hàng tháng</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(calculationResult.monthlyPayment)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Tổng lãi vay</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(calculationResult.totalInterest)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Đánh Giá Nhanh
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {calculationResult.monthlyPayment > 20000000 
                        ? "Mức trả hàng tháng khá cao. Bạn có thể cân nhắc tăng vốn tự có hoặc kéo dài thời gian vay."
                        : calculationResult.monthlyPayment > 15000000
                        ? "Mức trả hàng tháng ở mức trung bình. Đây có thể là kế hoạch khả thi."
                        : "Mức trả hàng tháng khá hợp lý. Đây là kế hoạch tốt để bắt đầu."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Next Steps */}
      {calculationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Tuyệt vời! Bạn đã tạo kế hoạch đầu tiên</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              onClick={handleCreatePlan}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Lưu Kế Hoạch Này
            </Button>
            
            <Badge variant="outline" className="text-xs">
              Bạn có thể chỉnh sửa chi tiết sau
            </Badge>
          </div>

          <div className="text-sm text-gray-500">
            Tiếp theo, chúng ta sẽ khám phá các tính năng nâng cao của FinHome
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FirstPlanStep