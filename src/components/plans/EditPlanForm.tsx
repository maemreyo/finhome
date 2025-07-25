// src/components/plans/EditPlanForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "react-hot-toast";
import { formatCurrency, parseCurrency } from "@/lib/utils";
import { Database } from "@/src/types/supabase";

type FinancialPlan = Database["public"]["Tables"]["financial_plans"]["Row"];

// Currency input component for better UX
function CurrencyInput({
  value,
  onChange,
  placeholder,
  ...props
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  [key: string]: any;
}) {
  const [displayValue, setDisplayValue] = useState(
    value ? formatCurrency(value) : ""
  );

  useEffect(() => {
    if (value) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numericValue = parseCurrency(input);
    setDisplayValue(input);
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (value) {
      setDisplayValue(formatCurrency(value));
    }
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
}

// Edit plan schema
const editPlanSchema = z.object({
  plan_name: z.string().min(1, "Plan name is required"),
  plan_type: z.enum(["home_purchase", "investment", "upgrade", "refinance"]),
  purchase_price: z.number().min(1, "Purchase price must be greater than 0"),
  down_payment: z.number().min(1, "Down payment must be greater than 0"),
  monthly_income: z.number().min(1, "Monthly income must be greater than 0"),
  monthly_expenses: z.number().min(0, "Monthly expenses cannot be negative"),
  current_savings: z.number().min(0, "Current savings cannot be negative"),
  additional_costs: z.number().default(0),
  other_debts: z.number().default(0),
  description: z.string().optional(),
  expected_rental_income: z.number().optional(),
  expected_appreciation_rate: z.number().optional(),
  investment_horizon_months: z.number().optional(),
});

type EditPlanFormData = z.infer<typeof editPlanSchema>;

interface EditPlanFormProps {
  plan: FinancialPlan;
  onCancel: () => void;
  onSave: (updatedPlan: FinancialPlan) => void;
}

export function EditPlanForm({ plan, onCancel, onSave }: EditPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const t = useTranslations("EditPlanForm");

  const form = useForm<EditPlanFormData>({
    // @ts-ignore
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      plan_name: plan.plan_name || "",
      plan_type: plan.plan_type || "home_purchase",
      purchase_price: plan.purchase_price || 0,
      down_payment: plan.down_payment || 0,
      monthly_income: plan.monthly_income || 0,
      monthly_expenses: plan.monthly_expenses || 0,
      current_savings: plan.current_savings || 0,
      additional_costs: plan.additional_costs || 0,
      other_debts: plan.other_debts || 0,
      description: plan.description || "",
      expected_rental_income: plan.expected_rental_income || undefined,
      expected_appreciation_rate: plan.expected_appreciation_rate || undefined,
      investment_horizon_months: plan.investment_horizon_months || undefined,
    },
  });

  // Validate current tab before switching
  const validateCurrentTab = async (targetTab: string) => {
    const values = form.getValues();
    let hasErrors = false;
    const errors: Record<string, string> = {};

    // Basic tab validation
    if (currentTab === "basic") {
      if (!values.plan_name.trim()) {
        errors.plan_name = t("validation.planNameRequired");
        hasErrors = true;
      }
      if (!values.purchase_price || values.purchase_price < 100000000) {
        errors.purchase_price = t("validation.purchasePriceMin");
        hasErrors = true;
      }
      if (!values.down_payment || values.down_payment < 10000000) {
        errors.down_payment = t("validation.downPaymentMin");
        hasErrors = true;
      }
      if (values.down_payment >= values.purchase_price) {
        errors.down_payment = t("validation.downPaymentMax");
        hasErrors = true;
      }
    }

    // Financial tab validation
    if (currentTab === "financial") {
      if (!values.monthly_income || values.monthly_income < 5000000) {
        errors.monthly_income = t("validation.monthlyIncomeMin");
        hasErrors = true;
      }
      if (!values.monthly_expenses || values.monthly_expenses < 1000000) {
        errors.monthly_expenses = t("validation.monthlyExpensesMin");
        hasErrors = true;
      }
      if (values.monthly_expenses >= values.monthly_income) {
        errors.monthly_expenses = t("validation.expensesLessThanIncome");
        hasErrors = true;
      }
    }

    setValidationErrors(errors);

    if (hasErrors) {
      toast.error(t("validation.fixErrorsBeforeContinue"));
      return false;
    }

    setCurrentTab(targetTab);
    return true;
  };

  async function onSubmit(data: EditPlanFormData) {
    // Validate all tabs before submission
    const isValid =
      (await validateCurrentTab("basic")) &&
      (await validateCurrentTab("financial")) &&
      (await validateCurrentTab("advanced"));

    if (!isValid) {
      toast.error(t("validation.fixErrorsInForm"));
      return;
    }

    setIsLoading(true);
    try {
      // Transform data to match API schema
      const apiData = {
        plan_name: data.plan_name,
        plan_type: data.plan_type,
        description: data.description,
        purchase_price: data.purchase_price,
        down_payment: data.down_payment,
        additional_costs: data.additional_costs || 0,
        monthly_income: data.monthly_income,
        monthly_expenses: data.monthly_expenses,
        current_savings: data.current_savings,
        other_debts: data.other_debts || 0,
        expected_rental_income: data.expected_rental_income,
        expected_appreciation_rate: data.expected_appreciation_rate,
        investment_horizon_months: data.investment_horizon_months,
      };

      const response = await fetch(`/api/plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update plan");
      }

      const result = await response.json();
      toast.success(t("messages.success"));
      onSave(result.data);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error(error instanceof Error ? error.message : t("messages.error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      {/* @ts-ignore */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs
          value={currentTab}
          onValueChange={validateCurrentTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              {t("tabs.basic")}
              {Object.keys(validationErrors).some((key) =>
                ["plan_name", "purchase_price", "down_payment"].includes(key)
              ) && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>
            <TabsTrigger value="financial">
              {t("tabs.financial")}
              {Object.keys(validationErrors).some((key) =>
                ["monthly_income", "monthly_expenses"].includes(key)
              ) && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>
            <TabsTrigger value="advanced">{t("tabs.advanced")}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("basicInfo.title")}</CardTitle>
                <CardDescription>{t("basicInfo.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="plan_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basicInfo.planName.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("basicInfo.planName.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {validationErrors.plan_name && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.plan_name}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basicInfo.planType.label")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("basicInfo.planType.placeholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="home_purchase">
                            {t("basicInfo.planType.options.homePurchase")}
                          </SelectItem>
                          <SelectItem value="investment">
                            {t("basicInfo.planType.options.investment")}
                          </SelectItem>
                          <SelectItem value="upgrade">
                            {t("basicInfo.planType.options.upgrade")}
                          </SelectItem>
                          <SelectItem value="refinance">
                            {t("basicInfo.planType.options.refinance")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="purchase_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("basicInfo.purchasePrice.label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t("basicInfo.purchasePrice.placeholder")}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("basicInfo.purchasePrice.description")}
                      </FormDescription>
                      <FormMessage />
                      {validationErrors.purchase_price && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.purchase_price}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="down_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basicInfo.downPayment.label")}</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t("basicInfo.downPayment.placeholder")}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("basicInfo.downPayment.description")}
                      </FormDescription>
                      <FormMessage />
                      {validationErrors.down_payment && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.down_payment}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("basicInfo.planDescription.label")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            "basicInfo.planDescription.placeholder"
                          )}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("financialInfo.title")}</CardTitle>
                <CardDescription>
                  {t("financialInfo.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="monthly_income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("financialInfo.monthlyIncome.label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t(
                            "financialInfo.monthlyIncome.placeholder"
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("financialInfo.monthlyIncome.description")}
                      </FormDescription>
                      <FormMessage />
                      {validationErrors.monthly_income && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.monthly_income}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="monthly_expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("financialInfo.monthlyExpenses.label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t(
                            "financialInfo.monthlyExpenses.placeholder"
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("financialInfo.monthlyExpenses.description")}
                      </FormDescription>
                      <FormMessage />
                      {validationErrors.monthly_expenses && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.monthly_expenses}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="current_savings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("financialInfo.currentSavings.label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t(
                            "financialInfo.currentSavings.placeholder"
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("financialInfo.currentSavings.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="other_debts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("financialInfo.otherDebts.label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t(
                            "financialInfo.otherDebts.placeholder"
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("financialInfo.otherDebts.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("advancedOptions.title")}</CardTitle>
                <CardDescription>
                  {t("advancedOptions.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="additional_costs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("advancedOptions.additionalCosts.label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t(
                            "advancedOptions.additionalCosts.placeholder"
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("advancedOptions.additionalCosts.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="expected_rental_income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("advancedOptions.expectedRentalIncome.label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value || 0}
                          onChange={field.onChange}
                          placeholder={t(
                            "advancedOptions.expectedRentalIncome.placeholder"
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("advancedOptions.expectedRentalIncome.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="expected_appreciation_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("advancedOptions.expectedAppreciationRate.label")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={t(
                            "advancedOptions.expectedAppreciationRate.placeholder"
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="investment_horizon_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("advancedOptions.investmentHorizonMonths.label")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t(
                            "advancedOptions.investmentHorizonMonths.placeholder"
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("buttons.saving") : t("buttons.save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("buttons.cancel")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
