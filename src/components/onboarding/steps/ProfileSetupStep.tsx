// src/components/onboarding/steps/ProfileSetupStep.tsx
// Profile setup step for onboarding

'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  User, 
  MapPin, 
  Target, 
  DollarSign,
  Home,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react'
import { OnboardingStep } from '@/types/onboarding'

interface ProfileSetupStepProps {
  step: OnboardingStep
  onComplete: () => void
  isCompleted: boolean
}

interface ProfileData {
  name: string
  age: string
  location: string
  userType: 'first_time_buyer' | 'investor' | 'upgrader'
  monthlyIncome: string
  currentSavings: string
  goalTimeline: string
  primaryGoal: string
  riskTolerance: 'low' | 'medium' | 'high'
}

const userTypes = [
  {
    id: 'first_time_buyer',
    title: 'Người Mua Nhà Lần Đầu',
    description: 'Tôi muốn mua nhà đầu tiên để ở',
    icon: Home,
    color: 'text-blue-600'
  },
  {
    id: 'investor',
    title: 'Nhà Đầu Tư Cá Nhân',
    description: 'Tôi muốn đầu tư bất động sản để tăng thu nhập',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    id: 'upgrader',
    title: 'Gia Đình Nâng Cấp',
    description: 'Tôi cần nâng cấp chỗ ở cho gia đình',
    icon: Users,
    color: 'text-purple-600'
  }
]

const vietnamCities = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Biên Hòa',
  'Nha Trang',
  'Huế',
  'Buôn Ma Thuột',
  'Vũng Tàu',
  'Khác'
]

