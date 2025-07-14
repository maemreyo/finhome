// src/components/examples/AppWithTutorials.tsx
// Example of complete app integration with onboarding, help, and tutorial systems

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, BarChart3, Settings, HelpCircle } from 'lucide-react'

// Import all our systems
import { HelpProvider } from '@/components/help'
import { TutorialProvider, TutorialLauncher, QuickTutorialButton } from '@/components/tutorial'
import { 
  HelpIconTooltip, 
  FinancialTermTooltip, 
  FeatureHelpPopover 
} from '@/components/help'

export const AppWithTutorials: React.FC = () => {
  const [propertyPrice, setPropertyPrice] = useState('2000000000')
  const [downPayment, setDownPayment] = useState('600000000')
  
  return (
    <HelpProvider>
      <TutorialProvider>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header with tutorial launcher */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    FinHome - Ứng Dụng Lập Kế Hoạch Tài Chính
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <QuickTutorialButton 
                      tutorialId="financial_planning_walkthrough"
                      label="Hướng dẫn nhanh"
                      size="sm"
                    />
                    <Button variant="outline" size="sm">
                      <HelpCircle className="w-4 h-4 mr-1" />
                      Trợ giúp
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Main planning form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <CardTitle>Tạo Kế Hoạch Tài Chính</CardTitle>
                      
                      <FeatureHelpPopover
                        title="Máy Tính Kế Hoạch Tài Chính"
                        description="Công cụ này giúp bạn tính toán chi tiết kế hoạch mua nhà và đầu tư bất động sản."
                        steps={[
                          "Nhập giá trị bất động sản",
                          "Xác định vốn tự có",
                          "Chọn lãi suất và thời gian vay",
                          "Xem kết quả và tạo kịch bản"
                        ]}
                        tips={[
                          "Vốn tự có 20-30% sẽ có lãi suất tốt hơn",
                          "So sánh lãi suất từ nhiều ngân hàng"
                        ]}
                        relatedFeatures={["So sánh kịch bản", "Phòng thí nghiệm tài chính"]}
                      >
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </FeatureHelpPopover>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Property Price Field - Tutorial Target */}
                    <div data-tutorial="create-plan-button" className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FinancialTermTooltip
                          term="Giá Trị Bất Động Sản"
                          definition="Tổng giá trị thị trường của căn nhà/đất bao gồm các chi phí phát sinh."
                          example="Nhà 1.8 tỷ + phí 200 triệu = 2 tỷ tổng giá trị"
                        >
                          Giá Trị Bất Động Sản
                        </FinancialTermTooltip>
                        
                        <HelpIconTooltip
                          content="Nhập tổng số tiền cần để sở hữu hoàn toàn bất động sản"
                          size="sm"
                        />
                      </Label>
                      
                      <div data-tutorial="property-price">
                        <Input
                          type="number"
                          value={propertyPrice}
                          onChange={(e) => setPropertyPrice(e.target.value)}
                          placeholder="2,000,000,000"
                          className="text-lg"
                        />
                      </div>
                    </div>

                    {/* Down Payment Field - Tutorial Target */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FinancialTermTooltip
                          term="Vốn Tự Có"
                          definition="Số tiền thanh toán trước khi vay ngân hàng, thường 20-30% giá trị nhà."
                          example="Nhà 2 tỷ, vốn tự có 600 triệu (30%) → vay 1.4 tỷ"
                        >
                          Vốn Tự Có
                        </FinancialTermTooltip>
                      </Label>
                      
                      <div data-tutorial="down-payment">
                        <Input
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(e.target.value)}
                          placeholder="600,000,000"
                          className="text-lg"
                        />
                      </div>
                    </div>

                    {/* Interest Rate - Tutorial Target */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FinancialTermTooltip
                          term="Lãi Suất"
                          definition="Tỷ lệ phần trăm phải trả hàng năm. Lãi suất càng thấp, chi phí càng ít."
                          example="Lãi suất 8%/năm = trả thêm 8% số tiền vay mỗi năm"
                        >
                          Lãi Suất (% năm)
                        </FinancialTermTooltip>
                      </Label>
                      
                      <div data-tutorial="interest-rate">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="8.5"
                          className="text-lg"
                        />
                      </div>
                    </div>

                    {/* Loan Term - Tutorial Target */}
                    <div className="space-y-2">
                      <Label>Thời Gian Vay (năm)</Label>
                      <div data-tutorial="loan-term">
                        <Input
                          type="number"
                          placeholder="20"
                          className="text-lg"
                        />
                      </div>
                    </div>

                    {/* Submit Button - Tutorial Target */}
                    <div data-tutorial="submit-plan">
                      <Button className="w-full" size="lg">
                        Tạo Kế Hoạch
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scenario Comparison Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      <CardTitle>So Sánh Kịch Bản</CardTitle>
                      <QuickTutorialButton 
                        tutorialId="scenario_comparison_tutorial"
                        label="Học cách so sánh"
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div data-tutorial="scenario-tab">
                        <Button variant="outline" className="w-full">
                          Mở Tab So Sánh Kịch Bản
                        </Button>
                      </div>
                      
                      <div data-tutorial="add-scenario">
                        <Button variant="secondary" className="w-full">
                          + Thêm Kịch Bản Mới
                        </Button>
                      </div>
                      
                      <div data-tutorial="scenario-settings" className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Các thiết lập kịch bản sẽ hiển thị ở đây
                        </p>
                      </div>
                      
                      <div data-tutorial="comparison-chart" className="h-32 bg-blue-50 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-blue-600">Biểu đồ so sánh kịch bản</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar with tutorial launcher */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trung Tâm Học Tập</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TutorialLauncher compact />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Cài Đặt Hướng Dẫn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hiển thị gợi ý</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tự động bắt đầu hướng dẫn</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mức độ chi tiết</span>
                      <select className="text-xs">
                        <option>Hướng dẫn đầy đủ</option>
                        <option>Gợi ý cơ bản</option>
                        <option>Tối thiểu</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Full tutorial launcher */}
                <TutorialLauncher />
              </div>
            </div>
          </div>
        </div>
      </TutorialProvider>
    </HelpProvider>
  )
}

export default AppWithTutorials