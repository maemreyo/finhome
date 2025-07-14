// src/app/properties/page.tsx
// Property search and listing page

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Filter, Home, TrendingUp, Calculator, Heart } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PropertySearch from '@/components/property/PropertySearch'
import { 
  PropertySearchResults, 
  ExtendedProperty,
  PROPERTY_TYPE_LABELS 
} from '@/types/property'
import { formatCurrency } from '@/lib/utils'

export default function PropertiesPage() {
  const [searchResults, setSearchResults] = useState<PropertySearchResults | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<ExtendedProperty | null>(null)

  const handleSearchResults = (results: PropertySearchResults) => {
    setSearchResults(results)
    setSelectedProperty(null)
  }

  const handlePropertySelect = (property: ExtendedProperty) => {
    setSelectedProperty(property)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tìm Kiếm Bất Động Sản
              </h1>
              <p className="text-gray-600 mt-2">
                Khám phá hàng ngàn bất động sản chất lượng trên toàn quốc
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Thị trường đang tăng 8.5%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Search Area */}
          <div className="lg:col-span-2 space-y-6">
            <PropertySearch
              onResults={handleSearchResults}
              onPropertySelect={handlePropertySelect}
              initialFilters={{
                sortBy: 'newest'
              }}
            />
            
            {/* Market Insights */}
            {searchResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Thông Tin Thị Trường
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {searchResults.total}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bất động sản
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(searchResults.aggregations.priceRange.min)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Giá thấp nhất
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(searchResults.aggregations.priceRange.max)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Giá cao nhất
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {searchResults.aggregations.propertyTypes.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Loại hình
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Selected Property Details */}
            {selectedProperty && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-blue-600" />
                      Chi Tiết Bất Động Sản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Property Image Placeholder */}
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>

                    {/* Property Basic Info */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {selectedProperty.property_name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedProperty.address || `${selectedProperty.district}, ${selectedProperty.city}`}</span>
                      </div>
                      
                      <div className="text-2xl font-bold text-blue-600 mb-3">
                        {formatCurrency(selectedProperty.listed_price)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Loại hình:</span>
                          <Badge variant="secondary">
                            {PROPERTY_TYPE_LABELS[selectedProperty.property_type]}
                          </Badge>
                        </div>
                        
                        {selectedProperty.area_sqm && (
                          <div className="flex justify-between">
                            <span className="text-sm">Diện tích:</span>
                            <span className="text-sm font-medium">{selectedProperty.area_sqm}m²</span>
                          </div>
                        )}
                        
                        {selectedProperty.price_per_sqm && (
                          <div className="flex justify-between">
                            <span className="text-sm">Giá/m²:</span>
                            <span className="text-sm font-medium">{formatCurrency(selectedProperty.price_per_sqm)}</span>
                          </div>
                        )}
                        
                        {selectedProperty.bedrooms && (
                          <div className="flex justify-between">
                            <span className="text-sm">Phòng ngủ:</span>
                            <span className="text-sm font-medium">{selectedProperty.bedrooms}</span>
                          </div>
                        )}
                        
                        {selectedProperty.bathrooms && (
                          <div className="flex justify-between">
                            <span className="text-sm">Phòng tắm:</span>
                            <span className="text-sm font-medium">{selectedProperty.bathrooms}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Investment Metrics */}
                    {selectedProperty.roiProjection && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Phân Tích Đầu Tư</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">ROI dự kiến:</span>
                            <span className="text-sm font-medium text-green-600">
                              {selectedProperty.roiProjection.toFixed(1)}%
                            </span>
                          </div>
                          
                          {selectedProperty.monthlyMortgageEstimate && (
                            <div className="flex justify-between">
                              <span className="text-sm">Trả góp/tháng:</span>
                              <span className="text-sm font-medium">
                                {formatCurrency(selectedProperty.monthlyMortgageEstimate)}
                              </span>
                            </div>
                          )}
                          
                          {selectedProperty.rentalYield && (
                            <div className="flex justify-between">
                              <span className="text-sm">Rental yield:</span>
                              <span className="text-sm font-medium text-blue-600">
                                {selectedProperty.rentalYield.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="border-t pt-4 space-y-2">
                      <Button className="w-full">
                        <Calculator className="w-4 h-4 mr-2" />
                        Tạo Kế Hoạch Tài Chính
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Heart className="w-4 h-4 mr-2" />
                        Thêm Vào Yêu Thích
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Stats */}
            {!selectedProperty && searchResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Thống Kê Nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Property Types Distribution */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Phân Bố Loại Hình</h4>
                      <div className="space-y-2">
                        {searchResults.aggregations.propertyTypes.map(type => (
                          <div key={type.type} className="flex justify-between text-sm">
                            <span>{PROPERTY_TYPE_LABELS[type.type as keyof typeof PROPERTY_TYPE_LABELS]}</span>
                            <span className="font-medium">{type.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Cities */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Thành Phố Phổ Biến</h4>
                      <div className="space-y-2">
                        {searchResults.aggregations.cities.slice(0, 5).map(city => (
                          <div key={city.city} className="flex justify-between text-sm">
                            <span>{city.city}</span>
                            <span className="font-medium">{city.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Mẹo Đầu Tư
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">💡 Vị trí quan trọng</p>
                    <p className="text-blue-700">
                      Ưu tiên các khu vực có hạ tầng phát triển và tiềm năng tăng giá cao.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">📊 Kiểm tra pháp lý</p>
                    <p className="text-green-700">
                      Đảm bảo bất động sản có sổ đỏ/sổ hồng rõ ràng trước khi đầu tư.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-900 mb-1">🏦 Tối ưu tài chính</p>
                    <p className="text-orange-700">
                      So sánh lãi suất từ nhiều ngân hàng để có được điều kiện vay tốt nhất.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}