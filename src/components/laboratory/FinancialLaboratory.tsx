// src/components/laboratory/FinancialLaboratory.tsx
// Financial Laboratory - What-If Analysis and Interactive Simulation Tools

"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  PiggyBank,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { FeatureBadge } from "@/components/subscription/SubscriptionBadge";

// Type definitions
interface LoanDetails {
  principal: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

interface PrepaymentScenario {
  monthlyExtra: number;
  oneTimePayment: number;
  paymentMonth: number;
  newTermMonths: number;
  interestSaved: number;
  totalSaved: number;
  breakEvenMonth: number;
}

interface RefinanceScenario {
  currentRate: number;
  newRate: number;
  closingCosts: number;
  monthlyPaymentOld: number;
  monthlyPaymentNew: number;
  breakEvenMonths: number;
  totalSavings: number;
  worthRefinancing: boolean;
}

interface MarketStressTest {
  scenario: string;
  rateChange: number;
  newRate: number;
  newMonthlyPayment: number;
  monthlyIncrease: number;
  affordabilityRatio: number;
  riskLevel: "low" | "medium" | "high";
}

interface FinancialLaboratoryProps {
  initialLoan: LoanDetails;
  monthlyIncome: number;
  monthlyExpenses: number;
  className?: string;
}

export const FinancialLaboratory: React.FC<FinancialLaboratoryProps> = ({
  initialLoan,
  monthlyIncome,
  monthlyExpenses,
  className,
}) => {
  const t = useTranslations("FinancialLaboratory");
  const [activeTab, setActiveTab] = useState<
    "prepayment" | "refinance" | "stress-test"
  >("prepayment");

  // Prepayment simulation state
  const [prepaymentAmount, setPrepaymentAmount] = useState(0);
  const [oneTimePayment, setOneTimePayment] = useState(0);
  const [paymentMonth, setPaymentMonth] = useState(12);

  // Refinance simulation state
  const [newInterestRate, setNewInterestRate] = useState(
    initialLoan.interestRate - 1
  );
  const [closingCosts, setClosingCosts] = useState(50000000); // 50M VND default

  // Stress test state
  const stressTestScenarios = useMemo(
    () => [
      {
        scenario: t("stressTest.scenarios.mildIncrease"),
        rateChange: 1,
        newRate: 0,
        newMonthlyPayment: 0,
        monthlyIncrease: 0,
        affordabilityRatio: 0,
        riskLevel: "low" as const,
      },
      {
        scenario: t("stressTest.scenarios.moderateIncrease"),
        rateChange: 2,
        newRate: 0,
        newMonthlyPayment: 0,
        monthlyIncrease: 0,
        affordabilityRatio: 0,
        riskLevel: "medium" as const,
      },
      {
        scenario: t("stressTest.scenarios.severeIncrease"),
        rateChange: 3,
        newRate: 0,
        newMonthlyPayment: 0,
        monthlyIncrease: 0,
        affordabilityRatio: 0,
        riskLevel: "high" as const,
      },
      {
        scenario: t("stressTest.scenarios.mildDecrease"),
        rateChange: -0.5,
        newRate: 0,
        newMonthlyPayment: 0,
        monthlyIncrease: 0,
        affordabilityRatio: 0,
        riskLevel: "low" as const,
      },
      {
        scenario: t("stressTest.scenarios.severeDecrease"),
        rateChange: -1.5,
        newRate: 0,
        newMonthlyPayment: 0,
        monthlyIncrease: 0,
        affordabilityRatio: 0,
        riskLevel: "low" as const,
      },
    ],
    [t]
  );

  // Calculate monthly payment
  const calculateMonthlyPayment = (
    principal: number,
    rate: number,
    termYears: number
  ) => {
    const monthlyRate = rate / 100 / 12;
    const totalMonths = termYears * 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  };

  // Calculate prepayment scenario
  const prepaymentScenario = useMemo((): PrepaymentScenario => {
    const monthlyRate = initialLoan.interestRate / 100 / 12;
    const totalMonths = initialLoan.termYears * 12;

    // Calculate with extra payments
    let balance = initialLoan.principal;
    let totalInterestPaid = 0;
    let month = 0;

    const basePayment = initialLoan.monthlyPayment;
    const extraPayment = prepaymentAmount;

    while (balance > 0 && month < totalMonths) {
      month++;

      // Add one-time payment if specified
      if (month === paymentMonth && oneTimePayment > 0) {
        balance = Math.max(0, balance - oneTimePayment);
      }

      if (balance <= 0) break;

      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(
        basePayment + extraPayment - interestPayment,
        balance
      );

      balance -= principalPayment;
      totalInterestPaid += interestPayment;

      if (balance <= 0) break;
    }

    const originalTotalInterest = initialLoan.totalInterest;
    const interestSaved = originalTotalInterest - totalInterestPaid;
    const totalSaved =
      interestSaved + (oneTimePayment > 0 ? 0 : oneTimePayment);

    return {
      monthlyExtra: prepaymentAmount,
      oneTimePayment,
      paymentMonth,
      newTermMonths: month,
      interestSaved,
      totalSaved,
      breakEvenMonth: Math.ceil(
        oneTimePayment / (prepaymentAmount + interestSaved / month)
      ),
    };
  }, [initialLoan, prepaymentAmount, oneTimePayment, paymentMonth]);

  // Calculate refinance scenario
  const refinanceScenario = useMemo((): RefinanceScenario => {
    const currentMonthlyPayment = initialLoan.monthlyPayment;
    const newMonthlyPayment = calculateMonthlyPayment(
      initialLoan.principal,
      newInterestRate,
      initialLoan.termYears
    );

    const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
    const breakEvenMonths = Math.ceil(closingCosts / monthlySavings);
    const totalSavings =
      monthlySavings * initialLoan.termYears * 12 - closingCosts;

    return {
      currentRate: initialLoan.interestRate,
      newRate: newInterestRate,
      closingCosts,
      monthlyPaymentOld: currentMonthlyPayment,
      monthlyPaymentNew: newMonthlyPayment,
      breakEvenMonths,
      totalSavings,
      worthRefinancing:
        totalSavings > 0 && breakEvenMonths < initialLoan.termYears * 12 * 0.3,
    };
  }, [initialLoan, newInterestRate, closingCosts]);

  // Calculate stress test scenarios
  const stressTestResults = useMemo(() => {
    return stressTestScenarios.map((scenario) => {
      const newRate = initialLoan.interestRate + scenario.rateChange;
      const newMonthlyPayment = calculateMonthlyPayment(
        initialLoan.principal,
        newRate,
        initialLoan.termYears
      );
      const monthlyIncrease = newMonthlyPayment - initialLoan.monthlyPayment;
      const affordabilityRatio = (newMonthlyPayment / monthlyIncome) * 100;

      let riskLevel: "low" | "medium" | "high" = "low";
      if (affordabilityRatio > 50) riskLevel = "high";
      else if (affordabilityRatio > 40) riskLevel = "medium";

      return {
        ...scenario,
        newRate,
        newMonthlyPayment,
        monthlyIncrease,
        affordabilityRatio,
        riskLevel,
      };
    });
  }, [initialLoan, monthlyIncome, stressTestScenarios]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const getRiskColor = (riskLevel: "low" | "medium" | "high") => {
    switch (riskLevel) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
    }
  };

  const getRiskBadgeColor = (riskLevel: "low" | "medium" | "high") => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current Loan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            {t("currentLoan.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">
                {t("currentLoan.principal")}
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(initialLoan.principal)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">
                {t("currentLoan.interestRate")}
              </div>
              <div className="text-xl font-bold">
                {initialLoan.interestRate}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">
                {t("currentLoan.loanTerm")}
              </div>
              <div className="text-xl font-bold">
                {t("currentLoan.loanTermValue", {
                  years: initialLoan.termYears,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">
                {t("currentLoan.monthlyPayment")}
              </div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(initialLoan.monthlyPayment)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Tools */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prepayment">{t("tabs.prepayment")}</TabsTrigger>
          <TabsTrigger value="refinance">
            <div className="flex items-center gap-2">
              {t("tabs.refinance")}
              <FeatureBadge featureKey="advanced_calculations" />
            </div>
          </TabsTrigger>
          <TabsTrigger value="stress-test">
            <div className="flex items-center gap-2">
              {t("tabs.stressTest")}
              <FeatureBadge featureKey="monte_carlo_analysis" />
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Prepayment Simulator */}
        <TabsContent value="prepayment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                {t("prepayment.title")}
              </CardTitle>
              <CardDescription>{t("prepayment.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Controls */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-extra">
                      {t("prepayment.monthlyExtra")}
                    </Label>
                    <Input
                      id="monthly-extra"
                      type="number"
                      value={prepaymentAmount}
                      onChange={(e) =>
                        setPrepaymentAmount(Number(e.target.value))
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                    <div className="mt-2">
                      <Slider
                        value={[prepaymentAmount]}
                        onValueChange={(value) => setPrepaymentAmount(value[0])}
                        max={5000000}
                        step={100000}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="one-time-payment">
                      {t("prepayment.oneTimePayment")}
                    </Label>
                    <Input
                      id="one-time-payment"
                      type="number"
                      value={oneTimePayment}
                      onChange={(e) =>
                        setOneTimePayment(Number(e.target.value))
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment-month">
                      {t("prepayment.paymentMonth")}
                    </Label>
                    <Input
                      id="payment-month"
                      type="number"
                      value={paymentMonth}
                      onChange={(e) => setPaymentMonth(Number(e.target.value))}
                      min="1"
                      max={initialLoan.termYears * 12}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                      {t("prepayment.simulationResults")}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("prepayment.newLoanTerm")}:
                        </span>
                        <span className="font-bold">
                          {t("prepayment.loanTermFormat", {
                            years: Math.floor(
                              prepaymentScenario.newTermMonths / 12
                            ),
                            months: prepaymentScenario.newTermMonths % 12,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("prepayment.timeReduction")}:
                        </span>
                        <span className="font-bold text-green-600">
                          {t("prepayment.loanTermFormat", {
                            years: Math.floor(
                              (initialLoan.termYears * 12 -
                                prepaymentScenario.newTermMonths) /
                                12
                            ),
                            months:
                              (initialLoan.termYears * 12 -
                                prepaymentScenario.newTermMonths) %
                              12,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("prepayment.interestSaved")}:
                        </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(prepaymentScenario.interestSaved)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("prepayment.totalSaved")}:
                        </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(prepaymentScenario.totalSaved)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                      {t("prepayment.effectivenessEvaluation")}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          {t("prepayment.interestSavingPercentage", {
                            percentage: (
                              (prepaymentScenario.interestSaved /
                                initialLoan.totalInterest) *
                              100
                            ).toFixed(1),
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          {t("prepayment.timeReductionPercentage", {
                            percentage: (
                              ((initialLoan.termYears * 12 -
                                prepaymentScenario.newTermMonths) /
                                (initialLoan.termYears * 12)) *
                              100
                            ).toFixed(1),
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refinance Analyzer */}
        <TabsContent value="refinance" className="space-y-4">
          <FeatureGate featureKey="advanced_calculations" promptStyle="inline">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                {t("refinance.title")}
              </CardTitle>
              <CardDescription>{t("refinance.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Controls */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-rate">
                      {t("refinance.newInterestRate")}
                    </Label>
                    <Input
                      id="new-rate"
                      type="number"
                      value={newInterestRate}
                      onChange={(e) =>
                        setNewInterestRate(Number(e.target.value))
                      }
                      step="0.1"
                      min="0"
                      max="20"
                      className="mt-1"
                    />
                    <div className="mt-2">
                      <Slider
                        value={[newInterestRate]}
                        onValueChange={(value) => setNewInterestRate(value[0])}
                        min={3}
                        max={15}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="closing-costs">
                      {t("refinance.closingCosts")}
                    </Label>
                    <Input
                      id="closing-costs"
                      type="number"
                      value={closingCosts}
                      onChange={(e) => setClosingCosts(Number(e.target.value))}
                      placeholder="50000000"
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      {t("refinance.rateComparison")}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.currentRate")}:
                        </span>
                        <span className="font-bold">
                          {refinanceScenario.currentRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.newRate")}:
                        </span>
                        <span className="font-bold text-green-600">
                          {refinanceScenario.newRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.rateDifference")}:
                        </span>
                        <span className="font-bold text-blue-600">
                          {(
                            refinanceScenario.currentRate -
                            refinanceScenario.newRate
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div
                    className={cn(
                      "rounded-lg p-4",
                      refinanceScenario.worthRefinancing
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {refinanceScenario.worthRefinancing ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <h4
                        className={cn(
                          "font-semibold",
                          refinanceScenario.worthRefinancing
                            ? "text-green-800 dark:text-green-200"
                            : "text-red-800 dark:text-red-200"
                        )}
                      >
                        {refinanceScenario.worthRefinancing
                          ? t("refinance.worthRefinancing")
                          : t("refinance.notWorthRefinancing")}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.oldMonthlyPayment")}:
                        </span>
                        <span className="font-bold">
                          {formatCurrency(refinanceScenario.monthlyPaymentOld)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.newMonthlyPayment")}:
                        </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(refinanceScenario.monthlyPaymentNew)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.monthlySavings")}:
                        </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(
                            refinanceScenario.monthlyPaymentOld -
                              refinanceScenario.monthlyPaymentNew
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.breakEvenAfter")}:
                        </span>
                        <span className="font-bold">
                          {t("refinance.breakEvenMonths", {
                            months: refinanceScenario.breakEvenMonths,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("refinance.totalSavings")}:
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            refinanceScenario.totalSavings > 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {formatCurrency(refinanceScenario.totalSavings)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                      {t("refinance.recommendation")}
                    </h4>
                    <div className="space-y-2 text-sm">
                      {refinanceScenario.worthRefinancing ? (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>
                              {t(
                                "refinance.recommendations.significantSavings"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>
                              {t(
                                "refinance.recommendations.reasonableBreakEven"
                              )}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span>
                              {t("refinance.recommendations.highCosts")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span>
                              {t(
                                "refinance.recommendations.waitForBetterRates"
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </FeatureGate>
        </TabsContent>

        {/* Market Scenario Testing */}
        <TabsContent value="stress-test" className="space-y-4">
          <FeatureGate featureKey="monte_carlo_analysis" promptStyle="inline">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t("stressTest.title")}
              </CardTitle>
              <CardDescription>{t("stressTest.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stressTestResults.map((scenario, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{scenario.scenario}</h4>
                      <Badge className={getRiskBadgeColor(scenario.riskLevel)}>
                        {scenario.riskLevel === "low"
                          ? t("stressTest.riskLevels.low")
                          : scenario.riskLevel === "medium"
                            ? t("stressTest.riskLevels.medium")
                            : t("stressTest.riskLevels.high")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          {t("stressTest.results.newRate")}
                        </div>
                        <div className="font-bold">
                          {scenario.newRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          {t("stressTest.results.monthlyPayment")}
                        </div>
                        <div className="font-bold">
                          {formatCurrency(scenario.newMonthlyPayment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          {t("stressTest.results.change")}
                        </div>
                        <div
                          className={cn(
                            "font-bold",
                            scenario.monthlyIncrease >= 0
                              ? "text-red-600"
                              : "text-green-600"
                          )}
                        >
                          {scenario.monthlyIncrease >= 0 ? "+" : ""}
                          {formatCurrency(scenario.monthlyIncrease)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">DTI Ratio</div>
                        <div
                          className={cn(
                            "font-bold",
                            getRiskColor(scenario.riskLevel)
                          )}
                        >
                          {scenario.affordabilityRatio.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      {scenario.riskLevel === "low" &&
                        t("stressTest.riskDescriptions.low")}
                      {scenario.riskLevel === "medium" &&
                        t("stressTest.riskDescriptions.medium")}
                      {scenario.riskLevel === "high" &&
                        t("stressTest.riskDescriptions.high")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </FeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialLaboratory;
