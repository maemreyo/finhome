// src/lib/hooks/useInvestments.ts
// Custom hook for investment tracking and ROI calculations

import { useState, useEffect, useMemo } from 'react'

export interface Investment {
  id: string
  name: string
  type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial'
  location: string
  purchasePrice: number
  currentValue: number
  purchaseDate: Date
  downPayment: number
  loanAmount: number
  monthlyPayment: number
  monthlyRental?: number
  totalInvestment: number
  unrealizedGain: number
  realizedGain: number
  totalReturn: number
  roiPercentage: number
  annualizedReturn: number
  cashFlow: number
  status: 'planning' | 'purchased' | 'rented' | 'sold'
  riskLevel: 'low' | 'medium' | 'high'
  notes?: string
}

export interface InvestmentMetrics {
  totalInvestment: number
  totalCurrentValue: number
  totalUnrealizedGain: number
  totalRealizedGain: number
  totalReturn: number
  averageROI: number
  monthlyPassiveIncome: number
  portfolioRiskScore: number
  diversificationScore: number
  totalProperties: number
  activeProperties: number
  rentedProperties: number
}

export interface UseInvestmentsOptions {
  userId?: string
  filterType?: 'all' | 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial'
  filterStatus?: 'all' | 'planning' | 'purchased' | 'rented' | 'sold'
}

