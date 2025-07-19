// src/lib/services/propertyService.ts
// Service for property search, management, and related operations

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import {
  PropertySearchFilters,
  PropertySearchResults,
  ExtendedProperty,
  PropertyFavorite,
  PropertyAlert,
  PropertyValuation,
  PropertyComparison,
  NeighborhoodData,
  MarketTrends
} from '@/types/property'

type SupabaseClient = ReturnType<typeof createClient>

export class PropertyService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  // Property Search and Filtering
  async searchProperties(
    filters: PropertySearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<PropertySearchResults> {
    let query = this.supabase
      .from('properties')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.minPrice) {
      query = query.gte('listed_price', filters.minPrice)
    }
    if (filters.maxPrice) {
      query = query.lte('listed_price', filters.maxPrice)
    }
    if (filters.propertyType?.length) {
      query = query.in('property_type', filters.propertyType)
    }
    if (filters.city?.length) {
      query = query.in('city', filters.city)
    }
    if (filters.district?.length) {
      query = query.in('district', filters.district)
    }
    if (filters.minArea) {
      query = query.gte('area_sqm', filters.minArea)
    }
    if (filters.maxArea) {
      query = query.lte('area_sqm', filters.maxArea)
    }
    if (filters.bedrooms?.length) {
      query = query.in('bedrooms', filters.bedrooms)
    }
    if (filters.bathrooms?.length) {
      query = query.in('bathrooms', filters.bathrooms)
    }
    if (filters.legalStatus?.length) {
      query = query.in('legal_status', filters.legalStatus)
    }
    if (filters.pricePerSqm?.min) {
      query = query.gte('price_per_sqm', filters.pricePerSqm.min)
    }
    if (filters.pricePerSqm?.max) {
      query = query.lte('price_per_sqm', filters.pricePerSqm.max)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('listed_price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('listed_price', { ascending: false })
        break
      case 'area_asc':
        query = query.order('area_sqm', { ascending: true })
        break
      case 'area_desc':
        query = query.order('area_sqm', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: properties, error, count } = await query

    if (error) {
      throw new Error(`Error searching properties: ${error.message}`)
    }

    // Get aggregations for filters
    const aggregations = await this.getSearchAggregations(filters)

    // Enhance properties with additional data
    const extendedProperties = await this.enhanceProperties(properties || [])

    return {
      properties: extendedProperties,
      total: count || 0,
      page,
      limit,
      filters,
      aggregations
    }
  }

  // Get property by ID with enhanced data
  async getPropertyById(id: string, userId?: string): Promise<ExtendedProperty | null> {
    const { data: property, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !property) {
      return null
    }

    const [enhanced] = await this.enhanceProperties([property], userId)
    return enhanced
  }

  // Property Favorites Management
  async addToFavorites(propertyId: string, notes?: string): Promise<PropertyFavorite> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const favorite: Omit<PropertyFavorite, 'id'> = {
      userId: user.id,
      propertyId,
      addedAt: new Date(),
      notes
    }

    // Store in localStorage for now (in production, use a favorites table)
    const favorites = this.getFavoritesFromStorage(user.id)
    const newFavorite = { ...favorite, id: crypto.randomUUID() }
    favorites.push(newFavorite)
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites))

    return newFavorite
  }

  async removeFromFavorites(propertyId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const favorites = this.getFavoritesFromStorage(user.id)
    const filtered = favorites.filter(f => f.propertyId !== propertyId)
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(filtered))
  }

  async getFavorites(userId?: string): Promise<PropertyFavorite[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    const targetUserId = userId || user?.id
    if (!targetUserId) return []

    return this.getFavoritesFromStorage(targetUserId)
  }

  async isFavorited(propertyId: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return false

    const favorites = this.getFavoritesFromStorage(user.id)
    return favorites.some(f => f.propertyId === propertyId)
  }

  // Property Comparison
  async compareProperties(propertyIds: string[]): Promise<PropertyComparison> {
    if (propertyIds.length < 2 || propertyIds.length > 5) {
      throw new Error('Can compare between 2 and 5 properties')
    }

    const properties = await Promise.all(
      propertyIds.map(id => this.getPropertyById(id))
    )

    const validProperties = properties.filter(p => p !== null) as ExtendedProperty[]

    const comparisonMatrix = validProperties.map(property => ({
      property,
      metrics: {
        pricePerSqm: property.price_per_sqm || 0,
        totalCost: this.calculateTotalCost(property),
        monthlyPayment: property.monthlyMortgageEstimate || 0,
        roiProjection: property.roiProjection || 0,
        neighborhoodScore: this.calculateNeighborhoodScore(property.neighborhood),
        liquidityScore: property.liquidityScore || 0,
        riskScore: property.riskScore || 0
      }
    }))

    const recommendation = this.generateRecommendation(comparisonMatrix)

    return {
      properties: validProperties,
      comparisonMatrix,
      recommendation
    }
  }

  // Property Valuation
  async getPropertyValuation(propertyId: string): Promise<PropertyValuation | null> {
    const property = await this.getPropertyById(propertyId)
    if (!property) return null

    // In a real implementation, this would call an external valuation API
    const comparable = await this.findComparableProperties(property)
    
    const estimatedValue = this.calculateEstimatedValue(property, comparable)
    const confidence = this.calculateValuationConfidence(property, comparable)

    return {
      propertyId,
      estimatedValue,
      estimatedValueRange: {
        low: estimatedValue * 0.9,
        high: estimatedValue * 1.1
      },
      confidence,
      lastUpdated: new Date(),
      methodology: 'automated',
      comparableProperties: comparable.map(p => ({
        id: p.id,
        soldPrice: p.listed_price || 0,
        soldDate: new Date(p.created_at),
        similarity: this.calculateSimilarity(property, p)
      })),
      factors: {
        location: 0.8,
        condition: 0.7,
        amenities: 0.6,
        market: 0.9
      }
    }
  }

  // Private helper methods
  private async enhanceProperties(
    properties: Database['public']['Tables']['properties']['Row'][],
    userId?: string
  ): Promise<ExtendedProperty[]> {
    return Promise.all(
      properties.map(async (property) => {
        const enhanced: ExtendedProperty = {
          ...property,
          monthlyMortgageEstimate: this.calculateMonthlyMortgage(property),
          totalCostEstimate: this.calculateTotalCost(property),
          roiProjection: this.calculateROI(property),
          affinityScore: this.calculateAffinityScore(property),
          neighborhood: await this.getNeighborhoodData(property),
          marketTrends: await this.getMarketTrends(property),
          isFavorited: userId ? await this.isFavorited(property.id) : false,
          rentalYield: this.calculateRentalYield(property),
          appreciationRate: this.calculateAppreciationRate(property),
          liquidityScore: this.calculateLiquidityScore(property),
          riskScore: this.calculateRiskScore(property)
        }
        return enhanced
      })
    )
  }

  private async getSearchAggregations(filters: PropertySearchFilters) {
    // Get price range
    const { data: priceData } = await this.supabase
      .from('properties')
      .select('listed_price')
      .not('listed_price', 'is', null)
      .order('listed_price')

    // Get area range
    const { data: areaData } = await this.supabase
      .from('properties')
      .select('area_sqm')
      .not('area_sqm', 'is', null)
      .order('area_sqm')

    // Get property type counts
    const { data: typeData } = await this.supabase
      .from('properties')
      .select('property_type')

    // Get city counts
    const { data: cityData } = await this.supabase
      .from('properties')
      .select('city')
      .not('city', 'is', null)

    // Get district counts
    const { data: districtData } = await this.supabase
      .from('properties')
      .select('district')
      .not('district', 'is', null)

    const priceRange = {
      min: priceData?.[0]?.listed_price || 0,
      max: priceData?.[priceData.length - 1]?.listed_price || 0
    }

    const areaRange = {
      min: areaData?.[0]?.area_sqm || 0,
      max: areaData?.[areaData.length - 1]?.area_sqm || 0
    }

    const propertyTypes = this.aggregateByField(typeData || [], 'property_type') as { type: string; count: number }[]
    const cities = this.aggregateByField(cityData || [], 'city') as { city: string; count: number }[]
    const districts = this.aggregateByField(districtData || [], 'district') as { district: string; count: number }[]

    return {
      priceRange,
      areaRange,
      propertyTypes,
      cities,
      districts
    }
  }

  private aggregateByField(data: any[], field: string): 
    { type: string; count: number }[] | { city: string; count: number }[] | { district: string; count: number }[] {
    const counts = data.reduce((acc, item) => {
      const value = item[field]
      if (value) {
        acc[value] = (acc[value] || 0) + 1
      }
      return acc
    }, {})

    if (field === 'property_type') {
      return Object.entries(counts).map(([key, count]) => ({
        type: key,
        count: count as number
      }))
    } else if (field === 'city') {
      return Object.entries(counts).map(([key, count]) => ({
        city: key,
        count: count as number
      }))
    } else {
      return Object.entries(counts).map(([key, count]) => ({
        district: key,
        count: count as number
      }))
    }
  }

  private getFavoritesFromStorage(userId: string): PropertyFavorite[] {
    try {
      const stored = localStorage.getItem(`favorites_${userId}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Calculation methods
  private calculateMonthlyMortgage(property: Database['public']['Tables']['properties']['Row']): number {
    const loanAmount = (property.listed_price || 0) * 0.8 // Assume 20% down payment
    const monthlyRate = 0.085 / 12 // Assume 8.5% annual rate
    const termMonths = 20 * 12 // 20 years

    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
           (Math.pow(1 + monthlyRate, termMonths) - 1)
  }

  private calculateTotalCost(property: Database['public']['Tables']['properties']['Row']): number {
    return (property.listed_price || 0) * 1.1 // Add 10% for fees and taxes
  }

  private calculateROI(property: Database['public']['Tables']['properties']['Row']): number {
    // Simplified ROI calculation for rental properties
    const monthlyRent = (property.listed_price || 0) * 0.006 // Assume 0.6% monthly rent
    const annualRent = monthlyRent * 12
    return (annualRent / (property.listed_price || 1)) * 100
  }

  private calculateAffinityScore(property: Database['public']['Tables']['properties']['Row']): number {
    // Simplified affinity scoring based on property characteristics
    let score = 50 // Base score

    // Price factor (lower price = higher score)
    if ((property.listed_price || 0) < 2000000000) score += 20
    else if ((property.listed_price || 0) < 5000000000) score += 10

    // Area factor
    if (property.area_sqm && property.area_sqm > 80) score += 15

    // Legal status factor
    if (property.legal_status === 'red_book') score += 15

    return Math.min(score, 100)
  }

  private async getNeighborhoodData(
    property: Database['public']['Tables']['properties']['Row']
  ): Promise<NeighborhoodData | undefined> {
    // In a real implementation, this would fetch from external APIs
    return {
      averagePrice: (property.listed_price || 0) * 0.95,
      pricePerSqm: property.price_per_sqm || 50000000,
      priceGrowth12m: 8.5,
      demographics: {
        averageAge: 35,
        incomeLevel: 'medium',
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
        crimeRate: 'low',
        policeStations: 1,
        streetLighting: true
      }
    }
  }

  private async getMarketTrends(
    property: Database['public']['Tables']['properties']['Row']
  ): Promise<MarketTrends | undefined> {
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
        demandTrend: 'increasing',
        supplyTrend: 'stable'
      }
    }
  }

  private calculateRentalYield(property: Database['public']['Tables']['properties']['Row']): number {
    const monthlyRent = (property.listed_price || 0) * 0.006
    const annualRent = monthlyRent * 12
    return (annualRent / (property.listed_price || 1)) * 100
  }

  private calculateAppreciationRate(property: Database['public']['Tables']['properties']['Row']): number {
    // Mock appreciation rate based on location and property type
    const baseRate = 6.5
    if (property.city === 'Ho Chi Minh') return baseRate + 1.5
    if (property.city === 'Hanoi') return baseRate + 1.0
    return baseRate
  }

  private calculateLiquidityScore(property: Database['public']['Tables']['properties']['Row']): number {
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

  private calculateRiskScore(property: Database['public']['Tables']['properties']['Row']): number {
    let risk = 20 // Base low risk

    // Legal status risk
    if (property.legal_status === 'disputed') risk += 40
    if (property.legal_status === 'pending') risk += 20

    // Price risk (very high prices are riskier)
    if ((property.listed_price || 0) > 10000000000) risk += 20

    return Math.min(risk, 100)
  }

  private calculateNeighborhoodScore(neighborhood?: NeighborhoodData): number {
    if (!neighborhood) return 50

    return (
      (neighborhood.infrastructure.schoolRating * 10) +
      (neighborhood.infrastructure.transportScore * 10) +
      (neighborhood.infrastructure.shoppingScore * 10) +
      (neighborhood.safety.crimeRate === 'low' ? 30 : neighborhood.safety.crimeRate === 'medium' ? 15 : 0)
    ) / 4
  }

  private async findComparableProperties(
    property: Database['public']['Tables']['properties']['Row']
  ): Promise<Database['public']['Tables']['properties']['Row'][]> {
    const { data } = await this.supabase
      .from('properties')
      .select('*')
      .eq('property_type', property.property_type)
      .eq('city', property.city)
      .neq('id', property.id)
      .limit(5)

    return data || []
  }

  private calculateEstimatedValue(
    property: Database['public']['Tables']['properties']['Row'],
    comparables: Database['public']['Tables']['properties']['Row'][]
  ): number {
    if (comparables.length === 0) return property.listed_price || 0

    const avgPrice = comparables.reduce((sum, comp) => sum + (comp.listed_price || 0), 0) / comparables.length
    return ((property.listed_price || 0) + avgPrice) / 2
  }

  private calculateValuationConfidence(
    property: Database['public']['Tables']['properties']['Row'],
    comparables: Database['public']['Tables']['properties']['Row'][]
  ): number {
    const baseConfidence = 0.7
    const comparableBonus = Math.min(comparables.length * 0.05, 0.2)
    return Math.min(baseConfidence + comparableBonus, 0.95)
  }

  private calculateSimilarity(
    property1: Database['public']['Tables']['properties']['Row'],
    property2: Database['public']['Tables']['properties']['Row']
  ): number {
    let similarity = 0

    // Property type match
    if (property1.property_type === property2.property_type) similarity += 30

    // Location match
    if (property1.city === property2.city) similarity += 25
    if (property1.district === property2.district) similarity += 15

    // Size similarity
    if (property1.area_sqm && property2.area_sqm) {
      const sizeDiff = Math.abs(property1.area_sqm - property2.area_sqm) / property1.area_sqm
      similarity += Math.max(0, 20 - sizeDiff * 20)
    }

    // Price similarity
    const priceDiff = Math.abs((property1.listed_price || 0) - (property2.listed_price || 0)) / (property1.listed_price || 1)
    similarity += Math.max(0, 10 - priceDiff * 10)

    return Math.min(similarity, 100)
  }

  private generateRecommendation(comparisonMatrix: PropertyComparison['comparisonMatrix']): PropertyComparison['recommendation'] {
    const bestValue = comparisonMatrix.reduce((best, current) => 
      (current.metrics.pricePerSqm < best.metrics.pricePerSqm) ? current : best
    )

    const bestInvestment = comparisonMatrix.reduce((best, current) =>
      (current.metrics.roiProjection > best.metrics.roiProjection) ? current : best
    )

    const bestLocation = comparisonMatrix.reduce((best, current) =>
      (current.metrics.neighborhoodScore > best.metrics.neighborhoodScore) ? current : best
    )

    return {
      bestValue: bestValue.property.id,
      bestInvestment: bestInvestment.property.id,
      bestLocation: bestLocation.property.id,
      summary: `Dựa trên phân tích so sánh, ${bestValue.property.property_name} có giá trị tốt nhất, ${bestInvestment.property.property_name} có tiềm năng đầu tư cao nhất, và ${bestLocation.property.property_name} có vị trí tốt nhất.`
    }
  }
}

// Export singleton instance
export const propertyService = new PropertyService()