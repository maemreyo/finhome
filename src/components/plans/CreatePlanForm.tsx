// src/components/plans/CreatePlanForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { formatCurrency, parseCurrency } from "@/lib/utils";
import { Home, MapPin, CheckCircle, AlertCircle, Clock, Save, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedCurrencyInput, PercentageSlider } from "@/components/ui/enhanced-currency-input";
import { FinancialPreview } from "@/components/financial/FinancialPreview";
import { useAutoSave, useAutoSaveStatus } from "@/hooks/useAutoSave";
import { 
  getSmartSuggestions, 
  formatVietnameseCurrency, 
  getCurrentInterestRates,
  analyzeAffordability,
  calculateLoanDetails
} from "@/lib/financial-utils";


// Create schema with better error messages
const createPlanSchema = z.object({
  plan_name: z.string().min(1, "Plan name is required"),
  plan_type: z.enum(["home_purchase", "investment", "upgrade", "refinance"]),
  purchase_price: z.number().min(1, "Purchase price must be greater than 0"),
  down_payment: z.number().min(1, "Down payment must be greater than 0"),
  monthly_income: z.number().min(1, "Monthly income must be greater than 0"),
  monthly_expenses: z.number().min(0, "Monthly expenses cannot be negative"),
  current_savings: z.number().min(0, "Current savings cannot be negative"),
  additional_costs: z.number().default(0),
  other_debts: z.number().default(0),
  plan_description: z.string().default(""),
  expected_rental_income: z.number().default(0),
  expected_appreciation_rate: z.number().default(0),
  investment_horizon_years: z.number().default(0),
}).refine((data) => data.down_payment < data.purchase_price, {
  message: "Down payment must be less than purchase price",
  path: ["down_payment"],
}).refine((data) => data.monthly_expenses < data.monthly_income, {
  message: "Monthly expenses must be less than monthly income",
  path: ["monthly_expenses"],
});

type CreatePlanFormData = z.infer<typeof createPlanSchema>;

interface CreatePlanFormProps {
  userId: string;
}

interface PropertyData {
  propertyId: string;
  propertyName: string;
  purchasePrice: number;
  propertyType: string;
  address: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  monthlyMortgageEstimate?: number;
  roiProjection?: number;
}

// Tab validation status type
type TabStatus = 'incomplete' | 'valid' | 'invalid';