export const useInvestments = (options: UseInvestmentsOptions = {}) => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load investments data
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock data - replace with actual API response
        const mockInvestments: Investment[] = [
          {
            id: '1',
            name: 'Căn hộ Vinhomes Central Park',
            type: 'apartment',
            location: 'Quận Bình Thạnh, TP.HCM',
            purchasePrice: 3200000000,
            currentValue: 3680000000,
            purchaseDate: new Date('2023-01-15'),
            downPayment: 640000000,
            loanAmount: 2560000000,
            monthlyPayment: 15200000,
            monthlyRental: 18000000,
            totalInvestment: 740000000,
            unrealizedGain: 480000000,
            realizedGain: 0,
            totalReturn: 480000000,
            roiPercentage: 15.0,
            annualizedReturn: 12.8,
            cashFlow: 2800000,
            status: 'rented',
            riskLevel: 'low'
          },
          {
            id: '2',
            name: 'Nhà phố Thảo Điền',
            type: 'townhouse',
            location: 'Quận 2, TP.HCM',
            purchasePrice: 5800000000,
            currentValue: 6380000000,
            purchaseDate: new Date('2022-06-10'),
            downPayment: 1160000000,
            loanAmount: 4640000000,
            monthlyPayment: 28500000,
            monthlyRental: 35000000,
            totalInvestment: 1360000000,
            unrealizedGain: 580000000,
            realizedGain: 0,
            totalReturn: 580000000,
            roiPercentage: 10.0,
            annualizedReturn: 8.2,
            cashFlow: 6500000,
            status: 'rented',
            riskLevel: 'medium'
          },
          {
            id: '3',
            name: 'Biệt thự Phú Mỹ Hưng',
            type: 'villa',
            location: 'Quận 7, TP.HCM',
            purchasePrice: 12500000000,
            currentValue: 12500000000,
            purchaseDate: new Date('2024-01-20'),
            downPayment: 2500000000,
            loanAmount: 10000000000,
            monthlyPayment: 58000000,
            totalInvestment: 2800000000,
            unrealizedGain: 0,
            realizedGain: 0,
            totalReturn: 0,
            roiPercentage: 0,
            annualizedReturn: 0,
            cashFlow: -58000000,
            status: 'planning',
            riskLevel: 'high'
          }
        ]

        setInvestments(mockInvestments)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load investments')
      } finally {
        setIsLoading(false)
      }
    }

    loadInvestments()
  }, [options.userId])

  // Filter investments based on options
  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => {
      const typeMatch = !options.filterType || options.filterType === 'all' || investment.type === options.filterType
      const statusMatch = !options.filterStatus || options.filterStatus === 'all' || investment.status === options.filterStatus
      return typeMatch && statusMatch
    })
  }, [investments, options.filterType, options.filterStatus])

  // Calculate portfolio metrics
  const metrics = useMemo((): InvestmentMetrics => {
    const totalInvestment = filteredInvestments.reduce((sum, inv) => sum + inv.totalInvestment, 0)
    const totalCurrentValue = filteredInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
    const totalUnrealizedGain = filteredInvestments.reduce((sum, inv) => sum + inv.unrealizedGain, 0)
    const totalRealizedGain = filteredInvestments.reduce((sum, inv) => sum + inv.realizedGain, 0)
    const totalReturn = totalUnrealizedGain + totalRealizedGain
    
    const averageROI = filteredInvestments.length > 0 
      ? filteredInvestments.reduce((sum, inv) => sum + inv.roiPercentage, 0) / filteredInvestments.length 
      : 0

    const monthlyPassiveIncome = filteredInvestments.reduce((sum, inv) => {
      return sum + (inv.monthlyRental ? Math.max(0, inv.cashFlow) : 0)
    }, 0)

    // Calculate risk score (1-10, lower is better)
    const riskScores = { low: 3, medium: 6, high: 9 }
    const portfolioRiskScore = filteredInvestments.length > 0
      ? filteredInvestments.reduce((sum, inv) => sum + riskScores[inv.riskLevel], 0) / filteredInvestments.length
      : 0

    // Calculate diversification score (1-10, higher is better)
    const typeSet = new Set(filteredInvestments.map(inv => inv.type))
    const locationSet = new Set(filteredInvestments.map(inv => inv.location.split(',')[0]))
    const diversificationScore = Math.min(10, (typeSet.size * 2) + (locationSet.size * 1.5))

    const totalProperties = filteredInvestments.length
    const activeProperties = filteredInvestments.filter(inv => inv.status !== 'sold').length
    const rentedProperties = filteredInvestments.filter(inv => inv.status === 'rented').length

    return {
      totalInvestment,
      totalCurrentValue,
      totalUnrealizedGain,
      totalRealizedGain,
      totalReturn,
      averageROI,
      monthlyPassiveIncome,
      portfolioRiskScore,
      diversificationScore,
      totalProperties,
      activeProperties,
      rentedProperties
    }
  }, [filteredInvestments])

  // Helper functions
  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    try {
      // Simulate API call
      const newInvestment: Investment = {
        ...investment,
        id: Date.now().toString()
      }
      
      setInvestments(prev => [...prev, newInvestment])
      return newInvestment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add investment')
      throw err
    }
  }

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      // Simulate API call
      setInvestments(prev => 
        prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update investment')
      throw err
    }
  }

  const deleteInvestment = async (id: string) => {
    try {
      // Simulate API call
      setInvestments(prev => prev.filter(inv => inv.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete investment')
      throw err
    }
  }

  const calculateROI = (investment: Pick<Investment, 'totalInvestment' | 'totalReturn'>) => {
    if (investment.totalInvestment === 0) return 0
    return (investment.totalReturn / investment.totalInvestment) * 100
  }

  const calculateAnnualizedReturn = (
    investment: Pick<Investment, 'totalInvestment' | 'totalReturn' | 'purchaseDate'>
  ) => {
    const monthsHeld = (new Date().getTime() - investment.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsHeld <= 0 || investment.totalInvestment === 0) return 0
    
    const totalReturn = investment.totalReturn / investment.totalInvestment
    return (Math.pow(1 + totalReturn, 12 / monthsHeld) - 1) * 100
  }

  const getInvestmentsByType = () => {
    const typeGroups = filteredInvestments.reduce((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(typeGroups).map(([type, count]) => ({
      type: type as Investment['type'],
      count,
      percentage: (count / filteredInvestments.length) * 100
    }))
  }

  const getTopPerformers = (limit = 3) => {
    return [...filteredInvestments]
      .sort((a, b) => b.roiPercentage - a.roiPercentage)
      .slice(0, limit)
  }

  const getWorstPerformers = (limit = 3) => {
    return [...filteredInvestments]
      .sort((a, b) => a.roiPercentage - b.roiPercentage)
      .slice(0, limit)
  }

  return {
    investments: filteredInvestments,
    allInvestments: investments,
    metrics,
    isLoading,
    error,
    
    // Actions
    addInvestment,
    updateInvestment,
    deleteInvestment,
    
    // Calculations
    calculateROI,
    calculateAnnualizedReturn,
    
    // Analytics
    getInvestmentsByType,
    getTopPerformers,
    getWorstPerformers,
    
    // Refresh
    refresh: () => {
      setInvestments([])
      setIsLoading(true)
      // Trigger reload
    }
  }
}

export default useInvestments