export const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({
  step,
  onComplete,
  isCompleted
}) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    location: '',
    userType: 'first_time_buyer',
    monthlyIncome: '',
    currentSavings: '',
    goalTimeline: '',
    primaryGoal: '',
    riskTolerance: 'medium'
  })

  const [currentSection, setCurrentSection] = useState(0)
  const sections = ['basic', 'financial', 'goals']

  const isBasicInfoValid = profileData.name && profileData.age && profileData.location && profileData.userType
  const isFinancialInfoValid = profileData.monthlyIncome && profileData.currentSavings
  const isGoalsInfoValid = profileData.goalTimeline && profileData.primaryGoal && profileData.riskTolerance

  const canProceed = () => {
    switch (currentSection) {
      case 0: return isBasicInfoValid
      case 1: return isFinancialInfoValid
      case 2: return isGoalsInfoValid
      default: return false
    }
  }

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      // Save profile data (in real app, this would be an API call)
      localStorage.setItem('onboarding_profile', JSON.stringify(profileData))
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const updateProfileData = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {sections.map((section, index) => (
          <div
            key={section}
            className={`w-3 h-3 rounded-full transition-colors ${
              index <= currentSection ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Basic Information */}
        {currentSection === 0 && (
          <motion.div
            key="basic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông Tin Cơ Bản
                </CardTitle>
                <CardDescription>
                  Giúp chúng tôi hiểu về bạn để cung cấp lời khuyên phù hợp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => updateProfileData('name', e.target.value)}
                      placeholder="Nguyễn Văn An"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Tuổi</Label>
                    <Select value={profileData.age} onValueChange={(value) => updateProfileData('age', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn độ tuổi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-25">18-25 tuổi</SelectItem>
                        <SelectItem value="26-35">26-35 tuổi</SelectItem>
                        <SelectItem value="36-45">36-45 tuổi</SelectItem>
                        <SelectItem value="46-55">46-55 tuổi</SelectItem>
                        <SelectItem value="55+">Trên 55 tuổi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Địa điểm quan tâm</Label>
                  <Select value={profileData.location} onValueChange={(value) => updateProfileData('location', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {vietnamCities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bạn là ai?</Label>
                  <RadioGroup
                    value={profileData.userType}
                    onValueChange={(value) => updateProfileData('userType', value as ProfileData['userType'])}
                    className="mt-2"
                  >
                    {userTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <motion.div
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <RadioGroupItem value={type.id} id={type.id} />
                          <Label htmlFor={type.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                            <IconComponent className={`w-5 h-5 ${type.color}`} />
                            <div>
                              <div className="font-medium">{type.title}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{type.description}</div>
                            </div>
                          </Label>
                        </motion.div>
                      )
                    })}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Financial Information */}
        {currentSection === 1 && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Thông Tin Tài Chính
                </CardTitle>
                <CardDescription>
                  Thông tin này sẽ giúp chúng tôi đưa ra lời khuyên phù hợp với khả năng tài chính của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="monthlyIncome">Thu nhập hàng tháng (VNĐ)</Label>
                  <Select 
                    value={profileData.monthlyIncome} 
                    onValueChange={(value) => updateProfileData('monthlyIncome', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn mức thu nhập" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-20">10-20 triệu</SelectItem>
                      <SelectItem value="20-30">20-30 triệu</SelectItem>
                      <SelectItem value="30-50">30-50 triệu</SelectItem>
                      <SelectItem value="50-100">50-100 triệu</SelectItem>
                      <SelectItem value="100+">Trên 100 triệu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currentSavings">Tiền tiết kiệm hiện tại (VNĐ)</Label>
                  <Select 
                    value={profileData.currentSavings} 
                    onValueChange={(value) => updateProfileData('currentSavings', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn mức tiết kiệm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100-500">100-500 triệu</SelectItem>
                      <SelectItem value="500-1000">500 triệu - 1 tỷ</SelectItem>
                      <SelectItem value="1000-2000">1-2 tỷ</SelectItem>
                      <SelectItem value="2000-5000">2-5 tỷ</SelectItem>
                      <SelectItem value="5000+">Trên 5 tỷ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    🔒 Bảo mật thông tin
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Thông tin tài chính của bạn được mã hóa và chỉ được sử dụng để tính toán kế hoạch cá nhân. 
                    Chúng tôi không chia sẻ dữ liệu với bên thứ ba.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goals and Preferences */}
        {currentSection === 2 && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Mục Tiêu và Ưu Tiên
                </CardTitle>
                <CardDescription>
                  Cho chúng tôi biết về mục tiêu và sở thích của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="goalTimeline">Khi nào bạn muốn mua nhà?</Label>
                  <Select 
                    value={profileData.goalTimeline} 
                    onValueChange={(value) => updateProfileData('goalTimeline', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">Trong 6 tháng</SelectItem>
                      <SelectItem value="1year">Trong 1 năm</SelectItem>
                      <SelectItem value="2years">1-2 năm nữa</SelectItem>
                      <SelectItem value="3years">2-3 năm nữa</SelectItem>
                      <SelectItem value="5years">Hơn 3 năm nữa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="primaryGoal">Mục tiêu chính của bạn</Label>
                  <Textarea
                    id="primaryGoal"
                    value={profileData.primaryGoal}
                    onChange={(e) => updateProfileData('primaryGoal', e.target.value)}
                    placeholder="Ví dụ: Tôi muốn mua một căn hộ 2-3 phòng ngủ ở quận trung tâm để ở cùng gia đình..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Mức độ chấp nhận rủi ro</Label>
                  <RadioGroup
                    value={profileData.riskTolerance}
                    onValueChange={(value) => updateProfileData('riskTolerance', value as ProfileData['riskTolerance'])}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low" className="flex-1">
                        <div className="font-medium">Thận trọng</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Tôi ưu tiên sự an toàn và ổn định tài chính
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="flex-1">
                        <div className="font-medium">Cân bằng</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Tôi chấp nhận rủi ro hợp lý để có cơ hội tăng trưởng
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high" className="flex-1">
                        <div className="font-medium">Tích cực</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Tôi sẵn sàng chấp nhận rủi ro cao để có lợi nhuận tốt
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
        >
          Trước
        </Button>

        <div className="flex items-center gap-2">
          {currentSection === sections.length - 1 && canProceed() && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Sẵn sàng hoàn thành</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex items-center gap-2"
        >
          {currentSection === sections.length - 1 ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Hoàn Thành
            </>
          ) : (
            'Tiếp Theo'
          )}
        </Button>
      </div>
    </div>
  )
}

export default ProfileSetupStep