// src/app/[locale]/dashboard/scenarios/page.tsx
// Scenario comparison and management page with i18n support

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ScenarioComparison } from "@/components/scenarios/ScenarioComparison";
import { useScenarios } from "@/hooks/useScenarios";
import { useAuth } from "@/hooks/useAuth";
import type { FinancialScenario } from "@/types/scenario";
import { useBankRates } from "@/hooks/useBankRates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  TrendingUp,
  Calculator,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { calculateMonthlyPayment } from "@/lib/financial/calculations";

// Helper function to create mock financial scenarios
const createMockScenario = (params: {
  id: string;
  name: string;
  scenarioType:
    | "baseline"
    | "optimistic"
    | "pessimistic"
    | "alternative"
    | "stress_test";
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  riskLevel: "low" | "medium" | "high";
}): FinancialScenario => {
  const monthlyPayment = calculateMonthlyPayment({
    principal: params.loanAmount,
    annualRate: params.interestRate,
    termMonths: params.loanTermYears * 12,
  });
  const totalInterest =
    monthlyPayment * params.loanTermYears * 12 - params.loanAmount;
  const totalCost = params.purchasePrice + totalInterest;
  const dtiRatio = (monthlyPayment / params.monthlyIncome) * 100;
  const ltvRatio = (params.loanAmount / params.purchasePrice) * 100;

  return {
    // Base FinancialPlan fields
    id: params.id,
    user_id: "demo-user",
    plan_name: params.name,
    description: `Mock ${params.scenarioType} scenario`,
    plan_type: "home_purchase",
    status: "draft",
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: params.monthlyIncome,
    monthly_income: params.monthlyIncome,
    current_monthly_expenses: params.monthlyExpenses,
    monthly_expenses: params.monthlyExpenses,
    current_savings: null,
    dependents: 0,
    purchase_price: params.purchasePrice,
    down_payment: params.downPayment,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: params.loanTermYears * 12,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: "moderate",
    investment_horizon_months: null,
    expected_roi: 10.5,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,

    // Scenario-specific properties
    scenarioType: params.scenarioType,
    riskLevel: params.riskLevel,

    // Calculated metrics
    calculatedMetrics: {
      monthlyPayment,
      totalInterest,
      totalCost,
      dtiRatio,
      ltvRatio,
      affordabilityScore: 7,
      payoffTimeMonths: params.loanTermYears * 12,
    },
  };
};

interface ScenarioGeneratorForm {
  propertyPrice: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  loanType: "home_purchase" | "investment" | "commercial";
}

