// src/components/expenses/SmartTipsHelper.tsx
// Smart tips system for discovering advanced AI features

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Lightbulb, 
  Zap, 
  Hash, 
  Calendar, 
  Target,
  Sparkles,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartTip {
  id: string
  title: string
  description: string
  example: string
  icon: React.ComponentType<any>
  category: 'batch' | 'tags' | 'relative_time' | 'amounts' | 'categories'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  color: string
}

interface SmartTipsHelperProps {
  onTipClick?: (example: string) => void
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  className?: string
}

export function SmartTipsHelper({ 
  onTipClick, 
  userLevel = 'beginner',
  className 
}: SmartTipsHelperProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const allTips: SmartTip[] = [
    {
      id: 'batch_transactions',
      title: 'Nhập nhiều giao dịch cùng lúc',
      description: 'Tiết kiệm thời gian bằng cách nhập nhiều giao dịch trong một câu',
      example: 'ăn sáng 30k, cà phê 25k, taxi 80k',
      icon: Target,
      category: 'batch',
      difficulty: 'beginner',
      color: 'text-blue-600'
    },
    {
      id: 'hashtag_tags',
      title: 'Thêm thẻ với dấu #',
      description: 'Tự động phân loại bằng cách thêm thẻ ngay khi nhập',
      example: 'xem phim 250k #giải_trí',
      icon: Hash,
      category: 'tags',
      difficulty: 'beginner',
      color: 'text-green-600'
    },
    {
      id: 'relative_time',
      title: 'Sử dụng thời gian tương đối',
      description: 'Ghi lại giao dịch của những ngày trước đó',
      example: 'hôm qua ăn phở 50k, tuần trước mua sách 150k',
      icon: Calendar,
      category: 'relative_time',
      difficulty: 'intermediate',
      color: 'text-purple-600'
    },
    {
      id: 'flexible_amounts',
      title: 'Format số tiền linh hoạt',
      description: 'AI hiểu nhiều cách viết số tiền khác nhau',
      example: '2tr5, 150 nghìn, 50k, 1.5 triệu đều được',
      icon: Zap,
      category: 'amounts',
      difficulty: 'intermediate', 
      color: 'text-amber-600'
    },
    {
      id: 'smart_categories',
      title: 'AI tự động phân loại',
      description: 'Không cần chỉ định danh mục, AI sẽ đoán dựa trên ngữ cảnh',
      example: 'đổ xăng 200k → Tự động vào "Đi lại"',
      icon: Sparkles,
      category: 'categories',
      difficulty: 'advanced',
      color: 'text-indigo-600'
    }
  ]

  // Filter tips based on user level
  const getVisibleTips = () => {
    if (showAdvanced) return allTips
    
    const levelHierarchy = {
      beginner: ['beginner'],
      intermediate: ['beginner', 'intermediate'],
      advanced: ['beginner', 'intermediate', 'advanced']
    }
    
    return allTips.filter(tip => 
      levelHierarchy[userLevel].includes(tip.difficulty)
    )
  }

  const visibleTips = getVisibleTips()
  const currentTip = visibleTips[currentTipIndex]

  // Auto-rotate tips every 10 seconds
  useEffect(() => {
    if (visibleTips.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % visibleTips.length)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [visibleTips.length])

  const handleNextTip = () => {
    setCurrentTipIndex(prev => (prev + 1) % visibleTips.length)
  }

  const handleTryExample = (example: string) => {
    onTipClick?.(example)
  }

  if (!currentTip) return null

  const IconComponent = currentTip.icon

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Mẹo hay
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-0">
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-50 to-purple-50">
                  <IconComponent className={cn("h-4 w-4", currentTip.color)} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{currentTip.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {currentTip.description}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  currentTip.difficulty === 'beginner' && "border-green-300 text-green-700",
                  currentTip.difficulty === 'intermediate' && "border-yellow-300 text-yellow-700",
                  currentTip.difficulty === 'advanced' && "border-red-300 text-red-700"
                )}
              >
                {currentTip.difficulty === 'beginner' && 'Cơ bản'}
                {currentTip.difficulty === 'intermediate' && 'Trung cấp'}
                {currentTip.difficulty === 'advanced' && 'Nâng cao'}
              </Badge>
            </div>

            <Separator />

            {/* Example */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Ví dụ:</p>
              <div className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
                <p className="text-sm font-mono text-gray-800">
                  "{currentTip.example}"
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                {visibleTips.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      index === currentTipIndex ? "bg-blue-500" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {visibleTips.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextTip}
                    className="h-6 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Tiếp theo
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={() => handleTryExample(currentTip.example)}
                  className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Thử ngay
                </Button>
              </div>
            </div>

            {/* Advanced toggle */}
            {userLevel !== 'advanced' && !showAdvanced && (
              <div className="pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(true)}
                  className="w-full h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Xem thêm mẹo nâng cao
                </Button>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}