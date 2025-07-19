// src/components/calculators/LoanCalculator.tsx
// Comprehensive loan calculator with Vietnamese bank integration

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Calendar, 
  TrendingUp,
  Building,
  Info,
  Download,
  Share,
  Bookmark,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { bankService } from '@/lib/services/bankService'
import AmortizationChart from '@/components/charts/AmortizationChart'

interface LoanCalculation {
  principal: number
  interestRate: number
  termMonths: number
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  downPayment: number
  propertyPrice: number
  loanToValue: number
  debtToIncome: number
  monthlyIncome: number
}

interface PaymentBreakdown {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

interface LoanCalculatorProps {
  className?: string
  onCalculationChange?: (calculation: LoanCalculation) => void
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  className,
  onCalculationChange
}) => {
  // Input states
  const [propertyPrice, setPropertyPrice] = useState(3000000000)
  const [downPaymentPercent, setDownPaymentPercent] = useState([20])
  const [loanTerm, setLoanTerm] = useState(20)
  const [interestRate, setInterestRate] = useState(8.5)
  const [monthlyIncome, setMonthlyIncome] = useState(50000000)
  const [selectedBank, setSelectedBank] = useState<string>('')
  
  // Display states
  const [activeTab, setActiveTab] = useState('basic')
  const [showAmortization, setShowAmortization] = useState(false)
  
  // Bank data
  const [banks, setBanks] = useState<any[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)

  // Load bank data
  useEffect(() => {
    const loadBanks = async () => {
      try {
        setIsLoadingBanks(true)
        const bankData = await bankService.getVietnameseBanks()
        setBanks(bankData)
      } catch (error) {
        console.error('Error loading banks:', error)
      } finally {
        setIsLoadingBanks(false)
      }
    }
    loadBanks()
  }, [])

  // Calculate loan details
  const calculation = useMemo((): LoanCalculation => {
    const downPayment = propertyPrice * (downPaymentPercent[0] / 100)
    const principal = propertyPrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const termMonths = loanTerm * 12
    
    let monthlyPayment = 0
    if (monthlyRate > 0) {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                      (Math.pow(1 + monthlyRate, termMonths) - 1)
    } else {
      monthlyPayment = principal / termMonths
    }
    
    const totalPayment = monthlyPayment * termMonths
    const totalInterest = totalPayment - principal
    const loanToValue = (principal / propertyPrice) * 100
    const debtToIncome = (monthlyPayment / monthlyIncome) * 100

    return {
      principal,
      interestRate,
      termMonths,
      monthlyPayment,
      totalInterest,
      totalPayment,
      downPayment,
      propertyPrice,
      loanToValue,
      debtToIncome,
      monthlyIncome
    }
  }, [propertyPrice, downPaymentPercent, loanTerm, interestRate, monthlyIncome])

  // Generate amortization schedule
  const amortizationSchedule = useMemo((): PaymentBreakdown[] => {
    const schedule: PaymentBreakdown[] = []
    let balance = calculation.principal
    let cumulativeInterest = 0
    let cumulativePrincipal = 0
    const monthlyRate = calculation.interestRate / 100 / 12

    for (let month = 1; month <= calculation.termMonths; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = calculation.monthlyPayment - interestPayment
      
      balance -= principalPayment
      cumulativeInterest += interestPayment
      cumulativePrincipal += principalPayment

      schedule.push({
        month,
        payment: calculation.monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        cumulativeInterest,
        cumulativePrincipal
      })
    }

    return schedule
  }, [calculation])

  // Notify parent component of calculation changes
  useEffect(() => {
    onCalculationChange?.(calculation)
  }, [calculation, onCalculationChange])

  // Financial health indicators
  const getHealthIndicator = (value: number, thresholds: { good: number; fair: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' }
    if (value <= thresholds.fair) return { status: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const ltvIndicator = getHealthIndicator(calculation.loanToValue, { good: 70, fair: 80 })
  const dtiIndicator = getHealthIndicator(calculation.debtToIncome, { good: 30, fair: 40 })

  // Bank rate comparison
  const bankRateComparison = useMemo(() => {
    if (!selectedBank || banks.length === 0) return null
    
    // Find rates for selected bank (mock data for demo)
    const rates = {
      'Vietcombank': 8.2,
      'BIDV': 7.8,
      'Agribank': 8.0,
      'Techcombank': 7.5,
      'VPBank': 8.3,
      'ACB': 7.9
    }
    
    const bankRate = rates[selectedBank as keyof typeof rates] || 8.5
    const savingsPerMonth = calculation.monthlyPayment - 
      (calculation.principal * (bankRate / 100 / 12 * Math.pow(1 + bankRate / 100 / 12, calculation.termMonths)) / 
       (Math.pow(1 + bankRate / 100 / 12, calculation.termMonths) - 1))
    
    return {
      bankRate,
      savingsPerMonth,
      totalSavings: savingsPerMonth * calculation.termMonths
    }
  }, [selectedBank, banks, calculation])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Máy Tính Vay Mua Nhà</h2>
        <p className="text-gray-600">Tính toán chi tiết khoản vay và lập kế hoạch tài chính</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Thông Tin Vay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Price */}
              <div className="space-y-2">
                <Label>Giá bất động sản: {formatCurrency(propertyPrice)}</Label>
                <Slider
                  value={[propertyPrice]}
                  onValueChange={(value) => setPropertyPrice(value[0])}
                  min={1000000000}
                  max={20000000000}
                  step={100000000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 tỷ</span>
                  <span>20 tỷ</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="space-y-2">
                <Label>Vốn tự có: {downPaymentPercent[0]}%</Label>
                <Slider
                  value={downPaymentPercent}
                  onValueChange={setDownPaymentPercent}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>10%</span>
                  <span>{formatCurrency(calculation.downPayment)}</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-2">
                <Label>Thời gian vay (năm)</Label>
                <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 năm</SelectItem>
                    <SelectItem value="15">15 năm</SelectItem>
                    <SelectItem value="20">20 năm</SelectItem>
                    <SelectItem value="25">25 năm</SelectItem>
                    <SelectItem value="30">30 năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label>Lãi suất (%/năm)</Label>
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min="3"
                  max="15"
                  step="0.1"
                />
              </div>

              {/* Monthly Income */}
              <div className="space-y-2">
                <Label>Thu nhập hàng tháng</Label>
                <Input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  placeholder="50,000,000"
                />
                <p className="text-sm text-gray-500">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>

              {/* Bank Selection */}
              <div className="space-y-2">
                <Label>So sánh với ngân hàng</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vietcombank">Vietcombank</SelectItem>
                    <SelectItem value="BIDV">BIDV</SelectItem>
                    <SelectItem value="Agribank">Agribank</SelectItem>
                    <SelectItem value="Techcombank">Techcombank</SelectItem>
                    <SelectItem value="VPBank">VPBank</SelectItem>
                    <SelectItem value="ACB">ACB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Bookmark className="w-4 h-4 mr-2" />
                Lưu tính toán
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Xuất PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Trả hàng tháng</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(calculation.monthlyPayment)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Tổng lãi suất</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(calculation.totalInterest)}
                      </p>
                    </div>
                    <Percent className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Tổng thanh toán</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(calculation.totalPayment)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Financial Health Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Đánh Giá Tài Chính
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Loan to Value */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tỷ lệ vay/giá trị (LTV)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tỷ lệ số tiền vay so với giá trị bất động sản</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={calculation.loanToValue} className="flex-1" />
                    <Badge className={cn("text-xs", ltvIndicator.bg, ltvIndicator.color)}>
                      {calculation.loanToValue.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {ltvIndicator.status === 'good' && 'Tốt: Dưới 70%'}
                    {ltvIndicator.status === 'fair' && 'Chấp nhận được: 70-80%'}
                    {ltvIndicator.status === 'poor' && 'Cao: Trên 80%'}
                  </p>
                </div>

                {/* Debt to Income */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tỷ lệ nợ/thu nhập (DTI)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tỷ lệ khoản vay hàng tháng so với thu nhập</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={calculation.debtToIncome} className="flex-1" />
                    <Badge className={cn("text-xs", dtiIndicator.bg, dtiIndicator.color)}>
                      {calculation.debtToIncome.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {dtiIndicator.status === 'good' && 'Tốt: Dưới 30%'}
                    {dtiIndicator.status === 'fair' && 'Chấp nhận được: 30-40%'}
                    {dtiIndicator.status === 'poor' && 'Cao: Trên 40%'}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Khuyến nghị:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {calculation.debtToIncome > 40 && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600" />
                      <span>Tăng vốn tự có hoặc giảm giá bất động sản để giảm DTI</span>
                    </div>
                  )}
                  {calculation.loanToValue < 70 && calculation.debtToIncome < 30 && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                      <span>Tình hình tài chính tốt, có thể xem xét vay thêm để đầu tư</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>So sánh lãi suất từ nhiều ngân hàng để tiết kiệm chi phí</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Comparison */}
          {bankRateComparison && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-600" />
                  So Sánh Với {selectedBank}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {bankRateComparison.bankRate}%
                    </div>
                    <div className="text-sm text-gray-600">Lãi suất</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(bankRateComparison.savingsPerMonth)}
                    </div>
                    <div className="text-sm text-gray-600">Tiết kiệm/tháng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(bankRateComparison.totalSavings)}
                    </div>
                    <div className="text-sm text-gray-600">Tổng tiết kiệm</div>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Tạo kế hoạch với {selectedBank}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Detailed Breakdown */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Tổng quan</TabsTrigger>
              <TabsTrigger value="breakdown">Chi tiết</TabsTrigger>
              <TabsTrigger value="amortization">Bảng trả nợ</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Chi Tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá bất động sản:</span>
                        <span className="font-medium">{formatCurrency(calculation.propertyPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vốn tự có:</span>
                        <span className="font-medium">{formatCurrency(calculation.downPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số tiền vay:</span>
                        <span className="font-medium">{formatCurrency(calculation.principal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lãi suất:</span>
                        <span className="font-medium">{calculation.interestRate}%/năm</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian vay:</span>
                        <span className="font-medium">{loanTerm} năm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trả hàng tháng:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(calculation.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng lãi:</span>
                        <span className="font-medium">{formatCurrency(calculation.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng thanh toán:</span>
                        <span className="font-medium">{formatCurrency(calculation.totalPayment)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phân Tích Chi Phí</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Principal vs Interest Chart */}
                    <div>
                      <h4 className="font-medium mb-3">Cơ cấu thanh toán</h4>
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(calculation.principal / calculation.totalPayment) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-blue-600">
                          Gốc: {formatCurrency(calculation.principal)} ({((calculation.principal / calculation.totalPayment) * 100).toFixed(1)}%)
                        </span>
                        <span className="text-gray-600">
                          Lãi: {formatCurrency(calculation.totalInterest)} ({((calculation.totalInterest / calculation.totalPayment) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Payment over time */}
                    <div>
                      <h4 className="font-medium mb-3">Xu hướng thanh toán theo năm</h4>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        {[5, 10, 15, 20].map(year => {
                          const monthIndex = year * 12 - 1
                          if (monthIndex < amortizationSchedule.length) {
                            const payment = amortizationSchedule[monthIndex]
                            return (
                              <div key={year} className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">Năm {year}</div>
                                <div className="text-xs text-gray-600">
                                  Còn: {formatCurrency(payment.balance)}
                                </div>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amortization" className="space-y-4">
              <AmortizationChart
                loanAmount={calculation.principal}
                interestRate={calculation.interestRate}
                loanTermMonths={calculation.termMonths}
                monthlyPayment={calculation.monthlyPayment}
              />
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bảng Trả Nợ Chi Tiết</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAmortization(!showAmortization)}
                    >
                      {showAmortization ? 'Ẩn bảng' : 'Hiện bảng'}
                    </Button>
                  </div>
                </CardHeader>
                {showAmortization && (
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white border-b">
                          <tr>
                            <th className="text-left p-2">Tháng</th>
                            <th className="text-right p-2">Thanh toán</th>
                            <th className="text-right p-2">Gốc</th>
                            <th className="text-right p-2">Lãi</th>
                            <th className="text-right p-2">Dư nợ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {amortizationSchedule.slice(0, 60).map((payment) => (
                            <tr key={payment.month} className="border-b">
                              <td className="p-2">{payment.month}</td>
                              <td className="text-right p-2">{formatCurrency(payment.payment)}</td>
                              <td className="text-right p-2">{formatCurrency(payment.principal)}</td>
                              <td className="text-right p-2">{formatCurrency(payment.interest)}</td>
                              <td className="text-right p-2">{formatCurrency(payment.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {amortizationSchedule.length > 60 && (
                        <p className="text-center text-gray-500 py-4">
                          Hiển thị 60 tháng đầu. Tổng cộng {amortizationSchedule.length} tháng.
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default LoanCalculator