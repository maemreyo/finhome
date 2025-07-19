// src/components/investments/InvestmentPortfolio.tsx
// Comprehensive investment portfolio tracking and ROI analysis component

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Filter,
  Download,
  Percent,
  Building,
  Home,
  Calculator
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useInvestments } from '@/lib/hooks/useInvestments'
import type { Investment as InvestmentType } from '@/lib/hooks/useInvestments'

// Use the Investment type from useInvestments hook
type Investment = InvestmentType

interface PortfolioMetrics {
  totalInvestment: number
  totalCurrentValue: number
  totalUnrealizedGain: number
  totalRealizedGain: number
  totalReturn: number
  averageROI: number
  monthlyPassiveIncome: number
  portfolioRiskScore: number
  diversificationScore: number
}

interface InvestmentPortfolioProps {
  userId?: string
  className?: string
}

export const InvestmentPortfolio: React.FC<InvestmentPortfolioProps> = ({
  userId,
  className
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y')
  const [filterType, setFilterType] = useState<'all' | 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'planning' | 'purchased' | 'rented' | 'sold'>('all')

  // Use the real investment hook instead of mock data
  const {
    investments,
    metrics,
    isLoading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getInvestmentsByType,
    getTopPerformers,
    getWorstPerformers
  } = useInvestments({
    userId,
    filterType,
    filterStatus
  })

  // Use metrics from the hook instead of calculating locally
  const portfolioMetrics: PortfolioMetrics = {
    totalInvestment: metrics.totalInvestment,
    totalCurrentValue: metrics.totalCurrentValue,
    totalUnrealizedGain: metrics.totalUnrealizedGain,
    totalRealizedGain: metrics.totalRealizedGain,
    totalReturn: metrics.totalReturn,
    averageROI: metrics.averageROI,
    monthlyPassiveIncome: metrics.monthlyPassiveIncome,
    portfolioRiskScore: metrics.portfolioRiskScore,
    diversificationScore: metrics.diversificationScore
  }

  const getTypeLabel = (type: Investment['type']) => {
    switch (type) {
      case 'apartment': return 'Căn hộ'
      case 'house': return 'Nhà riêng'
      case 'villa': return 'Biệt thự'
      case 'townhouse': return 'Nhà phố'
      case 'commercial': return 'Thương mại'
      default: return type
    }
  }

  const getStatusLabel = (status: Investment['status']) => {
    switch (status) {
      case 'planning': return 'Đang lập kế hoạch'
      case 'purchased': return 'Đã mua'
      case 'rented': return 'Đang cho thuê'
      case 'sold': return 'Đã bán'
      default: return status
    }
  }

  const getStatusColor = (status: Investment['status']) => {
    switch (status) {
      case 'planning': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'purchased': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'rented': return 'bg-green-100 text-green-800 border-green-300'
      case 'sold': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiskColor = (riskLevel: Investment['riskLevel']) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTypeIcon = (type: Investment['type']) => {
    switch (type) {
      case 'apartment': return Home
      case 'house': return Home
      case 'villa': return Building
      case 'townhouse': return Home
      case 'commercial': return Building
      default: return Home
    }
  }

  // Investments are already filtered by the hook
  const filteredInvestments = investments

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh Mục Đầu Tư</h2>
          <p className="text-gray-600 mt-1">Theo dõi hiệu suất và ROI của các khoản đầu tư bất động sản</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="apartment">Căn hộ</SelectItem>
              <SelectItem value="house">Nhà riêng</SelectItem>
              <SelectItem value="villa">Biệt thự</SelectItem>
              <SelectItem value="townhouse">Nhà phố</SelectItem>
              <SelectItem value="commercial">Thương mại</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="planning">Đang lập kế hoạch</SelectItem>
              <SelectItem value="purchased">Đã mua</SelectItem>
              <SelectItem value="rented">Đang cho thuê</SelectItem>
              <SelectItem value="sold">Đã bán</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Xuất báo cáo
          </Button>
          
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Thêm đầu tư
          </Button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Tổng Đầu Tư</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(portfolioMetrics.totalInvestment)}
                  </p>
                  <div className="flex items-center text-sm mt-1">
                    <span className="text-blue-700">Giá trị hiện tại: </span>
                    <span className="font-medium ml-1">
                      {formatCurrency(portfolioMetrics.totalCurrentValue)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-700" />
                </div>
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
                  <p className="text-sm font-medium text-green-600">Lợi Nhuận</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(portfolioMetrics.totalReturn)}
                  </p>
                  <div className="flex items-center text-sm mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                    <span className="text-green-700">
                      ROI: {portfolioMetrics.averageROI.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
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
                  <p className="text-sm font-medium text-purple-600">Thu Nhập Thụ Động</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(portfolioMetrics.monthlyPassiveIncome)}
                  </p>
                  <div className="flex items-center text-sm mt-1">
                    <span className="text-purple-700">/tháng</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Điểm Rủi Ro</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {portfolioMetrics.portfolioRiskScore.toFixed(1)}/10
                  </p>
                  <div className="flex items-center text-sm mt-1">
                    <span className="text-orange-700">
                      Đa dạng hóa: {portfolioMetrics.diversificationScore.toFixed(1)}/10
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-200 rounded-lg">
                  <Target className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="investments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="investments">Danh Sách Đầu Tư</TabsTrigger>
          <TabsTrigger value="performance">Hiệu Suất</TabsTrigger>
          <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
          <TabsTrigger value="cashflow">Dòng Tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="investments" className="space-y-4">
          {/* Investment List */}
          <div className="space-y-4">
            {filteredInvestments.map((investment, index) => {
              const IconComponent = getTypeIcon(investment.type)
              
              return (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Investment Icon and Basic Info */}
                          <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {investment.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">{investment.location}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {getTypeLabel(investment.type)}
                                  </Badge>
                                  <Badge variant="outline" className={getStatusColor(investment.status)}>
                                    {getStatusLabel(investment.status)}
                                  </Badge>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className={getRiskColor(investment.riskLevel)}>
                                          Rủi ro: {investment.riskLevel}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Mức độ rủi ro đầu tư: {investment.riskLevel}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              
                              {/* ROI Indicator */}
                              <div className="text-right">
                                <div className={cn(
                                  "text-2xl font-bold",
                                  investment.roiPercentage >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {investment.roiPercentage >= 0 ? '+' : ''}{investment.roiPercentage.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-500">ROI</div>
                              </div>
                            </div>

                            {/* Financial Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">Giá mua</div>
                                <div className="font-semibold text-blue-600">
                                  {formatCurrency(investment.purchasePrice)}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">Giá hiện tại</div>
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(investment.currentValue)}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">Lợi nhuận</div>
                                <div className={cn(
                                  "font-semibold",
                                  investment.totalReturn >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {formatCurrency(investment.totalReturn)}
                                </div>
                              </div>
                              
                              {investment.monthlyRental && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-sm text-gray-600">Thu nhập/tháng</div>
                                  <div className="font-semibold text-purple-600">
                                    {formatCurrency(investment.monthlyRental)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Cash Flow and Additional Info */}
                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex items-center gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Dòng tiền/tháng: </span>
                                  <span className={cn(
                                    "font-medium",
                                    investment.cashFlow >= 0 ? "text-green-600" : "text-red-600"
                                  )}>
                                    {formatCurrency(investment.cashFlow)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Mua từ: </span>
                                  <span className="font-medium">
                                    {investment.purchaseDate.toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Calculator className="w-3 h-3 mr-1" />
                                  Tính toán
                                </Button>
                                <Button variant="outline" size="sm">
                                  Chi tiết
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}

            {filteredInvestments.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Không có đầu tư nào</h3>
                  <p className="text-gray-500 mb-4">
                    Thêm khoản đầu tư bất động sản đầu tiên để bắt đầu theo dõi
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm đầu tư mới
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopPerformers(3).map((investment, index) => (
                    <div key={investment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">{investment.name}</div>
                        <div className="text-sm text-gray-600">{getTypeLabel(investment.type)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{investment.roiPercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">ROI</div>
                      </div>
                    </div>
                  ))}
                  {getTopPerformers(3).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có dữ liệu hiệu suất
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getInvestmentsByType().map((typeData) => (
                    <div key={typeData.type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{getTypeLabel(typeData.type)}</span>
                        <span className="text-sm text-gray-600">
                          {typeData.count} ({typeData.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={typeData.percentage} className="h-2" />
                    </div>
                  ))}
                  {getInvestmentsByType().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có đầu tư nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân Bổ Theo Loại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getInvestmentsByType().map((typeData) => {
                    const percentage = typeData.percentage
                    const IconComponent = getTypeIcon(typeData.type)
                    
                    return (
                      <div key={typeData.type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{getTypeLabel(typeData.type)}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {typeData.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={percentage} className="h-3" />
                          <div 
                            className="absolute top-0 left-0 h-3 bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {getInvestmentsByType().length === 0 && (
                    <div className="text-center py-8">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Chưa có đầu tư nào để phân tích</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân Tích Rủi Ro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Điểm rủi ro tổng thể</span>
                    <span className="font-medium">{portfolioMetrics.portfolioRiskScore.toFixed(1)}/10</span>
                  </div>
                  <Progress value={portfolioMetrics.portfolioRiskScore * 10} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Mức độ đa dạng hóa</span>
                    <span className="font-medium">{portfolioMetrics.diversificationScore.toFixed(1)}/10</span>
                  </div>
                  <Progress value={portfolioMetrics.diversificationScore * 10} className="h-2" />
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="font-medium">Khuyến nghị:</h4>
                  <div className="space-y-2 text-sm">
                    {portfolioMetrics.diversificationScore < 5 && (
                      <div className="flex items-start gap-2 text-amber-700">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Nên đa dạng hóa thêm các loại bất động sản và khu vực</span>
                      </div>
                    )}
                    {portfolioMetrics.portfolioRiskScore > 7 && (
                      <div className="flex items-start gap-2 text-red-700">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Danh mục có mức rủi ro cao, xem xét cân bằng lại</span>
                      </div>
                    )}
                    {portfolioMetrics.averageROI > 10 && (
                      <div className="flex items-start gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>ROI trung bình tốt, duy trì chiến lược hiện tại</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dòng Tiền Hàng Tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{investment.name}</div>
                      <div className="text-sm text-gray-600">{getStatusLabel(investment.status)}</div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "font-semibold",
                        investment.cashFlow >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(investment.cashFlow)}
                      </div>
                      <div className="text-sm text-gray-500">/tháng</div>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <div className="font-semibold text-blue-900">Tổng Thu Nhập Thụ Động</div>
                    <div className="text-sm text-blue-700">Dòng tiền dương hàng tháng</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(portfolioMetrics.monthlyPassiveIncome)}
                    </div>
                    <div className="text-sm text-blue-700">/tháng</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InvestmentPortfolio