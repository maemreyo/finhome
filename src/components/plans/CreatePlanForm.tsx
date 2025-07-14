// src/components/plans/CreatePlanForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { formatCurrency, parseCurrency } from '@/lib/utils'

const createPlanSchema = z.object({
  plan_name: z.string().min(1, 'Tên kế hoạch không được để trống'),
  plan_type: z.enum(['home_purchase', 'investment', 'upgrade', 'refinance']),
  purchase_price: z.number().min(1, 'Giá mua phải lớn hơn 0'),
  down_payment: z.number().min(1, 'Vốn tự có phải lớn hơn 0'),
  monthly_income: z.number().min(1, 'Thu nhập hàng tháng phải lớn hơn 0'),
  monthly_expenses: z.number().min(0, 'Chi phí hàng tháng không được âm'),
  current_savings: z.number().min(0, 'Tiết kiệm hiện tại không được âm'),
  additional_costs: z.number().optional().default(0),
  other_debts: z.number().optional().default(0),
  plan_description: z.string().optional(),
  expected_rental_income: z.number().optional(),
  expected_appreciation_rate: z.number().optional(),
  investment_horizon_years: z.number().optional(),
})

type CreatePlanFormData = z.infer<typeof createPlanSchema>

interface CreatePlanFormProps {
  userId: string
}

export function CreatePlanForm({ userId }: CreatePlanFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      plan_name: '',
      plan_type: 'home_purchase',
      purchase_price: 0,
      down_payment: 0,
      monthly_income: 0,
      monthly_expenses: 0,
      current_savings: 0,
      additional_costs: 0,
      other_debts: 0,
      plan_description: '',
    },
  })

  async function onSubmit(data: CreatePlanFormData) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create plan')
      }

      const result = await response.json()
      toast.success('Kế hoạch đã được tạo thành công!')
      router.push(`/dashboard/plans/${result.plan.id}`)
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="financial">Tài chính cá nhân</TabsTrigger>
            <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin kế hoạch</CardTitle>
                <CardDescription>
                  Nhập thông tin cơ bản về kế hoạch tài chính của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="plan_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên kế hoạch</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Mua căn hộ chung cư Q7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại kế hoạch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại kế hoạch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="home_purchase">Mua nhà ở</SelectItem>
                          <SelectItem value="investment">Đầu tư</SelectItem>
                          <SelectItem value="upgrade">Nâng cấp</SelectItem>
                          <SelectItem value="refinance">Tái cấu trúc</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá mua (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2,500,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Giá mua dự kiến của bất động sản
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="down_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vốn tự có (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="800,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Số tiền bạn có sẵn để trả trước
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả (tùy chọn)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết về kế hoạch của bạn..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tình hình tài chính</CardTitle>
                <CardDescription>
                  Thông tin về thu chi hàng tháng và tài sản hiện tại
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="monthly_income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thu nhập hàng tháng (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="25,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthly_expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi phí sinh hoạt hàng tháng (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="13,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_savings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiết kiệm hiện tại (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="other_debts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nợ khác (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Tổng số nợ khác hiện tại (thẻ tín dụng, vay cá nhân, v.v.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tùy chọn nâng cao</CardTitle>
                <CardDescription>
                  Các thông tin bổ sung cho kế hoạch đầu tư
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="additional_costs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi phí phát sinh (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Phí môi giới, thuế, phí làm sổ, nội thất, v.v.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_rental_income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thu nhập cho thuê dự kiến (VNĐ/tháng)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="4,000,000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Chỉ áp dụng cho bất động sản đầu tư
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_appreciation_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỷ lệ tăng giá dự kiến (%/năm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="5.0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investment_horizon_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian đầu tư (năm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang tạo...' : 'Tạo Kế Hoạch'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}