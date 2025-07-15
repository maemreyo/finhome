// src/app/achievements/page.tsx
// Achievements and gamification page

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Award, Trophy, Star, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import AchievementSystem from '@/components/achievements/AchievementSystem'

export default function AchievementsPage() {
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
                Thành Tích & Hệ Thống Điểm
              </h1>
              <p className="text-gray-600 mt-2">
                Theo dõi tiến độ học tập và nhận phần thưởng cho những thành công của bạn
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Award className="w-4 h-4 mr-1" />
                Hệ thống gamification
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Trophy className="w-4 h-4 mr-1" />
                Phần thưởng thực tế
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Star className="w-4 h-4 mr-1" />
                Xếp hạng cộng đồng
              </Badge>
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
          <AchievementSystem />
        </motion.div>
      </div>
    </div>
  )
}