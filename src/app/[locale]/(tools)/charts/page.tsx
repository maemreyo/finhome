// src/app/[locale]/charts/page.tsx
// Charts and data visualization page with i18n support

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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('ChartsPage')
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
        name: t('portfolio.properties.apartment'),
        type: 'apartment' as const,
        location: t('portfolio.locations.district1'),
        purchasePrice: 3200000000,
        currentValue: 3800000000,
        purchaseDate: new Date('2022-01-15'),
        monthlyRental: 25000000,
        expenses: 3000000
      },
      {
        id: '2',
        name: t('portfolio.properties.townhouse'),
        type: 'townhouse' as const,
        location: t('portfolio.locations.district2'),
        purchasePrice: 8500000000,
        currentValue: 9200000000,
        purchaseDate: new Date('2021-06-10'),
        monthlyRental: 45000000,
        expenses: 5000000
      },
      {
        id: '3',
        name: t('portfolio.properties.villa'),
        type: 'villa' as const,
        location: t('portfolio.locations.diamond'),
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
      name: t('roi.scenarios.property.name'),
      description: t('roi.scenarios.property.description'),
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
      name: t('roi.scenarios.stocks.name'),
      description: t('roi.scenarios.stocks.description'),
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
      name: t('roi.scenarios.bonds.name'),
      description: t('roi.scenarios.bonds.description'),
      initialInvestment: 3000000000,
      timeframe: 60,
      expectedReturns: Array.from({ length: 60 }, () => 15000000), // Stable 6% annual
      risk: 'low' as const,
      category: 'bonds' as const
    },
    {
      id: 'savings-bank',
      name: t('roi.scenarios.savings.name'),
      description: t('roi.scenarios.savings.description'),
      initialInvestment: 3000000000,
      timeframe: 60,
      expectedReturns: Array.from({ length: 60 }, () => 12500000), // 5% annual
      risk: 'low' as const,
      category: 'savings' as const
    }
  ]

  const handleDemoInteraction = (type: string) => {
    showToast(ToastHelpers.success(t('interactions.demo'), t('interactions.demoMessage', { type })))
    addExperience(10)
    
    addNotification({
      type: 'info',
      title: t('notifications.chartViewed'),
      message: t('notifications.chartAnalyzed', { type }),
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
                  {t('title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                {t('badges.trendAnalysis')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <PieChart className="w-4 h-4 mr-1" />
                {t('badges.portfolioAllocation')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Calculator className="w-4 h-4 mr-1" />
                {t('badges.roiCalculation')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Zap className="w-4 h-4 mr-1" />
                {t('badges.realTimeInteraction')}
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
              {t('tabs.loanAnalysis')}
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              {t('tabs.portfolio')}
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('tabs.roiComparison')}
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
                    <span>{t('loan.title')}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoInteraction(t('loan.interactionType'))}
                    >
                      {t('actions.interact')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {t('loan.description')}
                  </p>
                  
                  <AmortizationChart
                    loanAmount={mockLoanData.totalLoan}
                    interestRate={mockLoanData.interestRate}
                    loanTermMonths={240}
                    monthlyPayment={mockLoanData.totalLoan * (8.5 / 100 / 12 * Math.pow(1 + 8.5 / 100 / 12, 240)) / (Math.pow(1 + 8.5 / 100 / 12, 240) - 1)}
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
                    <span>{t('portfolio.title')}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoInteraction(t('portfolio.interactionType'))}
                    >
                      {t('actions.interact')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {t('portfolio.description')}
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
                    <span>{t('roi.title')}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoInteraction(t('roi.interactionType'))}
                    >
                      {t('actions.interact')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {t('roi.description')}
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
                {t('benefits.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('benefits.trendAnalysis.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('benefits.trendAnalysis.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <PieChart className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('benefits.dataVisualization.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('benefits.dataVisualization.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calculator className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('benefits.accurateCalculation.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('benefits.accurateCalculation.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('benefits.realTimeInteraction.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('benefits.realTimeInteraction.description')}
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