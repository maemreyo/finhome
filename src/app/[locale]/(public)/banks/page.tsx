// src/app/[locale]/banks/page.tsx
// Bank interest rates comparison page with i18n support

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Building, TrendingUp, Calculator, Percent, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import BankRateComparison from '@/components/banks/BankRateComparison'
import { BankLoanProduct } from '@/lib/services/bankService'

export default function BanksPage() {
  const t = useTranslations('BanksPage')
  const [selectedBank, setSelectedBank] = useState<BankLoanProduct | null>(null)

  const handleBankSelect = (bank: BankLoanProduct) => {
    setSelectedBank(bank)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('description')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                {t('badges.dailyUpdate')}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Building className="w-4 h-4 mr-1" />
                {t('badges.bankCount')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Main Comparison Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="comparison" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  {t('tabs.comparison')}
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('tabs.trends')}
                </TabsTrigger>
                <TabsTrigger value="guide" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {t('tabs.guide')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-6">
                <BankRateComparison
                  initialLoanAmount={2000000000}
                  initialLoanTerm={20}
                  onBankSelect={handleBankSelect}
                />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('trends.chartTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">{t('trends.chartPlaceholder')}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('trends.averageRates')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>{t('trends.rates.15years')}:</span>
                          <span className="font-semibold">7.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('trends.rates.20years')}:</span>
                          <span className="font-semibold">8.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('trends.rates.25years')}:</span>
                          <span className="font-semibold">8.6%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('trends.forecast')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-900">{t('trends.q1')}</p>
                          <p className="text-green-700">{t('trends.q1desc')}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="font-medium text-yellow-900">{t('trends.q2')}</p>
                          <p className="text-yellow-700">{t('trends.q2desc')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="guide" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('guide.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Step-by-step guide */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">{t('guide.processTitle')}</h3>
                        
                        <div className="space-y-3">
                          {[
                            {
                              step: 1,
                              title: t('guide.steps.step1.title'),
                              content: t('guide.steps.step1.content')
                            },
                            {
                              step: 2,
                              title: t('guide.steps.step2.title'),
                              content: t('guide.steps.step2.content')
                            },
                            {
                              step: 3,
                              title: t('guide.steps.step3.title'),
                              content: t('guide.steps.step3.content')
                            },
                            {
                              step: 4,
                              title: t('guide.steps.step4.title'),
                              content: t('guide.steps.step4.content')
                            },
                            {
                              step: 5,
                              title: t('guide.steps.step5.title'),
                              content: t('guide.steps.step5.content')
                            }
                          ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {item.step}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4">{t('guide.requirements.title')}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">{t('guide.requirements.borrower.title')}:</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• {t('guide.requirements.borrower.age')}</li>
                              <li>• {t('guide.requirements.borrower.income')}</li>
                              <li>• {t('guide.requirements.borrower.credit')}</li>
                              <li>• {t('guide.requirements.borrower.dti')}</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">{t('guide.requirements.property.title')}:</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• {t('guide.requirements.property.title_deed')}</li>
                              <li>• {t('guide.requirements.property.dispute')}</li>
                              <li>• {t('guide.requirements.property.value')}</li>
                              <li>• {t('guide.requirements.property.transfer')}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Selected Bank Details */}
            {selectedBank && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      {t('sidebar.selectedBank')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {selectedBank.bankName}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={selectedBank.rateType === 'promotional' ? 'default' : 'secondary'}>
                          {selectedBank.rateType === 'promotional' ? t('sidebar.promotional') : t('sidebar.standard')}
                        </Badge>
                        <Badge variant="outline">
                          {selectedBank.loanTermYears} {t('sidebar.years')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{t('sidebar.interestRate')}:</span>
                          <span className="text-sm font-medium">{selectedBank.interestRate}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">{t('sidebar.processingFee')}:</span>
                          <span className="text-sm font-medium">{selectedBank.processingFee}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">{t('sidebar.minDownPayment')}:</span>
                          <span className="text-sm font-medium">{selectedBank.minimumDownPayment || 20}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <Button className="w-full">
                        <Calculator className="w-4 h-4 mr-2" />
                        {t('sidebar.createPlan')}
                      </Button>
                      <Button variant="outline" className="w-full">
                        {t('sidebar.contactBank')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Current Market Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-green-600" />
                  {t('sidebar.currentRates')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">{t('sidebar.lowest')}:</span>
                    <span className="text-green-600 font-bold">7.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium">{t('sidebar.average')}:</span>
                    <span className="text-blue-600 font-bold">8.1%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm font-medium">{t('sidebar.highest')}:</span>
                    <span className="text-orange-600 font-bold">9.2%</span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  * {t('sidebar.lastUpdate')}
                </div>
              </CardContent>
            </Card>

            {/* Quick Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  {t('sidebar.quickCalc')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">💡 {t('sidebar.tips.saving.title')}</p>
                    <p className="text-blue-700">
                      {t('sidebar.tips.saving.content')}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">📊 {t('sidebar.tips.rule.title')}</p>
                    <p className="text-green-700">
                      {t('sidebar.tips.rule.content')}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-900 mb-1">🏦 {t('sidebar.tips.compare.title')}</p>
                    <p className="text-orange-700">
                      {t('sidebar.tips.compare.content')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}