export function CreatePlanForm({ userId }: CreatePlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [currentTab, setCurrentTab] = useState("basic");
  const [tabsStatus, setTabsStatus] = useState<Record<string, TabStatus>>({
    basic: 'incomplete',
    financial: 'incomplete',
    advanced: 'incomplete'
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('CreatePlanForm');
  const { averageRate } = getCurrentInterestRates();

  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema) as any,
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      plan_name: "",
      plan_type: "home_purchase",
      purchase_price: 0,
      down_payment: 0,
      monthly_income: 0,
      monthly_expenses: 0,
      current_savings: 0,
      additional_costs: 0,
      other_debts: 0,
      plan_description: "",
      expected_rental_income: 0,
      expected_appreciation_rate: 0,
      investment_horizon_years: 0,
    },
  });

  // Watch form values for real-time validation
  const watchedValues = form.watch();
  const formErrors = form.formState.errors;

  // Auto-save functionality
  const autoSaveKey = `create-plan-${userId}`;
  const { restoreData, clearSavedData, hasSavedData } = useAutoSave({
    key: autoSaveKey,
    data: watchedValues,
    delay: 3000, // Save after 3 seconds of inactivity
    onSave: () => {
      // Optional: Show save indicator
    },
    enabled: true
  });
  const { getStatusMessage } = useAutoSaveStatus(autoSaveKey, t);

  // Smart calculations
  const calculations = useMemo(() => {
    const { purchase_price, down_payment, monthly_income, monthly_expenses, current_savings, other_debts } = watchedValues;
    
    if (!purchase_price || !down_payment || !monthly_income) {
      return null;
    }

    const loanDetails = calculateLoanDetails(purchase_price, down_payment, averageRate);
    const affordability = analyzeAffordability(
      monthly_income,
      monthly_expenses || 0,
      loanDetails.monthlyPayment,
      current_savings || 0,
      other_debts || 0
    );

    return { loanDetails, affordability };
  }, [watchedValues, averageRate]);

  // Smart suggestions based on context
  const getFieldSuggestions = (fieldName: string) => {
    return getSmartSuggestions(fieldName, watchedValues[fieldName as keyof CreatePlanFormData] as number, {
      purchasePrice: watchedValues.purchase_price,
      monthlyIncome: watchedValues.monthly_income,
      planType: watchedValues.plan_type,
    });
  };

  // Validation state for enhanced inputs
  const getValidationState = (fieldName: string): 'neutral' | 'warning' | 'error' | 'success' => {
    if (formErrors[fieldName as keyof CreatePlanFormData]) return 'error';
    
    // Smart validation based on financial logic
    if (fieldName === 'down_payment' && watchedValues.purchase_price && watchedValues.down_payment) {
      const percentage = (watchedValues.down_payment / watchedValues.purchase_price) * 100;
      if (percentage < 10) return 'error';
      if (percentage < 20) return 'warning';
      return 'success';
    }
    
    if (fieldName === 'monthly_expenses' && watchedValues.monthly_income && watchedValues.monthly_expenses) {
      const ratio = watchedValues.monthly_expenses / watchedValues.monthly_income;
      if (ratio > 0.8) return 'error';
      if (ratio > 0.6) return 'warning';
      return 'success';
    }

    return 'neutral';
  };

  // Restore auto-saved data on mount
  useEffect(() => {
    const savedData = restoreData();
    if (savedData && !propertyData) {
      // Only restore if not coming from property search
      const source = searchParams.get('source');
      if (source !== 'property') {
        Object.keys(savedData).forEach(key => {
          if (key !== 'savedAt' && key !== 'version') {
            form.setValue(key as keyof CreatePlanFormData, savedData[key]);
          }
        });
        toast.success(t('messages.draftRestored'));
      }
    }
  }, [restoreData, form, propertyData, searchParams]);

  // Load property data from session storage if coming from property search
  useEffect(() => {
    const source = searchParams.get('source');
    if (source === 'property') {
      try {
        const storedProperty = sessionStorage.getItem('selectedProperty');
        if (storedProperty) {
          const property: PropertyData = JSON.parse(storedProperty);
          setPropertyData(property);
          
          // Auto-populate form with property data
          form.setValue('plan_name', `Plan for ${property.propertyName}`);
          form.setValue('purchase_price', property.purchasePrice);
          form.setValue('plan_type', property.propertyType as any);
          form.setValue('plan_description', `Financial plan for property: ${property.propertyName} at ${property.address}`);
          
          // Suggest a down payment (20% of purchase price)
          const suggestedDownPayment = Math.round(property.purchasePrice * 0.2);
          form.setValue('down_payment', suggestedDownPayment);
          
          // Set additional costs based on property price (typically 5-10%)
          const suggestedAdditionalCosts = Math.round(property.purchasePrice * 0.07);
          form.setValue('additional_costs', suggestedAdditionalCosts);
          
          // Clear the session storage after loading
          sessionStorage.removeItem('selectedProperty');
          
          toast.success(t('messages.propertyLoaded'));
        }
      } catch (error) {
        console.error('Error loading property data:', error);
        toast.error(t('messages.propertyLoadError'));
      }
    }
  }, [searchParams, form, t]);

  // Real-time tab status validation
  useEffect(() => {
    // Basic tab validation
    const basicFields = ['plan_name', 'purchase_price', 'down_payment'] as const;
    const basicHasValues = basicFields.every(field => {
      const value = watchedValues[field];
      if (field === 'plan_name') return value && (value as string).trim().length > 0;
      return value && (value as number) > 0;
    });
    const basicHasErrors = basicFields.some(field => formErrors[field]);
    
    let basicStatus: TabStatus = 'incomplete';
    if (basicHasValues && !basicHasErrors) {
      basicStatus = 'valid';
    } else if (basicHasValues && basicHasErrors) {
      basicStatus = 'invalid';
    }

    // Financial tab validation  
    const financialFields = ['monthly_income', 'monthly_expenses'] as const;
    const financialHasValues = financialFields.every(field => {
      const value = watchedValues[field];
      return value && (value as number) > 0;
    });
    const financialHasErrors = financialFields.some(field => formErrors[field]);

    let financialStatus: TabStatus = 'incomplete';
    if (financialHasValues && !financialHasErrors) {
      financialStatus = 'valid';
    } else if (financialHasValues && financialHasErrors) {
      financialStatus = 'invalid';
    }

    // Advanced tab is always accessible (optional fields)
    const advancedStatus: TabStatus = 'valid';

    // Only update state if status actually changed
    setTabsStatus(prev => {
      if (prev.basic !== basicStatus || prev.financial !== financialStatus || prev.advanced !== advancedStatus) {
        return {
          basic: basicStatus,
          financial: financialStatus,
          advanced: advancedStatus
        };
      }
      return prev;
    });
  }, [watchedValues, formErrors]);

  // Calculate completion percentage
  const completionPercentage = () => {
    const requiredFields = [
      'plan_name', 'purchase_price', 'down_payment', 
      'monthly_income', 'monthly_expenses'
    ];
    const completedFields = requiredFields.filter(field => {
      const value = watchedValues[field as keyof CreatePlanFormData];
      if (field === 'plan_name') return value && (value as string).trim().length > 0;
      return value && (value as number) > 0;
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Get tab status icon
  const getTabIcon = (status: TabStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'incomplete':
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Free tab switching - no validation blocking
  const handleTabChange = (tabValue: string) => {
    setCurrentTab(tabValue);
  };

  async function onSubmit(data: CreatePlanFormData) {
    setIsLoading(true);
    try {
      // Transform data to match API schema
      const apiData = {
        planName: data.plan_name,
        planType: data.plan_type,
        planDescription: data.plan_description,
        purchasePrice: data.purchase_price,
        downPayment: data.down_payment,
        additionalCosts: data.additional_costs || 0,
        monthlyIncome: data.monthly_income,
        monthlyExpenses: data.monthly_expenses,
        currentSavings: data.current_savings,
        otherDebts: data.other_debts || 0,
        expectedRentalIncome: data.expected_rental_income,
        expectedAppreciationRate: data.expected_appreciation_rate,
        investmentHorizonYears: data.investment_horizon_years,
        isPublic: false
      };

      const response = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create plan");
      }

      const result = await response.json();
      toast.success(t('messages.success'));
      router.push(`/dashboard/plans/${result.data.id}`);
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error(error instanceof Error ? error.message : t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit = tabsStatus.basic === 'valid' && tabsStatus.financial === 'valid';

  return (
    <div className="space-y-6">
      {/* Auto-save status and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusMessage() && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Save className="h-4 w-4" />
              <span>{getStatusMessage()}</span>
            </div>
          )}
          {hasSavedData() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                clearSavedData();
                toast.success(t('messages.draftCleared'));
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('autoSave.clearDraft')}
            </Button>
          )}
        </div>
      </div>

      {/* Main layout with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress indicator */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('progress.completion')}</span>
                  <span>{completionPercentage()}%</span>
                </div>
                <Progress value={completionPercentage()} className="h-2" />
                <p className="text-xs text-gray-500">
                  {t('progress.description')}
                </p>
              </div>
            </CardContent>
          </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Property Information Display */}
          {propertyData && (
            <Alert className="border-blue-200 bg-blue-50">
              <Home className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-blue-900">{t('propertyInfo.title')}:</h4>
                    <p className="text-blue-800 font-medium">{propertyData.propertyName}</p>
                    <div className="flex items-center gap-1 text-sm text-blue-700">
                      <MapPin className="w-3 h-3" />
                      <span>{propertyData.address}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-blue-700">
                      <span>{t('propertyInfo.price')}: {formatCurrency(propertyData.purchasePrice)}</span>
                      {propertyData.area && <span>{t('propertyInfo.area')}: {propertyData.area}m²</span>}
                      {propertyData.bedrooms && <span>{t('propertyInfo.bedrooms')}: {propertyData.bedrooms}</span>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {t('propertyInfo.from')}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                {getTabIcon(tabsStatus.basic)}
                <span>{t('tabs.basic')}</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                {getTabIcon(tabsStatus.financial)}
                <span>{t('tabs.financial')}</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                {getTabIcon(tabsStatus.advanced)}
                <span>{t('tabs.advanced')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card className="min-h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTabIcon(tabsStatus.basic)}
                    {t('basicInfo.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('basicInfo.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col h-full">
                  <FormField
                    control={form.control as any}
                    name="plan_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('basicInfo.planName.label')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('basicInfo.planName.placeholder')}
                            {...field}
                            className={cn(
                              formErrors.plan_name && "border-red-500 focus:border-red-500"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="plan_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('basicInfo.planType.label')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('basicInfo.planType.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="home_purchase">
                              {t('basicInfo.planType.options.homePurchase')}
                            </SelectItem>
                            <SelectItem value="investment">{t('basicInfo.planType.options.investment')}</SelectItem>
                            <SelectItem value="upgrade">{t('basicInfo.planType.options.upgrade')}</SelectItem>
                            <SelectItem value="refinance">
                              {t('basicInfo.planType.options.refinance')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('basicInfo.purchasePrice.label')}</FormLabel>
                        <FormControl>
                          <EnhancedCurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder={t('basicInfo.purchasePrice.placeholder')}
                            suggestions={getFieldSuggestions('purchasePrice')}
                            validationState={getValidationState('purchase_price')}
                            validationMessage={formErrors.purchase_price?.message}
                            marketInfo={{
                              average: 2500000000,
                              range: { min: 1500000000, max: 5000000000 },
                              trend: 'up'
                            }}
                            showCalculator
                          />
                        </FormControl>
                        <FormDescription>
                          {t('basicInfo.purchasePrice.description')}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="down_payment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('basicInfo.downPayment.label')}</FormLabel>
                        <FormControl>
                          <EnhancedCurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder={t('basicInfo.downPayment.placeholder')}
                            suggestions={getFieldSuggestions('downPayment')}
                            validationState={getValidationState('down_payment')}
                            validationMessage={formErrors.down_payment?.message}
                            showCalculator
                          />
                        </FormControl>
                        <FormDescription>
                          {t('basicInfo.downPayment.description')}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="plan_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('basicInfo.planDescription.label')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('basicInfo.planDescription.placeholder')}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Spacer to push navigation to bottom */}
                  <div className="flex-grow" />
                  
                  {/* Quick navigation buttons */}
                  <div className="flex justify-between mt-6">
                    <div /> {/* Empty div for spacing */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("financial")}
                      className="flex items-center gap-2"
                    >
                      {t('navigation.next')}: {t('tabs.financial')}
                      <div className="ml-1">{getTabIcon(tabsStatus.financial)}</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card className="min-h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTabIcon(tabsStatus.financial)}
                    {t('financialInfo.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('financialInfo.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col h-full">
                  <FormField
                    control={form.control as any}
                    name="monthly_income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('financialInfo.monthlyIncome.label')}</FormLabel>
                        <FormControl>
                          <EnhancedCurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder={t('financialInfo.monthlyIncome.placeholder')}
                            suggestions={getFieldSuggestions('monthlyIncome')}
                            validationState={getValidationState('monthly_income')}
                            validationMessage={formErrors.monthly_income?.message}
                            marketInfo={{
                              average: 25000000,
                              range: { min: 10000000, max: 100000000 },
                              trend: 'stable'
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('financialInfo.monthlyIncome.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="monthly_expenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('financialInfo.monthlyExpenses.label')}</FormLabel>
                        <FormControl>
                          <EnhancedCurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder={t('financialInfo.monthlyExpenses.placeholder')}
                            suggestions={getFieldSuggestions('monthlyExpenses')}
                            validationState={getValidationState('monthly_expenses')}
                            validationMessage={formErrors.monthly_expenses?.message}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('financialInfo.monthlyExpenses.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="current_savings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('financialInfo.currentSavings.label')}</FormLabel>
                        <FormControl>
                          <EnhancedCurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder={t('financialInfo.currentSavings.placeholder')}
                            validationState={getValidationState('current_savings')}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('financialInfo.currentSavings.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="other_debts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('financialInfo.otherDebts.label')}</FormLabel>
                        <FormControl>
                          <EnhancedCurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder={t('financialInfo.otherDebts.placeholder')}
                            validationState={getValidationState('other_debts')}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('financialInfo.otherDebts.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Spacer to push navigation to bottom */}
                  <div className="flex-grow" />
                  
                  {/* Quick navigation buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("basic")}
                      className="flex items-center gap-2"
                    >
                      <div className="mr-1">{getTabIcon(tabsStatus.basic)}</div>
                      {t('navigation.previous')}: {t('tabs.basic')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("advanced")}
                      className="flex items-center gap-2"
                    >
                      {t('navigation.next')}: {t('tabs.advanced')}
                      <div className="ml-1">{getTabIcon(tabsStatus.advanced)}</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card className="min-h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTabIcon(tabsStatus.advanced)}
                    {t('advancedOptions.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('advancedOptions.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col h-full">
                  <FormField
                    control={form.control as any}
                    name="additional_costs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('advancedOptions.additionalCosts.label')}</FormLabel>
                        <FormControl>
                          <EnhancedCurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder={t('advancedOptions.additionalCosts.placeholder')}
                            suggestions={getFieldSuggestions('additionalCosts')}
                            validationState={getValidationState('additional_costs')}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('advancedOptions.additionalCosts.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Progressive disclosure - only show for investment properties */}
                  {watchedValues.plan_type === 'investment' && (
                    <FormField
                      control={form.control as any}
                      name="expected_rental_income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('advancedOptions.expectedRentalIncome.label')}
                          </FormLabel>
                          <FormControl>
                            <EnhancedCurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder={t('advancedOptions.expectedRentalIncome.placeholder')}
                              suggestions={getFieldSuggestions('expectedRentalIncome')}
                              validationState={getValidationState('expected_rental_income')}
                              marketInfo={{
                                average: watchedValues.purchase_price ? watchedValues.purchase_price * 0.006 : 4000000,
                                range: { min: 2000000, max: 15000000 },
                                trend: 'up'
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('advancedOptions.expectedRentalIncome.description')}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Progressive disclosure - show appreciation rate for investment */}
                  {(watchedValues.plan_type === 'investment' || watchedValues.plan_type === 'upgrade') && (
                    <>
                      <FormField
                        control={form.control as any}
                        name="expected_appreciation_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('advancedOptions.expectedAppreciationRate.label')}</FormLabel>
                            <FormControl>
                              <PercentageSlider
                                value={field.value || 6}
                                onChange={field.onChange}
                                min={0}
                                max={15}
                                step={0.1}
                                suggestions={[5, 6, 7, 8]}
                                label=""
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control as any}
                        name="investment_horizon_years"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('advancedOptions.investmentHorizonYears.label')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('advancedOptions.investmentHorizonYears.placeholder')}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Spacer to push navigation to bottom */}
                  <div className="flex-grow" />
                  
                  {/* Quick navigation buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("financial")}
                      className="flex items-center gap-2"
                    >
                      <div className="mr-1">{getTabIcon(tabsStatus.financial)}</div>
                      {t('navigation.previous')}: {t('tabs.financial')}
                    </Button>
                    <div /> {/* Empty div for spacing */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {!canSubmit && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('submission.requiredFieldsMessage')}
                      <ul className="mt-2 list-disc list-inside text-sm">
                        {tabsStatus.basic !== 'valid' && (
                          <li>{t('submission.completeBasicTab')}</li>
                        )}
                        {tabsStatus.financial !== 'valid' && (
                          <li>{t('submission.completeFinancialTab')}</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !canSubmit}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        {t('buttons.creating')}
                      </>
                    ) : (
                      t('buttons.create')
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    {t('buttons.cancel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
        </div>

        {/* Financial Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <FinancialPreview
              purchasePrice={watchedValues.purchase_price || 0}
              downPayment={watchedValues.down_payment || 0}
              monthlyIncome={watchedValues.monthly_income || 0}
              monthlyExpenses={watchedValues.monthly_expenses || 0}
              currentSavings={watchedValues.current_savings || 0}
              otherDebts={watchedValues.other_debts || 0}
              additionalCosts={watchedValues.additional_costs || 0}
              expectedRentalIncome={watchedValues.expected_rental_income || 0}
              expectedAppreciationRate={watchedValues.expected_appreciation_rate || 6}
              investmentHorizonYears={watchedValues.investment_horizon_years || 10}
              planType={watchedValues.plan_type || 'home_purchase'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}