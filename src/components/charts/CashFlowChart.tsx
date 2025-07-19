// src/components/charts/CashFlowChart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CashFlowData {
  month: number
  income: number
  expenses: number
  netCashFlow: number
  cumulativeCashFlow: number
}

interface CashFlowChartProps {
  monthlyIncome: number
  monthlyExpenses: number
  monthlyPayment: number
  expectedRentalIncome?: number
  timeframe: number // months
}

export function CashFlowChart({ 
  monthlyIncome, 
  monthlyExpenses, 
  monthlyPayment, 
  expectedRentalIncome = 0,
  timeframe = 60 // 5 years default
}: CashFlowChartProps) {
  const t = useTranslations('Charts.CashFlow')

  // Generate cash flow data
  const generateCashFlowData = (): CashFlowData[] => {
    const data: CashFlowData[] = []
    let cumulativeCashFlow = 0
    
    const totalIncome = monthlyIncome + expectedRentalIncome
    const totalExpenses = monthlyExpenses + monthlyPayment
    const netMonthly = totalIncome - totalExpenses

    for (let month = 1; month <= timeframe; month++) {
      cumulativeCashFlow += netMonthly
      
      data.push({
        month,
        income: totalIncome,
        expenses: totalExpenses,
        netCashFlow: netMonthly,
        cumulativeCashFlow
      })
    }

    return data
  }

  const data = generateCashFlowData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{t('tooltips.month', { month: label })}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 60,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis 
            dataKey="month" 
            tickFormatter={(value) => t('xAxis.monthLabel', { month: value })}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, { compact: true })}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name={t('legend.income')}
            dot={{ r: 3, fill: 'hsl(var(--chart-1))' }}
            activeDot={{ r: 5, fill: 'hsl(var(--chart-1))' }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name={t('legend.expenses')}
            dot={{ r: 3, fill: 'hsl(var(--chart-2))' }}
            activeDot={{ r: 5, fill: 'hsl(var(--chart-2))' }}
          />
          <Line 
            type="monotone" 
            dataKey="netCashFlow" 
            stroke="hsl(var(--chart-3))" 
            strokeWidth={3}
            name={t('legend.netCashFlow')}
            dot={{ r: 4, fill: 'hsl(var(--chart-3))' }}
            activeDot={{ r: 6, fill: 'hsl(var(--chart-3))' }}
          />
          <Line 
            type="monotone" 
            dataKey="cumulativeCashFlow" 
            stroke="hsl(var(--chart-4))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name={t('legend.cumulativeCashFlow')}
            dot={{ r: 3, fill: 'hsl(var(--chart-4))' }}
            activeDot={{ r: 5, fill: 'hsl(var(--chart-4))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}