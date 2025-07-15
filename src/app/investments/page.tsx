// src/app/investments/page.tsx
// Investment portfolio tracking and ROI analysis page

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, PieChart, Calculator } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InvestmentPortfolio from '@/components/investments/InvestmentPortfolio'

export default function InvestmentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Danh Mục Đầu Tư
              </h1>
              <p className="text-gray-600 mt-2">
                Theo dõi hiệu suất và phân tích ROI của các khoản đầu tư bất động sản
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Cập nhật thời gian thực
              </Badge>
              <Badge variant="outline" className="text-sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                Phân tích chuyên sâu
              </Badge>
              <Button variant="outline" size="sm">
                <Calculator className="w-4 h-4 mr-1" />
                Tính Toán ROI
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <InvestmentPortfolio />
        </motion.div>
      </div>
    </div>
  )
}