// src/components/expenses/SixJarsVisualization.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Home,
  BookOpen,
  PiggyBank,
  Gamepad2,
  LineChart,
  Gift,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { sixJarsConfig } from '@/lib/utils/budgetCalculations';

interface JarData {
  key: string;
  name: string;
  allocated: number;
  spent: number;
  percentage: number;
  color: string;
}

interface SixJarsVisualizationProps {
  budget: {
    id: string;
    name: string;
    total_budget: number;
    budget_allocation?: Record<string, number>;
    current_spent?: number;
    spending_by_category?: Record<string, number>;
    category_mapping?: Record<string, string>;
  };
  className?: string;
}

export function SixJarsVisualization({ budget, className }: SixJarsVisualizationProps) {
  const getJarIcon = (jarKey: string) => {
    const iconMap = {
      necessities: Home,
      education: BookOpen,
      ltss: PiggyBank,
      play: Gamepad2,
      financial_freedom: LineChart,
      give: Gift
    };
    const IconComponent = iconMap[jarKey as keyof typeof iconMap] || Home;
    return <IconComponent className="h-5 w-5" />;
  };

  const calculateJarData = (): JarData[] => {
    const allocation = budget.budget_allocation || {};
    const spendingByCategory = budget.spending_by_category || {};
    const categoryMapping = budget.category_mapping || {};

    return sixJarsConfig.groups.map(group => {
      const allocated = allocation[group.key] || 0;
      
      // Calculate spent amount for this jar by summing spending from mapped categories
      let spent = 0;
      Object.entries(categoryMapping).forEach(([categoryId, jarKey]) => {
        if (jarKey === group.key) {
          spent += spendingByCategory[categoryId] || 0;
        }
      });

      return {
        key: group.key,
        name: group.name,
        allocated,
        spent,
        percentage: allocated > 0 ? (spent / allocated) * 100 : 0,
        color: group.color
      };
    });
  };

  const jarData = calculateJarData();
  const totalAllocated = jarData.reduce((sum, jar) => sum + jar.allocated, 0);
  const totalSpent = jarData.reduce((sum, jar) => sum + jar.spent, 0);
  const overallProgress = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const getStatusIcon = (percentage: number) => {
    if (percentage > 100) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage > 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600';
    if (percentage > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-purple-500" />
            6 Jars Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">
                {formatCurrency(totalSpent)} / {formatCurrency(totalAllocated)}
              </span>
            </div>
            
            <Progress value={Math.min(overallProgress, 100)} className="h-3" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{overallProgress.toFixed(1)}% used</span>
              <span className={cn(
                totalAllocated - totalSpent < 0 ? "text-red-600" : "text-green-600"
              )}>
                {totalAllocated - totalSpent >= 0 ? 'Remaining' : 'Exceeded'}: {formatCurrency(Math.abs(totalAllocated - totalSpent))}
              </span>
            </div>

            {overallProgress > 100 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have exceeded your total budget by {formatCurrency(totalSpent - totalAllocated)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Jars */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jarData.map(jar => (
          <Card key={jar.key} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${jar.color}20`, color: jar.color }}
                >
                  {getJarIcon(jar.key)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{jar.name}</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(jar.percentage)}
                    <span className={cn("text-xs", getStatusColor(jar.percentage))}>
                      {jar.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">{formatCurrency(jar.spent)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{formatCurrency(jar.allocated)}</span>
                </div>
                
                <Progress 
                  value={Math.min(jar.percentage, 100)} 
                  className="h-2"
                  style={{ 
                    backgroundColor: `${jar.color}20`,
                  }}
                />
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {jar.percentage > 100 ? 'Over budget' : 'Remaining'}
                  </span>
                  <span className={cn(
                    jar.allocated - jar.spent < 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {formatCurrency(Math.abs(jar.allocated - jar.spent))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Jar Explanation */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">About the 6 Jars Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {sixJarsConfig.groups.map(group => (
              <div key={group.key} className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-full mt-0.5"
                  style={{ backgroundColor: `${group.color}20`, color: group.color }}
                >
                  {getJarIcon(group.key)}
                </div>
                <div>
                  <h5 className="font-medium text-sm">{group.name}</h5>
                  <p className="text-xs text-muted-foreground mb-1">
                    {group.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> {group.examples.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}