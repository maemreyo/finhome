// src/components/dashboard/PropertyPortfolio.tsx
// Property portfolio widget showing saved properties and investment tracking

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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

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

  // Mock data - in real app, this would fetch from API
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockProperties: Property[] = [
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
      
      setProperties(mockProperties)
      setIsLoading(false)
    }

    loadProperties()
  }, [userId])

  const getTypeLabel = (type: Property['type']) => {
    switch (type) {
      case 'apartment': return 'Căn hộ'
      case 'house': return 'Nhà riêng'
      case 'villa': return 'Biệt thự'
      case 'townhouse': return 'Nhà phố'
      default: return type
    }
  }

  const getStatusLabel = (status: Property['status']) => {
    switch (status) {
      case 'interested': return 'Quan tâm'
      case 'planning': return 'Đang lập kế hoạch'
      case 'negotiating': return 'Đang thương lượng'
      case 'purchased': return 'Đã mua'
      default: return status
    }
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
          <CardTitle>Danh Mục Bất Động Sản</CardTitle>
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
            Danh Mục Bất Động Sản
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tất cả ({properties.length})
            </Button>
            <Button
              variant={filter === 'favorites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('favorites')}
            >
              <Heart className="w-3 h-3 mr-1" />
              Yêu thích ({properties.filter(p => p.isFavorited).length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Tổng Giá Trị</div>
            <div className="text-lg font-bold text-blue-900">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">ROI Trung Bình</div>
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
                        <span className="text-muted-foreground">Loại:</span>
                        <span className="font-medium">{getTypeLabel(property.type)}</span>
                      </div>
                      {property.area && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diện tích:</span>
                          <span className="font-medium">{property.area}m²</span>
                        </div>
                      )}
                      {property.bedrooms && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phòng ngủ:</span>
                          <span className="font-medium">{property.bedrooms}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Giá:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(property.price)}
                        </span>
                      </div>
                      {property.pricePerSqm && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá/m²:</span>
                          <span className="font-medium">
                            {formatCurrency(property.pricePerSqm)}
                          </span>
                        </div>
                      )}
                      {property.roiProjection && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ROI dự kiến:</span>
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
                        Xem {new Date(property.lastViewed).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        Xem
                      </Button>
                      {property.status === 'interested' && (
                        <Button size="sm">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Lập Kế Hoạch
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
                {filter === 'favorites' ? 'Chưa có bất động sản yêu thích' : 'Chưa có bất động sản nào'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'favorites' 
                  ? 'Thêm bất động sản vào danh sách yêu thích để theo dõi'
                  : 'Bắt đầu tìm kiếm bất động sản phù hợp với bạn'
                }
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tìm Bất Động Sản
              </Button>
            </div>
          )}

          {properties.length > 0 && (
            <div className="pt-4 border-t">
              <Button variant="ghost" size="sm" className="w-full justify-center">
                Xem Tất Cả Bất Động Sản
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