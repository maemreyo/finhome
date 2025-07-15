// src/components/financial-planning/FinancialPlanningWizard.tsx
// Comprehensive financial planning wizard integrating all systems

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Calculator, 
  Home, 
  DollarSign, 
  Target, 
  TrendingUp,
  Building,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'

interface PlanData {
  // Personal Information
  personalInfo: {
    name: string
    age: number
    monthlyIncome: number
    monthlyExpenses: number
    currentSavings: number
    dependents: number
  }
  
  // Property Goals
  propertyGoals: {
    propertyType: 'apartment' | 'house' | 'villa' | 'townhouse'
    location: string
    budget: number
    timeframe: number // months
    purpose: 'primary' | 'investment' | 'upgrade'
    features: string[]
  }
  
  // Financial Strategy
  financialStrategy: {
    downPaymentTarget: number
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    investmentHorizon: number
    expectedROI: number
    bankPreference: string[]
  }
  
  // Additional Goals
  additionalGoals: {
    emergencyFund: number
    education: number
    retirement: number
    other: Array<{
      name: string
      amount: number
      timeframe: number
    }>
  }
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  component: React.ComponentType<any>
  validation?: (data: PlanData) => string[]
}

interface FinancialPlanningWizardProps {
  onComplete?: (data: PlanData) => void
  initialData?: Partial<PlanData>
  className?: string
}

