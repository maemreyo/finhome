// src/components/tutorial/TutorialLauncher.tsx
// Component for launching different tutorials from various parts of the app

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Calculator, 
  BarChart3, 
  Zap, 
  Play, 
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import { useTutorial } from './TutorialProvider'
import { cn } from '@/lib/utils'

interface TutorialCardProps {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  icon: React.ComponentType<any>
  isCompleted: boolean
  onStart: () => void
  className?: string
}

const TutorialCard: React.FC<TutorialCardProps> = ({
  id,
  title,
  description,
  duration,
  difficulty,
  category,
  icon: Icon,
  isCompleted,
  onStart,
  className
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getDifficultyText = () => {
    switch (difficulty) {
      case 'beginner': return 'Cơ bản'
      case 'intermediate': return 'Trung bình'
      case 'advanced': return 'Nâng cao'
      default: return 'Không xác định'
    }
  }

  return (
    <Card className={cn("transition-all hover:shadow-md border-2", 
      isCompleted ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:border-blue-200",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isCompleted ? "bg-green-100" : "bg-blue-50"
            )}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Icon className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {title}
                {isCompleted && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                    Hoàn thành
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", getDifficultyColor())}>
                  {getDifficultyText()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm leading-relaxed mb-3">
          {description}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          
          <Button
            size="sm"
            variant={isCompleted ? "outline" : "default"}
            onClick={onStart}
            className="h-7"
          >
            {isCompleted ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Xem lại
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Bắt đầu
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface TutorialLauncherProps {
  className?: string
  compact?: boolean
}

export const TutorialLauncher: React.FC<TutorialLauncherProps> = ({ 
  className, 
  compact = false 
}) => {
  const { startTutorial, getCompletedTutorials } = useTutorial()
  const completedTutorials = getCompletedTutorials()

  const tutorials = [
    {
      id: 'financial_planning_walkthrough',
      title: 'Lập Kế Hoạch Tài Chính',
      description: 'Học cách tạo kế hoạch tài chính hoàn chỉnh từ việc nhập thông tin đến phân tích kết quả.',
      duration: '5-7 phút',
      difficulty: 'beginner' as const,
      category: 'Cơ bản',
      icon: Calculator
    },
    {
      id: 'scenario_comparison_tutorial',
      title: 'So Sánh Kịch Bản',
      description: 'Tìm hiểu cách so sánh nhiều phương án vay khác nhau để chọn lựa tối ưu nhất.',
      duration: '4-5 phút',
      difficulty: 'intermediate' as const,
      category: 'Phân tích',
      icon: BarChart3
    },
    {
      id: 'advanced_features_tutorial',
      title: 'Tính Năng Nâng Cao',
      description: 'Khám phá các công cụ phân tích chuyên sâu như mô phỏng tái cơ cấu và stress testing.',
      duration: '8-10 phút',
      difficulty: 'advanced' as const,
      category: 'Nâng cao',
      icon: Zap
    }
  ]

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Hướng dẫn nhanh
        </h3>
        {tutorials.map((tutorial) => (
          <Button
            key={tutorial.id}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8"
            onClick={() => startTutorial(tutorial.id)}
          >
            <tutorial.icon className="w-3 h-3 mr-2" />
            {tutorial.title}
            {completedTutorials.includes(tutorial.id) && (
              <CheckCircle className="w-3 h-3 ml-auto text-green-600" />
            )}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Hướng Dẫn Tương Tác
        </h2>
        <p className="text-sm text-gray-600">
          Học cách sử dụng FinHome hiệu quả với các hướng dẫn từng bước chi tiết.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => (
          <TutorialCard
            key={tutorial.id}
            id={tutorial.id}
            title={tutorial.title}
            description={tutorial.description}
            duration={tutorial.duration}
            difficulty={tutorial.difficulty}
            category={tutorial.category}
            icon={tutorial.icon}
            isCompleted={completedTutorials.includes(tutorial.id)}
            onStart={() => startTutorial(tutorial.id)}
          />
        ))}
      </div>
      
      {/* Tutorial statistics */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">
              Tiến độ học tập
            </h3>
            <p className="text-sm text-blue-700">
              Bạn đã hoàn thành {completedTutorials.length}/{tutorials.length} hướng dẫn
            </p>
          </div>
          <div className="ml-auto">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {Math.round((completedTutorials.length / tutorials.length) * 100)}%
              </div>
              <div className="text-xs text-blue-600">hoàn thành</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick tutorial starter button for specific features
interface QuickTutorialButtonProps {
  tutorialId: string
  label?: string
  size?: 'sm' | 'lg' | 'default' | 'icon'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export const QuickTutorialButton: React.FC<QuickTutorialButtonProps> = ({
  tutorialId,
  label = "Hướng dẫn",
  size = 'sm',
  variant = 'outline',
  className
}) => {
  const { startTutorial, shouldShowTutorial } = useTutorial()
  
  if (!shouldShowTutorial(tutorialId)) {
    return null
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => startTutorial(tutorialId)}
      className={cn("gap-1", className)}
    >
      <BookOpen className="w-3 h-3" />
      {label}
    </Button>
  )
}

export default TutorialLauncher