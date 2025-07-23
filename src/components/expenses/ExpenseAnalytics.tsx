// src/components/expenses/ExpenseAnalytics.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  BookOpen,
  Brain,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { vi } from "date-fns/locale";
import { StorytellingReport } from "./StorytellingReport";
import { AIFinancialAdvisor } from "./AIFinancialAdvisor";

interface Transaction {
  id: string;
  transaction_type: "expense" | "income" | "transfer";
  amount: number;
  transaction_date: string;
  expense_category?: {
    id: string;
    name_vi: string;
    color: string;
  };
  income_category?: {
    id: string;
    name_vi: string;
    color: string;
  };
  wallet: {
    name: string;
  };
}

interface SpendingInsight {
  title: string;
  description: string;
  type: "positive" | "warning" | "negative";
  icon: React.ReactNode;
  value?: string;
  trend?: number;
}

interface ExpenseAnalyticsProps {
  transactions: Transaction[];
  loading?: boolean;
  className?: string;
}

type DateRangeOption = "7d" | "30d" | "3m" | "6m" | "1y";
type ChartType = "category" | "trend" | "comparison" | "cashflow";
type ViewType = "analytics" | "storytelling" | "ai_advisor";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#EC4899",
  "#6366F1",
];

export function ExpenseAnalytics({
  transactions,
  loading = false,
  className,
}: ExpenseAnalyticsProps) {
  const t = useTranslations('ExpenseAnalytics')
  const [dateRange, setDateRange] = useState<DateRangeOption>("30d");
  const [selectedChart, setSelectedChart] = useState<ChartType>("category");
  const [selectedView, setSelectedView] = useState<ViewType>("analytics");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate date range
  const getDateRange = (range: DateRangeOption) => {
    const now = new Date();
    switch (range) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "3m":
        return { start: subMonths(now, 3), end: now };
      case "6m":
        return { start: subMonths(now, 6), end: now };
      case "1y":
        return { start: subMonths(now, 12), end: now };
    }
  };

  const { start: startDate, end: endDate } = getDateRange(dateRange);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  // Get top spending category
  const getTopCategory = (expenses: Transaction[]) => {
    const categoryTotals = expenses.reduce(
      (acc, transaction) => {
        const categoryName = transaction.expense_category?.name_vi || t("ExpenseCommon.other");
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [category, amount]) =>
        amount > max.amount ? { category, amount } : max,
      { category: "", amount: 0 }
    );

    return topCategory.category || t("noData");
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const expenses = filteredTransactions.filter(
      (t) => t.transaction_type === "expense"
    );
    const income = filteredTransactions.filter(
      (t) => t.transaction_type === "income"
    );

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    const avgDailyExpenses =
      totalExpenses /
      Math.max(
        1,
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );

    return {
      totalExpenses,
      totalIncome,
      netAmount,
      avgDailyExpenses,
      transactionCount: filteredTransactions.length,
      topCategory: getTopCategory(expenses),
    };
  }, [filteredTransactions, startDate, endDate]);

  // Prepare category spending data
  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter(
      (t) => t.transaction_type === "expense"
    );
    const categoryTotals = expenses.reduce(
      (acc, transaction) => {
        const category = transaction.expense_category;
        const categoryName = category?.name_vi || t("ExpenseCommon.other");
        const categoryColor = category?.color || "#6B7280";

        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            amount: 0,
            color: categoryColor,
            count: 0,
          };
        }
        acc[categoryName].amount += transaction.amount;
        acc[categoryName].count += 1;

        return acc;
      },
      {} as Record<
        string,
        { name: string; amount: number; color: string; count: number }
      >
    );

    return Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categories
  }, [filteredTransactions]);

  // Prepare trend data
  const trendData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const dayTransactions = filteredTransactions.filter(
        (t) =>
          format(new Date(t.transaction_date), "yyyy-MM-dd") ===
          format(day, "yyyy-MM-dd")
      );

      const expenses = dayTransactions
        .filter((t) => t.transaction_type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const income = dayTransactions
        .filter((t) => t.transaction_type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(day, "dd/MM", { locale: vi }),
        fullDate: format(day, "yyyy-MM-dd"),
        expenses,
        income,
        net: income - expenses,
      };
    });
  }, [filteredTransactions, startDate, endDate]);

  // Generate spending insights
  const generateInsights = (): SpendingInsight[] => {
    const insights: SpendingInsight[] = [];

    // High spending day insight
    const highestSpendingDay = trendData.reduce(
      (max, day) => (day.expenses > max.expenses ? day : max),
      { expenses: 0, date: "", fullDate: "" }
    );

    if (highestSpendingDay.expenses > 0) {
      insights.push({
        title: t("insights.highestSpendingDay.title"),
        description: t("insights.highestSpendingDay.description", { date: highestSpendingDay.date, amount: formatCurrency(highestSpendingDay.expenses) }),
        type: "warning",
        icon: <TrendingUp className="h-4 w-4" />,
        value: formatCurrency(highestSpendingDay.expenses),
      });
    }

    // Top category insight
    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      const percentage =
        (topCategory.amount / summaryStats.totalExpenses) * 100;

      insights.push({
        title: t("insights.topCategory.title"),
        description: t("insights.topCategory.description", { category: topCategory.name, percentage: percentage.toFixed(1) }),
        type: percentage > 40 ? "warning" : "positive",
        icon: <PieChartIcon className="h-4 w-4" />,
        value: formatCurrency(topCategory.amount),
      });
    }

    // Net income insight
    if (summaryStats.netAmount !== 0) {
      insights.push({
        title:
          summaryStats.netAmount > 0
            ? t("insights.netPositive.title")
            : t("insights.netNegative.title"),
        description: t("insights.netAmountDescription", {
          type: summaryStats.netAmount > 0 ? "income" : "expense",
          amount: formatCurrency(Math.abs(summaryStats.netAmount)),
        }),
        type: summaryStats.netAmount > 0 ? "positive" : "negative",
        icon:
          summaryStats.netAmount > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          ),
        value: formatCurrency(Math.abs(summaryStats.netAmount)),
      });
    }

    // Average daily spending
    if (summaryStats.avgDailyExpenses > 0) {
      insights.push({
        title: t("insights.avgDailySpending.title"),
        description: t("insights.avgDailySpending.description", { amount: formatCurrency(summaryStats.avgDailyExpenses) }),
        type: "positive",
        icon: <Calendar className="h-4 w-4" />,
        value: formatCurrency(summaryStats.avgDailyExpenses),
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {selectedView === "analytics" ? t('title') : 
             selectedView === "storytelling" ? "Báo cáo chi tiêu thông minh" :
             "Cố vấn AI Tài chính"}
          </h2>
          <p className="text-muted-foreground">
            {selectedView === "analytics" ? t('subtitle') : 
             selectedView === "storytelling" ? "Hiểu rõ dòng tiền với phân tích và insights cá nhân hóa" :
             "Nhận lời khuyên tài chính thông minh được cá nhân hóa bởi AI"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onValueChange={(value: DateRangeOption) => setDateRange(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('last7Days')}</SelectItem>
              <SelectItem value="30d">{t('last30Days')}</SelectItem>
              <SelectItem value="3m">{t('last3Months')}</SelectItem>
              <SelectItem value="6m">{t('last6Months')}</SelectItem>
              <SelectItem value="1y">{t('lastYear')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center gap-2 border-b">
        <Button
          variant={selectedView === "analytics" ? "default" : "ghost"}
          onClick={() => setSelectedView("analytics")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          {t('title')}
        </Button>
        <Button
          variant={selectedView === "storytelling" ? "default" : "ghost"}
          onClick={() => setSelectedView("storytelling")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Báo cáo thông minh
        </Button>
        <Button
          variant={selectedView === "ai_advisor" ? "default" : "ghost"}
          onClick={() => setSelectedView("ai_advisor")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <Brain className="h-4 w-4 mr-2" />
          Cố vấn AI
        </Button>
      </div>

      {/* Conditional Content */}
      {selectedView === "analytics" ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summaryStats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.transactionCount} {t('transactions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summaryStats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange === "7d"
                ? t('last7Days')
                : dateRange === "30d"
                  ? t('last30Days')
                  : dateRange === "3m"
                    ? t('last3Months')
                    : dateRange === "6m"
                      ? t('last6Months')
                      : t('lastYear')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('netAmount')}</CardTitle>
            <DollarSign
              className={cn(
                "h-4 w-4",
                summaryStats.netAmount >= 0 ? "text-green-500" : "text-red-500"
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                summaryStats.netAmount >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {summaryStats.netAmount >= 0 ? "+" : ""}
              {formatCurrency(summaryStats.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('spendingPerDay')}: {formatCurrency(summaryStats.avgDailyExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('topCategory')}
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryData.length > 0 ? categoryData[0].name : t("noData")}
            </div>
            <p className="text-xs text-muted-foreground">
              {categoryData.length > 0
                ? formatCurrency(categoryData[0].amount)
                : t("noData")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('chartType')}:</span>
        </div>
        <div className="flex gap-1">
          {[
            { key: "category", label: t("category"), icon: PieChartIcon },
            { key: "trend", label: t("trend"), icon: BarChart3 },
            { key: "cashflow", label: t("cashflow"), icon: Activity },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedChart === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChart(key as ChartType)}
            >
              <Icon className="h-4 w-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedChart === "category" && (
                <>
                  <PieChartIcon className="h-5 w-5" />
                  {t('category')}
                </>
              )}
              {selectedChart === "trend" && (
                <>
                  <BarChart3 className="h-5 w-5" />
                  {t('trend')}
                </>
              )}
              {selectedChart === "cashflow" && (
                <>
                  <Activity className="h-5 w-5" />
                  {t('cashflow')}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === "category" && categoryData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                ) : selectedChart === "trend" ? (
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        formatCurrency(value, { compact: true })
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="expenses" fill="#EF4444" name={t('expenses')} />
                    <Bar dataKey="income" fill="#10B981" name={t('income')} />
                  </BarChart>
                ) : (
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        formatCurrency(value, { compact: true })
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="net"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name={t('netAmount')}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('insights')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{t("noData")}</p>
                <p className="text-sm">
                  {t("noDataDescription")}
                </p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 p-1 rounded-full",
                        insight.type === "positive" &&
                          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                        insight.type === "warning" &&
                          "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                        insight.type === "negative" &&
                          "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {insight.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {insight.description}
                      </p>
                      {insight.value && (
                        <p className="text-xs font-medium mt-1">
                          {insight.value}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < insights.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('categoryBreakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const percentage =
                  (category.amount / summaryStats.totalExpenses) * 100;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm">
                          {category.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {category.count} {t('transactions')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(category.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
        </>
      ) : selectedView === "storytelling" ? (
        /* Storytelling Report View */
        <StorytellingReport 
          initialPeriod={dateRange}
          className="mt-6"
        />
      ) : (
        /* AI Financial Advisor View */
        <AIFinancialAdvisor />
      )}
    </div>
  );
}
