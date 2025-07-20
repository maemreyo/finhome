// src/components/financial/FinancialPreview.tsx
"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  calculateLoanDetails, 
  analyzeAffordability, 
  calculateFinancialHealth,
  formatVietnameseCurrency,
  getCurrentInterestRates,
  calculatePropertyROI
} from "@/lib/financial-utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Calendar,
  PieChart,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialPreviewProps {
  purchasePrice: number;
  downPayment: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  otherDebts: number;
  additionalCosts: number;
  expectedRentalIncome: number;
  expectedAppreciationRate: number;
  investmentHorizonYears: number;
  planType: string;
}

export function FinancialPreview({
  purchasePrice,
  downPayment,
  monthlyIncome,
  monthlyExpenses,
  currentSavings,
  otherDebts,
  additionalCosts,
  expectedRentalIncome,
  expectedAppreciationRate,
  investmentHorizonYears,
  planType
}: FinancialPreviewProps) {
  const t = useTranslations('CreatePlanForm.financialPreview');
  const { averageRate } = getCurrentInterestRates();
  
  const calculations = useMemo(() => {
    if (!purchasePrice || !downPayment || !monthlyIncome) {
      return null;
    }

    const loanDetails = calculateLoanDetails(purchasePrice, downPayment, averageRate);
    const affordability = analyzeAffordability(
      monthlyIncome,
      monthlyExpenses,
      loanDetails.monthlyPayment,
      currentSavings,
      otherDebts
    );
    const financialHealth = calculateFinancialHealth(
      monthlyIncome,
      monthlyExpenses,
      currentSavings,
      otherDebts
    );

    let roi = null;
    if (planType === 'investment' && expectedRentalIncome && investmentHorizonYears) {
      roi = calculatePropertyROI(
        purchasePrice,
        downPayment,
        expectedRentalIncome,
        loanDetails.monthlyPayment,
        expectedAppreciationRate || 6,
        investmentHorizonYears
      );
    }

    return {
      loanDetails,
      affordability,
      financialHealth,
      roi,
      totalUpfrontCost: downPayment + additionalCosts,
      monthlyNetCashFlow: monthlyIncome - monthlyExpenses - loanDetails.monthlyPayment - otherDebts
    };
  }, [
    purchasePrice, downPayment, monthlyIncome, monthlyExpenses, 
    currentSavings, otherDebts, additionalCosts, expectedRentalIncome,
    expectedAppreciationRate, investmentHorizonYears, planType, averageRate
  ]);

  if (!calculations) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            {t('emptyState')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAffordabilityColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'acceptable': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'risky': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'unaffordable': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAffordabilityIcon = (score: string) => {
    switch (score) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'acceptable': return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'risky': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'unaffordable': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Affordability Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            {t('affordabilityAnalysis.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            "p-3 rounded-lg border flex items-center gap-3",
            getAffordabilityColor(calculations.affordability.score)
          )}>
            {getAffordabilityIcon(calculations.affordability.score)}
            <div>
              <div className="font-semibold">
                {t(`affordabilityAnalysis.score.${calculations.affordability.score}`)}
              </div>
              <div className="text-sm">
                {t('affordabilityAnalysis.debtToIncomeRatio', { 
                  ratio: (calculations.affordability.debtToIncomeRatio * 100).toFixed(1) 
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('affordabilityAnalysis.monthlyLeftover')}</span>
              <span className={cn(
                "font-medium",
                calculations.monthlyNetCashFlow >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatVietnameseCurrency(calculations.monthlyNetCashFlow, true)}
              </span>
            </div>
            
            <Progress 
              value={Math.min(calculations.affordability.debtToIncomeRatio * 100, 100)} 
              className="h-2"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>{t('affordabilityAnalysis.safeLimit')}</span>
              <span>50%+</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            {t('loanSummary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600">{t('loanSummary.loanAmount')}</div>
              <div className="font-semibold">
                {formatVietnameseCurrency(calculations.loanDetails.loanAmount, true)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">{t('loanSummary.interestRate')}</div>
              <div className="font-semibold">{calculations.loanDetails.interestRate}%</div>
            </div>
            <div>
              <div className="text-gray-600">{t('loanSummary.monthlyPayment')}</div>
              <div className="font-semibold text-blue-600">
                {formatVietnameseCurrency(calculations.loanDetails.monthlyPayment, true)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">{t('loanSummary.loanTerm')}</div>
              <div className="font-semibold">{calculations.loanDetails.termYears} {t('loanSummary.years')}</div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('loanSummary.totalInterest')}</span>
              <span className="font-medium text-orange-600">
                {formatVietnameseCurrency(calculations.loanDetails.totalInterest, true)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upfront Costs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            {t('upfrontInvestment.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t('upfrontInvestment.downPayment')}</span>
              <span className="font-medium">
                {formatVietnameseCurrency(downPayment, true)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('upfrontInvestment.additionalCosts')}</span>
              <span className="font-medium">
                {formatVietnameseCurrency(additionalCosts, true)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>{t('upfrontInvestment.totalRequired')}</span>
              <span className="text-blue-600">
                {formatVietnameseCurrency(calculations.totalUpfrontCost, true)}
              </span>
            </div>
          </div>
          
          {currentSavings > 0 && (
            <div className="pt-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('upfrontInvestment.availableSavings')}</span>
                <span>{formatVietnameseCurrency(currentSavings, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('upfrontInvestment.remainingAfterPurchase')}</span>
                <span className={cn(
                  "font-medium",
                  (currentSavings - calculations.totalUpfrontCost) >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatVietnameseCurrency(currentSavings - calculations.totalUpfrontCost, true)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            {t('financialHealth.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('financialHealth.emergencyFund')}</span>
                <span className="font-medium">
                  {calculations.financialHealth.emergencyFundMonths.toFixed(1)} {t('financialHealth.months')}
                </span>
              </div>
              <Progress 
                value={Math.min(calculations.financialHealth.emergencyFundMonths / 6 * 100, 100)} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('financialHealth.savingsRate')}</span>
                <span className="font-medium">
                  {(calculations.financialHealth.savingsRate * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(calculations.financialHealth.savingsRate * 100 / 20 * 100, 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment ROI (for investment properties) */}
      {calculations.roi && planType === 'investment' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              {t('investmentReturns.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">{t('investmentReturns.annualCashFlow')}</div>
                <div className="font-semibold text-green-600">
                  {formatVietnameseCurrency(calculations.roi.totalCashFlow / investmentHorizonYears, true)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">{t('investmentReturns.projectedROI')}</div>
                <div className="font-semibold text-blue-600">
                  {(calculations.roi.annualizedROI * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">{t('investmentReturns.capitalGains')}</div>
                <div className="font-semibold">
                  {formatVietnameseCurrency(calculations.roi.capitalGains, true)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">{t('investmentReturns.totalReturn')}</div>
                <div className="font-semibold text-green-600">
                  {formatVietnameseCurrency(calculations.roi.totalReturn, true)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings and Recommendations */}
      {(calculations.affordability.score === 'risky' || calculations.affordability.score === 'unaffordable' || 
        calculations.monthlyNetCashFlow < calculations.financialHealth.emergencyFundMonths * 0.1 ||
        currentSavings < monthlyExpenses * 3) && (
        <div className="space-y-2">
          {/* Risk-based warnings */}
          {calculations.affordability.score === 'risky' && (
            <>
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-sm">
                  {t('recommendations.highDebtRatio')}
                </AlertDescription>
              </Alert>
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-sm">
                  {t('recommendations.banksRequireDocumentation')}
                </AlertDescription>
              </Alert>
            </>
          )}
          
          {calculations.affordability.score === 'unaffordable' && (
            <>
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  {t('recommendations.exceedsSafeLimits')}
                </AlertDescription>
              </Alert>
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  {t('recommendations.maximumRecommended', { 
                    amount: formatVietnameseCurrency(calculations.affordability.maxAffordablePrice, true) 
                  })}
                </AlertDescription>
              </Alert>
            </>
          )}
          
          {/* Cash flow warnings */}
          {calculations.monthlyNetCashFlow < monthlyExpenses * 0.1 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                {t('recommendations.littleBuffer')}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Emergency fund recommendations */}
          {currentSavings < monthlyExpenses * 3 && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                {t('recommendations.buildEmergencyFund')}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Positive recommendations for good scores */}
          {calculations.affordability.score === 'excellent' && (
            <>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  {t('recommendations.excellentPosition')}
                </AlertDescription>
              </Alert>
              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  {t('recommendations.considerInvesting')}
                </AlertDescription>
              </Alert>
            </>
          )}
          
          {calculations.affordability.score === 'good' && (
            <>
              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  {t('recommendations.goodPosition')}
                </AlertDescription>
              </Alert>
              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  {t('recommendations.maintainEmergencyFund')}
                </AlertDescription>
              </Alert>
            </>
          )}
          
          {calculations.affordability.score === 'acceptable' && (
            <>
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  {t('recommendations.acceptableBudget')}
                </AlertDescription>
              </Alert>
              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  {t('recommendations.considerIncreasing')}
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      )}
    </div>
  );
}