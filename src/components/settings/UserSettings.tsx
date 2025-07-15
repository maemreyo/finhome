// src/components/settings/UserSettings.tsx
// Comprehensive user settings and preferences management

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Smartphone,
  Mail,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import useGlobalState from "@/lib/hooks/useGlobalState";
import {
  useToast,
  ToastHelpers,
} from "@/components/notifications/ToastNotification";
import { formatVietnamesePhone } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserSettingsProps {
  className?: string;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ className }) => {
  const { showToast } = useToast();
  const {
    user,
    setUser,
    updatePreferences,
    currentTheme,
    setTheme,
    addNotification,
    addExperience,
  } = useGlobalState();

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    avatar: user?.avatar || "",
  });

  const [preferences, setPreferences] = useState({
    currency: user?.preferences?.currency || "VND",
    language: user?.preferences?.language || "vi",
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      achievements: user?.preferences?.notifications?.achievements ?? true,
      marketUpdates: user?.preferences?.notifications?.marketUpdates ?? true,
      paymentReminders:
        user?.preferences?.notifications?.paymentReminders ?? true,
    },
    dashboard: {
      layout: user?.preferences?.dashboard?.layout || "grid",
      widgets: user?.preferences?.dashboard?.widgets || [],
    },
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    showPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const hasFormChanges =
      formData.name !== (user?.name || "") ||
      formData.email !== (user?.email || "") ||
      formData.phone !== "" ||
      formData.bio !== "";

    const hasPreferenceChanges =
      preferences.currency !== (user?.preferences?.currency || "VND") ||
      preferences.language !== (user?.preferences?.language || "vi") ||
      JSON.stringify(preferences.notifications) !==
        JSON.stringify(user?.preferences?.notifications || {}) ||
      JSON.stringify(preferences.dashboard) !==
        JSON.stringify(user?.preferences?.dashboard || {});

    setHasChanges(hasFormChanges || hasPreferenceChanges);
  }, [formData, preferences, user]);

  // Handle form updates
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (
    section: string,
    field: string,
    value: any
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...(typeof prev[section as keyof typeof prev] === "object" &&
        prev[section as keyof typeof prev] !== null
          ? (prev[section as keyof typeof prev] as Record<string, any>)
          : {}),
        [field]: value,
      },
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user profile
      if (user) {
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar,
        };
        setUser(updatedUser);
      }

      // Update preferences
      updatePreferences(preferences);

      // Show success notification
      showToast(
        ToastHelpers.success(
          "Cài đặt đã lưu",
          "Thông tin của bạn đã được cập nhật thành công"
        )
      );

      addNotification({
        type: "success",
        title: "Cài đặt cập nhật",
        message: "Thông tin cá nhân và tùy chọn đã được lưu",
        isRead: false,
      });

      addExperience(20);
      setHasChanges(false);
    } catch (error) {
      showToast(ToastHelpers.error("Lỗi lưu cài đặt", "Vui lòng thử lại sau"));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset settings
  const handleResetSettings = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      bio: "",
      avatar: user?.avatar || "",
    });

    setPreferences({
      currency: user?.preferences?.currency || "VND",
      language: user?.preferences?.language || "vi",
      notifications: user?.preferences?.notifications || {
        email: true,
        push: true,
        achievements: true,
        marketUpdates: true,
        paymentReminders: true,
      },
      dashboard: user?.preferences?.dashboard || {
        layout: "grid",
        widgets: [],
      },
    });

    setHasChanges(false);
    showToast(
      ToastHelpers.info(
        "Đã khôi phục",
        "Cài đặt đã được khôi phục về trạng thái ban đầu"
      )
    );
  };

  // Export user data
  const handleExportData = () => {
    const exportData = {
      profile: formData,
      preferences,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finhome-user-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      ToastHelpers.success(
        "Dữ liệu đã xuất",
        "File dữ liệu cá nhân đã được tải xuống"
      )
    );
  };

  const availableWidgets = [
    { id: "portfolio-summary", name: "Tổng quan danh mục" },
    { id: "recent-transactions", name: "Giao dịch gần đây" },
    { id: "market-news", name: "Tin tức thị trường" },
    { id: "loan-calculator", name: "Máy tính vay" },
    { id: "savings-progress", name: "Tiến độ tiết kiệm" },
    { id: "achievements", name: "Thành tích" },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Cài Đặt Tài Khoản
          </h2>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và tùy chọn hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-200"
            >
              Có thay đổi chưa lưu
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleResetSettings}
            disabled={!hasChanges || isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Khôi phục
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Giao diện
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Dữ liệu
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông Tin Cá Nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className="text-lg">
                    {formData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar">URL Avatar</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => handleFormChange("avatar", e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-sm text-gray-500">
                    Nhập URL hình ảnh hoặc để trống để sử dụng avatar mặc định
                  </p>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="nguyen.vana@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="0912 345 678"
                  />
                  {formData.phone && (
                    <p className="text-sm text-gray-500">
                      Định dạng: {formatVietnamesePhone(formData.phone)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      handlePreferenceChange("language", "", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      handlePreferenceChange("currency", "", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleFormChange("bio", e.target.value)}
                  placeholder="Chia sẻ một chút về bản thân và mục tiêu tài chính của bạn..."
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  {formData.bio.length}/500 ký tự
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Cài Đặt Thông Báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <Label>Thông báo qua email</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo về giao dịch và cập nhật quan trọng
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <Label>Thông báo đẩy</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Thông báo ngay lập tức trên thiết bị di động
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <Label>Thông báo thành tích</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo khi mở khóa thành tích mới
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications.achievements}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("achievements", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <Label>Cập nhật thị trường</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Thông tin về lãi suất, thị trường bất động sản
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications.marketUpdates}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("marketUpdates", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <Label>Nhắc nhở thanh toán</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Nhắc nhở về các khoản vay và hóa đơn sắp đến hạn
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications.paymentReminders}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("paymentReminders", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Giao Diện & Hiển Thị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-4">
                <Label>Chủ đề giao diện</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      currentTheme === "light"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    )}
                    onClick={() => setTheme("light")}
                  >
                    <div className="w-full h-20 bg-white border rounded mb-3 flex items-center justify-center">
                      <div className="text-xs text-gray-600">Sáng</div>
                    </div>
                    <div className="text-sm font-medium">Chủ đề sáng</div>
                  </div>

                  <div
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      currentTheme === "dark"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    )}
                    onClick={() => setTheme("dark")}
                  >
                    <div className="w-full h-20 bg-gray-800 border rounded mb-3 flex items-center justify-center">
                      <div className="text-xs text-white">Tối</div>
                    </div>
                    <div className="text-sm font-medium">Chủ đề tối</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dashboard Layout */}
              <div className="space-y-4">
                <Label>Bố cục dashboard</Label>
                <Select
                  value={preferences.dashboard.layout}
                  onValueChange={(value) =>
                    handlePreferenceChange("dashboard", "layout", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Lưới (Grid)</SelectItem>
                    <SelectItem value="list">Danh sách (List)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Dashboard Widgets */}
              <div className="space-y-4">
                <Label>Widgets dashboard</Label>
                <p className="text-sm text-gray-500">
                  Chọn các widget hiển thị trên trang chính
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {availableWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={widget.id}
                        checked={preferences.dashboard.widgets.includes(
                          widget.id
                        )}
                        onChange={(e) => {
                          const newWidgets = e.target.checked
                            ? [...preferences.dashboard.widgets, widget.id]
                            : preferences.dashboard.widgets.filter(
                                (w) => w !== widget.id
                              );
                          handlePreferenceChange(
                            "dashboard",
                            "widgets",
                            newWidgets
                          );
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={widget.id} className="text-sm">
                        {widget.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Bảo Mật Tài Khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Change */}
              <div className="space-y-4">
                <Label>Đổi mật khẩu</Label>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={security.showPassword ? "text" : "password"}
                        value={security.currentPassword}
                        onChange={(e) =>
                          setSecurity((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setSecurity((prev) => ({
                            ...prev,
                            showPassword: !prev.showPassword,
                          }))
                        }
                      >
                        {security.showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) =>
                        setSecurity((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Nhập mật khẩu mới"
                    />
                    {security.newPassword && (
                      <div className="space-y-1">
                        <Progress
                          value={Math.min(
                            100,
                            security.newPassword.length * 10
                          )}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          Độ mạnh mật khẩu:{" "}
                          {security.newPassword.length < 6
                            ? "Yếu"
                            : security.newPassword.length < 10
                              ? "Trung bình"
                              : "Mạnh"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) =>
                        setSecurity((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    {security.confirmPassword &&
                      security.newPassword !== security.confirmPassword && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Mật khẩu không khớp
                        </p>
                      )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-fit"
                    disabled={
                      !security.currentPassword ||
                      !security.newPassword ||
                      security.newPassword !== security.confirmPassword
                    }
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Xác thực hai yếu tố (2FA)</Label>
                  <p className="text-sm text-gray-500">
                    Tăng cường bảo mật với xác thực qua SMS hoặc app
                  </p>
                </div>
                <Switch
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSecurity((prev) => ({
                      ...prev,
                      twoFactorEnabled: checked,
                    }))
                  }
                />
              </div>

              <Separator />

              {/* Session Management */}
              <div className="space-y-4">
                <Label>Quản lý phiên đăng nhập</Label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">Thiết bị hiện tại</p>
                      <p className="text-sm text-gray-500">
                        Chrome trên Windows • Đang hoạt động
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Hiện tại
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    Đăng xuất tất cả thiết bị khác
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Quản Lý Dữ Liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Export */}
              <div className="space-y-4">
                <div>
                  <Label>Xuất dữ liệu cá nhân</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Tải xuống tất cả dữ liệu cá nhân của bạn trong định dạng
                    JSON
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-fit"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Xuất dữ liệu
                </Button>
              </div>

              <Separator />

              {/* Data Summary */}
              <div className="space-y-4">
                <Label>Tóm tắt dữ liệu</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">12</div>
                    <div className="text-sm text-gray-500">
                      Kế hoạch tài chính
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">3</div>
                    <div className="text-sm text-gray-500">Bất động sản</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">156</div>
                    <div className="text-sm text-gray-500">Tính toán vay</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">8</div>
                    <div className="text-sm text-gray-500">Thành tích</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Deletion */}
              <div className="space-y-4">
                <div>
                  <Label className="text-red-600">Xóa tài khoản</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. Hành
                    động này không thể hoàn tác.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    showToast(
                      ToastHelpers.error(
                        "Chức năng chưa khả dụng",
                        "Vui lòng liên hệ hỗ trợ để xóa tài khoản"
                      )
                    )
                  }
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Xóa tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;
