// src/components/subscription/UpgradePrompt.tsx
// Upgrade prompt component for subscription upselling

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Crown, Star, Zap, X } from "lucide-react";
import { FeatureAccess, FeatureKey } from "@/types/subscription";
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  calculateYearlyDiscount,
} from "@/config/subscriptionPlans";
import { UserSubscriptionTier } from "@/src/types/supabase";

interface UpgradePromptProps {
  featureKey: FeatureKey;
  access: FeatureAccess;
  style?: "modal" | "banner" | "inline" | "tooltip";
  className?: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

/**
 * UpgradePrompt component for encouraging subscription upgrades
 */
export function UpgradePrompt({
  featureKey,
  access,
  style = "inline",
  className = "",
  onDismiss,
  dismissible = true,
}: UpgradePromptProps) {
  const t = useTranslations("UpgradePrompts");
  const tFeatures = useTranslations("Features");
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = (tier: UserSubscriptionTier) => {
    router.push(`/subscription/checkout?plan=${tier}&feature=${featureKey}`);
  };

  if (isDismissed) return null;

  const targetPlan = SUBSCRIPTION_PLANS.find(
    (plan) => plan.tier === access.upgradeRequired
  );
  if (!targetPlan) return null;

  const isLimitExceeded = access.reason === "limit_exceeded";
  const urgencyLevel = isLimitExceeded ? "high" : "medium";

  // Generate contextual messages based on feature
  const getFeatureMessage = (key: FeatureKey) => {
    const messages = {
      unlimited_plans: {
        title: tFeatures("unlimited_plans_title"),
        message: isLimitExceeded
          ? tFeatures("unlimited_plans_limit_message", {
              current: access.currentUsage ?? 0,
              limit: access.limit ?? 0,
            })
          : tFeatures("unlimited_plans_message"),
        benefit: tFeatures("unlimited_plans_benefit"),
      },
      advanced_calculations: {
        title: tFeatures("advanced_calculations_title"),
        message: tFeatures("advanced_calculations_message"),
        benefit: tFeatures("advanced_calculations_benefit"),
      },
      scenario_comparison: {
        title: tFeatures("scenario_comparison_title"),
        message: isLimitExceeded
          ? tFeatures("scenario_comparison_limit_message", {
              current: access.currentUsage ?? 0,
              limit: access.limit ?? 0,
            })
          : tFeatures("scenario_comparison_message"),
        benefit: tFeatures("scenario_comparison_benefit"),
      },
      real_time_data: {
        title: tFeatures("real_time_data_title"),
        message: tFeatures("real_time_data_message"),
        benefit: tFeatures("real_time_data_benefit"),
      },
      monte_carlo_analysis: {
        title: tFeatures("monte_carlo_title"),
        message: tFeatures("monte_carlo_message"),
        benefit: tFeatures("monte_carlo_benefit"),
      },
    };

    return (
      (messages as any)[key] || {
        title: tFeatures("feature_upgrade_title"),
        message: tFeatures("feature_upgrade_message"),
        benefit: tFeatures("feature_upgrade_benefit"),
      }
    );
  };

  const featureMessage = getFeatureMessage(featureKey);

  const renderPromptContent = () => (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        {urgencyLevel === "high" ? (
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        ) : targetPlan.tier === "professional" ? (
          <Crown className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
        ) : (
          <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm">
            {featureMessage.title}
          </h4>
          <p className="text-gray-600 text-sm mt-1">{featureMessage.message}</p>
          <p className="text-gray-500 text-xs mt-2">{featureMessage.benefit}</p>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => handleUpgrade(targetPlan.tier)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Zap className="h-4 w-4 mr-2" />
          {t("upgrade_to", { plan: targetPlan.nameVi })}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/subscription")}
          className="sm:w-auto"
        >
          {t("compare_plans")}
        </Button>
      </div>

      {targetPlan.trial?.enabled && (
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            {t("free_trial_available", { days: targetPlan.trial.days })}
          </Badge>
        </div>
      )}
    </div>
  );

  // Render based on style
  switch (style) {
    case "modal":
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t("unlock_feature")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-blue-600" />
                <span>Cần nâng cấp</span>
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4">{renderPromptContent()}</div>
          </DialogContent>
        </Dialog>
      );

    case "banner":
      return (
        <div
          className={`border border-blue-200 bg-blue-50 rounded-lg p-4 ${className}`}
        >
          {renderPromptContent()}
        </div>
      );

    case "tooltip":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" disabled className="opacity-50">
                Cao cấp
                <Crown className="h-4 w-4 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-2">
                <p className="font-medium">{featureMessage.title}</p>
                <p className="text-xs text-gray-200">
                  {featureMessage.message}
                </p>
                <Button
                  size="sm"
                  onClick={() => handleUpgrade(targetPlan.tier)}
                  className="w-full"
                >
                  {t("upgrade_now")}
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    case "inline":
    default:
      return (
        <Card className={`border-blue-200 ${className}`}>
          <CardContent className="p-4">{renderPromptContent()}</CardContent>
        </Card>
      );
  }
}

interface QuickUpgradeButtonProps {
  featureKey: FeatureKey;
  targetTier: UserSubscriptionTier;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

/**
 * Quick upgrade button for inline usage
 */
export function QuickUpgradeButton({
  featureKey,
  targetTier,
  size = "sm",
  variant = "outline",
  className = "",
}: QuickUpgradeButtonProps) {
  const t = useTranslations("UpgradePrompts");
  const router = useRouter();

  const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === targetTier);
  if (!plan) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() =>
        router.push(
          `/subscription/checkout?plan=${targetTier}&feature=${featureKey}`
        )
      }
      className={`${className}`}
    >
      <Crown className="h-4 w-4 mr-2" />
      {t("upgrade_to", { plan: plan.nameVi })}
    </Button>
  );
}

interface FeatureLockIconProps {
  featureKey: FeatureKey;
  className?: string;
  showTooltip?: boolean;
}

/**
 * Simple lock icon for disabled features
 */
export function FeatureLockIcon({
  featureKey,
  className = "",
  showTooltip = true,
}: FeatureLockIconProps) {
  const t = useTranslations("SubscriptionCommon");

  const icon = <Crown className={`h-4 w-4 text-gray-400 ${className}`} />;

  if (!showTooltip) return icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{t("premium_feature_locked")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
