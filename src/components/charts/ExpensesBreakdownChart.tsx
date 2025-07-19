// src/components/charts/ExpensesBreakdownChart.tsx
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface ExpenseData {
  name: string
  value: number
  color: string
}

interface ExpensesBreakdownChartProps {
  monthlyExpenses: number
  monthlyPayment: number
  additionalCosts?: number
  otherDebts?: number
}

export function ExpensesBreakdownChart({ 
  monthlyExpenses, 
  monthlyPayment, 
  additionalCosts = 0,
  otherDebts = 0
}: ExpensesBreakdownChartProps) {
  const t = useTranslations('Charts.ExpensesBreakdown')

  // Prepare data for pie chart
  const data: ExpenseData[] = [
    {
      name: t('categories.livingExpenses'),
      value: monthlyExpenses,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: t('categories.mortgagePayment'),
      value: monthlyPayment,
      color: 'hsl(var(--chart-2))'
    }
  ]

  // Add additional costs if provided
  if (additionalCosts > 0) {
    data.push({
      name: t('categories.additionalCosts'),
      value: additionalCosts,
      color: 'hsl(var(--chart-3))'
    })
  }

  // Add other debts if provided
  if (otherDebts > 0) {
    data.push({
      name: t('categories.otherDebts'),
      value: otherDebts,
      color: 'hsl(var(--chart-4))'
    })
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show label for slices smaller than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="hsl(var(--background))" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
        stroke="hsl(var(--foreground))"
        strokeWidth="0.5"
        style={{ 
          filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))',
          paintOrder: 'stroke fill'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-foreground font-medium">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">{t('summary.totalExpenses')}</p>
          <p className="text-lg font-semibold">{formatCurrency(total)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">{t('summary.largestExpense')}</p>
          <p className="text-lg font-semibold">
            {data.length > 0 && data.reduce((max, item) => item.value > max.value ? item : max).name}
          </p>
        </div>
      </div>
    </div>
  )
}