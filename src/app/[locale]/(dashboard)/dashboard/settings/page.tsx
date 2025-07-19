// Dashboard settings page with locale support - UPDATED: Integrated with database

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { DashboardService } from '@/lib/services/dashboardService'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const t = useTranslations('Dashboard.Settings')
  const { user } = useAuth()
  
  // User preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [achievementNotifications, setAchievementNotifications] = useState(true)
  const [marketUpdateNotifications, setMarketUpdateNotifications] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'list'>('grid')
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'friends'>('private')
  const [allowDataSharing, setAllowDataSharing] = useState(false)
  
  // User profile state
  const [language, setLanguage] = useState('vi')
  const [currency, setCurrency] = useState('VND')
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load user settings on component mount
  useEffect(() => {
    if (!user) return

    const loadSettings = async () => {
      try {
        setLoading(true)
        
        // Load user preferences and profile in parallel
        const [preferences, profile] = await Promise.all([
          DashboardService.getUserPreferences(user.id),
          DashboardService.getUserProfile(user.id)
        ])

        // Update preferences state
        setEmailNotifications(preferences.email_notifications)
        setPushNotifications(preferences.push_notifications)
        setAchievementNotifications(preferences.achievement_notifications)
        setMarketUpdateNotifications(preferences.market_update_notifications)
        setTheme(preferences.theme)
        setDashboardLayout(preferences.dashboard_layout)
        setProfileVisibility(preferences.profile_visibility)
        setAllowDataSharing(preferences.allow_data_sharing)

        // Update profile state
        setLanguage(profile.preferred_language || profile.language || 'vi')
        setCurrency(profile.currency || 'VND')
        setTimezone(profile.timezone || 'Asia/Ho_Chi_Minh')
        setFullName(profile.full_name || '')
        setPhone(profile.phone || '')
        setCompany(profile.company || '')
        setMonthlyIncome(profile.monthly_income || 0)
        setCity(profile.city || '')
        setDistrict(profile.district || '')
        setAddress(profile.address || '')
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Lỗi tải cài đặt. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user])

  // Save general settings
  const saveGeneralSettings = async () => {
    if (!user || saving) return

    try {
      setSaving(true)
      
      await DashboardService.updateUserProfile(user.id, {
        preferred_language: language,
        currency,
        timezone,
        full_name: fullName,
        phone,
        company,
        monthly_income: monthlyIncome > 0 ? monthlyIncome : undefined,
        city,
        district,
        address
      })

      toast.success('Đã lưu cài đặt chung thành công!')
    } catch (error) {
      console.error('Error saving general settings:', error)
      toast.error('Lỗi lưu cài đặt. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  // Save notification settings
  const saveNotificationSettings = async () => {
    if (!user || saving) return

    try {
      setSaving(true)
      
      await DashboardService.updateUserPreferences(user.id, {
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        achievement_notifications: achievementNotifications,
        market_update_notifications: marketUpdateNotifications
      })

      toast.success('Đã lưu cài đặt thông báo thành công!')
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error('Lỗi lưu cài đặt. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  // Save preference settings
  const savePreferenceSettings = async () => {
    if (!user || saving) return

    try {
      setSaving(true)
      
      await DashboardService.updateUserPreferences(user.id, {
        theme,
        dashboard_layout: dashboardLayout,
        profile_visibility: profileVisibility,
        allow_data_sharing: allowDataSharing
      })

      toast.success('Đã lưu tùy chọn cá nhân thành công!')
    } catch (error) {
      console.error('Error saving preference settings:', error)
      toast.error('Lỗi lưu cài đặt. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell title={t('title')} description={t('description')}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell 
      title={t('title')} 
      description={t('description')}
    >
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('tabs.preferences')}</TabsTrigger>
          <TabsTrigger value="account">{t('tabs.account')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('general.title')}
              </CardTitle>
              <CardDescription>
                {t('general.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (Việt Nam Đồng)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Múi giờ</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn múi giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Singapore">{t('general.timezones.singapore')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Giao diện</Label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giao diện" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Sáng</SelectItem>
                    <SelectItem value="dark">Tối</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveGeneralSettings} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Cài Đặt Thông Báo
              </CardTitle>
              <CardDescription>
                Chọn loại thông báo bạn muốn nhận
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Thông báo email</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo về kế hoạch và cập nhật tài khoản
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Thông báo đẩy</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo trên thiết bị di động
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievement-notifications">Thông báo thành tích</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo khi đạt được thành tích mới
                    </p>
                  </div>
                  <Switch
                    id="achievement-notifications"
                    checked={achievementNotifications}
                    onCheckedChange={setAchievementNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="market-notifications">Thông báo thị trường</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông tin cập nhật về thị trường bất động sản
                    </p>
                  </div>
                  <Switch
                    id="market-notifications"
                    checked={marketUpdateNotifications}
                    onCheckedChange={setMarketUpdateNotifications}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveNotificationSettings} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo Mật Tài Khoản
              </CardTitle>
              <CardDescription>
                Quản lý mật khẩu và cài đặt bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Xác thực hai yếu tố</Label>
                    <p className="text-sm text-muted-foreground">
                      Thêm lớp bảo mật bổ sung cho tài khoản
                    </p>
                  </div>
                  <Button variant="outline">Kích hoạt</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Phiên đăng nhập</Label>
                    <p className="text-sm text-muted-foreground">
                      Quản lý các thiết bị đã đăng nhập
                    </p>
                  </div>
                  <Button variant="outline">Xem chi tiết</Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Cập nhật mật khẩu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Tùy Chọn Cá Nhân
              </CardTitle>
              <CardDescription>
                Tùy chỉnh trải nghiệm sử dụng ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bố cục dashboard</Label>
                    <p className="text-sm text-muted-foreground">
                      Chọn cách hiển thị dashboard
                    </p>
                  </div>
                  <Select value={dashboardLayout} onValueChange={(value: 'grid' | 'list') => setDashboardLayout(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Lưới</SelectItem>
                      <SelectItem value="list">Danh sách</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiển thị hồ sơ</Label>
                    <p className="text-sm text-muted-foreground">
                      Ai có thể xem hồ sơ của bạn
                    </p>
                  </div>
                  <Select value={profileVisibility} onValueChange={(value: 'public' | 'private' | 'friends') => setProfileVisibility(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Riêng tư</SelectItem>
                      <SelectItem value="friends">Bạn bè</SelectItem>
                      <SelectItem value="public">Công khai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chia sẻ dữ liệu</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép chia sẻ dữ liệu để cải thiện dịch vụ
                    </p>
                  </div>
                  <Switch
                    checked={allowDataSharing}
                    onCheckedChange={setAllowDataSharing}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={savePreferenceSettings} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu tùy chọn'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Quản Lý Tài Khoản
              </CardTitle>
              <CardDescription>
                {t('account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('account.exportData')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('account.exportDataDescription')}
                    </p>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {t('account.exportDataButton')}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <Label>{t('account.dangerZone')}</Label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('account.deleteAccount')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('account.deleteAccountDescription')}
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('account.deleteAccountButton')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}