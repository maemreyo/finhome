// src/app/[locale]/(dashboard)/subscription/checkout/page.tsx
// Subscription checkout and upgrade flow

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, CreditCard, Shield, ArrowLeft } from 'lucide-react'
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider'
import { useAuth } from '@/hooks/useAuth'
import { SUBSCRIPTION_PLANS, formatPrice, calculateYearlyDiscount } from '@/config/subscriptionPlans'
import { UserSubscriptionTier } from '@/lib/supabase/types'

export default function CheckoutPage() {
  const t = useTranslations('subscription')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tier: currentTier, refreshSubscription } = useSubscriptionContext()
  const { user } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'plan' | 'payment' | 'processing' | 'success'>('plan')
  
  // Get plan and billing cycle from URL params
  const planParam = searchParams.get('plan') as UserSubscriptionTier
  const billingParam = searchParams.get('billing') || 'monthly'
  const featureParam = searchParams.get('feature')
  
  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.tier === planParam)
  const isYearly = billingParam === 'yearly'
  
  useEffect(() => {
    if (!selectedPlan || selectedPlan.tier === 'free') {
      router.push('/subscription')
    }
  }, [selectedPlan, router])

  const handlePayment = async () => {
    if (!selectedPlan) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      setStep('processing')
      
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.tier,
          billing: billingParam,
          userId: user?.id || '',
          featureKey: featureParam
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }
      
      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        // For demo purposes, simulate success
        setStep('success')
        await refreshSubscription()
      }
      
    } catch (err) {
      setError('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.')
      setStep('payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'payment') {
      setStep('plan')
    } else {
      router.push('/subscription')
    }
  }

  if (!selectedPlan) {
    return null
  }

  const price = isYearly ? selectedPlan.price.yearly : selectedPlan.price.monthly
  const discount = isYearly ? calculateYearlyDiscount(selectedPlan) : 0

  return (
    <div className="container max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold">
          {step === 'success' ? 'Nâng cấp thành công!' : 'Nâng cấp gói dịch vụ'}
        </h1>
        <p className="text-gray-600 mt-2">
          {step === 'success' 
            ? 'Tài khoản của bạn đã được nâng cấp thành công.'
            : 'Hoàn tất quá trình nâng cấp để truy cập các tính năng cao cấp.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan Summary */}
        <div className="lg:col-span-2 space-y-6">
          {step === 'success' ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-green-800">
                      Chào mừng bạn đến với {selectedPlan.nameVi}!
                    </CardTitle>
                    <p className="text-green-600 text-sm">
                      Bạn hiện có quyền truy cập vào tất cả các tính năng cao cấp.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Gói đã chọn:</span>
                    <p className="font-semibold">{selectedPlan.nameVi}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Chu kỳ thanh toán:</span>
                    <p className="font-semibold">{isYearly ? 'Hàng năm' : 'Hàng tháng'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Số tiền:</span>
                    <p className="font-semibold">{formatPrice(price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày gia hạn tiếp theo:</span>
                    <p className="font-semibold">
                      {new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex space-x-4">
                  <Button onClick={() => router.push('/dashboard')}>
                    Đi đến Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/subscription')}
                  >
                    Quản lý đăng ký
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Plan Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết gói đăng ký</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedPlan.nameVi}</h3>
                      <p className="text-gray-600 text-sm">{selectedPlan.descriptionVi}</p>
                    </div>
                    <Badge variant="secondary">
                      {isYearly ? 'Hàng năm' : 'Hàng tháng'}
                    </Badge>
                  </div>
                  
                  {featureParam && (
                    <Alert>
                      <AlertDescription>
                        Bạn đang nâng cấp để sử dụng tính năng: <strong>{featureParam}</strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-medium">Tính năng bao gồm:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedPlan.features.slice(0, 8).map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature.nameVi}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPlan.trial?.enabled && currentTier === 'free' && (
                    <Alert>
                      <AlertDescription>
                        🎉 Bạn sẽ nhận được {selectedPlan.trial.days} ngày dùng thử miễn phí!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Phương thức thanh toán</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">Thẻ tín dụng / Thẻ ghi nợ</p>
                          <p className="text-sm text-gray-600">
                            Thanh toán an toàn qua Stripe
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>Thanh toán được mã hóa và bảo mật 100%</span>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Processing */}
              {step === 'processing' && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Đang xử lý thanh toán...</h3>
                    <p className="text-gray-600 text-sm">
                      Vui lòng không đóng trang này. Quá trình có thể mất vài giây.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{selectedPlan.nameVi}</span>
                  <span>{formatPrice(isYearly ? selectedPlan.price.monthly * 12 : selectedPlan.price.monthly)}</span>
                </div>
                
                {isYearly && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá hàng năm ({discount}%)</span>
                    <span>-{formatPrice(selectedPlan.price.monthly * 12 - selectedPlan.price.yearly)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(price)}</span>
                </div>
                
                <p className="text-sm text-gray-600">
                  {isYearly ? 'Thanh toán mỗi năm' : 'Thanh toán mỗi tháng'}
                </p>
              </div>

              {step !== 'success' && step !== 'processing' && (
                <div className="pt-4">
                  {step === 'plan' ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setStep('payment')}
                    >
                      Tiếp tục thanh toán
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handlePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Xác nhận thanh toán'
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-800 mb-1">
                    Thanh toán an toàn
                  </h4>
                  <p className="text-blue-600">
                    Thông tin thẻ của bạn được mã hóa SSL 256-bit và không được lưu trữ trên máy chủ của chúng tôi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}