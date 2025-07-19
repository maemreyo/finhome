// src/app/[locale]/dashboard/laboratory/page.tsx
// Financial Laboratory page for what-if analysis with i18n support - UPDATED: 2024-01-18 - Integrated with real database

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { FinancialLaboratory } from "@/components/laboratory/FinancialLaboratory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  TrendingUp,
  AlertCircle,
  Plus,
  Beaker,
} from "lucide-react";
import { type FinancialPlanWithMetrics } from "@/lib/api/plans";
import { DashboardService } from "@/lib/services/dashboardService";

// Demo financial plan for unauthenticated users (minimal fallback)
const demoPlans: FinancialPlanWithMetrics[] = [
  {
    id: "demo-1",
    user_id: "demo-user",
    plan_name: "Kế hoạch mẫu",
    description: "Kế hoạch mẫu cho người chưa đăng nhập",
    plan_type: "home_purchase",
    status: "active",
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: null,
    monthly_income: 45000000,
    current_monthly_expenses: null,
    monthly_expenses: 18000000,
    current_savings: 600000000,
    dependents: 0,
    purchase_price: 2500000000,
    down_payment: 500000000,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: null,
    investment_horizon_months: null,
    expected_roi: null,
    preferred_banks: null,
    expected_rental_income: null,
    expected_appreciation_rate: null,
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    feasibility_score: null,
    recommended_adjustments: {},
    is_public: false,
    view_count: 0,
    cached_calculations: null,
    calculations_last_updated: null,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    completed_at: null,
    // New required fields
    is_favorite: false,
    roi: 8.5,
    total_progress: 65.0,
    financial_progress: 70.0,
    monthly_contribution: 5000000,
    estimated_completion_date: "2026-12-31T00:00:00Z",
    risk_level: "medium",
    tags: ["gia-dinh", "nha-o"],
    notes: null,
    shared_with: [],
    calculatedMetrics: {
      monthlyPayment: 20500000,
      totalInterest: 2920000000,
      debtToIncomeRatio: 45.6,
      affordabilityScore: 8,
      roi: 8.5,
    },
  },
];

// Calculate loan details from plan
const calculateLoanDetails = (plan: FinancialPlanWithMetrics) => {
  const principal = (plan.purchase_price || 0) - (plan.down_payment || 0);
  const interestRate = 8.5; // Default rate
  const termYears = 20; // Default term

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = termYears * 12;
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - principal;

  return {
    principal,
    interestRate,
    termYears,
    monthlyPayment,
    totalInterest,
    totalPayment,
  };
};

