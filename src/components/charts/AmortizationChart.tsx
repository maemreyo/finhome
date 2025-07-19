// src/components/charts/AmortizationChart.tsx
'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface AmortizationData {
  year: number
  principalPayment: number
  interestPayment: number
  remainingBalance: number
  cumulativePrincipal: number
  cumulativeInterest: number
}

interface AmortizationChartProps {
  loanAmount: number
  interestRate: number
  loanTermMonths: number
  monthlyPayment: number
}

export function AmortizationChart({ 
  loanAmount, 
  interestRate, 
  loanTermMonths, 
  monthlyPayment 
}: AmortizationChartProps) {
  const t = useTranslations('Charts.Amortization')

  // Generate amortization schedule
  const generateAmortizationData = (): AmortizationData[] => {
    const data: AmortizationData[] = []
    let remainingBalance = loanAmount
    let cumulativePrincipal = 0
    let cumulativeInterest = 0
    const monthlyInterestRate = interestRate / 100 / 12

    // Group by years for better visualization
    const loanTermYears = Math.ceil(loanTermMonths / 12)

    for (let year = 1; year <= loanTermYears; year++) {
      let yearlyPrincipal = 0
      let yearlyInterest = 0
      const monthsInYear = year === loanTermYears ? (loanTermMonths % 12) || 12 : 12

      for (let month = 1; month <= monthsInYear && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * monthlyInterestRate
        const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance)
        
        yearlyPrincipal += principalPayment
        yearlyInterest += interestPayment
        cumulativePrincipal += principalPayment
        cumulativeInterest += interestPayment
        remainingBalance -= principalPayment
        
        if (remainingBalance < 0.01) {
          remainingBalance = 0
          break
        }
      }

      data.push({
        year,
        principalPayment: yearlyPrincipal,
        interestPayment: yearlyInterest,
        remainingBalance,
        cumulativePrincipal,
        cumulativeInterest
      })

      if (remainingBalance === 0) break
    }

    return data
  }

  const data = generateAmortizationData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{t('tooltips.year', { year: label })}</p>
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
    <div className="w-full">
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 40,
              bottom: 80,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis 
              dataKey="year" 
              tickFormatter={(value) => t('xAxis.yearLabel', { year: value })}
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
            <Area
              type="monotone"
              dataKey="interestPayment"
              stackId="1"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.7}
              name={t('legend.interestPayment')}
            />
            <Area
              type="monotone"
              dataKey="principalPayment"
              stackId="1"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.7}
              name={t('legend.principalPayment')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">{t('summary.totalInterest')}</p>
          <p className="text-lg font-semibold" style={{ color: 'hsl(var(--chart-2))' }}>
            {formatCurrency(data.reduce((sum, item) => sum + item.interestPayment, 0))}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">{t('summary.totalPrincipal')}</p>
          <p className="text-lg font-semibold" style={{ color: 'hsl(var(--chart-1))' }}>
            {formatCurrency(data.reduce((sum, item) => sum + item.principalPayment, 0))}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">{t('summary.interestRatio')}</p>
          <p className="text-lg font-semibold text-foreground">
            {(() => {
              const totalInterest = data.reduce((sum, item) => sum + item.interestPayment, 0)
              const totalPrincipal = data.reduce((sum, item) => sum + item.principalPayment, 0)
              const ratio = totalInterest + totalPrincipal > 0 ? (totalInterest / (totalInterest + totalPrincipal)) * 100 : 0
              return `${ratio.toFixed(1)}%`
            })()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AmortizationChart