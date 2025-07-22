// src/components/expenses/ExpenseTrackingDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { QuickTransactionForm } from "./QuickTransactionForm";
import { EnhancedQuickTransactionForm } from "./EnhancedQuickTransactionForm";
import { IntelligentTransactionForm } from "./IntelligentTransactionForm";
import { TransactionsList } from "./TransactionsList";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  ArrowRightLeft,
  PiggyBank,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  RefreshCw,
  Brain,
  Zap,
  Settings,
  Sparkles
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Transaction {
  id: string;
  transaction_type: "expense" | "income" | "transfer";
  amount: number;
  description?: string;
  transaction_date: string;
  wallet: { id: string; name: string; icon: string; color: string };
  expense_category?: { name_vi: string; color: string };
  income_category?: { name_vi: string; color: string };
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  wallet_type: string;
}

interface Goal {
  id: string;
  name: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  contributions: Array<{
    amount: number;
    contribution_date: string;
  }>;
}

interface Budget {
  id: string;
  name: string;
  total_budget: number;
  total_spent: number;
  remaining_amount: number;
  progress_percentage: number;
  budget_period: string;
  start_date: string;
  end_date: string;
}

interface ExpenseTrackingDashboardProps {
  userId: string;
  initialData: {
    wallets: Wallet[];
    expenseCategories: any[];
    incomeCategories: any[];
    recentTransactions: Transaction[];
    currentBudgets: Budget[];
    activeGoals: Goal[];
  };
}

