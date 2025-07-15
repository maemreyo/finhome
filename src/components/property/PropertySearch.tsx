// src/components/property/PropertySearch.tsx
// Property search and filtering interface

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  ChevronDown,
  X,
  SlidersHorizontal,
  Grid,
  List,
  Heart,
  Calculator,
  TrendingUp
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

import { propertyService } from '@/lib/services/propertyService'
import { 
  PropertySearchFilters, 
  PropertySearchResults, 
  ExtendedProperty,
  PROPERTY_TYPE_LABELS,
  LEGAL_STATUS_LABELS,
  CITY_LABELS
} from '@/types/property'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PropertySearchProps {
  onResults?: (results: PropertySearchResults) => void
  onPropertySelect?: (property: ExtendedProperty) => void
  initialFilters?: PropertySearchFilters
  className?: string
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  onResults,
  onPropertySelect,
  initialFilters = {},
  className
}) => {
  const [filters, setFilters] = useState<PropertySearchFilters>(initialFilters)
  const [results, setResults] = useState<PropertySearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 20000000000
  ])

  // Area range state
  const [areaRange, setAreaRange] = useState<[number, number]>([
    filters.minArea || 0,
    filters.maxArea || 500
  ])

  // Perform search
  const performSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      const searchResults = await propertyService.searchProperties(filters, 1, 20)
      setResults(searchResults)
      onResults?.(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, onResults])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<PropertySearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Auto-search when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [performSearch])

  // Handle property type selection
  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.propertyType || []
    const newTypes = checked
      ? [...currentTypes, type as any]
      : currentTypes.filter(t => t !== type)
    
    updateFilters({ propertyType: newTypes })
  }

  // Handle city selection
  const handleCityChange = (city: string, checked: boolean) => {
    const currentCities = filters.city || []
    const newCities = checked
      ? [...currentCities, city]
      : currentCities.filter(c => c !== city)
    
    updateFilters({ city: newCities })
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
    setPriceRange([0, 20000000000])
    setAreaRange([0, 500])
    setSearchTerm('')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.propertyType?.length) count++
    if (filters.city?.length) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.minArea || filters.maxArea) count++
    if (filters.bedrooms?.length) count++
    if (filters.bathrooms?.length) count++
    if (filters.legalStatus?.length) count++
    return count
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, địa chỉ, quận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Lọc
                  {getActiveFilterCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bộ Lọc Tìm Kiếm</DialogTitle>
                  <DialogDescription>
                    Điều chỉnh các tiêu chí để tìm bất động sản phù hợp
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  {/* Property Type Filter */}
                  <div className="space-y-3">
                    <Label>Loại Bất Động Sản</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${key}`}
                            checked={filters.propertyType?.includes(key as any)}
                            onCheckedChange={(checked) => 
                              handlePropertyTypeChange(key, checked as boolean)
                            }
                          />
                          <Label htmlFor={`type-${key}`} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Khoảng Giá (VNĐ)</Label>
                    <div className="px-3">
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => {
                          setPriceRange(value as [number, number])
                          updateFilters({
                            minPrice: value[0],
                            maxPrice: value[1]
                          })
                        }}
                        max={20000000000}
                        min={0}
                        step={100000000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  {/* Area Range */}
                  <div className="space-y-3">
                    <Label>Diện Tích (m²)</Label>
                    <div className="px-3">
                      <Slider
                        value={areaRange}
                        onValueChange={(value) => {
                          setAreaRange(value as [number, number])
                          updateFilters({
                            minArea: value[0],
                            maxArea: value[1]
                          })
                        }}
                        max={500}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{areaRange[0]}m²</span>
                        <span>{areaRange[1]}m²</span>
                      </div>
                    </div>
                  </div>

                  {/* Cities */}
                  <div className="space-y-3">
                    <Label>Thành Phố</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                      {Object.entries(CITY_LABELS).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`city-${key}`}
                            checked={filters.city?.includes(key)}
                            onCheckedChange={(checked) => 
                              handleCityChange(key, checked as boolean)
                            }
                          />
                          <Label htmlFor={`city-${key}`} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-3">
                    <Label>Số Phòng Ngủ</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <Button
                          key={num}
                          variant={filters.bedrooms?.includes(num) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = filters.bedrooms || []
                            const updated = current.includes(num)
                              ? current.filter(n => n !== num)
                              : [...current, num]
                            updateFilters({ bedrooms: updated })
                          }}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-3">
                    <Label>Số Phòng Tắm</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <Button
                          key={num}
                          variant={filters.bathrooms?.includes(num) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = filters.bathrooms || []
                            const updated = current.includes(num)
                              ? current.filter(n => n !== num)
                              : [...current, num]
                            updateFilters({ bathrooms: updated })
                          }}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Legal Status */}
                  <div className="space-y-3">
                    <Label>Tình Trạng Pháp Lý</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(LEGAL_STATUS_LABELS).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`legal-${key}`}
                            checked={filters.legalStatus?.includes(key as any)}
                            onCheckedChange={(checked) => {
                              const current = filters.legalStatus || []
                              const updated = checked
                                ? [...current, key as any]
                                : current.filter(status => status !== key)
                              updateFilters({ legalStatus: updated })
                            }}
                          />
                          <Label htmlFor={`legal-${key}`} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Xóa Bộ Lọc
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Áp Dụng
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Select value={filters.sortBy || 'newest'} onValueChange={(value) => 
              updateFilters({ sortBy: value as any })
            }>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                <SelectItem value="area_asc">Diện tích tăng</SelectItem>
                <SelectItem value="area_desc">Diện tích giảm</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.propertyType?.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {PROPERTY_TYPE_LABELS[type]}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handlePropertyTypeChange(type, false)}
              />
            </Badge>
          ))}
          {filters.city?.map(city => (
            <Badge key={city} variant="secondary" className="gap-1">
              {CITY_LABELS[city as keyof typeof CITY_LABELS]}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleCityChange(city, false)}
              />
            </Badge>
          ))}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              {formatCurrency(filters.minPrice || 0)} - {formatCurrency(filters.maxPrice || 20000000000)}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ minPrice: undefined, maxPrice: undefined })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Search Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {results && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tìm thấy {results.total} bất động sản
            </p>
          </div>

          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {results.properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                viewMode={viewMode}
                onSelect={() => onPropertySelect?.(property)}
              />
            ))}
          </div>
        </div>
      )}

      {results && results.properties.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy bất động sản</h3>
          <p className="text-muted-foreground mb-4">
            Thử điều chỉnh bộ lọc để tìm kiếm với phạm vi rộng hơn
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Xóa Bộ Lọc
          </Button>
        </div>
      )}
    </div>
  )
}

// Property Card Component
interface PropertyCardProps {
  property: ExtendedProperty
  viewMode: 'grid' | 'list'
  onSelect: () => void
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewMode, onSelect }) => {
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (isFavorited) {
        await propertyService.removeFromFavorites(property.id)
      } else {
        await propertyService.addToFavorites(property.id)
      }
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Favorite error:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onSelect}>
        <CardContent className="p-4">
          <div className={cn(
            "flex gap-4",
            viewMode === 'grid' ? "flex-col" : "flex-row"
          )}>
            {/* Property Image Placeholder */}
            <div className={cn(
              "bg-gray-100 rounded-lg flex items-center justify-center",
              viewMode === 'grid' ? "h-48 w-full" : "h-32 w-48 flex-shrink-0"
            )}>
              <Home className="w-8 h-8 text-gray-400" />
            </div>

            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {property.property_name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">
                      {property.district}, {property.city}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={handleFavorite}
                >
                  <Heart 
                    className={cn(
                      "w-5 h-5",
                      isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                    )} 
                  />
                </Button>
              </div>

              {/* Property Details */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {property.area_sqm && (
                  <div className="flex items-center gap-1">
                    <Square className="w-3 h-3" />
                    <span>{property.area_sqm}m²</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
              </div>

              {/* Price and ROI */}
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(property.listed_price || 0)}
                </div>
                {property.price_per_sqm && (
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(property.price_per_sqm)}/m²
                  </div>
                )}
                {property.roiProjection && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>ROI: {property.roiProjection.toFixed(1)}%</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Calculator className="w-3 h-3 mr-1" />
                  Tính Toán
                </Button>
                <Button variant="outline" size="sm">
                  Chi Tiết
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PropertySearch