export const FinancialPlanningWizard: React.FC<FinancialPlanningWizardProps> = ({
  onComplete,
  initialData,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [planData, setPlanData] = useState<PlanData>({
    personalInfo: {
      name: '',
      age: 30,
      monthlyIncome: 50000000,
      monthlyExpenses: 25000000,
      currentSavings: 200000000,
      dependents: 0
    },
    propertyGoals: {
      propertyType: 'apartment',
      location: '',
      budget: 3000000000,
      timeframe: 24,
      purpose: 'primary',
      features: []
    },
    financialStrategy: {
      downPaymentTarget: 20,
      riskTolerance: 'moderate',
      investmentHorizon: 20,
      expectedROI: 8,
      bankPreference: []
    },
    additionalGoals: {
      emergencyFund: 150000000,
      education: 0,
      retirement: 0,
      other: []
    },
    ...initialData
  })
  
  const [errors, setErrors] = useState<string[]>([])
  const { showToast } = useToast()

  // Step 1: Personal Information
  const PersonalInfoStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Thông Tin Cá Nhân</h3>
        <p className="text-gray-600">Cung cấp thông tin tài chính cơ bản của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            value={planData.personalInfo.name}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, name: e.target.value }
            }))}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Tuổi</Label>
          <Input
            id="age"
            type="number"
            value={planData.personalInfo.age}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, age: Number(e.target.value) }
            }))}
            min="18"
            max="70"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="income">Thu nhập hàng tháng (VND)</Label>
          <Input
            id="income"
            type="number"
            value={planData.personalInfo.monthlyIncome}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, monthlyIncome: Number(e.target.value) }
            }))}
            placeholder="50,000,000"
          />
          <p className="text-sm text-gray-500">
            Hiện tại: {formatCurrency(planData.personalInfo.monthlyIncome)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenses">Chi phí hàng tháng (VND)</Label>
          <Input
            id="expenses"
            type="number"
            value={planData.personalInfo.monthlyExpenses}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, monthlyExpenses: Number(e.target.value) }
            }))}
            placeholder="25,000,000"
          />
          <p className="text-sm text-gray-500">
            Hiện tại: {formatCurrency(planData.personalInfo.monthlyExpenses)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="savings">Tiết kiệm hiện có (VND)</Label>
          <Input
            id="savings"
            type="number"
            value={planData.personalInfo.currentSavings}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, currentSavings: Number(e.target.value) }
            }))}
            placeholder="200,000,000"
          />
          <p className="text-sm text-gray-500">
            Hiện tại: {formatCurrency(planData.personalInfo.currentSavings)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dependents">Số người phụ thuộc</Label>
          <Select 
            value={planData.personalInfo.dependents.toString()} 
            onValueChange={(value) => setPlanData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, dependents: Number(value) }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Không có</SelectItem>
              <SelectItem value="1">1 người</SelectItem>
              <SelectItem value="2">2 người</SelectItem>
              <SelectItem value="3">3 người</SelectItem>
              <SelectItem value="4">4+ người</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Health Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Tình Hình Tài Chính
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Thu nhập ròng:</span>
              <span className="font-medium text-green-600 ml-2">
                {formatCurrency(planData.personalInfo.monthlyIncome - planData.personalInfo.monthlyExpenses)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tỷ lệ tiết kiệm:</span>
              <span className="font-medium ml-2">
                {(((planData.personalInfo.monthlyIncome - planData.personalInfo.monthlyExpenses) / planData.personalInfo.monthlyIncome) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Step 2: Property Goals
  const PropertyGoalsStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Mục Tiêu Bất Động Sản</h3>
        <p className="text-gray-600">Xác định loại bất động sản và ngân sách mong muốn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Loại bất động sản</Label>
          <Select 
            value={planData.propertyGoals.propertyType} 
            onValueChange={(value: any) => setPlanData(prev => ({
              ...prev,
              propertyGoals: { ...prev.propertyGoals, propertyType: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Căn hộ</SelectItem>
              <SelectItem value="house">Nhà riêng</SelectItem>
              <SelectItem value="townhouse">Nhà phố</SelectItem>
              <SelectItem value="villa">Biệt thự</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Mục đích sử dụng</Label>
          <Select 
            value={planData.propertyGoals.purpose} 
            onValueChange={(value: any) => setPlanData(prev => ({
              ...prev,
              propertyGoals: { ...prev.propertyGoals, purpose: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Ở chính</SelectItem>
              <SelectItem value="investment">Đầu tư</SelectItem>
              <SelectItem value="upgrade">Nâng cấp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Khu vực mong muốn</Label>
          <Select 
            value={planData.propertyGoals.location} 
            onValueChange={(value) => setPlanData(prev => ({
              ...prev,
              propertyGoals: { ...prev.propertyGoals, location: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn khu vực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quan1">Quận 1, TP.HCM</SelectItem>
              <SelectItem value="quan2">Quận 2, TP.HCM</SelectItem>
              <SelectItem value="quan7">Quận 7, TP.HCM</SelectItem>
              <SelectItem value="binhtan">Quận Bình Tân, TP.HCM</SelectItem>
              <SelectItem value="binhthanh">Quận Bình Thạnh, TP.HCM</SelectItem>
              <SelectItem value="hanoi">Hà Nội</SelectItem>
              <SelectItem value="danang">Đà Nẵng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Thời gian dự kiến (tháng)</Label>
          <Select 
            value={planData.propertyGoals.timeframe.toString()} 
            onValueChange={(value) => setPlanData(prev => ({
              ...prev,
              propertyGoals: { ...prev.propertyGoals, timeframe: Number(value) }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">1 năm</SelectItem>
              <SelectItem value="18">1.5 năm</SelectItem>
              <SelectItem value="24">2 năm</SelectItem>
              <SelectItem value="36">3 năm</SelectItem>
              <SelectItem value="60">5 năm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Ngân sách dự kiến: {formatCurrency(planData.propertyGoals.budget)}</Label>
        <Slider
          value={[planData.propertyGoals.budget]}
          onValueChange={(value) => setPlanData(prev => ({
            ...prev,
            propertyGoals: { ...prev.propertyGoals, budget: value[0] }
          }))}
          min={1000000000}
          max={20000000000}
          step={500000000}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>1 tỷ VND</span>
          <span>20 tỷ VND</span>
        </div>
      </div>

      {/* Property Features */}
      <div className="space-y-3">
        <Label>Tiện ích mong muốn</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Gần trung tâm',
            'Gần trường học',
            'Gần bệnh viện',
            'View đẹp',
            'Có hồ bơi',
            'Có gym',
            'An ninh 24/7',
            'Chỗ đậu xe',
            'Gần metro'
          ].map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={planData.propertyGoals.features.includes(feature)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPlanData(prev => ({
                      ...prev,
                      propertyGoals: {
                        ...prev.propertyGoals,
                        features: [...prev.propertyGoals.features, feature]
                      }
                    }))
                  } else {
                    setPlanData(prev => ({
                      ...prev,
                      propertyGoals: {
                        ...prev.propertyGoals,
                        features: prev.propertyGoals.features.filter(f => f !== feature)
                      }
                    }))
                  }
                }}
              />
              <Label htmlFor={feature} className="text-sm">{feature}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Step 3: Financial Strategy
  const FinancialStrategyStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Chiến Lược Tài Chính</h3>
        <p className="text-gray-600">Xác định mức rủi ro và chiến lược đầu tư</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Vốn tự có mục tiêu: {planData.financialStrategy.downPaymentTarget}%</Label>
          <Slider
            value={[planData.financialStrategy.downPaymentTarget]}
            onValueChange={(value) => setPlanData(prev => ({
              ...prev,
              financialStrategy: { ...prev.financialStrategy, downPaymentTarget: value[0] }
            }))}
            min={10}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>10%</span>
            <span>50%</span>
          </div>
          <p className="text-sm text-blue-600">
            Số tiền cần: {formatCurrency(planData.propertyGoals.budget * (planData.financialStrategy.downPaymentTarget / 100))}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Mức độ chấp nhận rủi ro</Label>
          <Select 
            value={planData.financialStrategy.riskTolerance} 
            onValueChange={(value: any) => setPlanData(prev => ({
              ...prev,
              financialStrategy: { ...prev.financialStrategy, riskTolerance: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Thận trọng (3-5% ROI)</SelectItem>
              <SelectItem value="moderate">Trung bình (6-10% ROI)</SelectItem>
              <SelectItem value="aggressive">Tích cực (10%+ ROI)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Thời gian đầu tư (năm)</Label>
          <Input
            type="number"
            value={planData.financialStrategy.investmentHorizon}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              financialStrategy: { ...prev.financialStrategy, investmentHorizon: Number(e.target.value) }
            }))}
            min="5"
            max="30"
          />
        </div>

        <div className="space-y-2">
          <Label>ROI mong đợi (%/năm)</Label>
          <Input
            type="number"
            value={planData.financialStrategy.expectedROI}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              financialStrategy: { ...prev.financialStrategy, expectedROI: Number(e.target.value) }
            }))}
            min="3"
            max="20"
            step="0.5"
          />
        </div>
      </div>

      {/* Bank Preferences */}
      <div className="space-y-3">
        <Label>Ngân hàng quan tâm</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Vietcombank',
            'BIDV',
            'Agribank',
            'Techcombank',
            'VPBank',
            'ACB',
            'Sacombank',
            'MB Bank'
          ].map((bank) => (
            <div key={bank} className="flex items-center space-x-2">
              <Checkbox
                id={bank}
                checked={planData.financialStrategy.bankPreference.includes(bank)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPlanData(prev => ({
                      ...prev,
                      financialStrategy: {
                        ...prev.financialStrategy,
                        bankPreference: [...prev.financialStrategy.bankPreference, bank]
                      }
                    }))
                  } else {
                    setPlanData(prev => ({
                      ...prev,
                      financialStrategy: {
                        ...prev.financialStrategy,
                        bankPreference: prev.financialStrategy.bankPreference.filter(b => b !== bank)
                      }
                    }))
                  }
                }}
              />
              <Label htmlFor={bank} className="text-sm">{bank}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Step 4: Additional Goals
  const AdditionalGoalsStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Mục Tiêu Khác</h3>
        <p className="text-gray-600">Các mục tiêu tài chính bổ sung</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="emergency">Quỹ khẩn cấp (VND)</Label>
          <Input
            id="emergency"
            type="number"
            value={planData.additionalGoals.emergencyFund}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              additionalGoals: { ...prev.additionalGoals, emergencyFund: Number(e.target.value) }
            }))}
            placeholder="150,000,000"
          />
          <p className="text-sm text-gray-500">
            Khuyến nghị: 6-12 tháng chi phí sinh hoạt
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Quỹ giáo dục (VND)</Label>
          <Input
            id="education"
            type="number"
            value={planData.additionalGoals.education}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              additionalGoals: { ...prev.additionalGoals, education: Number(e.target.value) }
            }))}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retirement">Quỹ hưu trí (VND)</Label>
          <Input
            id="retirement"
            type="number"
            value={planData.additionalGoals.retirement}
            onChange={(e) => setPlanData(prev => ({
              ...prev,
              additionalGoals: { ...prev.additionalGoals, retirement: Number(e.target.value) }
            }))}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )

  // Step 5: Review and Summary
  const ReviewStep: React.FC = () => {
    const downPaymentNeeded = planData.propertyGoals.budget * (planData.financialStrategy.downPaymentTarget / 100)
    const monthlySavingsNeeded = (downPaymentNeeded - planData.personalInfo.currentSavings) / planData.propertyGoals.timeframe
    const canAfford = monthlySavingsNeeded <= (planData.personalInfo.monthlyIncome - planData.personalInfo.monthlyExpenses)

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Tóm Tắt Kế Hoạch</h3>
          <p className="text-gray-600">Xem lại và xác nhận kế hoạch tài chính của bạn</p>
        </div>

        {/* Feasibility Analysis */}
        <Card className={cn(
          "border-2",
          canAfford ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {canAfford ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-orange-600" />
              )}
              <div>
                <h4 className={cn(
                  "text-xl font-bold",
                  canAfford ? "text-green-900" : "text-orange-900"
                )}>
                  {canAfford ? 'Kế hoạch khả thi!' : 'Cần điều chỉnh kế hoạch'}
                </h4>
                <p className={cn(
                  "text-sm",
                  canAfford ? "text-green-700" : "text-orange-700"
                )}>
                  {canAfford 
                    ? 'Bạn có thể đạt được mục tiêu với kế hoạch hiện tại'
                    : 'Kế hoạch hiện tại cần được điều chỉnh để phù hợp với khả năng tài chính'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(downPaymentNeeded)}
                </div>
                <div className="text-sm text-gray-600">Vốn cần thiết</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg">
                <div className={cn(
                  "text-lg font-bold",
                  canAfford ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(monthlySavingsNeeded)}
                </div>
                <div className="text-sm text-gray-600">Tiết kiệm/tháng</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {planData.propertyGoals.timeframe} tháng
                </div>
                <div className="text-sm text-gray-600">Thời gian</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {planData.financialStrategy.expectedROI}%
                </div>
                <div className="text-sm text-gray-600">ROI mục tiêu</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Mục Tiêu Bất Động Sản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Loại:</span>
                <span className="font-medium">{planData.propertyGoals.propertyType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngân sách:</span>
                <span className="font-medium">{formatCurrency(planData.propertyGoals.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Khu vực:</span>
                <span className="font-medium">{planData.propertyGoals.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mục đích:</span>
                <span className="font-medium">{planData.propertyGoals.purpose}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Chiến Lược Tài Chính
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Vốn tự có:</span>
                <span className="font-medium">{planData.financialStrategy.downPaymentTarget}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rủi ro:</span>
                <span className="font-medium">{planData.financialStrategy.riskTolerance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian đầu tư:</span>
                <span className="font-medium">{planData.financialStrategy.investmentHorizon} năm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI mong đợi:</span>
                <span className="font-medium">{planData.financialStrategy.expectedROI}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Khuyến Nghị
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canAfford && (
              <div className="flex items-start gap-2 text-orange-700">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span className="text-sm">
                  Tăng thời gian tiết kiệm hoặc giảm ngân sách để phù hợp với khả năng tài chính
                </span>
              </div>
            )}
            
            <div className="flex items-start gap-2 text-blue-700">
              <Info className="w-4 h-4 mt-0.5" />
              <span className="text-sm">
                Xem xét đa dạng hóa danh mục đầu tư để giảm rủi ro
              </span>
            </div>
            
            <div className="flex items-start gap-2 text-blue-700">
              <Info className="w-4 h-4 mt-0.5" />
              <span className="text-sm">
                So sánh lãi suất từ nhiều ngân hàng để có lựa chọn tốt nhất
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const steps: WizardStep[] = [
    {
      id: 'personal',
      title: 'Thông Tin Cá Nhân',
      description: 'Tình hình tài chính hiện tại',
      icon: Calculator,
      component: PersonalInfoStep,
      validation: (data) => {
        const errors = []
        if (!data.personalInfo.name) errors.push('Vui lòng nhập họ tên')
        if (data.personalInfo.monthlyIncome <= 0) errors.push('Thu nhập phải lớn hơn 0')
        if (data.personalInfo.monthlyExpenses >= data.personalInfo.monthlyIncome) {
          errors.push('Chi phí không được lớn hơn thu nhập')
        }
        return errors
      }
    },
    {
      id: 'property',
      title: 'Mục Tiêu BDS',
      description: 'Loại bất động sản mong muốn',
      icon: Home,
      component: PropertyGoalsStep,
      validation: (data) => {
        const errors = []
        if (!data.propertyGoals.location) errors.push('Vui lòng chọn khu vực')
        if (data.propertyGoals.budget <= 0) errors.push('Ngân sách phải lớn hơn 0')
        return errors
      }
    },
    {
      id: 'strategy',
      title: 'Chiến Lược',
      description: 'Rủi ro và đầu tư',
      icon: TrendingUp,
      component: FinancialStrategyStep
    },
    {
      id: 'goals',
      title: 'Mục Tiêu Khác',
      description: 'Các mục tiêu bổ sung',
      icon: Target,
      component: AdditionalGoalsStep
    },
    {
      id: 'review',
      title: 'Xem Lại',
      description: 'Tóm tắt và xác nhận',
      icon: CheckCircle,
      component: ReviewStep
    }
  ]

  const currentStepData = steps[currentStep]
  const CurrentStepComponent = currentStepData.component

  const validateCurrentStep = () => {
    if (currentStepData.validation) {
      const validationErrors = currentStepData.validation(planData)
      setErrors(validationErrors)
      return validationErrors.length === 0
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
        setErrors([])
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setErrors([])
    }
  }

  const handleComplete = () => {
    if (validateCurrentStep()) {
      showToast(ToastHelpers.success(
        'Kế hoạch đã tạo thành công!', 
        'Bạn có thể theo dõi tiến độ trong dashboard'
      ))
      onComplete?.(planData)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Wizard Lập Kế Hoạch Tài Chính</h2>
          <Badge variant="outline">
            Bước {currentStep + 1}/{steps.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap",
                  isActive && "bg-blue-100 text-blue-700",
                  isCompleted && "bg-green-100 text-green-700",
                  !isActive && !isCompleted && "text-gray-500"
                )}
              >
                <StepIcon className="w-4 h-4" />
                <span className="font-medium">{step.title}</span>
                {isCompleted && <Check className="w-3 h-3" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent />
            </motion.div>
          </AnimatePresence>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">Vui lòng kiểm tra lại:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>

        <div className="text-sm text-gray-500">
          {currentStep + 1} / {steps.length}
        </div>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleComplete}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Hoàn thành kế hoạch
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            Tiếp theo
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default FinancialPlanningWizard