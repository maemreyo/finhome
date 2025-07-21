// src/app/[locale]/(dashboard)/billing/page.tsx
// Billing management and history page

'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  Settings,
  AlertTriangle,
  Check,
  Clock,
  FileText
} from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider'
import { useBilling } from '@/hooks/useSubscription'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/config/subscriptionPlans'

export default function BillingPage() {
  const t = useTranslations('BillingPage')
  const { 
    subscription, 
    currentPlan, 
    tier, 
    isInTrial, 
    trialDaysRemaining 
  } = useSubscriptionContext()
  const { billingHistory, isLoading: billingLoading } = useBilling()
  
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  // Mock billing data for demonstration
  const mockBillingHistory = [
    {
      id: '1',
      date: new Date('2024-01-15'),
      amount: 299000,
      status: 'paid',
      description: 'Gói Premium - Hàng tháng',
      invoiceUrl: '#'
    },
    {
      id: '2',
      date: new Date('2023-12-15'),
      amount: 299000,
      status: 'paid',
      description: 'Gói Premium - Hàng tháng',
      invoiceUrl: '#'
    },
    {
      id: '3',
      date: new Date('2023-11-15'),
      amount: 299000,
      status: 'failed',
      description: 'Gói Premium - Hàng tháng',
      invoiceUrl: '#'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>
      case 'pending':
        return <Badge variant="secondary">Đang xử lý</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleUpdatePayment = async () => {
    setIsUpdatingPayment(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsUpdatingPayment(false)
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsCanceling(false)
  }

  return (
    <div className="space-y-6">
      <Header 
        title={t('title')}
        description="Quản lý thanh toán và lịch sử giao dịch của bạn"
      />
      
      <div className="container mx-auto px-6 space-y-8">
        {/* Current Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>{t('current_plan')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPlan ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{currentPlan.nameVi}</h3>
                      <p className="text-gray-600 text-sm">{currentPlan.descriptionVi}</p>
                    </div>
                    <Badge 
                      className={
                        tier === 'professional' ? 'bg-purple-100 text-purple-800' :
                        tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {currentPlan.nameVi}
                    </Badge>
                  </div>

                  {tier !== 'free' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Giá hàng tháng:</span>
                        <p className="font-semibold">{formatPrice(currentPlan.price.monthly)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Chu kỳ thanh toán:</span>
                        <p className="font-semibold">Hàng tháng</p>
                      </div>
                    </div>
                  )}

                  {isInTrial && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Bạn đang trong thời gian dùng thử. Còn <strong>{trialDaysRemaining} ngày</strong> để trải nghiệm miễn phí.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <p className="text-gray-600">Không có thông tin gói đăng ký</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Thông tin thanh toán</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tier !== 'free' ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Ngày thanh toán tiếp theo:</span>
                      <p className="font-semibold">15 tháng 2, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Số tiền:</span>
                      <p className="font-semibold">{currentPlan && formatPrice(currentPlan.price.monthly)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Phương thức thanh toán:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">**** **** **** 4242</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleUpdatePayment}
                      disabled={isUpdatingPayment}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {isUpdatingPayment ? 'Đang cập nhật...' : 'Cập nhật phương thức thanh toán'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {isCanceling ? 'Đang hủy...' : 'Hủy đăng ký'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Bạn đang sử dụng gói miễn phí</p>
                  <Button onClick={() => window.location.href = '/subscription'}>
                    Nâng cấp ngay
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{t('BillingPage.billing_history')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tier === 'free' ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có lịch sử giao dịch nào</p>
                <p className="text-sm">Nâng cấp để xem lịch sử thanh toán</p>
              </div>
            ) : billingLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockBillingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100' :
                        invoice.status === 'failed' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        {invoice.status === 'paid' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : invoice.status === 'failed' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{invoice.description}</p>
                        <p className="text-sm text-gray-600">
                          {invoice.date.toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(invoice.amount)}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    Xem tất cả giao dịch
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {tier !== 'professional' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {tier === 'free' ? 'Nâng cấp lên Premium' : 'Nâng cấp lên Professional'}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {tier === 'free' 
                      ? 'Mở khóa tính năng nâng cao và tận hưởng trải nghiệm hoàn chỉnh'
                      : 'Truy cập API, phân tích Monte Carlo và nhiều tính năng độc quyền'
                    }
                  </p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = '/subscription'}
                >
                  Nâng cấp ngay
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}