// src/components/shared-wallets/InviteMemberForm.tsx
// Form for inviting new members to shared wallet

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, UserPlus, Mail, Shield, Eye, Users, Crown } from 'lucide-react'

const inviteMemberSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['admin', 'member', 'viewer']),
  can_add_transactions: z.boolean(),
  can_edit_transactions: z.boolean(), 
  can_delete_transactions: z.boolean(),
  can_manage_budget: z.boolean(),
})

type InviteMemberForm = z.infer<typeof inviteMemberSchema>

const ROLES = [
  {
    value: 'admin',
    label: 'Quản trị',
    description: 'Có thể quản lý ví, mời thành viên và quản lý ngân sách',
    icon: Shield,
    defaultPermissions: {
      can_add_transactions: true,
      can_edit_transactions: true,
      can_delete_transactions: true,
      can_manage_budget: true,
    }
  },
  {
    value: 'member',
    label: 'Thành viên',
    description: 'Có thể thêm giao dịch và xem báo cáo',
    icon: Users,
    defaultPermissions: {
      can_add_transactions: true,
      can_edit_transactions: false,
      can_delete_transactions: false,
      can_manage_budget: false,
    }
  },
  {
    value: 'viewer',
    label: 'Người xem',
    description: 'Chỉ có thể xem thông tin, không thể chỉnh sửa',
    icon: Eye,
    defaultPermissions: {
      can_add_transactions: false,
      can_edit_transactions: false,
      can_delete_transactions: false,
      can_manage_budget: false,
    }
  }
]

interface InviteMemberFormProps {
  walletId: string
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function InviteMemberForm({ walletId, onSubmit, onCancel }: InviteMemberFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<InviteMemberForm>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      role: 'member',
      can_add_transactions: true,
      can_edit_transactions: false,
      can_delete_transactions: false,
      can_manage_budget: false,
    }
  })

  const selectedRole = watch('role')
  const permissions = {
    can_add_transactions: watch('can_add_transactions'),
    can_edit_transactions: watch('can_edit_transactions'),
    can_delete_transactions: watch('can_delete_transactions'),
    can_manage_budget: watch('can_manage_budget'),
  }

  const handleRoleChange = (role: string) => {
    setValue('role', role as any)
    const roleConfig = ROLES.find(r => r.value === role)
    if (roleConfig) {
      Object.entries(roleConfig.defaultPermissions).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }
  }

  const handleFormSubmit = async (data: InviteMemberForm) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/shared-wallets/${walletId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          role: data.role,
          permissions: {
            can_add_transactions: data.can_add_transactions,
            can_edit_transactions: data.can_edit_transactions,
            can_delete_transactions: data.can_delete_transactions,
            can_manage_budget: data.can_manage_budget,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể mời thành viên')
      }

      setSuccess(true)
      setTimeout(async () => {
        await onSubmit()
      }, 1500)
    } catch (err: any) {
      console.error('Error inviting member:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Đã gửi lời mời!</h3>
        <p className="text-muted-foreground">
          Lời mời đã được gửi thành công. Người dùng sẽ nhận được thông báo để tham gia ví.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Email người dùng *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            className="pl-10"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Nhập email của người dùng đã có tài khoản trên hệ thống
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <Label>Vai trò *</Label>
        <div className="grid gap-3">
          {ROLES.map((role) => {
            const Icon = role.icon
            return (
              <Card 
                key={role.value}
                className={`cursor-pointer transition-colors ${
                  selectedRole === role.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => handleRoleChange(role.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedRole === role.value ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{role.label}</h4>
                        {selectedRole === role.value && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Custom Permissions */}
      <div className="space-y-4">
        <div>
          <Label>Quyền hạn tùy chỉnh</Label>
          <p className="text-sm text-muted-foreground">
            Điều chỉnh quyền hạn cụ thể cho thành viên này
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="can_add_transactions">Thêm giao dịch</Label>
                <p className="text-sm text-muted-foreground">Cho phép thêm giao dịch mới</p>
              </div>
              <Switch
                id="can_add_transactions"
                checked={permissions.can_add_transactions}
                onCheckedChange={(checked) => setValue('can_add_transactions', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="can_edit_transactions">Chỉnh sửa giao dịch</Label>
                <p className="text-sm text-muted-foreground">Cho phép chỉnh sửa giao dịch hiện có</p>
              </div>
              <Switch
                id="can_edit_transactions"
                checked={permissions.can_edit_transactions}
                onCheckedChange={(checked) => setValue('can_edit_transactions', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="can_delete_transactions">Xóa giao dịch</Label>
                <p className="text-sm text-muted-foreground">Cho phép xóa giao dịch</p>
              </div>
              <Switch
                id="can_delete_transactions"
                checked={permissions.can_delete_transactions}
                onCheckedChange={(checked) => setValue('can_delete_transactions', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="can_manage_budget">Quản lý ngân sách</Label>
                <p className="text-sm text-muted-foreground">Cho phép tạo và chỉnh sửa ngân sách</p>
              </div>
              <Switch
                id="can_manage_budget"
                checked={permissions.can_manage_budget}
                onCheckedChange={(checked) => setValue('can_manage_budget', checked)}
              />
            </div>
          </CardContent>
        </Card>
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
              Đang gửi...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Gửi lời mời
            </>
          )}
        </Button>
      </div>
    </form>
  )
}