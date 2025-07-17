// src/components/admin/PropertyCreateForm.tsx
// Comprehensive property creation form with Vietnamese address validation

'use client'

import React, { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { MapPin, Home, DollarSign, Ruler, FileText, Upload } from 'lucide-react'
import { formatCurrency, parseCurrency } from '@/lib/utils'
import PropertyImageUpload from './PropertyImageUpload'

// Vietnamese cities and districts data
const VIETNAMESE_LOCATIONS = {
  'Ho Chi Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Thủ Đức', 'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'],
  'Hanoi': ['Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tây Hồ', 'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông', 'Sơn Tây', 'Ba Vì', 'Chương Mỹ', 'Đan Phượng', 'Đông Anh', 'Gia Lâm', 'Hoài Đức', 'Mê Linh', 'Mỹ Đức', 'Phú Xuyên', 'Phúc Thọ', 'Quốc Oai', 'Sóc Sơn', 'Thạch Thất', 'Thanh Oai', 'Thanh Trì', 'Thường Tín', 'Ứng Hòa'],
  'Da Nang': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'],
  'Can Tho': ['Ninh Kiều', 'Ô Môn', 'Bình Thuỷ', 'Cái Răng', 'Thốt Nốt', 'Vĩnh Thạnh', 'Cờ Đỏ', 'Phong Điền', 'Thới Lai']
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà riêng' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'townhouse', label: 'Nhà phố' },
  { value: 'land', label: 'Đất nền' },
  { value: 'commercial', label: 'Thương mại' }
]

const PROPERTY_STATUSES = [
  { value: 'for_sale', label: 'Đang bán' },
  { value: 'sold', label: 'Đã bán' },
  { value: 'for_rent', label: 'Cho thuê' },
  { value: 'rented', label: 'Đã thuê' },
  { value: 'off_market', label: 'Ngưng bán' }
]

const LEGAL_STATUSES = [
  { value: 'red_book', label: 'Sổ đỏ' },
  { value: 'pink_book', label: 'Sổ hồng' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'disputed', label: 'Tranh chấp' }
]

const ORIENTATIONS = [
  { value: 'north', label: 'Hướng Bắc' },
  { value: 'south', label: 'Hướng Nam' },
  { value: 'east', label: 'Hướng Đông' },
  { value: 'west', label: 'Hướng Tây' },
  { value: 'northeast', label: 'Hướng Đông Bắc' },
  { value: 'northwest', label: 'Hướng Tây Bắc' },
  { value: 'southeast', label: 'Hướng Đông Nam' },
  { value: 'southwest', label: 'Hướng Tây Nam' }
]

