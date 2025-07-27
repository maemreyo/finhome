// src/lib/hooks/useInvestments.ts
// Custom hook for investment tracking and ROI calculations

import { useState, useEffect, useMemo } from 'react'
import { DashboardService } from '@/lib/services/dashboardService'
import { createClient } from '@/lib/supabase/client'
import { plansAPI } from '@/lib/api/plans'
import type { FinancialPlan, Property } from '@/src/types/supabase'

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

        if (!options.userId) {
          setInvestments([])
          return
        }

        // Load user's financial plans from database
        const [plans, properties] = await Promise.all([
          DashboardService.getFinancialPlans(options.userId),
          DashboardService.getProperties(20)
        ])

        // Convert financial plans and properties to Investment format
        const investmentPlans: Investment[] = plans
          .filter((plan: FinancialPlan) => plan.plan_type === 'investment' && plan.status === 'active')
          .map((plan: FinancialPlan) => {
            const purchasePrice = plan.purchase_price || 0
            const downPayment = plan.down_payment || 0
            const currentValue = purchasePrice // Use purchase_price as fallback since current_market_value doesn't exist
            const monthlyPayment = 0 // monthly_payment field doesn't exist in schema
            const monthlyRental = plan.expected_rental_income || 0
            const totalInvestment = downPayment + (plan.additional_costs || 0)
            const unrealizedGain = Math.max(0, currentValue - purchasePrice)
            const totalReturn = unrealizedGain // total_rental_income field doesn't exist
            const cashFlow = monthlyRental - monthlyPayment
            
            return {
              id: plan.id,
              name: plan.plan_name,
              type: mapPropertyType((plan as any).property_type || 'apartment'), // property_type field doesn't exist in financial_plans
              location: (plan as any).property_location || 'N/A', // property_location field doesn't exist in financial_plans
              purchasePrice,
              currentValue,
              purchaseDate: new Date(plan.created_at || new Date()),
              downPayment,
              loanAmount: purchasePrice - downPayment,
              monthlyPayment,
              monthlyRental,
              totalInvestment,
              unrealizedGain,
              realizedGain: (plan as any).realized_gain || 0, // realized_gain field doesn't exist in financial_plans
              totalReturn,
              roiPercentage: totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0,
              annualizedReturn: calculateAnnualizedReturnFromData(totalReturn, totalInvestment, new Date(plan.created_at || new Date())),
              cashFlow,
              status: mapPlanStatus(plan.status || 'draft'),
              riskLevel: calculateRiskLevel(plan),
              notes: plan.notes ?? undefined
            }
          })

        // Convert properties to Investment format for owned properties
        const propertyInvestments: Investment[] = properties
          .filter((property: Property) => (property as any).ownership_status === 'owned') // ownership_status field doesn't exist
          .map((property: Property) => {
            const purchasePrice = (property as any).purchase_price || property.listed_price || 0 // purchase_price field doesn't exist
            const currentValue = property.listed_price || 0 // current_market_value field doesn't exist, use listed_price
            const monthlyRental = (property as any).rental_income || 0 // rental_income field doesn't exist
            const monthlyPayment = (property as any).mortgage_payment || 0 // mortgage_payment field doesn't exist
            const downPayment = (property as any).down_payment || (purchasePrice * 0.2) // down_payment field doesn't exist
            const totalInvestment = downPayment + ((property as any).closing_costs || 0) // closing_costs field doesn't exist
            const unrealizedGain = Math.max(0, currentValue - purchasePrice)
            const totalReturn = unrealizedGain + ((property as any).total_rental_received || 0) // total_rental_received field doesn't exist
            const cashFlow = monthlyRental - monthlyPayment
            
            return {
              id: property.id,
              name: property.property_name || 'Property Investment',
              type: property.property_type as Investment['type'],
              location: `${property.district}, ${property.city}`,
              purchasePrice,
              currentValue,
              purchaseDate: new Date((property as any).purchase_date || property.created_at || new Date()), // purchase_date field doesn't exist
              downPayment,
              loanAmount: purchasePrice - downPayment,
              monthlyPayment,
              monthlyRental,
              totalInvestment,
              unrealizedGain,
              realizedGain: (property as any).realized_gain || 0, // realized_gain field doesn't exist
              totalReturn,
              roiPercentage: totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0,
              annualizedReturn: calculateAnnualizedReturnFromData(totalReturn, totalInvestment, new Date((property as any).purchase_date || property.created_at || new Date())), // purchase_date field doesn't exist
              cashFlow,
              status: (property as any).rental_status === 'rented' ? 'rented' : 'purchased', // rental_status field doesn't exist
              riskLevel: calculatePropertyRiskLevel(property),
              notes: (property as any).notes ?? undefined // notes field doesn't exist
            }
          })

        // Combine both sources
        const allInvestments = [...investmentPlans, ...propertyInvestments]
        setInvestments(allInvestments)
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
      if (!options.userId) throw new Error('User not authenticated')
      
      // Create a financial plan for the investment
      const planData = {
        plan_name: investment.name,
        plan_type: 'investment' as const,
        purchase_price: investment.purchasePrice,
        down_payment: investment.downPayment,
        monthly_payment: investment.monthlyPayment,
        expected_rental_income: investment.monthlyRental,
        property_type: investment.type,
        property_location: investment.location,
        status: 'active' as const,
        notes: investment.notes
      }
      
      const newPlan = await plansAPI.createPlan(planData)
      
      // Convert back to Investment format
      const newInvestment: Investment = {
        id: newPlan.id,
        name: newPlan.plan_name,
        type: mapPropertyType((newPlan as any).property_type || 'apartment'), // property_type field doesn't exist
        location: (newPlan as any).property_location || 'N/A', // property_location field doesn't exist
        purchasePrice: newPlan.purchase_price || 0,
        currentValue: newPlan.purchase_price || 0,
        purchaseDate: new Date(newPlan.created_at || new Date()),
        downPayment: newPlan.down_payment || 0,
        loanAmount: (newPlan.purchase_price || 0) - (newPlan.down_payment || 0),
        monthlyPayment: (newPlan as any).monthly_payment || 0, // monthly_payment field doesn't exist
        monthlyRental: newPlan.expected_rental_income || 0,
        totalInvestment: newPlan.down_payment || 0,
        unrealizedGain: 0,
        realizedGain: 0,
        totalReturn: 0,
        roiPercentage: 0,
        annualizedReturn: 0,
        cashFlow: (newPlan.expected_rental_income || 0) - ((newPlan as any).monthly_payment || 0), // monthly_payment field doesn't exist
        status: 'planning',
        riskLevel: calculateRiskLevel(newPlan),
        notes: newPlan.notes ?? undefined
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
      if (!options.userId) throw new Error('User not authenticated')
      
      // Update the financial plan in database
      await plansAPI.updatePlan(id, {
        plan_name: updates.name,
        purchase_price: updates.purchasePrice,
        down_payment: updates.downPayment,
        // monthly_payment: updates.monthlyPayment, // Field doesn't exist in schema
        expected_rental_income: updates.monthlyRental
        // current_market_value: updates.currentValue, // Field doesn't exist in schema
        // realized_gain: updates.realizedGain, // Field doesn't exist in schema
        // notes: updates.notes // Field doesn't exist in CreatePlanRequest type
      })
      
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
      if (!options.userId) throw new Error('User not authenticated')
      
      // Archive the financial plan instead of deleting
      await plansAPI.updatePlan(id, {
        status: 'archived'
      })
      
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

  // Helper functions for data mapping
  const mapPropertyType = (type: string): Investment['type'] => {
    const typeMap: Record<string, Investment['type']> = {
      'apartment': 'apartment',
      'house': 'house',
      'villa': 'villa',
      'townhouse': 'townhouse',
      'commercial': 'commercial'
    }
    return typeMap[type] || 'apartment'
  }

  const mapPlanStatus = (status: string): Investment['status'] => {
    const statusMap: Record<string, Investment['status']> = {
      'draft': 'planning',
      'active': 'purchased',
      'completed': 'sold',
      'archived': 'sold'
    }
    return statusMap[status] || 'planning'
  }

  const calculateRiskLevel = (plan: any): Investment['riskLevel'] => {
    const debtRatio = plan.purchase_price && plan.down_payment ? 
      (plan.purchase_price - plan.down_payment) / plan.purchase_price : 0
    const affordabilityScore = plan.affordability_score || 5
    
    if (debtRatio > 0.8 || affordabilityScore < 3) return 'high'
    if (debtRatio > 0.6 || affordabilityScore < 6) return 'medium'
    return 'low'
  }

  const calculatePropertyRiskLevel = (property: any): Investment['riskLevel'] => {
    const priceRange = property.listed_price || 0
    const legalStatus = property.legal_status
    
    if (priceRange > 10000000000 || legalStatus === 'disputed') return 'high'
    if (priceRange > 5000000000 || legalStatus === 'pending') return 'medium'
    return 'low'
  }

  const calculateAnnualizedReturnFromData = (totalReturn: number, totalInvestment: number, purchaseDate: Date): number => {
    const monthsHeld = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsHeld <= 0 || totalInvestment === 0) return 0
    
    const returnRatio = totalReturn / totalInvestment
    return (Math.pow(1 + returnRatio, 12 / monthsHeld) - 1) * 100
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