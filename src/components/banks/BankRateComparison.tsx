// src/components/banks/BankRateComparison.tsx
// Bank interest rate comparison component

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Building, 
  Calculator, 
  TrendingDown, 
  TrendingUp, 
  Percent, 
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Star,
  Info
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

import { bankService } from '@/lib/services/bankService'
import { formatCurrency } from '@/lib/utils'
import { BankComparison, BankLoanProduct } from '@/lib/services/bankService'
import { cn } from '@/lib/utils'

interface BankRateComparisonProps {
  initialLoanAmount?: number
  initialLoanTerm?: number
  onBankSelect?: (bank: BankLoanProduct) => void
  className?: string
}

export const BankRateComparison: React.FC<BankRateComparisonProps> = ({
  initialLoanAmount = 2000000000,
  initialLoanTerm = 20,
  onBankSelect,
  className
}) => {
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount)
  const [loanTerm, setLoanTerm] = useState(initialLoanTerm)
  const [downPayment, setDownPayment] = useState([20])
  const [comparison, setComparison] = useState<BankComparison | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [availableBanks, setAvailableBanks] = useState<Array<{ name: string; code: string; products: number }>>([])

  // Load available banks
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const banks = await bankService.getVietnameseBanks()
        setAvailableBanks(banks)
      } catch (error) {
        console.error('Error loading banks:', error)
      }
    }
    loadBanks()
  }, [])

  // Perform comparison
  const performComparison = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await bankService.compareLoanOptions(
        loanAmount,
        loanTerm,
        downPayment[0]
      )
      setComparison(result)
    } catch (error) {
      console.error('Error comparing rates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loanAmount, loanTerm, downPayment])

  // Auto-compare when parameters change
  useEffect(() => {
    const timer = setTimeout(performComparison, 500)
    return () => clearTimeout(timer)
  }, [loanAmount, loanTerm, downPayment, performComparison])

  const actualLoanAmount = loanAmount * ((100 - downPayment[0]) / 100)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            So Sánh Lãi Suất Ngân Hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Loan Amount */}
            <div className="space-y-2">
              <Label>Tổng Giá Trị Bất Động Sản</Label>
              <Input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                placeholder="2,000,000,000"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Số tiền cần vay: {formatCurrency(actualLoanAmount)}
              </p>
            </div>

            {/* Loan Term */}
            <div className="space-y-2">
              <Label>Thời Gian Vay (năm)</Label>
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
          </div>

          {/* Down Payment Slider */}
          <div className="space-y-3">
            <Label>Vốn Tự Có: {downPayment[0]}%</Label>
            <div className="px-3">
              <Slider
                value={downPayment}
                onValueChange={setDownPayment}
                max={50}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>10%</span>
                <span>Vốn tự có: {formatCurrency(loanAmount * (downPayment[0] / 100))}</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
            Ngân Hàng Hiện Có
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableBanks.map(bank => (
              <div key={bank.code} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-sm">{bank.name}</div>
                <div className="text-xs text-muted-foreground">
                  {bank.products} sản phẩm
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && !isLoading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Lãi Suất Thấp Nhất</span>
                </div>
                <div className="text-lg font-bold text-green-800">
                  {comparison.bestOptions.lowestRate?.bankName}
                </div>
                <div className="text-sm text-green-700">
                  {comparison.bestOptions.lowestRate?.interestRate}% / năm
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Trả Ít Nhất</span>
                </div>
                <div className="text-lg font-bold text-blue-800">
                  {comparison.bestOptions.lowestPayment?.bankName}
                </div>
                <div className="text-sm text-blue-700">
                  {comparison.products.find(p => p.product.id === comparison.bestOptions.lowestPayment?.id) &&
                    formatCurrency(comparison.products.find(p => p.product.id === comparison.bestOptions.lowestPayment?.id)!.monthlyPayment)
                  }/tháng
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Giá Trị Tốt Nhất</span>
                </div>
                <div className="text-lg font-bold text-purple-800">
                  {comparison.bestOptions.bestValue?.bankName}
                </div>
                <div className="text-sm text-purple-700">
                  Tiết kiệm: {comparison.products.find(p => p.product.id === comparison.bestOptions.bestValue?.id)?.savings &&
                    formatCurrency(comparison.products.find(p => p.product.id === comparison.bestOptions.bestValue?.id)!.savings!)
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Chi Tiết So Sánh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.products.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Bank Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Building className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {item.product.bankName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant={item.product.rateType === 'promotional' ? 'default' : 'secondary'}>
                                    {item.product.rateType === 'promotional' ? 'Khuyến mãi' : 'Tiêu chuẩn'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {item.product.loanTermYears} năm
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                  {item.product.interestRate}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Lãi suất
                                </div>
                              </div>

                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(item.monthlyPayment)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Trả/tháng
                                </div>
                              </div>

                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-orange-600">
                                  {formatCurrency(item.totalInterest)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Tổng lãi
                                </div>
                              </div>

                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-purple-600">
                                  {formatCurrency(item.totalPayment)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Tổng thanh toán
                                </div>
                              </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Phí xử lý:</span>
                                  <span>{item.product.processingFee}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Phí trả sớm:</span>
                                  <span>{item.product.earlyPaymentPenalty}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Vốn tối thiểu:</span>
                                  <span>
                                    {item.product.minimumDownPayment || 20}%
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Hạn mức tối thiểu:</span>
                                  <span>
                                    {item.product.minimumLoanAmount ? 
                                      formatCurrency(item.product.minimumLoanAmount) : 
                                      'Không giới hạn'
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Hạn mức tối đa:</span>
                                  <span>
                                    {item.product.maximumLoanAmount ? 
                                      formatCurrency(item.product.maximumLoanAmount) : 
                                      'Không giới hạn'
                                    }
                                  </span>
                                </div>
                                {item.savings && item.savings > 0 && (
                                  <div className="flex justify-between text-green-600 font-medium">
                                    <span>Tiết kiệm:</span>
                                    <span>{formatCurrency(item.savings)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Special Conditions */}
                            {item.product.specialConditions && item.product.specialConditions.length > 0 && (
                              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-yellow-900">
                                    Điều kiện đặc biệt:
                                  </span>
                                </div>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                  {item.product.specialConditions.map((condition, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                                      <span>{condition}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="ml-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => onBankSelect?.(item.product)}
                                    size="sm"
                                    className="whitespace-nowrap"
                                  >
                                    Chọn Ngân Hàng
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Sử dụng thông tin này để tạo kế hoạch tài chính</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Mẹo Chọn Ngân Hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">So sánh tổng chi phí</p>
                      <p className="text-muted-foreground">Xem xét tổng thanh toán, không chỉ lãi suất hàng tháng</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Kiểm tra điều kiện</p>
                      <p className="text-muted-foreground">Đảm bảo bạn đáp ứng các yêu cầu của ngân hàng</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Đàm phán lãi suất</p>
                      <p className="text-muted-foreground">Khách hàng VIP có thể được ưu đãi lãi suất tốt hơn</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Xem xét dịch vụ</p>
                      <p className="text-muted-foreground">Chất lượng dịch vụ và hỗ trợ khách hàng cũng quan trọng</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Results */}
      {comparison && comparison.products.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm vay phù hợp</h3>
            <p className="text-muted-foreground mb-4">
              Thử điều chỉnh số tiền vay hoặc thời gian vay để tìm được sản phẩm phù hợp
            </p>
            <Button onClick={performComparison}>
              Tìm Kiếm Lại
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BankRateComparison