// Form validation schema
const propertyFormSchema = z.object({
  title: z.string().min(5, 'Tên bất động sản phải có ít nhất 5 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  property_type: z.string().min(1, 'Vui lòng chọn loại bất động sản'),
  status: z.string().min(1, 'Vui lòng chọn trạng thái'),
  city: z.string().min(1, 'Vui lòng chọn thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  ward: z.string().optional(),
  address: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),
  list_price: z.number().min(1000000, 'Giá niêm yết phải ít nhất 1 triệu VND'),
  area_sqm: z.number().min(1, 'Diện tích phải lớn hơn 0'),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  floors: z.number().min(0).optional(),
  legal_status: z.string().min(1, 'Vui lòng chọn tình trạng pháp lý'),
  orientation: z.string().optional(),
  balcony_direction: z.string().optional(),
  furnished: z.boolean().optional(),
  parking_spaces: z.number().min(0).optional(),
  year_built: z.number().min(1900).max(new Date().getFullYear()).optional(),
  floor_number: z.number().min(0).optional(),
  total_floors: z.number().min(0).optional(),
  road_width: z.number().min(0).optional(),
  is_featured: z.boolean().optional(),
  images: z.array(z.string()).optional()
})

type PropertyFormValues = z.infer<typeof propertyFormSchema>

interface PropertyCreateFormProps {
  onSubmit: (data: PropertyFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function PropertyCreateForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: PropertyCreateFormProps) {
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [priceDisplay, setPriceDisplay] = useState<string>('')
  const [propertyImages, setPropertyImages] = useState<string[]>([])

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: '',
      status: 'for_sale',
      city: '',
      district: '',
      ward: '',
      address: '',
      list_price: 0,
      area_sqm: 0,
      bedrooms: 0,
      bathrooms: 0,
      floors: 1,
      legal_status: '',
      orientation: '',
      balcony_direction: '',
      furnished: false,
      parking_spaces: 0,
      year_built: undefined,
      floor_number: 1,
      total_floors: 1,
      road_width: 4,
      is_featured: false,
      images: []
    }
  })

  // Handle city selection and update available districts
  useEffect(() => {
    if (selectedCity && VIETNAMESE_LOCATIONS[selectedCity as keyof typeof VIETNAMESE_LOCATIONS]) {
      setAvailableDistricts(VIETNAMESE_LOCATIONS[selectedCity as keyof typeof VIETNAMESE_LOCATIONS])
      form.setValue('district', '') // Reset district when city changes
    }
  }, [selectedCity, form])

  // Handle price formatting
  const handlePriceChange = (value: string) => {
    const numericValue = parseCurrency(value)
    form.setValue('list_price', numericValue)
    setPriceDisplay(formatCurrency(numericValue))
  }

  // Calculate price per square meter
  const pricePerSqm = form.watch('list_price') / (form.watch('area_sqm') || 1)

  const handleSubmit = async (data: PropertyFormValues) => {
    try {
      // Include images in the submission data
      const submissionData = {
        ...data,
        images: propertyImages
      }
      await onSubmit(submissionData)
      toast.success('Bất động sản được tạo thành công!')
      form.reset()
      setPropertyImages([])
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo bất động sản')
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>
                Nhập thông tin cơ bản về bất động sản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên bất động sản *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Căn hộ 2PN tại Vinhomes Central Park"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về bất động sản, vị trí, tiện ích..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả càng chi tiết càng thu hút khách hàng
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại bất động sản *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại BDS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Thông tin vị trí
              </CardTitle>
              <CardDescription>
                Nhập thông tin vị trí chi tiết
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thành phố *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedCity(value)
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thành phố" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(VIETNAMESE_LOCATIONS).map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quận/Huyện *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quận/huyện" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phường/Xã</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Phường 1, Phường Bến Nghé..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ chi tiết *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 123 Đường Nguyễn Huệ"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Price and Area Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Giá và diện tích
              </CardTitle>
              <CardDescription>
                Thông tin về giá bán và diện tích
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="list_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá niêm yết (VND) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="5000000000"
                          value={priceDisplay}
                          onChange={(e) => handlePriceChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Nhập giá bằng số hoặc có dấu phẩy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area_sqm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diện tích (m²) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="80"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {pricePerSqm > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Giá mỗi m²:</strong> {formatCurrency(pricePerSqm)}/m²
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Chi tiết bất động sản
              </CardTitle>
              <CardDescription>
                Thông tin chi tiết về cấu trúc và tiện ích
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số phòng ngủ</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số phòng tắm</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tầng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parking_spaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chỗ đậu xe</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hướng nhà</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn hướng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORIENTATIONS.map((orientation) => (
                            <SelectItem key={orientation.value} value={orientation.value}>
                              {orientation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balcony_direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hướng ban công</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn hướng ban công" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORIENTATIONS.map((orientation) => (
                            <SelectItem key={orientation.value} value={orientation.value}>
                              {orientation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="year_built"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm xây dựng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2020"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tầng số</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Tầng của căn hộ trong tòa nhà
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="road_width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ rộng đường (m)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="4"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal and Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pháp lý và thông tin khác
              </CardTitle>
              <CardDescription>
                Thông tin pháp lý và các tùy chọn khác
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="legal_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tình trạng pháp lý *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tình trạng pháp lý" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEGAL_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-6">
                <FormField
                  control={form.control}
                  name="furnished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Có nội thất
                        </FormLabel>
                        <FormDescription>
                          Bất động sản đã có nội thất
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Bất động sản nổi bật
                        </FormLabel>
                        <FormDescription>
                          Hiển thị ưu tiên trên trang chủ
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Hình ảnh bất động sản
              </CardTitle>
              <CardDescription>
                Tải lên hình ảnh cho bất động sản (tối đa 10 hình)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyImageUpload
                existingImages={propertyImages}
                onImagesChange={setPropertyImages}
                maxImages={10}
                maxFileSize={5}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="sm:w-auto w-full"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:w-auto w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo bất động sản'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}