export function ExpenseTrackingDashboard({
  userId,
  initialData,
}: ExpenseTrackingDashboardProps) {
  const t = useTranslations("ExpenseTrackingDashboard");
  const tCommon = useTranslations("ExpenseCommon");
  const tWallets = useTranslations("Wallets");
  const tGoals = useTranslations("GoalManager");
  const [wallets, setWallets] = useState(initialData.wallets);
  const [recentTransactions, setRecentTransactions] = useState(
    initialData.recentTransactions
  );
  const [activeGoals, setActiveGoals] = useState(initialData.activeGoals);
  const [currentBudgets, setCurrentBudgets] = useState(
    initialData.currentBudgets
  );
  
  // Form selection state
  const [formMode, setFormMode] = useState<'basic' | 'enhanced' | 'intelligent'>('enhanced');
  const [showFormSelector, setShowFormSelector] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate summary stats
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const thisMonthIncome = recentTransactions
    .filter(
      (t) => t.transaction_type === "income" && isThisMonth(t.transaction_date)
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const thisMonthExpenses = recentTransactions
    .filter(
      (t) => t.transaction_type === "expense" && isThisMonth(t.transaction_date)
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const netIncome = thisMonthIncome - thisMonthExpenses;

  const isThisMonth = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Refresh wallets and transactions
      const [walletsResponse, transactionsResponse] = await Promise.all([
        fetch("/api/expenses/wallets"),
        fetch("/api/expenses"),
      ]);

      if (walletsResponse.ok) {
        const walletsData = await walletsResponse.json();
        setWallets(walletsData.wallets);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData.transactions.slice(0, 20));
      }

      toast.success(tCommon("dataUpdated"));
    } catch (error) {
      toast.error(tCommon("errorUpdatingData"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTransactionSuccess = () => {
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalBalance")}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="h-6 w-6 p-0"
              >
                {showBalances ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalances ? formatCurrency(totalBalance) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              {tWallets("overview.fromWallets", { count: wallets.length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("monthlyIncome")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {showBalances ? formatCurrency(thisMonthIncome) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">{t("thisMonth")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("monthlyExpenses")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {showBalances ? formatCurrency(thisMonthExpenses) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">{t("thisMonth")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("monthlyBalance")}
            </CardTitle>
            <DollarSign
              className={cn(
                "h-4 w-4",
                netIncome >= 0 ? "text-green-600" : "text-red-600"
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                netIncome >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {showBalances
                ? `${netIncome >= 0 ? "+" : ""}${formatCurrency(netIncome)}`
                : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">{t("thisMonth")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Smart Transaction Form Selector */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {formMode === 'basic' && <Plus className="h-5 w-5 text-blue-500" />}
                  {formMode === 'enhanced' && <Zap className="h-5 w-5 text-amber-500" />}
                  {formMode === 'intelligent' && <Brain className="h-5 w-5 text-purple-500" />}
                  <CardTitle>
                    {formMode === 'basic' && 'Quick Entry'}
                    {formMode === 'enhanced' && 'Enhanced Entry'}
                    {formMode === 'intelligent' && 'Smart AI Entry'}
                  </CardTitle>
                  {formMode === 'intelligent' && (
                    <Badge variant="secondary" className="ml-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Powered
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFormSelector(!showFormSelector)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Form Mode Selector */}
              {showFormSelector && (
                <div className="pt-3 border-t">
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant={formMode === 'basic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {setFormMode('basic'); setShowFormSelector(false)}}
                      className="flex-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Basic
                    </Button>
                    <Button
                      variant={formMode === 'enhanced' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {setFormMode('enhanced'); setShowFormSelector(false)}}
                      className="flex-1"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Enhanced
                    </Button>
                    <Button
                      variant={formMode === 'intelligent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {setFormMode('intelligent'); setShowFormSelector(false)}}
                      className="flex-1"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      AI Smart
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {formMode === 'basic' && <p>• Simple transaction entry form</p>}
                    {formMode === 'enhanced' && (
                      <>
                        <p>• Quick mode with keyboard shortcuts</p>
                        <p>• Smart tag suggestions</p>
                      </>
                    )}
                    {formMode === 'intelligent' && (
                      <>
                        <p>• AI-powered auto-complete</p>
                        <p>• Smart category prediction</p>
                        <p>• Amount suggestions based on history</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Render appropriate form based on selection */}
              {formMode === 'basic' && (
                <QuickTransactionForm
                  wallets={wallets}
                  expenseCategories={initialData.expenseCategories}
                  incomeCategories={initialData.incomeCategories}
                  onSuccess={handleTransactionSuccess}
                  className="border-0 shadow-none p-0"
                />
              )}
              
              {formMode === 'enhanced' && (
                <EnhancedQuickTransactionForm
                  wallets={wallets}
                  expenseCategories={initialData.expenseCategories}
                  incomeCategories={initialData.incomeCategories}
                  onSuccess={handleTransactionSuccess}
                  userId={userId}
                  defaultQuickMode={true}
                  className="border-0 shadow-none p-0"
                />
              )}
              
              {formMode === 'intelligent' && (
                <IntelligentTransactionForm
                  wallets={wallets}
                  expenseCategories={initialData.expenseCategories}
                  incomeCategories={initialData.incomeCategories}
                  onSuccess={handleTransactionSuccess}
                  userId={userId}
                  quickMode={true}
                  className="border-0 shadow-none p-0"
                />
              )}
            </CardContent>
          </Card>

          {/* Wallets Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {tWallets("title")}
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {tWallets("list.addNew")}
              </Button>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Wallet className="h-8 w-8 mx-auto mb-2" />
                  <p>{tWallets("list.empty.title")}</p>
                  <p className="text-sm">
                    {tWallets("list.empty.description")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: wallet.color + "20" }}
                      >
                        {wallet.wallet_type === "cash" && (
                          <Wallet
                            className="h-5 w-5"
                            style={{ color: wallet.color }}
                          />
                        )}
                        {wallet.wallet_type === "bank_account" && (
                          <CreditCard
                            className="h-5 w-5"
                            style={{ color: wallet.color }}
                          />
                        )}
                        {wallet.wallet_type === "e_wallet" && (
                          <Wallet
                            className="h-5 w-5"
                            style={{ color: wallet.color }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{wallet.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {tWallets(`types.${wallet.wallet_type}`)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          {showBalances
                            ? formatCurrency(wallet.balance)
                            : "••••••"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {wallet.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Overview */}
          {currentBudgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t("budgets")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentBudgets.map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{budget.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(budget.total_spent)} /{" "}
                          {formatCurrency(budget.total_budget)}
                        </span>
                      </div>
                      <Progress
                        value={budget.progress_percentage}
                        className="h-2"
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span
                          className={cn(
                            budget.progress_percentage > 100
                              ? "text-red-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {budget.progress_percentage.toFixed(1)}% {t("used")}
                        </span>
                        <span
                          className={cn(
                            budget.remaining_amount < 0
                              ? "text-red-600"
                              : "text-green-600"
                          )}
                        >
                          {t("remaining")}:{" "}
                          {formatCurrency(budget.remaining_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("recentTransactions")}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                  />
                </Button>
                <Button variant="outline" size="sm">
                  {tCommon("viewAll")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {recentTransactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <ArrowRightLeft className="h-8 w-8 mx-auto mb-2" />
                    <p>{t("noTransactions")}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentTransactions.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  (transaction.expense_category?.color ||
                                    transaction.income_category?.color ||
                                    "#3B82F6") + "20",
                              }}
                            >
                              {transaction.transaction_type === "expense" && (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              {transaction.transaction_type === "income" && (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              )}
                              {transaction.transaction_type === "transfer" && (
                                <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {transaction.description ||
                                transaction.expense_category?.name_vi ||
                                transaction.income_category?.name_vi ||
                                tCommon("transaction")}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{transaction.wallet.name}</span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  transaction.transaction_date
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={cn(
                                "font-semibold text-sm",
                                transaction.transaction_type === "expense"
                                  ? "text-red-600"
                                  : transaction.transaction_type === "income"
                                    ? "text-green-600"
                                    : "text-blue-600"
                              )}
                            >
                              {transaction.transaction_type === "expense"
                                ? "-"
                                : transaction.transaction_type === "income"
                                  ? "+"
                                  : ""}
                              {formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Savings Goals */}
          {activeGoals.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  {tGoals("title")}
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {tGoals("createGoal")}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{goal.name}</span>
                          {goal.goal_type === "buy_house" && (
                            <Badge variant="secondary" className="text-xs">
                              {tGoals("buyHouseGoal")}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(goal.current_amount)} /{" "}
                          {formatCurrency(goal.target_amount)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(goal.progress_percentage, 100)}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {goal.progress_percentage.toFixed(1)}%{" "}
                          {tGoals("completed")}
                        </span>
                        {goal.goal_type === "buy_house" &&
                          goal.progress_percentage > 25 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-blue-600"
                            >
                              {tGoals("viewSuitableProperties")} →
                            </Button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
