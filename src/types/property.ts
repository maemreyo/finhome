// src/types/property.ts
// Type definitions for property management system

import { Database } from '@/lib/supabase/types'

export type PropertyRow = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export interface PropertySearchFilters {
  minPrice?: number
  maxPrice?: number
  propertyType?: PropertyRow['property_type'][]
  city?: string[]
  district?: string[]
  minArea?: number
  maxArea?: number
  bedrooms?: number[]
  bathrooms?: number[]
  legalStatus?: PropertyRow['legal_status'][]
  amenities?: string[]
  sortBy?: 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'newest' | 'oldest'
  pricePerSqm?: {
    min?: number
    max?: number
  }
}

export interface PropertySearchResults {
  properties: ExtendedProperty[]
  total: number
  page: number
  limit: number
  filters: PropertySearchFilters
  aggregations: {
    priceRange: { min: number; max: number }
    areaRange: { min: number; max: number }
    propertyTypes: { type: string; count: number }[]
    cities: { city: string; count: number }[]
    districts: { district: string; count: number }[]
  }
}

export interface ExtendedProperty extends PropertyRow {
  // Calculated fields
  monthlyMortgageEstimate?: number
  totalCostEstimate?: number
  roiProjection?: number
  affinityScore?: number
  distanceToUserLocation?: number
  
  // Related data
  neighborhood?: NeighborhoodData
  marketTrends?: MarketTrends
  financialPlanCount?: number
  isFavorited?: boolean
  userNotes?: string
  
  // Investment metrics
  rentalYield?: number
  appreciationRate?: number
  liquidityScore?: number
  riskScore?: number
}

export interface NeighborhoodData {
  averagePrice: number
  pricePerSqm: number
  priceGrowth12m: number
  demographics: {
    averageAge: number
    incomeLevel: 'low' | 'medium' | 'high' | 'premium'
    familyFriendly: boolean
  }
  infrastructure: {
    schoolRating: number
    hospitalDistance: number
    transportScore: number
    shoppingScore: number
  }
  amenities: {
    nearbySchools: number
    nearbyHospitals: number
    nearbyMalls: number
    parkDistance: number
  }
  safety: {
    crimeRate: 'low' | 'medium' | 'high'
    policeStations: number
    streetLighting: boolean
  }
}

export interface MarketTrends {
  priceHistory: Array<{
    date: string
    averagePrice: number
    volume: number
  }>
  supplyDemand: {
    supply: number
    demand: number
    daysOnMarket: number
  }
  forecast: {
    priceGrowthNext12m: number
    demandTrend: 'increasing' | 'stable' | 'decreasing'
    supplyTrend: 'increasing' | 'stable' | 'decreasing'
  }
}

export interface PropertyComparison {
  properties: ExtendedProperty[]
  comparisonMatrix: {
    property: ExtendedProperty
    metrics: {
      pricePerSqm: number
      totalCost: number
      monthlyPayment: number
      roiProjection: number
      neighborhoodScore: number
      liquidityScore: number
      riskScore: number
    }
  }[]
  recommendation: {
    bestValue: string
    bestInvestment: string
    bestLocation: string
    summary: string
  }
}

export interface PropertyFavorite {
  id: string
  userId: string
  propertyId: string
  addedAt: Date
  notes?: string
  tags?: string[]
  alertSettings?: {
    priceChange: boolean
    statusChange: boolean
    marketUpdates: boolean
  }
}

export interface PropertyAlert {
  id: string
  userId: string
  alertType: 'price_drop' | 'new_listing' | 'market_update' | 'interest_rate_change'
  filters: PropertySearchFilters
  isActive: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  lastTriggered?: Date
  triggerCount: number
  createdAt: Date
}

export interface PropertyValuation {
  propertyId: string
  estimatedValue: number
  estimatedValueRange: {
    low: number
    high: number
  }
  confidence: number
  lastUpdated: Date
  methodology: 'automated' | 'professional' | 'user_input'
  comparableProperties: {
    id: string
    soldPrice: number
    soldDate: Date
    similarity: number
  }[]
  factors: {
    location: number
    condition: number
    amenities: number
    market: number
  }
}

