// src/app/admin/properties/page.tsx
// Admin property management interface

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, MapPin, Home, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useAdminProperties } from '@/hooks/useProperties'
import PropertyCreateForm from '@/components/admin/PropertyCreateForm'
import PropertyImageGrid from '@/components/admin/PropertyImageGrid'

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà riêng' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'townhouse', label: 'Nhà phố' },
  { value: 'land', label: 'Đất nền' },
  { value: 'commercial', label: 'Thương mại' }
]

const PROPERTY_STATUSES = [
  { value: 'for_sale', label: 'Đang bán', color: 'bg-green-100 text-green-800' },
  { value: 'sold', label: 'Đã bán', color: 'bg-gray-100 text-gray-800' },
  { value: 'for_rent', label: 'Cho thuê', color: 'bg-blue-100 text-blue-800' },
  { value: 'rented', label: 'Đã thuê', color: 'bg-purple-100 text-purple-800' },
  { value: 'off_market', label: 'Ngưng bán', color: 'bg-red-100 text-red-800' }
]

export default function AdminPropertiesPage() {
  const { user } = useAuth()
  const { 
    properties, 
    isLoading, 
    error, 
    stats,
    createProperty,
    updateProperty, 
    deleteProperty, 
    searchProperties,
    refreshProperties 
  } = useAdminProperties()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Check admin access (this should be properly implemented with your auth system)
  const isAdmin = user?.email?.includes('admin') // Replace with proper admin check

  // Handle search and filtering
  const handleSearch = async () => {
    await searchProperties({
      search: searchTerm || undefined,
      property_type: filterType === 'all' ? undefined : filterType,
      status: filterStatus === 'all' ? undefined : filterStatus,
      page: 1,
      limit: 50 // Show more properties in admin view
    })
  }

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterType, filterStatus])

  const filteredProperties = properties

  const handleDeleteProperty = async (propertyId: string) => {
    if (confirm('Bạn có chắc muốn xóa bất động sản này?')) {
      try {
        await deleteProperty(propertyId)
      } catch (error) {
        console.error('Error deleting property:', error)
      }
    }
  }

  const handleToggleFeatured = async (propertyId: string) => {
    try {
      const property = properties.find(p => p.id === propertyId)
      if (property) {
        await updateProperty(propertyId, { is_featured: !property.is_featured })
      }
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      await updateProperty(propertyId, { status: newStatus as any })
    } catch (error) {
      console.error('Error updating property status:', error)
    }
  }

  const handleCreateProperty = async (data: any) => {
    try {
      setIsCreating(true)
      await createProperty(data)
      setIsCreateDialogOpen(false)
      toast.success('Bất động sản được tạo thành công!')
    } catch (error) {
      console.error('Error creating property:', error)
      toast.error('Có lỗi xảy ra khi tạo bất động sản')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = PROPERTY_STATUSES.find(s => s.value === status)
    return (
      <Badge className={statusConfig?.color}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const getPropertyTypeLabel = (type: string) => {
    const typeConfig = PROPERTY_TYPES.find(t => t.value === type)
    return typeConfig?.label || type
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
            <p className="text-gray-600">Bạn không có quyền truy cập vào trang quản trị.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Bất động sản</h1>
          <p className="text-gray-600 mt-2">
            Quản lý danh sách bất động sản trên hệ thống FinHome
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bất động sản
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm bất động sản mới</DialogTitle>
              <DialogDescription>
                Tạo bất động sản mới trong hệ thống FinHome
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <PropertyCreateForm
                onSubmit={handleCreateProperty}
                onCancel={() => setIsCreateDialogOpen(false)}
                isSubmitting={isCreating}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng BDS</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang bán</p>
                <p className="text-2xl font-bold text-gray-900">{stats.forSale}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nổi bật</p>
                <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, quận, thành phố..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Loại BDS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {PROPERTY_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bất động sản ({filteredProperties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tên BDS</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Diện tích</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <PropertyImageGrid
                        images={Array.isArray(property.images) ? property.images as string[] : []}
                        title={property.title}
                        className="w-16 h-16"
                        showCount={false}
                        maxVisible={1}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.title}</div>
                        {property.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-1">
                            Nổi bật
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPropertyTypeLabel(property.property_type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{property.district}</div>
                        <div className="text-gray-500">{property.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(property.list_price)}</div>
                        <div className="text-sm text-gray-500">
                          {property.area_sqm ? formatCurrency(property.list_price / property.area_sqm) : 'N/A'}/m²
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{property.area_sqm || property.total_area || 'N/A'}m²</TableCell>
                    <TableCell>{getStatusBadge(property.status)}</TableCell>
                    <TableCell>{property.view_count}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProperty(property)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFeatured(property.id)}
                          className={property.is_featured ? 'bg-yellow-50' : ''}
                        >
                          ⭐
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {!isLoading && filteredProperties.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {error ? `Lỗi: ${error}` : 'Không tìm thấy bất động sản nào'}
              </p>
              {error && (
                <Button 
                  variant="outline" 
                  onClick={refreshProperties}
                  className="mt-2"
                >
                  Thử lại
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      {selectedProperty && (
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết bất động sản</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedProperty.title}</h3>
                <p className="text-sm text-gray-500">ID: {selectedProperty.id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <Select 
                    value={selectedProperty.status} 
                    onValueChange={(value) => handleStatusChange(selectedProperty.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Nổi bật</label>
                  <div className="mt-2">
                    <Button
                      variant={selectedProperty.is_featured ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFeatured(selectedProperty.id)}
                    >
                      {selectedProperty.is_featured ? 'Đang nổi bật' : 'Không nổi bật'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-sm space-y-2">
                <p><strong>Loại:</strong> {getPropertyTypeLabel(selectedProperty.property_type)}</p>
                <p><strong>Vị trí:</strong> {selectedProperty.district}, {selectedProperty.city}</p>
                <p><strong>Giá:</strong> {formatCurrency(selectedProperty.list_price)}</p>
                <p><strong>Diện tích:</strong> {selectedProperty.area_sqm}m²</p>
                <p><strong>Phòng ngủ:</strong> {selectedProperty.bedrooms}</p>
                <p><strong>Phòng tắm:</strong> {selectedProperty.bathrooms}</p>
                <p><strong>Lượt xem:</strong> {selectedProperty.view_count}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}