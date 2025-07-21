// src/components/subscription/SubscriptionPlansCard.tsx
// Subscription plans display and selection component

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Crown, Star, Zap, Gem } from "lucide-react";
import { useSubscriptionContext } from "./SubscriptionProvider";
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  calculateYearlyDiscount,
} from "@/config/subscriptionPlans";
import { UserSubscriptionTier } from "@/lib/supabase/types";

export function SubscriptionPlansCard() {
  const tSubscriptionCommon = useTranslations("SubscriptionCommon");
  const tFaq = useTranslations("SubscriptionFaq");
  const tSubscriptionPlans = useTranslations("SubscriptionPlans");
  const router = useRouter();
  const { tier: currentTier, isInTrial } = useSubscriptionContext();
  const [isYearly, setIsYearly] = useState(false);

  const handleUpgrade = (planTier: UserSubscriptionTier) => {
    if (planTier === "free") return;
    router.push(
      `/subscription/checkout?plan=${planTier}&billing=${isYearly ? "yearly" : "monthly"}`
    );
  };

  const getPlanIcon = (tier: UserSubscriptionTier) => {
    switch (tier) {
      case "free":
        return <Zap className="h-8 w-8 text-gray-500" />;
      case "premium":
        return <Star className="h-8 w-8 text-blue-500" />;
      case "professional":
        return <Crown className="h-8 w-8 text-purple-500" />;
      default:
        return <Zap className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPlanColor = (tier: UserSubscriptionTier) => {
    switch (tier) {
      case "free":
        return "border-gray-200 bg-white";
      case "premium":
        return "border-blue-300 bg-blue-50 ring-2 ring-blue-200";
      case "professional":
        return "border-purple-300 bg-purple-50 ring-2 ring-purple-200";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const isCurrentPlan = (tier: UserSubscriptionTier) => currentTier === tier;

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span
          className={`text-sm ${!isYearly ? "font-semibold" : "text-gray-500"}`}
        >
          {tSubscriptionPlans("monthly")}
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-blue-600"
        />
        <span
          className={`text-sm ${isYearly ? "font-semibold" : "text-gray-500"}`}
        >
          {tSubscriptionPlans("yearly")}
        </span>
        {isYearly && (
          <Badge variant="secondary" className="ml-2">
            {tSubscriptionPlans("save_percentage", { percentage: "17" })}
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUBSCRIPTION_PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`
                relative h-full transition-all duration-200 hover:shadow-lg
                ${getPlanColor(plan.tier)}
                ${plan.popular ? "transform scale-105" : ""}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    {tSubscriptionPlans("most_popular")}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.tier)}
                </div>

                <CardTitle className="text-2xl font-bold">
                  {plan.nameVi}
                </CardTitle>

                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {plan.price.monthly === 0 ? (
                      <span className="text-green-600">
                        {tSubscriptionCommon("free_tier")}
                      </span>
                    ) : (
                      <span>
                        {formatPrice(
                          isYearly ? plan.price.yearly : plan.price.monthly
                        )}
                        <span className="text-lg font-normal text-gray-500">
                          /{isYearly ? "năm" : "tháng"}
                        </span>
                      </span>
                    )}
                  </div>

                  {isYearly && plan.price.monthly > 0 && (
                    <div className="text-sm text-gray-500">
                      {formatPrice(plan.price.monthly * 12)} →{" "}
                      {formatPrice(plan.price.yearly)}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mt-4">
                  {plan.descriptionVi}
                </p>

                {plan.trial?.enabled && !isCurrentPlan(plan.tier) && (
                  <Badge variant="outline" className="mt-2">
                    {tSubscriptionPlans("free_trial", {
                      days: plan.trial.days,
                    })}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900">
                    {tSubscriptionPlans("features_included")}
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 6).map((feature) => (
                      <li
                        key={feature.id}
                        className="flex items-start space-x-3"
                      >
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span
                            className={`text-sm ${feature.highlighted ? "font-semibold" : ""}`}
                          >
                            {feature.nameVi}
                          </span>
                          {feature.highlighted && (
                            <Gem className="inline h-4 w-4 text-blue-500 ml-1" />
                          )}
                        </div>
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-sm text-gray-500">
                        +{plan.features.length - 6} tính năng khác
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan(plan.tier) ? (
                    <Button variant="outline" className="w-full" disabled>
                      {tSubscriptionPlans("current_plan")}
                    </Button>
                  ) : plan.tier === "free" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.tier)}
                    >
                      {tSubscriptionPlans("downgrade")}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.tier === "premium"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                      onClick={() => handleUpgrade(plan.tier)}
                    >
                      {currentTier === "free"
                        ? tSubscriptionPlans("upgrade")
                        : plan.tier === "professional" &&
                            currentTier === "premium"
                          ? tSubscriptionPlans("upgrade")
                          : tSubscriptionPlans("contact_sales")}
                    </Button>
                  )}
                </div>

                {/* Trial Info */}
                {isInTrial && isCurrentPlan(plan.tier) && (
                  <div className="text-center text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Đang trong thời gian dùng thử</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">
          {tSubscriptionPlans("faq_title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>{tFaq("can_cancel_anytime.question")}</strong>
            <p>{tFaq("can_cancel_anytime.answer")}</p>
          </div>
          <div>
            <strong>{tFaq("refund_policy.question")}</strong>
            <p>{tFaq("refund_policy.answer")}</p>
          </div>
          <div>
            <strong>{tFaq("data_security.question")}</strong>
            <p>{tFaq("data_security.answer")}</p>
          </div>
          <div>
            <strong>{tFaq("plan_changes.question")}</strong>
            <p>{tFaq("plan_changes.answer")}</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        {tSubscriptionPlans("pricing_currency")}
      </div>
    </div>
  );
}