export default function ScenariosPage() {
  const { user } = useAuth();
  const {
    scenarios,
    loading,
    error,
    createScenario,
    updateScenario,
    deleteScenario,
  } = useScenarios(user?.id || "");
  const t = useTranslations("Dashboard.Scenarios");
  const { rates, isLoading: ratesLoading, getRates } = useBankRates();
  const [selectedScenario, setSelectedScenario] =
    useState<FinancialScenario | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatorForm, setGeneratorForm] = useState<ScenarioGeneratorForm>({
    propertyPrice: 2500000000,
    monthlyIncome: 45000000,
    monthlyExpenses: 18000000,
    loanType: "home_purchase",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenarios, setGeneratedScenarios] = useState<
    FinancialScenario[]
  >([]);

  // Mock data for demonstration
  const mockScenarios: FinancialScenario[] = [
    createMockScenario({
      id: "scenario-1",
      name: t("mockScenarios.conservative.name"),
      scenarioType: "baseline",
      purchasePrice: 2500000000,
      downPayment: 750000000,
      loanAmount: 1750000000,
      interestRate: 8.0,
      loanTermYears: 15,
      monthlyIncome: 45000000,
      monthlyExpenses: 18000000,
      riskLevel: "low",
    }),
    createMockScenario({
      id: "scenario-2",
      name: t("mockScenarios.balanced.name"),
      scenarioType: "alternative",
      purchasePrice: 2500000000,
      downPayment: 500000000,
      loanAmount: 2000000000,
      interestRate: 8.5,
      loanTermYears: 20,
      monthlyIncome: 45000000,
      monthlyExpenses: 18000000,
      riskLevel: "medium",
    }),
    createMockScenario({
      id: "scenario-3",
      name: t("mockScenarios.optimistic.name"),
      scenarioType: "optimistic",
      purchasePrice: 2500000000,
      downPayment: 375000000,
      loanAmount: 2125000000,
      interestRate: 9.0,
      loanTermYears: 25,
      monthlyIncome: 45000000,
      monthlyExpenses: 18000000,
      riskLevel: "medium",
    }),
    createMockScenario({
      id: "scenario-4",
      name: t("mockScenarios.highRisk.name"),
      scenarioType: "stress_test",
      purchasePrice: 2500000000,
      downPayment: 250000000,
      loanAmount: 2250000000,
      interestRate: 10.0,
      loanTermYears: 30,
      monthlyIncome: 45000000,
      monthlyExpenses: 18000000,
      riskLevel: "high",
    }),
  ];

  const handleScenarioSelect = (scenario: FinancialScenario) => {
    setSelectedScenario(scenario);
    // In a real app, this would navigate to a detailed view or apply the scenario
    console.log("Selected scenario:", scenario);
  };

  const handleCreateNewScenario = () => {
    setShowCreateModal(true);
    // Load latest bank rates when opening the modal
    getRates({ loanType: generatorForm.loanType, isActive: true });
  };

  const generateSmartScenarios = async () => {
    setIsGenerating(true);
    try {
      // Get current bank rates for the loan type
      await getRates({
        loanType: generatorForm.loanType,
        isActive: true,
        minAmount: generatorForm.propertyPrice * 0.7, // Assume 70% loan amount
        maxAmount: generatorForm.propertyPrice * 0.9, // Max 90% loan amount
      });

      // Create scenarios with different down payment percentages
      const downPaymentOptions = [10, 15, 20, 25, 30];
      const loanTermOptions = [15, 20, 25, 30];

      const generatedScenarios: FinancialScenario[] = [];
      let scenarioId = 1;

      for (const downPaymentPercent of downPaymentOptions) {
        for (const loanTermYears of loanTermOptions) {
          if (generatedScenarios.length >= 6) break; // Limit to 6 scenarios

          const downPayment = Math.round(
            generatorForm.propertyPrice * (downPaymentPercent / 100)
          );
          const loanAmount = generatorForm.propertyPrice - downPayment;

          // Use rates from bank data or fallback to market average
          const applicableRates = rates.filter(
            (rate) =>
              (rate.min_amount || 0) <= loanAmount &&
              (rate.max_amount || Infinity) >= loanAmount &&
              (rate.min_term_months || 0) <= loanTermYears * 12 &&
              (rate.max_term_months || Infinity) >= loanTermYears * 12
          );

          const bestRate =
            applicableRates.length > 0
              ? Math.min(
                  ...applicableRates.map(
                    (r) => r.promotional_rate || r.base_rate
                  )
                )
              : 8.5 +
                (loanTermYears > 20 ? 1.0 : 0) +
                (downPaymentPercent < 20 ? 0.5 : 0);

          const monthlyPayment = calculateMonthlyPayment({
            principal: loanAmount,
            annualRate: bestRate,
            termMonths: loanTermYears * 12,
          });

          const totalPayment = monthlyPayment * loanTermYears * 12;
          const totalInterest = totalPayment - loanAmount;
          const netCashFlow =
            generatorForm.monthlyIncome -
            generatorForm.monthlyExpenses -
            monthlyPayment;

          // Determine risk level and recommendation
          const debtToIncomeRatio =
            (monthlyPayment / generatorForm.monthlyIncome) * 100;
          let riskLevel: "low" | "medium" | "high" = "low";
          let recommendation: "optimal" | "safe" | "aggressive" | "risky" =
            "safe";

          if (
            debtToIncomeRatio > 45 ||
            netCashFlow < 0 ||
            downPaymentPercent < 15
          ) {
            riskLevel = "high";
            recommendation = "risky";
          } else if (debtToIncomeRatio > 35 || downPaymentPercent < 20) {
            riskLevel = "medium";
            recommendation = "aggressive";
          } else if (
            debtToIncomeRatio <= 30 &&
            downPaymentPercent >= 20 &&
            netCashFlow > 5000000
          ) {
            recommendation = "optimal";
          }

          const scenario: FinancialScenario = createMockScenario({
            id: `generated-${scenarioId++}`,
            name: t("generatedScenarioName", {
              downPaymentPercent,
              loanTermYears,
            }),
            scenarioType:
              riskLevel === "low"
                ? "baseline"
                : riskLevel === "medium"
                  ? "alternative"
                  : "stress_test",
            purchasePrice: generatorForm.propertyPrice,
            downPayment,
            loanAmount,
            interestRate: bestRate,
            loanTermYears,
            monthlyIncome: generatorForm.monthlyIncome,
            monthlyExpenses: generatorForm.monthlyExpenses,
            riskLevel,
          });

          generatedScenarios.push(scenario);
        }
        if (generatedScenarios.length >= 6) break;
      }

      // Sort by risk level priority and add to scenarios
      const sortedScenarios = generatedScenarios.sort((a, b) => {
        const priority = { low: 3, medium: 2, high: 1 };
        return priority[b.riskLevel] - priority[a.riskLevel];
      });

      // Note: In a real implementation, you would use the createScenario function
      // from the useScenarios hook to save these to the database
      setGeneratedScenarios(sortedScenarios);

      setShowCreateModal(false);
      toast.success(t("generationSuccess", { count: sortedScenarios.length }));
    } catch (error) {
      console.error("Error generating scenarios:", error);
      toast.error(t("generationError"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Load bank rates on component mount
  useEffect(() => {
    getRates({ loanType: "home_purchase", isActive: true });
  }, []);

  // Use mock data for demo purposes when no user is authenticated
  const displayScenarios = user ? scenarios : mockScenarios;
  const lowRiskScenarios = displayScenarios.filter(
    (s) => s.riskLevel === "low"
  );
  const totalScenarios = displayScenarios.length;
  const avgMonthlyPayment =
    displayScenarios.reduce(
      (sum, s) => sum + (s.calculatedMetrics?.monthlyPayment || 0),
      0
    ) / totalScenarios;

  if (loading && user) {
    return (
      <DashboardShell title={t("title")} description={t("description")}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardShell>
    );
  }

  if (error && user) {
    return (
      <DashboardShell title={t("title")} description={t("description")}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={t("title")}
      description={t("description")}
      headerAction={
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("createScenarioButton")}
            </Button>
          </DialogTrigger>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {/* Demo Alert for Non-Authenticated Users */}
        {!user && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>{t("demoMode.strong")}</strong> {t("demoMode.text")}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("summary.totalScenarios")}
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScenarios}</div>
              <p className="text-xs text-muted-foreground">
                {t("summary.optionsCreated")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("summary.optimalScenarios")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {lowRiskScenarios.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("summary.bestRated")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("summary.averagePayment")}
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat(t("locale"), {
                  style: "currency",
                  currency: "VND",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(avgMonthlyPayment)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("summary.monthly")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("summary.actions")}
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleCreateNewScenario}
                    className="w-full"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t("smartGenerateButton")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      {t("smartGenerateModal.title")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("smartGenerateModal.description")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyPrice">
                        {t("smartGenerateModal.propertyPrice")}
                      </Label>
                      <Input
                        id="propertyPrice"
                        type="number"
                        value={generatorForm.propertyPrice}
                        onChange={(e) =>
                          setGeneratorForm((prev) => ({
                            ...prev,
                            propertyPrice: Number(e.target.value),
                          }))
                        }
                        placeholder="2,500,000,000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">
                        {t("smartGenerateModal.monthlyIncome")}
                      </Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={generatorForm.monthlyIncome}
                        onChange={(e) =>
                          setGeneratorForm((prev) => ({
                            ...prev,
                            monthlyIncome: Number(e.target.value),
                          }))
                        }
                        placeholder="45,000,000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyExpenses">
                        {t("smartGenerateModal.monthlyExpenses")}
                      </Label>
                      <Input
                        id="monthlyExpenses"
                        type="number"
                        value={generatorForm.monthlyExpenses}
                        onChange={(e) =>
                          setGeneratorForm((prev) => ({
                            ...prev,
                            monthlyExpenses: Number(e.target.value),
                          }))
                        }
                        placeholder="18,000,000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanType">
                        {t("smartGenerateModal.loanType")}
                      </Label>
                      <Select
                        value={generatorForm.loanType}
                        onValueChange={(value: any) =>
                          setGeneratorForm((prev) => ({
                            ...prev,
                            loanType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home_purchase">
                            {t("smartGenerateModal.loanTypes.homePurchase")}
                          </SelectItem>
                          <SelectItem value="investment">
                            {t("smartGenerateModal.loanTypes.investment")}
                          </SelectItem>
                          <SelectItem value="commercial">
                            {t("smartGenerateModal.loanTypes.commercial")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {ratesLoading && (
                      <Alert>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <AlertDescription>
                          {t("smartGenerateModal.loadingRates")}
                        </AlertDescription>
                      </Alert>
                    )}

                    {rates.length > 0 && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          {t("smartGenerateModal.ratesFound", {
                            count: rates.length,
                          })}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowCreateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      {t("smartGenerateModal.cancel")}
                    </Button>
                    <Button
                      onClick={generateSmartScenarios}
                      disabled={isGenerating || ratesLoading}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t("smartGenerateModal.generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          {t("smartGenerateModal.generateButton")}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Badge
                variant="outline"
                className="w-full justify-center text-xs"
              >
                {t("availableRates", { count: rates.length })}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Scenario Comparison Component */}
        {displayScenarios.length > 0 ? (
          <ScenarioComparison
            scenarios={displayScenarios}
            onScenarioSelect={handleScenarioSelect}
            onCreateNewScenario={handleCreateNewScenario}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("noScenario.title")}</CardTitle>
              <CardDescription>{t("noScenario.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateNewScenario}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("noScenario.createButton")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Selected Scenario Details */}
        {selectedScenario && (
          <Card>
            <CardHeader>
              <CardTitle>{t("selectedScenario.title")}</CardTitle>
              <CardDescription>
                {t("selectedScenario.description", {
                  planName: selectedScenario.plan_name,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">
                    {t("selectedScenario.basicInfo.title")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {t("selectedScenario.basicInfo.propertyPrice")}:
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat(t("locale"), {
                          style: "currency",
                          currency: "VND",
                          notation: "compact",
                        }).format(selectedScenario.purchase_price || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("selectedScenario.basicInfo.downPayment")}:
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat(t("locale"), {
                          style: "currency",
                          currency: "VND",
                          notation: "compact",
                        }).format(selectedScenario.down_payment || 0)}{" "}
                        (
                        {Math.round(
                          ((selectedScenario.down_payment || 0) /
                            (selectedScenario.purchase_price || 1)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("selectedScenario.basicInfo.loanAmount")}:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat(t("locale"), {
                          style: "currency",
                          currency: "VND",
                          notation: "compact",
                        }).format(
                          (selectedScenario.purchase_price || 0) -
                            (selectedScenario.down_payment || 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("selectedScenario.basicInfo.loanTerm")}:</span>
                      <span className="font-medium">
                        {Math.round(
                          (selectedScenario.loanCalculations?.[0]
                            ?.loan_term_months || 0) / 12
                        )}{" "}
                        {t("selectedScenario.basicInfo.years")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("selectedScenario.basicInfo.interestRate")}:
                      </span>
                      <span className="font-medium">
                        {selectedScenario.loanCalculations?.[0]
                          ?.interest_rate || 0}
                        %/{t("selectedScenario.basicInfo.perYear")}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    {t("selectedScenario.monthlyFinance.title")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {t("selectedScenario.monthlyFinance.income")}:
                      </span>
                      <span className="font-medium text-green-600">
                        {new Intl.NumberFormat(t("locale"), {
                          style: "currency",
                          currency: "VND",
                          notation: "compact",
                        }).format(selectedScenario.monthly_income || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("selectedScenario.monthlyFinance.expenses")}:
                      </span>
                      <span className="font-medium text-red-600">
                        {new Intl.NumberFormat(t("locale"), {
                          style: "currency",
                          currency: "VND",
                          notation: "compact",
                        }).format(selectedScenario.monthly_expenses || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t(
                          "selectedScenario.monthlyFinance.monthlyLoanPayment"
                        )}
                        :
                      </span>
                      <span className="font-medium text-blue-600">
                        {new Intl.NumberFormat(t("locale"), {
                          style: "currency",
                          currency: "VND",
                          notation: "compact",
                        }).format(
                          selectedScenario.calculatedMetrics?.monthlyPayment ||
                            0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">
                        {t("selectedScenario.monthlyFinance.netCashFlow")}:
                      </span>
                      <span
                        className={`font-bold ${(selectedScenario.monthly_income || 0) - (selectedScenario.monthly_expenses || 0) - (selectedScenario.calculatedMetrics?.monthlyPayment || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {(selectedScenario.monthly_income || 0) -
                          (selectedScenario.monthly_expenses || 0) -
                          (selectedScenario.calculatedMetrics?.monthlyPayment ||
                            0) >=
                        0
                          ? "+"
                          : ""}
                        {new Intl.NumberFormat(t("locale"), {
                          style: "currency",
                          currency: "VND",
                          notation: "compact",
                        }).format(
                          (selectedScenario.monthly_income || 0) -
                            (selectedScenario.monthly_expenses || 0) -
                            (selectedScenario.calculatedMetrics
                              ?.monthlyPayment || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
