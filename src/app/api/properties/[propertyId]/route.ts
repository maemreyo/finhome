// src/app/api/properties/[propertyId]/route.ts
// API routes for individual property operations

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/src/types/supabase'

interface RouteParams {
  params: Promise<{
    propertyId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const { propertyId } = await params

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Get property details
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch property' },
        { status: 500 }
      )
    }

    // Enhance property with calculated fields
    const enhancedProperty = {
      ...property,
      monthlyMortgageEstimate: calculateMonthlyMortgage(property),
      totalCostEstimate: calculateTotalCost(property),
      roiProjection: calculateROI(property),
      rentalYield: calculateRentalYield(property),
      appreciationRate: calculateAppreciationRate(property),
      liquidityScore: calculateLiquidityScore(property),
      riskScore: calculateRiskScore(property),
      neighborhood: await getNeighborhoodData(property),
      marketTrends: await getMarketTrends(property)
    }

    return NextResponse.json(enhancedProperty)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { propertyId } = await params
    const body = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Update property
    const updateData = {
      ...body,
      price_per_sqm: body.area_sqm && body.listed_price ? 
        body.listed_price / body.area_sqm : undefined,
      updated_at: new Date().toISOString()
    }

    const { data: property, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      )
    }

    return NextResponse.json(property)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { propertyId } = await params

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Delete property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper calculation functions
function calculateMonthlyMortgage(property: Database['public']['Tables']['properties']['Row']): number {
  const loanAmount = (property.listed_price || 0) * 0.8 // Assume 20% down payment
  const monthlyRate = 0.085 / 12 // Assume 8.5% annual rate
  const termMonths = 20 * 12 // 20 years

  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
         (Math.pow(1 + monthlyRate, termMonths) - 1)
}

function calculateTotalCost(property: Database['public']['Tables']['properties']['Row']): number {
  return (property.listed_price || 0) * 1.1 // Add 10% for fees and taxes
}

function calculateROI(property: Database['public']['Tables']['properties']['Row']): number {
  // Simplified ROI calculation for rental properties
  const monthlyRent = (property.listed_price || 0) * 0.006 // Assume 0.6% monthly rent
  const annualRent = monthlyRent * 12
  return (annualRent / (property.listed_price || 1)) * 100
}

function calculateRentalYield(property: Database['public']['Tables']['properties']['Row']): number {
  const monthlyRent = (property.listed_price || 0) * 0.006
  const annualRent = monthlyRent * 12
  return (annualRent / (property.listed_price || 1)) * 100
}

function calculateAppreciationRate(property: Database['public']['Tables']['properties']['Row']): number {
  // Mock appreciation rate based on location and property type
  const baseRate = 6.5
  if (property.city === 'Ho Chi Minh') return baseRate + 1.5
  if (property.city === 'Hanoi') return baseRate + 1.0
  return baseRate
}

function calculateLiquidityScore(property: Database['public']['Tables']['properties']['Row']): number {
  let score = 50

  // Location factor
  if (property.city === 'Ho Chi Minh' || property.city === 'Hanoi') score += 20

  // Property type factor
  if (property.property_type === 'apartment') score += 15
  if (property.property_type === 'house') score += 10

  // Legal status factor
  if (property.legal_status === 'red_book') score += 15

  return Math.min(score, 100)
}

function calculateRiskScore(property: Database['public']['Tables']['properties']['Row']): number {
  let risk = 20 // Base low risk

  // Legal status risk
  if (property.legal_status === 'disputed') risk += 40
  if (property.legal_status === 'pending') risk += 20

  // Price risk (very high prices are riskier)
  if ((property.listed_price || 0) > 10000000000) risk += 20

  return Math.min(risk, 100)
}

async function getNeighborhoodData(property: Database['public']['Tables']['properties']['Row']) {
  // In a real implementation, this would fetch from external APIs
  return {
    averagePrice: (property.listed_price || 0) * 0.95,
    pricePerSqm: property.price_per_sqm || 50000000,
    priceGrowth12m: 8.5,
    demographics: {
      averageAge: 35,
      incomeLevel: 'medium' as const,
      familyFriendly: true
    },
    infrastructure: {
      schoolRating: 8,
      hospitalDistance: 2.5,
      transportScore: 7,
      shoppingScore: 8
    },
    amenities: {
      nearbySchools: 3,
      nearbyHospitals: 2,
      nearbyMalls: 1,
      parkDistance: 0.8
    },
    safety: {
      crimeRate: 'low' as const,
      policeStations: 1,
      streetLighting: true
    }
  }
}

async function getMarketTrends(property: Database['public']['Tables']['properties']['Row']) {
  // Mock market trends data
  return {
    priceHistory: [
      { date: '2024-01-01', averagePrice: (property.listed_price || 0) * 0.9, volume: 25 },
      { date: '2024-06-01', averagePrice: (property.listed_price || 0) * 0.95, volume: 30 },
      { date: '2024-12-01', averagePrice: property.listed_price || 0, volume: 28 }
    ],
    supplyDemand: {
      supply: 45,
      demand: 60,
      daysOnMarket: 35
    },
    forecast: {
      priceGrowthNext12m: 7.2,
      demandTrend: 'increasing' as const,
      supplyTrend: 'stable' as const
    }
  }
}