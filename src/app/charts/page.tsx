// src/app/charts/page.tsx
// Comprehensive data visualization showcase page

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Calculator,
  PieChart,
  ArrowRight,
  Zap
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AmortizationChart from '@/components/charts/AmortizationChart'
import PortfolioChart from '@/components/charts/PortfolioChart'
import ROIComparisonChart from '@/components/charts/ROIComparisonChart'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'

export default function ChartsPage() {
  const { showToast } = useToast()
  const { addNotification, addExperience } = useGlobalState()
  const [activeDemo, setActiveDemo] = useState('loan')

  // Mock data for demonstrations
  const mockLoanData = {
    amortizationData: Array.from({ length: 240 }, (_, i) => {
      const month = i + 1
      const principal = 2400000000
      const monthlyRate = 8.5 / 100 / 12
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, 240)) / (Math.pow(1 + monthlyRate, 240) - 1)
      
      let balance = principal
      let cumulativeInterest = 0
      let cumulativePrincipal = 0
      
      for (let j = 0; j < month; j++) {
        const interestPayment = balance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        balance -= principalPayment
        cumulativeInterest += interestPayment
        cumulativePrincipal += principalPayment
      }
      
      return {
        month,
        payment: monthlyPayment,
        principal: monthlyPayment - (balance * monthlyRate),
        interest: balance * monthlyRate,
        balance: Math.max(0, balance),
        cumulativeInterest,
        cumulativePrincipal
      }
    }),
    totalLoan: 2400000000,
    interestRate: 8.5
  }

  const mockPortfolioData = {
    properties: [
      {
        id: '1',
        name: 'Căn hộ Vinhomes Central Park',
        type: 'apartment' as const,
        location: 'Quận 1, TP.HCM',
        purchasePrice: 3200000000,
        currentValue: 3800000000,
        purchaseDate: new Date('2022-01-15'),
        monthlyRental: 25000000,
        expenses: 3000000
      },
      {
        id: '2',
        name: 'Nhà phố Thảo Điền',
        type: 'townhouse' as const,
        location: 'Quận 2, TP.HCM',
        purchasePrice: 8500000000,
        currentValue: 9200000000,
        purchaseDate: new Date('2021-06-10'),
        monthlyRental: 45000000,
        expenses: 5000000
      },
      {
        id: '3',
        name: 'Biệt thự Đảo Kim Cương',
        type: 'villa' as const,
        location: 'Quận 2, TP.HCM',
        purchasePrice: 15000000000,
        currentValue: 16500000000,
        purchaseDate: new Date('2020-03-20'),
        monthlyRental: 80000000,
        expenses: 8000000
      }
    ],
    performance: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1),
      totalValue: 29500000000 + (i * 200000000),
      totalInvestment: 26700000000,
      monthlyIncome: 150000000,
      monthlyExpenses: 16000000
    }))
  }

  const mockROIScenarios = [
    {
      id: 'property-hcm',
      name: 'BĐS Trung tâm TP.HCM',
      description: 'Căn hộ cao cấp khu trung tâm',
      initialInvestment: 3000000000,
      timeframe: 60,
      expectedReturns: Array.from({ length: 60 }, (_, i) => {
        const baseReturn = 25000000 - 3000000 // Monthly rental - expenses
        const appreciation = (3000000000 * 0.08 / 12) // 8% annual appreciation
        return baseReturn + (i > 12 ? appreciation : 0)
      }),
      risk: 'medium' as const,
      category: 'property' as const
    },
    {
      id: 'stocks-vn30',
      name: 'VN30 Index Fund',
      description: 'Quỹ chỉ số cổ phiếu VN30',
      initialInvestment: 3000000000,
      timeframe: 60,
      expectedReturns: Array.from({ length: 60 }, (_, i) => {
        const volatility = Math.sin(i * 0.2) * 50000000
        return 20000000 + volatility // Average 8% annual return with volatility
      }),
      risk: 'high' as const,
      category: 'stocks' as const
    },
    {
      id: 'bonds-government',
      name: 'Trái phiếu chính phủ',
      description: 'Trái phiếu chính phủ 5 năm',
      initialInvestment: 3000000000,
      timeframe: 60,
      expectedReturns: Array.from({ length: 60 }, () => 15000000), // Stable 6% annual
      risk: 'low' as const,
      category: 'bonds' as const
    },
    {
      id: 'savings-bank',
      name: 'Tiết kiệm ngân hàng',
      description: 'Gửi tiết kiệm kỳ hạn 12 tháng',
      initialInvestment: 3000000000,
      timeframe: 60,
      expectedReturns: Array.from({ length: 60 }, () => 12500000), // 5% annual
      risk: 'low' as const,
      category: 'savings' as const
    }
  ]

  const handleDemoInteraction = (type: string) => {
    showToast(ToastHelpers.success('Demo tương tác', `Bạn đã tương tác với biểu đồ ${type}`))
    addExperience(10)
    
    addNotification({
      type: 'info',
      title: 'Biểu đồ được xem',
      message: `Dữ liệu ${type} đã được phân tích và hiển thị`,
      isRead: false
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Biểu Đồ & Phân Tích Dữ Liệu
                </h1>
                <p className="text-gray-600 mt-1">
                  Trực quan hóa dữ liệu tài chính với các biểu đồ tương tác thông minh
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Phân tích xu hướng
              </Badge>
              <Badge variant="outline" className="text-sm">
                <PieChart className="w-4 h-4 mr-1" />
                Phân bổ danh mục
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Calculator className="w-4 h-4 mr-1" />
                Tính toán ROI
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Zap className="w-4 h-4 mr-1" />
                Tương tác thời gian thực
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="loan" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Phân tích khoản vay
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Danh mục đầu tư
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              So sánh ROI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loan" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Biểu Đồ Phân Tích Khoản Vay</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoInteraction('khoản vay')}
                    >
                      Tương tác
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Phân tích chi tiết lịch trả nợ cho khoản vay mua nhà 3 tỷ VND, lãi suất 8.5%/năm, thời hạn 20 năm.
                    Biểu đồ hiển thị sự thay đổi dư nợ và cơ cấu thanh toán theo thời gian.
                  </p>
                  
                  <AmortizationChart
                    amortizationData={mockLoanData.amortizationData}
                    totalLoan={mockLoanData.totalLoan}
                    interestRate={mockLoanData.interestRate}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Phân Tích Danh Mục Đầu Tư</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoInteraction('danh mục đầu tư')}
                    >
                      Tương tác
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Tổng quan danh mục bất động sản với 3 tài sản trị giá 29.5 tỷ VND.
                    Theo dõi hiệu suất, phân bổ theo loại tài sản và dòng tiền hàng tháng.
                  </p>
                  
                  <PortfolioChart
                    properties={mockPortfolioData.properties}
                    performance={mockPortfolioData.performance}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>So Sánh ROI Các Kênh Đầu Tư</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoInteraction('so sánh ROI')}
                    >
                      Tương tác
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    So sánh hiệu suất đầu tư giữa bất động sản, cổ phiếu, trái phiếu và tiết kiệm ngân hàng.
                    Phân tích rủi ro và lợi nhuận để đưa ra quyết định đầu tư thông minh.
                  </p>
                  
                  <ROIComparisonChart
                    scenarios={mockROIScenarios}
                    highlightedScenario="property-hcm"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Integration Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-center text-xl text-blue-900">
                Lợi Ích Hệ Thống Biểu Đồ Tích Hợp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Phân Tích Xu Hướng</h4>
                  <p className="text-sm text-gray-600">
                    Theo dõi và dự báo xu hướng tài chính
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <PieChart className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Trực Quan Dữ Liệu</h4>
                  <p className="text-sm text-gray-600">
                    Hiển thị dữ liệu phức tạp một cách dễ hiểu
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calculator className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Tính Toán Chính Xác</h4>
                  <p className="text-sm text-gray-600">
                    Công thức tài chính chính xác và đáng tin cậy
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Tương Tác Thời Gian Thực</h4>
                  <p className="text-sm text-gray-600">
                    Thay đổi tham số và xem kết quả ngay lập tức
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}