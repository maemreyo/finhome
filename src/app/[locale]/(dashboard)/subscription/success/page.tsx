// src/app/[locale]/(dashboard)/subscription/success/page.tsx
// Subscription success page after Stripe checkout

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider'

export default function SubscriptionSuccessPage() {
  const t = useTranslations('subscription')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshSubscription, currentPlan, tier } = useSubscriptionContext()
  
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId] = useState(searchParams.get('session_id'))

  useEffect(() => {
    const initializeSuccess = async () => {
      // Refresh subscription data
      await refreshSubscription()
      setIsLoading(false)
    }

    initializeSuccess()
  }, [refreshSubscription])

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-6 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">Đang xử lý...</h1>
        <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto w-24 h-24"
        >
          <div className="absolute inset-0 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border-4 border-green-200 border-t-green-500 rounded-full"
          />
        </motion.div>

        {/* Success Message */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-900"
          >
            🎉 Nâng cấp thành công!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-600"
          >
            Chào mừng bạn đến với {currentPlan?.nameVi || 'Premium'}!
          </motion.p>
        </div>

        {/* Plan Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-3">
                {tier === 'professional' ? (
                  <Crown className="h-6 w-6 text-purple-600" />
                ) : (
                  <Sparkles className="h-6 w-6 text-blue-600" />
                )}
                <span>Gói {currentPlan?.nameVi}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-center">
                {currentPlan?.descriptionVi}
              </p>
              
              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {currentPlan?.features.slice(0, 6).map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{feature.nameVi}</span>
                  </div>
                ))}
              </div>

              {currentPlan?.trial?.enabled && (
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 font-medium text-center">
                    🎁 Bạn có {currentPlan.trial.days} ngày dùng thử miễn phí!
                  </p>
                  <p className="text-blue-600 text-sm text-center mt-1">
                    Bạn sẽ không bị tính phí cho đến khi thời gian dùng thử kết thúc.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold">Bước tiếp theo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Khám phá tính năng</h3>
              <p className="text-sm text-gray-600">
                Trải nghiệm các công cụ tài chính nâng cao
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Tạo kế hoạch</h3>
              <p className="text-sm text-gray-600">
                Lập kế hoạch tài chính chi tiết cho mục tiêu của bạn
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Phân tích dữ liệu</h3>
              <p className="text-sm text-gray-600">
                Sử dụng công cụ phân tích để đưa ra quyết định tốt hơn
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Bắt đầu sử dụng
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => router.push('/subscription')}
          >
            Quản lý đăng ký
          </Button>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center text-sm text-gray-500"
        >
          <p>Cần hỗ trợ? <a href="mailto:support@finhome.vn" className="text-blue-600 hover:underline">Liên hệ với chúng tôi</a></p>
          {sessionId && (
            <p className="mt-1">Mã giao dịch: {sessionId.slice(-8)}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}