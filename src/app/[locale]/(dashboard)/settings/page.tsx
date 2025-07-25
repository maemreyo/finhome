// Dashboard settings page with locale support - UPDATED: Integrated with database

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { DashboardService } from "@/lib/services/dashboardService";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { PasswordChangeForm } from "@/components/settings/PasswordChangeForm";
import { ExportDataDialog } from "@/components/settings/ExportDataDialog";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { AdminSettings } from "@/components/admin/AdminSettings";

export default function SettingsPage() {
  const t = useTranslations("Dashboard.Settings");
  const { user } = useAuth();
  console.log(user);
  // User preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [achievementNotifications, setAchievementNotifications] =
    useState(true);
  const [marketUpdateNotifications, setMarketUpdateNotifications] =
    useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dashboardLayout, setDashboardLayout] = useState<"grid" | "list">(
    "grid"
  );
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private" | "friends"
  >("private");
  const [allowDataSharing, setAllowDataSharing] = useState(false);

  // User profile state
  const [language, setLanguage] = useState("vi");
  const [currency, setCurrency] = useState("VND");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");

  // Admin access state
  const [isAdmin, setIsAdmin] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user settings on component mount
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        setLoading(true);

        // Load user preferences and profile in parallel
        const [preferences, profile] = await Promise.all([
          DashboardService.getUserPreferences(user.id),
          DashboardService.getUserProfile(user.id),
        ]);

        // Update preferences state
        setEmailNotifications(preferences.email_notifications || false);
        setPushNotifications(preferences.push_notifications || false);
        setAchievementNotifications(
          preferences.achievement_notifications || false
        );
        setMarketUpdateNotifications(
          preferences.market_update_notifications || false
        );
        setTheme(preferences.theme || ("light" as any));
        setDashboardLayout(preferences.dashboard_layout || ("grid" as any));
        setProfileVisibility(
          preferences.profile_visibility || ("private" as any)
        );
        setAllowDataSharing(preferences.allow_data_sharing || false);

        // Update profile state
        setLanguage(profile.preferred_language || profile.language || "vi");
        setCurrency(profile.currency || "VND");
        setTimezone(profile.timezone || "Asia/Ho_Chi_Minh");
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setCompany(profile.company || "");
        setMonthlyIncome(profile.monthly_income || 0);
        setCity(profile.city || "");
        setDistrict(profile.district || "");
        setAddress(profile.address || "");

        // Update admin status
        setIsAdmin(profile.is_admin || false);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error(t("general.loadError"));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Save general settings
  const saveGeneralSettings = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

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
        address,
      });

      toast.success(t("general.saveSuccess"));
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast.error(t("general.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

      await DashboardService.updateUserPreferences(user.id, {
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        achievement_notifications: achievementNotifications,
        market_update_notifications: marketUpdateNotifications,
      });

      toast.success(t("notifications.saveSuccess"));
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error(t("general.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // Save preference settings
  const savePreferenceSettings = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

      await DashboardService.updateUserPreferences(user.id, {
        theme,
        dashboard_layout: dashboardLayout,
        profile_visibility: profileVisibility,
        allow_data_sharing: allowDataSharing,
      });

      toast.success(t("preferences.saveSuccess"));
    } catch (error) {
      console.error("Error saving preference settings:", error);
      toast.error(t("general.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title={t("title")} description={t("description")}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={t("title")} description={t("description")}>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">{t("tabs.general")}</TabsTrigger>
          <TabsTrigger value="notifications">
            {t("tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("tabs.preferences")}</TabsTrigger>
          <TabsTrigger value="account">{t("tabs.account")}</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          {/* <TabsTrigger value="admin" className="">Admin</TabsTrigger> */}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("general.title")}
              </CardTitle>
              <CardDescription>{t("general.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("general.language")}</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("general.selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">
                        {t("general.languages.vietnamese")}
                      </SelectItem>
                      <SelectItem value="en">
                        {t("general.languages.english")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t("general.currency")}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("general.selectCurrency")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">
                        {t("general.currencies.vnd")}
                      </SelectItem>
                      <SelectItem value="USD">
                        {t("general.currencies.usd")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">{t("general.timezone")}</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("general.selectTimezone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">
                      {t("general.timezones.vietnam")}
                    </SelectItem>
                    <SelectItem value="Asia/Bangkok">
                      {t("general.timezones.bangkok")}
                    </SelectItem>
                    <SelectItem value="Asia/Singapore">
                      {t("general.timezones.singapore")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">{t("general.theme")}</Label>
                <Select
                  value={theme}
                  onValueChange={(value: "light" | "dark") => setTheme(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("general.selectTheme")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      {t("general.themes.light")}
                    </SelectItem>
                    <SelectItem value="dark">
                      {t("general.themes.dark")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveGeneralSettings} disabled={saving}>
                  {saving ? t("general.saving") : t("general.saveChanges")}
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
                {t("notifications.title")}
              </CardTitle>
              <CardDescription>
                {t("notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      {t("notifications.emailNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("notifications.emailDescription")}
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
                    <Label htmlFor="push-notifications">
                      {t("notifications.pushNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("notifications.pushDescription")}
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
                    <Label htmlFor="achievement-notifications">
                      {t("notifications.achievementNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("notifications.achievementDescription")}
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
                    <Label htmlFor="market-notifications">
                      {t("notifications.marketNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("notifications.marketDescription")}
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
                  {saving
                    ? t("notifications.saving")
                    : t("notifications.saveChanges")}
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
                {t("security.title")}
              </CardTitle>
              <CardDescription>{t("security.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PasswordChangeForm />

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("security.twoFactorAuth")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("security.twoFactorDescription")}
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    {t("security.enable")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("security.loginSessions")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("security.loginSessionsDescription")}
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    {t("security.viewDetails")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("preferences.title")}
              </CardTitle>
              <CardDescription>{t("preferences.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("preferences.dashboardLayout")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("preferences.dashboardLayoutDescription")}
                    </p>
                  </div>
                  <Select
                    value={dashboardLayout}
                    onValueChange={(value: "grid" | "list") =>
                      setDashboardLayout(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">
                        {t("preferences.layoutGrid")}
                      </SelectItem>
                      <SelectItem value="list">
                        {t("preferences.layoutList")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("preferences.profileVisibility")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("preferences.profileVisibilityDescription")}
                    </p>
                  </div>
                  <Select
                    value={profileVisibility}
                    onValueChange={(value: "public" | "private" | "friends") =>
                      setProfileVisibility(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        {t("preferences.visibilityPrivate")}
                      </SelectItem>
                      <SelectItem value="friends">
                        {t("preferences.visibilityFriends")}
                      </SelectItem>
                      <SelectItem value="public">
                        {t("preferences.visibilityPublic")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("preferences.dataSharing")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("preferences.dataSharingDescription")}
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
                  {saving
                    ? t("preferences.saving")
                    : t("preferences.savePreferences")}
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
                {t("account.title")}
              </CardTitle>
              <CardDescription>{t("account.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("account.exportData")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("account.exportDataDescription")}
                    </p>
                  </div>
                  <ExportDataDialog />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <Label>{t("account.dangerZone")}</Label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("account.deleteAccount")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("account.deleteAccountDescription")}
                      </p>
                    </div>
                    <DeleteAccountDialog />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