// Vietnamese property-specific types
export interface VietnamesePropertyTypes {
  apartment: 'Căn hộ'
  house: 'Nhà riêng'
  villa: 'Biệt thự'
  townhouse: 'Nhà phố'
  land: 'Đất'
  commercial: 'Thương mại'
}

export interface VietnameseLegalStatus {
  red_book: 'Sổ đỏ'
  pink_book: 'Sổ hồng'
  pending: 'Đang chờ'
  disputed: 'Tranh chấp'
}

export interface VietnamCities {
  'Ho Chi Minh': 'Thành phố Hồ Chí Minh'
  'Hanoi': 'Hà Nội'
  'Da Nang': 'Đà Nẵng'
  'Can Tho': 'Cần Thơ'
  'Hai Phong': 'Hải Phòng'
  'Bien Hoa': 'Biên Hòa'
  'Hue': 'Huế'
  'Nha Trang': 'Nha Trang'
  'Buon Ma Thuot': 'Buôn Ma Thuột'
  'Quy Nhon': 'Quy Nhon'
}

export interface VietnamDistricts {
  // Ho Chi Minh City districts
  'District 1': 'Quận 1'
  'District 2': 'Quận 2'
  'District 3': 'Quận 3'
  'District 4': 'Quận 4'
  'District 5': 'Quận 5'
  'District 6': 'Quận 6'
  'District 7': 'Quận 7'
  'District 8': 'Quận 8'
  'District 9': 'Quận 9'
  'District 10': 'Quận 10'
  'District 11': 'Quận 11'
  'District 12': 'Quận 12'
  'Binh Thanh': 'Bình Thạnh'
  'Go Vap': 'Gò Vấp'
  'Phu Nhuan': 'Phú Nhuận'
  'Tan Binh': 'Tân Bình'
  'Tan Phu': 'Tân Phú'
  'Thu Duc': 'Thủ Đức'
  // Add more as needed
}

export const PROPERTY_TYPE_LABELS: VietnamesePropertyTypes = {
  apartment: 'Căn hộ',
  house: 'Nhà riêng',
  villa: 'Biệt thự',
  townhouse: 'Nhà phố',
  land: 'Đất',
  commercial: 'Thương mại'
}

export const LEGAL_STATUS_LABELS: VietnameseLegalStatus = {
  red_book: 'Sổ đỏ',
  pink_book: 'Sổ hồng',
  pending: 'Đang chờ',
  disputed: 'Tranh chấp'
}

export const CITY_LABELS: VietnamCities = {
  'Ho Chi Minh': 'Thành phố Hồ Chí Minh',
  'Hanoi': 'Hà Nội',
  'Da Nang': 'Đà Nẵng',
  'Can Tho': 'Cần Thơ',
  'Hai Phong': 'Hải Phòng',
  'Bien Hoa': 'Biên Hòa',
  'Hue': 'Huế',
  'Nha Trang': 'Nha Trang',
  'Buon Ma Thuot': 'Buôn Ma Thuột',
  'Quy Nhon': 'Quy Nhon'
}

// Common amenities in Vietnamese properties
export const COMMON_AMENITIES = [
  'Hồ bơi', // Swimming pool
  'Gym', // Gym
  'Chỗ đỗ xe', // Parking
  'Bảo vệ 24/7', // 24/7 security
  'Thang máy', // Elevator
  'Sân vườn', // Garden
  'Ban công', // Balcony
  'Điều hòa', // Air conditioning
  'Nội thất', // Furnished
  'Gần trường học', // Near school
  'Gần bệnh viện', // Near hospital
  'Gần siêu thị', // Near supermarket
  'Gần công viên', // Near park
  'View đẹp', // Nice view
  'Tầng cao', // High floor
  'Có cầu thang', // Has stairs
  'Có gác lửng', // Has mezzanine
  'Gần phố cổ', // Near old quarter
  'Gần trung tâm', // Near city center
  'Yên tĩnh' // Quiet
] as const

export type VietnameseAmenity = typeof COMMON_AMENITIES[number]