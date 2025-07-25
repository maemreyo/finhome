// src/hooks/useProperties.ts
// React hooks for property management

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/src/types/supabase'
import { toast } from 'sonner'

type Property = Database['public']['Tables']['properties']['Row']
type PropertyInsert = Database['public']['Tables']['properties']['Insert']
type PropertyUpdate = Database['public']['Tables']['properties']['Update']

interface UsePropertiesReturn {
  properties: Property[]
  isLoading: boolean
  error: string | null
  total: number
  createProperty: (property: PropertyInsert) => Promise<Property>
  updateProperty: (id: string, updates: PropertyUpdate) => Promise<Property>
  deleteProperty: (id: string) => Promise<void>
  searchProperties: (filters: PropertyFilters) => Promise<void>
  refreshProperties: () => Promise<void>
}

interface PropertyFilters {
  search?: string
  property_type?: string
  status?: string
  city?: string
  district?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export function useProperties(initialFilters: PropertyFilters = {}): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState(initialFilters)

  const supabase = createClient()

  const loadProperties = useCallback(async (searchFilters: PropertyFilters = filters) => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })

      // Apply filters
      if (searchFilters.search) {
        query = query.or(`title.ilike.%${searchFilters.search}%,district.ilike.%${searchFilters.search}%,city.ilike.%${searchFilters.search}%`)
      }

      if (searchFilters.property_type && searchFilters.property_type !== 'all') {
        query = query.eq('property_type', searchFilters.property_type as any)
      }

      if (searchFilters.status && searchFilters.status !== 'all') {
        query = query.eq('status', searchFilters.status as any)
      }

      if (searchFilters.city) {
        query = query.eq('city', searchFilters.city)
      }

      if (searchFilters.district) {
        query = query.eq('district', searchFilters.district)
      }

      if (searchFilters.minPrice) {
        query = query.gte('list_price', searchFilters.minPrice)
      }

      if (searchFilters.maxPrice) {
        query = query.lte('list_price', searchFilters.maxPrice)
      }

      // Pagination
      const page = searchFilters.page || 1
      const limit = searchFilters.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      // Sorting
      query = query.order('created_at', { ascending: false })

      const { data, error: queryError, count } = await query

      if (queryError) {
        throw queryError
      }

      setProperties(data || [])
      setTotal(count || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load properties'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters])

  const searchProperties = useCallback(async (searchFilters: PropertyFilters) => {
    setFilters(searchFilters)
    await loadProperties(searchFilters)
  }, [loadProperties])

  const refreshProperties = useCallback(async () => {
    await loadProperties()
  }, [loadProperties])

  const createProperty = useCallback(async (property: any): Promise<Property> => {
    try {
      // Separate images from property data
      const { images, ...propertyData } = property
      
      // Create property with images
      const propertyWithImages = {
        ...propertyData,
        images: images || []
      }

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyWithImages])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Add to local state
      setProperties(prev => [data, ...prev])
      setTotal(prev => prev + 1)
      
      toast.success('Property created successfully')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create property'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [supabase])

  const updateProperty = useCallback(async (id: string, updates: PropertyUpdate): Promise<Property> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state
      setProperties(prev => prev.map(prop => 
        prop.id === id ? data : prop
      ))
      
      toast.success('Property updated successfully')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [supabase])

  const deleteProperty = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Remove from local state
      setProperties(prev => prev.filter(prop => prop.id !== id))
      setTotal(prev => prev - 1)
      
      toast.success('Property deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete property'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [supabase])

  // Load properties on mount
  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  return {
    properties,
    isLoading,
    error,
    total,
    createProperty,
    updateProperty,
    deleteProperty,
    searchProperties,
    refreshProperties
  }
}

// Hook for admin property management with additional stats
export function useAdminProperties() {
  const propertiesHook = useProperties()
  const [stats, setStats] = useState({
    totalProperties: 0,
    forSale: 0,
    sold: 0,
    featured: 0,
    totalViews: 0
  })

  const supabase = createClient()

  const loadStats = useCallback(async () => {
    try {
      // Get property counts by status
      const { data: statusCounts } = await supabase
        .from('properties')
        .select('status')

      // Get featured count
      const { count: featuredCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)

      // Get total views
      const { data: viewsData } = await supabase
        .from('properties')
        .select('view_count')

      const totalViews = viewsData?.reduce((sum, prop) => sum + (prop.view_count || 0), 0) || 0

      if (statusCounts) {
        const forSale = statusCounts.filter(p => p.status === 'for_sale').length
        const sold = statusCounts.filter(p => p.status === 'sold').length
        
        setStats({
          totalProperties: statusCounts.length,
          forSale,
          sold,
          featured: featuredCount || 0,
          totalViews
        })
      }
    } catch (error) {
      console.error('Error loading property stats:', error)
    }
  }, [supabase])

  // Load stats when properties change
  useEffect(() => {
    if (!propertiesHook.isLoading) {
      loadStats()
    }
  }, [propertiesHook.properties, propertiesHook.isLoading, loadStats])

  return {
    ...propertiesHook,
    stats,
    loadStats
  }
}