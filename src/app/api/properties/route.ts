// src/app/api/properties/route.ts
// API routes for property search and management

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { PropertySearchFilters } from '@/types/property'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)

    // Parse search parameters
    const filters: PropertySearchFilters = {
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      propertyType: searchParams.get('propertyType')?.split(',') as any[],
      city: searchParams.get('city')?.split(','),
      district: searchParams.get('district')?.split(','),
      minArea: searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined,
      maxArea: searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined,
      bedrooms: searchParams.get('bedrooms')?.split(',').map(Number),
      bathrooms: searchParams.get('bathrooms')?.split(',').map(Number),
      legalStatus: searchParams.get('legalStatus')?.split(',') as any[],
      sortBy: searchParams.get('sortBy') as any || 'newest'
    }

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20

    // Build query
    let query = supabase
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
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Get aggregations for the response
    const aggregations = await getPropertyAggregations(supabase)

    return NextResponse.json({
      properties: properties || [],
      total: count || 0,
      page,
      limit,
      filters,
      aggregations
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const {
      property_name,
      property_type,
      listed_price,
      ...otherData
    } = body

    if (!property_name || !property_type || !listed_price) {
      return NextResponse.json(
        { error: 'Missing required fields: property_name, property_type, listed_price' },
        { status: 400 }
      )
    }

    // Calculate price per sqm if area is provided
    const propertyData = {
      ...otherData,
      property_name,
      property_type,
      listed_price,
      price_per_sqm: otherData.area_sqm ? listed_price / otherData.area_sqm : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: property, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      )
    }

    return NextResponse.json(property, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get property aggregations
async function getPropertyAggregations(supabase: any) {
  try {
    // Get price range
    const { data: priceData } = await supabase
      .from('properties')
      .select('listed_price')
      .order('listed_price')

    // Get area range  
    const { data: areaData } = await supabase
      .from('properties')
      .select('area_sqm')
      .not('area_sqm', 'is', null)
      .order('area_sqm')

    // Get property type counts
    const { data: typeData } = await supabase
      .from('properties')
      .select('property_type')

    // Get city counts
    const { data: cityData } = await supabase
      .from('properties')
      .select('city')
      .not('city', 'is', null)

    // Get district counts
    const { data: districtData } = await supabase
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

    const aggregateByField = (data: any[], field: string) => {
      const counts = data.reduce((acc, item) => {
        const value = item[field]
        if (value) {
          acc[value] = (acc[value] || 0) + 1
        }
        return acc
      }, {})

      return Object.entries(counts).map(([key, count]) => ({
        [field === 'property_type' ? 'type' : field === 'city' ? 'city' : 'district']: key,
        count: count as number
      }))
    }

    const propertyTypes = aggregateByField(typeData || [], 'property_type')
    const cities = aggregateByField(cityData || [], 'city')
    const districts = aggregateByField(districtData || [], 'district')

    return {
      priceRange,
      areaRange,
      propertyTypes,
      cities,
      districts
    }

  } catch (error) {
    console.error('Aggregation error:', error)
    return {
      priceRange: { min: 0, max: 0 },
      areaRange: { min: 0, max: 0 },
      propertyTypes: [],
      cities: [],
      districts: []
    }
  }
}