export default function LaboratoryPage() {
  const t = useTranslations("Dashboard.Laboratory");
  const { user, isAuthenticated } = useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbPlans, setDbPlans] = useState<any[]>([]);

  // Load database plans
  useEffect(() => {
    const loadDbPlans = async () => {
      try {
        setLoading(true);
        if (isAuthenticated && user) {
          const plans = await DashboardService.getFinancialPlans(user.id);
          setDbPlans(plans);
          if (plans.length > 0) {
            setSelectedPlanId(plans[0].id);
          }
        } else {
          // Use demo data for unauthenticated users
          setDbPlans([]);
          setSelectedPlanId(demoPlans[0].id);
        }
      } catch (err) {
        console.error("Error loading financial plans:", err);
        setError("Failed to load financial plans");
      } finally {
        setLoading(false);
      }
    };

    loadDbPlans();
  }, [isAuthenticated, user]);

  // Convert database plan to FinancialPlanWithMetrics format
  const convertDbPlan = (dbPlan: any): FinancialPlanWithMetrics => {
    return {
      id: dbPlan.id,
      user_id: dbPlan.user_id,
      plan_name: dbPlan.plan_name,
      description: dbPlan.description,
      plan_type: dbPlan.plan_type,
      status: dbPlan.status,
      property_id: dbPlan.property_id,
      custom_property_data: dbPlan.custom_property_data,
      target_age: dbPlan.target_age,
      current_monthly_income: dbPlan.current_monthly_income,
      monthly_income: dbPlan.monthly_income,
      current_monthly_expenses: dbPlan.current_monthly_expenses,
      monthly_expenses: dbPlan.monthly_expenses,
      current_savings: dbPlan.current_savings,
      dependents: dbPlan.dependents,
      purchase_price: dbPlan.purchase_price,
      down_payment: dbPlan.down_payment,
      additional_costs: dbPlan.additional_costs,
      other_debts: dbPlan.other_debts,
      target_property_type: dbPlan.target_property_type,
      target_location: dbPlan.target_location,
      target_budget: dbPlan.target_budget,
      target_timeframe_months: dbPlan.target_timeframe_months,
      investment_purpose: dbPlan.investment_purpose,
      desired_features: dbPlan.desired_features,
      down_payment_target: dbPlan.down_payment_target,
      risk_tolerance: dbPlan.risk_tolerance,
      investment_horizon_months: dbPlan.investment_horizon_months,
      expected_roi: dbPlan.expected_roi,
      preferred_banks: dbPlan.preferred_banks,
      expected_rental_income: dbPlan.expected_rental_income,
      expected_appreciation_rate: dbPlan.expected_appreciation_rate,
      emergency_fund_target: dbPlan.emergency_fund_target,
      education_fund_target: dbPlan.education_fund_target,
      retirement_fund_target: dbPlan.retirement_fund_target,
      other_goals: dbPlan.other_goals,
      feasibility_score: dbPlan.feasibility_score,
      recommended_adjustments: dbPlan.recommended_adjustments,
      is_public: dbPlan.is_public,
      view_count: dbPlan.view_count,
      cached_calculations: dbPlan.cached_calculations,
      calculations_last_updated: dbPlan.calculations_last_updated,
      created_at: dbPlan.created_at,
      updated_at: dbPlan.updated_at,
      completed_at: dbPlan.completed_at,
      // New required fields
      is_favorite: dbPlan.is_favorite || false,
      roi: dbPlan.roi || 0,
      total_progress: dbPlan.total_progress || 0,
      financial_progress: dbPlan.financial_progress || 0,
      monthly_contribution: dbPlan.monthly_contribution || 0,
      estimated_completion_date: dbPlan.estimated_completion_date,
      risk_level: dbPlan.risk_level || 'medium',
      tags: dbPlan.tags || [],
      notes: dbPlan.notes,
      shared_with: dbPlan.shared_with || [],
      calculatedMetrics: dbPlan.cached_calculations || {
        monthlyPayment: 0,
        totalInterest: 0,
        debtToIncomeRatio: 0,
        affordabilityScore: 0,
        roi: 0,
      },
    };
  };

  // Use database plans or fallback to demo data
  const availablePlans = isAuthenticated && dbPlans.length > 0 
    ? dbPlans.map(convertDbPlan)
    : demoPlans;

  const selectedPlan = availablePlans.find((p) => p.id === selectedPlanId);
  const loanDetails = selectedPlan ? calculateLoanDetails(selectedPlan) : null;

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleCreateNewPlan = () => {
    // Navigate to create new plan page
    console.log("Navigate to create new plan");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title={t("title")} description={t("description")} />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title={t("title")} description={t("description")} />
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title={t("title")} description={t("whatIfDescription")} />

      <div className="p-6 space-y-6">
        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {t("planSelection.title")}
            </CardTitle>
            <CardDescription>{t("planSelection.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedPlanId} onValueChange={handlePlanChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("planSelection.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{plan.plan_name}</span>
                          <span className="text-sm text-gray-500 ml-4">
                            {new Intl.NumberFormat(t("locale"), {
                              style: "currency",
                              currency: "VND",
                              notation: "compact",
                            }).format(plan.purchase_price || 0)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateNewPlan}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("planSelection.newPlanButton")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {selectedPlan && loanDetails && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-blue-500" />
                  <div className="text-sm font-medium">
                    {t("quickStats.plan")}
                  </div>
                </div>
                <div className="text-xl font-bold mt-1">
                  {selectedPlan.plan_name}
                </div>
                <div className="text-sm text-gray-600">
                  {t(`planTypes.${selectedPlan.plan_type}`)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  <div className="text-sm font-medium">
                    {t("quickStats.loanAmount")}
                  </div>
                </div>
                <div className="text-xl font-bold mt-1">
                  {new Intl.NumberFormat(t("locale"), {
                    style: "currency",
                    currency: "VND",
                    notation: "compact",
                  }).format(loanDetails.principal)}
                </div>
                <div className="text-sm text-gray-600">
                  {loanDetails.interestRate}% -{" "}
                  {t("quickStats.years", { count: loanDetails.termYears })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <div className="text-sm font-medium">
                    {t("quickStats.monthlyPayment")}
                  </div>
                </div>
                <div className="text-xl font-bold mt-1">
                  {new Intl.NumberFormat(t("locale"), {
                    style: "currency",
                    currency: "VND",
                    notation: "compact",
                  }).format(loanDetails.monthlyPayment)}
                </div>
                <div className="text-sm text-gray-600">
                  {t("quickStats.incomePercentage", {
                    percentage: (
                      (loanDetails.monthlyPayment /
                        (selectedPlan.monthly_income || 1)) *
                      100
                    ).toFixed(1),
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <div className="text-sm font-medium">
                    {t("quickStats.netCashFlow")}
                  </div>
                </div>
                <div className="text-xl font-bold mt-1">
                  {new Intl.NumberFormat(t("locale"), {
                    style: "currency",
                    currency: "VND",
                    notation: "compact",
                  }).format(
                    (selectedPlan.monthly_income || 0) -
                      (selectedPlan.monthly_expenses || 0) -
                      loanDetails.monthlyPayment
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {(selectedPlan.monthly_income || 0) -
                    (selectedPlan.monthly_expenses || 0) -
                    loanDetails.monthlyPayment >=
                  0
                    ? t("quickStats.positive")
                    : t("quickStats.negative")}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Laboratory Component */}
        {selectedPlan && loanDetails ? (
          <FinancialLaboratory
            initialLoan={loanDetails}
            monthlyIncome={selectedPlan.monthly_income || 0}
            monthlyExpenses={selectedPlan.monthly_expenses || 0}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("noPlan.title")}</CardTitle>
              <CardDescription>{t("noPlan.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateNewPlan}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("noPlan.createButton")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Educational Content */}
        <Card>
          <CardHeader>
            <CardTitle>{t("usageGuide.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-blue-500" />
                  {t("usageGuide.earlyRepayment.title")}
                </div>
                <div className="text-sm text-gray-600">
                  {t("usageGuide.earlyRepayment.description")}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  {t("usageGuide.refinancing.title")}
                </div>
                <div className="text-sm text-gray-600">
                  {t("usageGuide.refinancing.description")}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  {t("usageGuide.stressTest.title")}
                </div>
                <div className="text-sm text-gray-600">
                  {t("usageGuide.stressTest.description")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
