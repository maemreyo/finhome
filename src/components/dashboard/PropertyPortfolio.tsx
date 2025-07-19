// src/components/dashboard/PropertyPortfolio.tsx
// Property portfolio widget showing saved properties and investment tracking with i18n support

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  MapPin, 
  DollarSign,
  Percent,
  Plus,
  ArrowRight,
  Star,
  Eye
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { DashboardService } from '@/lib/services/dashboardService'

interface Property {
  id: string
  name: string
  type: 'apartment' | 'house' | 'villa' | 'townhouse'
  location: string
  price: number
  pricePerSqm?: number
  area?: number
  bedrooms?: number
  status: 'interested' | 'planning' | 'negotiating' | 'purchased'
  roiProjection?: number
  priceChange?: number
  lastViewed: Date
  isFavorited: boolean
  imageUrl?: string
  notes?: string
}

interface PropertyPortfolioProps {
  userId?: string
  className?: string
}

export const PropertyPortfolio: React.FC<PropertyPortfolioProps> = ({
  userId,
  className
}) => {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'favorites' | 'planning'>('all')
  const t = useTranslations('Dashboard.PropertyPortfolio')

  // Load real property data from database
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      
      try {
        if (userId) {
          // Load both user's interested properties and financial plans
          const [interestedProperties, plans] = await Promise.all([
            DashboardService.getUserInterestedProperties(userId),
            DashboardService.getFinancialPlans(userId)
          ])
          
          const realProperties: Property[] = []
          
          // Add properties from database
          interestedProperties.forEach(property => {
            realProperties.push({
              id: property.id,
              name: property.title || property.property_name || 'Unknown Property',
              type: (property.property_type as Property['type']) || 'apartment',
              location: `${property.district}, ${property.city}`,
              price: property.list_price || property.listed_price || 0,
              pricePerSqm: property.price_per_sqm || undefined,
              area: property.area_sqm || property.total_area || undefined,
              bedrooms: property.bedrooms || undefined,
              status: 'interested', // All fetched properties are considered interested
              roiProjection: 8.0, // Default ROI projection
              priceChange: Math.random() * 6 - 2, // Random price change for demo
              lastViewed: new Date(property.updated_at || property.created_at),
              isFavorited: Math.random() > 0.5, // Random favorited status for demo
            })
          })
          
          // Add properties from financial plans (for purchased/planning status)
          plans.forEach(plan => {
            if (plan.status === 'active' || plan.status === 'completed') {
              const customData = plan.custom_property_data as any || {}
              const propertyType = plan.target_property_type || 'apartment'
              const purchasePrice = plan.purchase_price || 0
              const area = customData.area || Math.floor(purchasePrice / 45000000)
              const bedrooms = customData.bedrooms || (area > 100 ? 3 : area > 70 ? 2 : 1)
              
              realProperties.push({
                id: `plan-${plan.id}`,
                name: plan.plan_name,
                type: propertyType as Property['type'],
                location: plan.target_location || 'TP.HCM',
                price: purchasePrice,
                pricePerSqm: area ? Math.floor(purchasePrice / area) : 45000000,
                area: area,
                bedrooms: bedrooms,
                status: plan.status === 'active' ? 'planning' : 'purchased',
                roiProjection: plan.expected_roi || 8.0,
                priceChange: Math.random() * 6 - 2,
                lastViewed: new Date(plan.updated_at),
                isFavorited: plan.status === 'active',
              })
            }
          })
          
          setProperties(realProperties)
        } else {
          // Fallback to demo data for unauthenticated users
          const demoProperties: Property[] = [
            {
              id: '1',
              name: 'Căn hộ Vinhomes Central Park',
              type: 'apartment',
              location: 'Quận Bình Thạnh, TP.HCM',
              price: 3200000000,
              pricePerSqm: 45000000,
              area: 71,
              bedrooms: 2,
              status: 'planning',
              roiProjection: 8.5,
              priceChange: 2.3,
              lastViewed: new Date(Date.now() - 2 * 60 * 60 * 1000),
              isFavorited: true
            },
            {
              id: '2',
              name: 'Nhà phố Thảo Điền',
              type: 'townhouse',
              location: 'Quận 2, TP.HCM',
              price: 5800000000,
              pricePerSqm: 85000000,
              area: 68,
              bedrooms: 3,
              status: 'interested',
              roiProjection: 7.2,
              priceChange: -1.5,
              lastViewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              isFavorited: true
            },
            {
              id: '3',
              name: 'Biệt thự Phú Mỹ Hưng',
              type: 'villa',
              location: 'Quận 7, TP.HCM',
              price: 12500000000,
              pricePerSqm: 62500000,
              area: 200,
              bedrooms: 4,
              status: 'interested',
              roiProjection: 6.8,
              priceChange: 3.7,
              lastViewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              isFavorited: false
            }
          ]
          
          setProperties(demoProperties)
        }
      } catch (error) {
        console.error('Error loading property portfolio:', error)
        
        // Fallback to empty properties on error
        setProperties([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [userId])

  const getTypeLabel = (type: Property['type']) => {
    return t(`propertyTypes.${type}`)
  }

  const getStatusLabel = (status: Property['status']) => {
    return t(`status.${status}`)
  }

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'interested': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'planning': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'negotiating': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'purchased': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredProperties = properties.filter(property => {
    switch (filter) {
      case 'favorites':
        return property.isFavorited
      case 'planning':
        return property.status === 'planning'
      default:
        return true
    }
  })

  const totalValue = properties.reduce((sum, property) => sum + property.price, 0)
  const avgROI = properties.reduce((sum, property) => sum + (property.roiProjection || 0), 0) / properties.length

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            {t('title')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              {t('all')} ({properties.length})
            </Button>
            <Button
              variant={filter === 'favorites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('favorites')}
            >
              <Heart className="w-3 h-3 mr-1" />
              {t('favorites')} ({properties.filter(p => p.isFavorited).length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">{t('totalValue')}</div>
            <div className="text-lg font-bold text-blue-900">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">{t('averageROI')}</div>
            <div className="text-lg font-bold text-green-900">
              {avgROI.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Property Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm leading-tight">
                        {property.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {property.isFavorited && (
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      )}
                      <Badge variant="outline" className={getStatusColor(property.status)}>
                        {getStatusLabel(property.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('details.type')}</span>
                        <span className="font-medium">{getTypeLabel(property.type)}</span>
                      </div>
                      {property.area && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('details.area')}</span>
                          <span className="font-medium">{property.area}m²</span>
                        </div>
                      )}
                      {property.bedrooms && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('details.bedrooms')}</span>
                          <span className="font-medium">{property.bedrooms}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('details.price')}</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(property.price)}
                        </span>
                      </div>
                      {property.pricePerSqm && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('details.pricePerSqm')}</span>
                          <span className="font-medium">
                            {formatCurrency(property.pricePerSqm)}
                          </span>
                        </div>
                      )}
                      {property.roiProjection && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('details.expectedROI')}</span>
                          <span className="font-medium text-green-600">
                            {property.roiProjection}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Change & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {property.priceChange && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs",
                          property.priceChange > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {property.priceChange > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{Math.abs(property.priceChange)}%</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {t('lastViewed')} {new Date(property.lastViewed).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        {t('actions.view')}
                      </Button>
                      {property.status === 'interested' && (
                        <Button size="sm">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {t('actions.createPlan')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredProperties.length === 0 && (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'favorites' ? t('empty.noFavorites') : t('empty.noProperties')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'favorites' 
                  ? t('empty.favoriteDescription')
                  : t('empty.description')
                }
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('actions.findProperties')}
              </Button>
            </div>
          )}

          {properties.length > 0 && (
            <div className="pt-4 border-t">
              <Button variant="ghost" size="sm" className="w-full justify-center">
                {t('actions.viewAll')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyPortfolio