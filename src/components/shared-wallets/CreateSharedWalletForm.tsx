// src/components/shared-wallets/CreateSharedWalletForm.tsx
// Form for creating new shared wallets

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wallet, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

const createWalletSchema = z.object({
  name: z.string().min(1, 'Tên ví là bắt buộc').max(100, 'Tên ví không được quá 100 ký tự'),
  wallet_type: z.enum(['cash', 'bank_account', 'credit_card', 'e_wallet', 'investment', 'other']),
  currency: z.string(),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Màu không hợp lệ'),
  initial_balance: z.number().min(0, 'Số dư ban đầu phải >= 0'),
  require_approval_for_expenses: z.boolean(),
  description: z.string().max(500, 'Mô tả không được quá 500 ký tự').optional(),
  expense_approval_threshold: z.number().min(0, 'Ngưỡng phê duyệt phải >= 0').optional(),
})

type CreateWalletForm = z.infer<typeof createWalletSchema>

const WALLET_TYPES = [
  { value: 'cash', label: 'Tiền mặt', icon: '💵' },
  { value: 'bank_account', label: 'Tài khoản ngân hàng', icon: '🏦' },
  { value: 'credit_card', label: 'Thẻ tín dụng', icon: '💳' },
  { value: 'e_wallet', label: 'Ví điện tử', icon: '📱' },
  { value: 'investment', label: 'Đầu tư', icon: '📈' },
  { value: 'other', label: 'Khác', icon: '📦' },
]

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
]

interface CreateSharedWalletFormProps {
  onSubmit: (data: CreateWalletForm) => Promise<void>
  onCancel: () => void
}

export function CreateSharedWalletForm({ onSubmit, onCancel }: CreateSharedWalletFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateWalletForm>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      wallet_type: 'bank_account',
      currency: 'VND',
      color: '#3B82F6',
      initial_balance: 0,
      require_approval_for_expenses: false,
    }
  })

  const selectedColor = watch('color')
  const requireApproval = watch('require_approval_for_expenses')

  const handleFormSubmit = async (data: CreateWalletForm) => {
    try {
      setLoading(true)
      setError(null)
      await onSubmit(data)
    } catch (err) {
      console.error('Error creating wallet:', err)
      setError('Không thể tạo ví. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
        
        <div className="space-y-2">
          <Label htmlFor="name">Tên ví *</Label>
          <Input
            id="name"
            placeholder="Ví gia đình, Chi tiêu chung..."
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            placeholder="Ví chung dành cho chi tiêu gia đình hàng ngày..."
            {...register('description')}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wallet_type">Loại ví *</Label>
            <Select
              onValueChange={(value) => setValue('wallet_type', value as any)}
              defaultValue="bank_account"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Tiền tệ</Label>
            <Select
              onValueChange={(value) => setValue('currency', value)}
              defaultValue="VND"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND (₫)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial_balance">Số dư ban đầu</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="initial_balance"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              className="pl-10"
              {...register('initial_balance', { valueAsNumber: true })}
            />
          </div>
          {errors.initial_balance && (
            <p className="text-sm text-red-500">{errors.initial_balance.message}</p>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Giao diện</h3>
        
        <div className="space-y-2">
          <Label>Màu sắc</Label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  selectedColor === color ? "border-gray-900 scale-110" : "border-gray-300"
                )}
                style={{ backgroundColor: color }}
                onClick={() => setValue('color', color)}
              />
            ))}
          </div>
          <Input
            type="color"
            value={selectedColor}
            onChange={(e) => setValue('color', e.target.value)}
            className="w-20 h-10"
          />
        </div>
      </div>

      {/* Approval Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cài đặt phê duyệt</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="require_approval">Yêu cầu phê duyệt chi tiêu</Label>
            <p className="text-sm text-muted-foreground">
              Các giao dịch chi tiêu cần được phê duyệt trước khi ghi nhận
            </p>
          </div>
          <Switch
            id="require_approval"
            checked={requireApproval}
            onCheckedChange={(checked) => setValue('require_approval_for_expenses', checked)}
          />
        </div>

        {requireApproval && (
          <div className="space-y-2">
            <Label htmlFor="expense_approval_threshold">Ngưỡng phê duyệt (VND)</Label>
            <Input
              id="expense_approval_threshold"
              type="number"
              min="0"
              step="10000"
              placeholder="50000"
              {...register('expense_approval_threshold', { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground">
              Chỉ các giao dịch lớn hơn ngưỡng này mới cần phê duyệt
            </p>
            {errors.expense_approval_threshold && (
              <p className="text-sm text-red-500">{errors.expense_approval_threshold.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Tạo ví chung
            </>
          )}
        </Button>
      </div>
    </form>
  )
}