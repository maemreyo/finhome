// src/components/subscription/FeatureDemo.tsx
// Demo component showing all subscription feature patterns

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FeatureGate, 
  ConditionalFeature, 
  FeatureWrapper,
  useFeatureGate
} from './FeatureGate'
import { 
  SubscriptionBadge, 
  TrialBadge, 
  FeatureBadge, 
  LimitBadge,
  UpgradeBadge
} from './SubscriptionBadge'
import { UpgradePrompt, QuickUpgradeButton, FeatureLockIcon } from './UpgradePrompt'
import { useSubscriptionContext } from './SubscriptionProvider'
import { 
  Calculator, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Crown, 
  Star,
  Info
} from 'lucide-react'

export function FeatureDemo() {
  const { tier, currentPlan, isInTrial } = useSubscriptionContext()
  const [activeTab, setActiveTab] = useState('basic')
  
  // Hook usage example
  const { hasAccess: hasAdvancedCalc, checkAndTrack } = useFeatureGate({
    featureKey: 'advanced_calculations'
  })

  const handleAdvancedCalculation = async () => {
    const canAccess = await checkAndTrack()
    if (canAccess) {
      // In a real implementation, this would trigger actual advanced calculation
      console.log('Advanced calculation feature accessed')
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Feature Gate Demo</h1>
        <div className="flex items-center justify-center space-x-4">
          <SubscriptionBadge />
          <TrialBadge />
          {tier !== 'professional' && <UpgradeBadge targetTier="professional" />}
        </div>
        <p className="text-gray-600">
          Trạng thái hiện tại: {currentPlan?.nameVi} 
          {isInTrial && ' (Đang dùng thử)'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <Calculator className="h-4 w-4 mr-2" />
            Cơ bản
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Nâng cao</span>
              <FeatureBadge featureKey="advanced_calculations" />
            </div>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Phân tích</span>
              <FeatureBadge featureKey="monte_carlo_analysis" />
            </div>
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <Zap className="h-4 w-4 mr-2" />
            Patterns
          </TabsTrigger>
        </TabsList>

        {/* Basic Features - Always Available */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Tính toán cơ bản</span>
                <Badge variant="secondary">Miễn phí</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Các tính năng này luôn có sẵn cho tất cả người dùng.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button className="w-full">Tính lãi suất đơn giản</Button>
                <Button className="w-full">So sánh 2 khoản vay</Button>
                <Button className="w-full">Tính khả năng chi trả</Button>
                <Button className="w-full">Ước tính tiết kiệm</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Features - Premium Required */}
        <TabsContent value="advanced" className="space-y-6">
          <FeatureGate featureKey="advanced_calculations" promptStyle="banner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Tính toán nâng cao</span>
                  <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Công cụ tính toán tiên tiến cho các kịch bản phức tạp.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleAdvancedCalculation}
                    disabled={!hasAdvancedCalc}
                    className="w-full"
                  >
                    Lãi suất đa tầng
                  </Button>
                  <Button className="w-full">Phân tích trả nợ trước</Button>
                  <Button className="w-full">Kiểm tra sức chịu đựng</Button>
                  <Button className="w-full">Tối ưu hóa khoản vay</Button>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Các tính năng này giúp bạn phân tích sâu hơn về tình hình tài chính.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>

        {/* Analytics - Professional Required */}
        <TabsContent value="analytics" className="space-y-6">
          <FeatureGate featureKey="monte_carlo_analysis" promptStyle="inline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Phân tích Monte Carlo</span>
                  <Badge className="bg-purple-100 text-purple-800">Professional</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Mô phỏng xác suất và phân tích rủi ro chuyên nghiệp.
                </p>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Kết quả mô phỏng</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-sm text-gray-600">Xác suất thành công</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">2.3B</div>
                      <div className="text-sm text-gray-600">Lợi nhuận trung bình</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">15%</div>
                      <div className="text-sm text-gray-600">Rủi ro tối đa</div>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Chạy mô phỏng mới
                </Button>
              </CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>

        {/* Feature Gate Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Conditional Feature Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>ConditionalFeature Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ConditionalFeature 
                  featureKey="real_time_data"
                  fallback={
                    <div className="text-gray-500 text-center py-4">
                      <FeatureLockIcon featureKey="real_time_data" />
                      <p className="mt-2">Dữ liệu thời gian thực chỉ dành cho Premium</p>
                    </div>
                  }
                >
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800">Dữ liệu trực tiếp</h4>
                    <p className="text-green-600 text-sm">Cập nhật mỗi phút</p>
                    <div className="mt-2 text-2xl font-bold text-green-800">
                      8.5% <span className="text-sm">lãi suất hiện tại</span>
                    </div>
                  </div>
                </ConditionalFeature>
              </CardContent>
            </Card>

            {/* Render Props Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>FeatureWrapper Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <FeatureWrapper featureKey="collaboration">
                  {({ hasAccess, access, isLoading }) => (
                    <div>
                      {isLoading ? (
                        <div className="animate-pulse bg-gray-200 rounded h-20"></div>
                      ) : hasAccess ? (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800">Chia sẻ & Cộng tác</h4>
                          <p className="text-blue-600 text-sm">Mời thành viên gia đình tham gia</p>
                          <Button size="sm" className="mt-2">Chia sẻ kế hoạch</Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Crown className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-2">Tính năng cộng tác</p>
                          <QuickUpgradeButton 
                            featureKey="collaboration" 
                            targetTier={access?.upgradeRequired || 'premium'}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </FeatureWrapper>
              </CardContent>
            </Card>

            {/* Usage Limits Example */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Kế hoạch đã tạo</span>
                  <LimitBadge current={tier === 'free' ? 2 : 15} limit={tier === 'free' ? 2 : 50} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Kịch bản so sánh</span>
                  <LimitBadge current={tier === 'free' ? 1 : 8} limit={tier === 'free' ? 1 : 20} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Xuất báo cáo</span>
                  <LimitBadge current={tier === 'free' ? 3 : 25} limit={tier === 'free' ? 3 : 100} showPercentage />
                </div>
              </CardContent>
            </Card>

            {/* Modal Upgrade Prompt */}
            <Card>
              <CardHeader>
                <CardTitle>Modal Upgrade Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Thử nhấn nút này để xem prompt dạng modal.
                </p>
                <UpgradePrompt 
                  featureKey="api_access"
                  access={{
                    hasAccess: false,
                    reason: 'subscription_required',
                    upgradeRequired: 'professional'
                  }}
                  style="modal"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-center">Tóm tắt tính năng theo gói</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="font-semibold">Miễn phí</h3>
              <p className="text-sm text-gray-600">2 kế hoạch, tính toán cơ bản</p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold">Premium</h3>
              <p className="text-sm text-gray-600">Không giới hạn, tính năng nâng cao</p>
            </div>
            <div className="space-y-2">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold">Professional</h3>
              <p className="text-sm text-gray-600">Monte Carlo, API, thương hiệu</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}