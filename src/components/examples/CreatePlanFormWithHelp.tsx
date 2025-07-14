// src/components/examples/CreatePlanFormWithHelp.tsx
// Example of integrating contextual help system with form components
// This demonstrates how to add help tooltips, popovers, and financial term explanations

'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calculator, HelpCircle, Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'

// Import our help components
import { 
  HelpTooltip, 
  FinancialTermTooltip, 
  HelpIconTooltip,
  FeatureHelpPopover,
  QuickHelpPopover,
  HelpProvider,
  useHelp
} from '@/components/help'

const formSchema = z.object({
  propertyPrice: z.number().min(100000000, 'Giá nhà tối thiểu 100 triệu'),
  downPayment: z.number().min(0, 'Vốn tự có không thể âm'),
  interestRate: z.number().min(0.01).max(30, 'Lãi suất từ 0.01% đến 30%'),
  loanTerm: z.number().min(1).max(30, 'Thời gian vay từ 1 đến 30 năm'),
})

type FormData = z.infer<typeof formSchema>

export const CreatePlanFormWithHelp: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyPrice: 2000000000, // 2 tỷ VND
      downPayment: 600000000,    // 600 triệu VND (30%)
      interestRate: 8.5,         // 8.5%/năm
      loanTerm: 20              // 20 năm
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Plan created:', data)
    setIsSubmitting(false)
  }

  return (
    <HelpProvider>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold">
                Tạo Kế Hoạch Tài Chính Mới
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Nhập thông tin để tính toán kế hoạch mua nhà
              </p>
            </div>
            
            {/* Feature help popover for the entire form */}
            <FeatureHelpPopover
              title="Tạo Kế Hoạch Tài Chính"
              description="Công cụ này giúp bạn lập kế hoạch chi tiết cho việc mua nhà hoặc đầu tư bất động sản với các thông số tài chính chính xác."
              steps={[
                "Nhập giá trị bất động sản bạn muốn mua",
                "Xác định số vốn tự có (tiền mặt ban đầu)",
                "Chọn lãi suất vay dự kiến từ ngân hàng",
                "Thiết lập thời gian vay phù hợp"
              ]}
              tips={[
                "Vốn tự có 20-30% sẽ có lãi suất tốt hơn",
                "So sánh lãi suất từ nhiều ngân hàng khác nhau",
                "Thời gian vay dài = lãi suất cao nhưng áp lực thanh toán thấp"
              ]}
              relatedFeatures={["So sánh kịch bản", "Mô phỏng tái cơ cấu", "Phân tích ROI"]}
            >
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Info className="w-4 h-4 text-muted-foreground" />
              </Button>
            </FeatureHelpPopover>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Property Price with Financial Term Tooltip */}
              <FormField
                control={form.control}
                name="propertyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FinancialTermTooltip
                        term="Giá Trị Bất Động Sản"
                        definition="Tổng giá trị thị trường của căn nhà/đất bạn dự định mua, bao gồm cả phí phát sinh như thuế, phí công chứng."
                        example="Ví dụ: Nhà 1.8 tỷ + phí 200 triệu = 2 tỷ tổng giá trị"
                        moreInfoUrl="https://example.com/real-estate-valuation"
                      >
                        Giá Trị Bất Động Sản
                      </FinancialTermTooltip>
                      
                      <HelpIconTooltip
                        content="Nhập tổng số tiền bạn cần để sở hữu hoàn toàn bất động sản, bao gồm cả các chi phí phát sinh như thuế, phí môi giới."
                        title="Hướng dẫn nhập giá trị"
                        size="sm"
                      />
                    </FormLabel>
                    <FormControl>
                      <div data-help="property-price">
                        <Input
                          type="number"
                          placeholder="2,000,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-lg font-medium"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Down Payment with Help Tooltip */}
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FinancialTermTooltip
                        term="Vốn Tự Có (Down Payment)"
                        definition="Số tiền bạn thanh toán ngay khi mua nhà, trước khi vay ngân hàng. Thường chiếm 20-30% giá trị căn nhà."
                        example="Nhà 2 tỷ, vốn tự có 600 triệu (30%) → vay 1.4 tỷ"
                      >
                        Vốn Tự Có
                      </FinancialTermTooltip>
                      
                      <QuickHelpPopover
                        term="Tối Ưu Vốn Tự Có"
                        definition="Việc cân bằng giữa vốn tự có và khoản vay sẽ ảnh hưởng đến lãi suất và khả năng đầu tư khác."
                        formula="% Vốn tự có = (Vốn tự có / Giá nhà) × 100%"
                        example={{
                          scenario: "Nhà 2 tỷ, có 800 triệu tiền mặt",
                          calculation: "Có thể trả 600 triệu (30%) và giữ 200 triệu đầu tư khác",
                          result: "Vay 1.4 tỷ với lãi suất ưu đãi"
                        }}
                      >
                        <HelpCircle className="w-4 h-4 text-blue-500 cursor-help" />
                      </QuickHelpPopover>
                    </FormLabel>
                    <FormControl>
                      <div data-help="down-payment">
                        <Input
                          type="number"
                          placeholder="600,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-lg font-medium"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interest Rate with Advanced Help */}
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FinancialTermTooltip
                        term="Lãi Suất Vay"
                        definition="Tỷ lệ phần trăm bạn phải trả hàng năm cho số tiền vay. Lãi suất càng thấp, tổng chi phí vay càng ít."
                        example="Lãi suất 8%/năm nghĩa là bạn trả thêm 8% số tiền vay mỗi năm"
                      >
                        Lãi Suất (% năm)
                      </FinancialTermTooltip>
                      
                      <HelpTooltip
                        content="Lãi suất hiện tại của các ngân hàng Việt Nam dao động từ 7-12%/năm tùy theo thời gian vay và điều kiện khách hàng. Nên so sánh nhiều ngân hàng để có lãi suất tốt nhất."
                        title="Thông tin lãi suất thị trường"
                        position="right"
                        maxWidth={350}
                      >
                        <Info className="w-4 h-4 text-amber-500 cursor-help" />
                      </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <div data-help="interest-rate">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="8.5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-lg font-medium"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loan Term */}
              <FormField
                control={form.control}
                name="loanTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FinancialTermTooltip
                        term="Thời Gian Vay"
                        definition="Số năm bạn sẽ trả nợ cho ngân hàng. Thời gian càng dài, khoản trả hàng tháng càng thấp nhưng tổng lãi phải trả sẽ cao hơn."
                        example="Vay 20 năm vs 15 năm: trả ít hơn mỗi tháng nhưng tổng lãi nhiều hơn"
                      >
                        Thời Gian Vay (năm)
                      </FinancialTermTooltip>
                    </FormLabel>
                    <FormControl>
                      <div data-help="loan-term">
                        <Input
                          type="number"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-lg font-medium"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo Kế Hoạch'}
                </Button>
                
                <HelpTooltip
                  content="Sau khi tạo, bạn có thể chỉnh sửa kế hoạch, tạo nhiều kịch bản khác nhau, và xuất báo cáo chi tiết."
                  title="Bước tiếp theo"
                  position="top"
                >
                  <Button variant="outline" size="icon">
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </HelpTooltip>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </HelpProvider>
  )
}

export default CreatePlanFormWithHelp