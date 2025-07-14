// src/app/banks/page.tsx
// Bank interest rates comparison page

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Building, TrendingUp, Calculator, Percent, Star } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import BankRateComparison from '@/components/banks/BankRateComparison'
import { BankLoanProduct } from '@/lib/services/bankService'

export default function BanksPage() {
  const [selectedBank, setSelectedBank] = useState<BankLoanProduct | null>(null)

  const handleBankSelect = (bank: BankLoanProduct) => {
    setSelectedBank(bank)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                So Sánh Lãi Suất Ngân Hàng
              </h1>
              <p className="text-gray-600 mt-2">
                Tìm kiếm gói vay ưu đãi nhất từ các ngân hàng hàng đầu Việt Nam
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Cập nhật hàng ngày
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Building className="w-4 h-4 mr-1" />
                8+ Ngân hàng
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Main Comparison Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="comparison" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  So Sánh Lãi Suất
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Xu Hướng Thị Trường
                </TabsTrigger>
                <TabsTrigger value="guide" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Hướng Dẫn Vay
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-6">
                <BankRateComparison
                  initialLoanAmount={2000000000}
                  initialLoanTerm={20}
                  onBankSelect={handleBankSelect}
                />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Xu Hướng Lãi Suất 12 Tháng Qua</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Biểu đồ xu hướng lãi suất sẽ hiển thị ở đây</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lãi Suất Trung Bình</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Vay 15 năm:</span>
                          <span className="font-semibold">7.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vay 20 năm:</span>
                          <span className="font-semibold">8.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vay 25 năm:</span>
                          <span className="font-semibold">8.6%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dự Báo Thị Trường</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-900">Q1 2024</p>
                          <p className="text-green-700">Lãi suất dự kiến ổn định</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="font-medium text-yellow-900">Q2 2024</p>
                          <p className="text-yellow-700">Có thể tăng nhẹ 0.1-0.2%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="guide" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hướng Dẫn Vay Mua Nhà</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Step-by-step guide */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Quy Trình Vay Mua Nhà</h3>
                        
                        <div className="space-y-3">
                          {[
                            {
                              step: 1,
                              title: "Chuẩn bị hồ sơ",
                              content: "CMND, sổ hộ khẩu, chứng minh thu nhập, sao kê tài khoản"
                            },
                            {
                              step: 2,
                              title: "Thẩm định tài sản",
                              content: "Ngân hàng thẩm định giá trị bất động sản làm tài sản đảm bảo"
                            },
                            {
                              step: 3,
                              title: "Duyệt hồ sơ vay",
                              content: "Ngân hàng xem xét khả năng trả nợ và điều kiện vay"
                            },
                            {
                              step: 4,
                              title: "Ký hợp đồng",
                              content: "Ký hợp đồng tín dụng và các giấy tờ pháp lý"
                            },
                            {
                              step: 5,
                              title: "Giải ngân",
                              content: "Nhận tiền và bắt đầu trả nợ theo lịch trình"
                            }
                          ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {item.step}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4">Điều Kiện Vay Chung</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Về người vay:</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• Tuổi từ 18-65 (nam) hoặc 18-60 (nữ)</li>
                              <li>• Có thu nhập ổn định tối thiểu 6 tháng</li>
                              <li>• Không có nợ xấu trong hệ thống ngân hàng</li>
                              <li>• Có khả năng trả nợ (DTI ≤ 40%)</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Về tài sản:</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• Có sổ đỏ/sổ hồng hợp lệ</li>
                              <li>• Không trong tình trạng tranh chấp</li>
                              <li>• Giá trị tài sản ≥ 150% số tiền vay</li>
                              <li>• Được phép chuyển nhượng</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Selected Bank Details */}
            {selectedBank && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      Ngân Hàng Đã Chọn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {selectedBank.bankName}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={selectedBank.rateType === 'promotional' ? 'default' : 'secondary'}>
                          {selectedBank.rateType === 'promotional' ? 'Khuyến mãi' : 'Tiêu chuẩn'}
                        </Badge>
                        <Badge variant="outline">
                          {selectedBank.loanTermYears} năm
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Lãi suất:</span>
                          <span className="text-sm font-medium">{selectedBank.interestRate}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Phí xử lý:</span>
                          <span className="text-sm font-medium">{selectedBank.processingFee}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Vốn tối thiểu:</span>
                          <span className="text-sm font-medium">{selectedBank.minimumDownPayment || 20}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <Button className="w-full">
                        <Calculator className="w-4 h-4 mr-2" />
                        Tạo Kế Hoạch Với Ngân Hàng Này
                      </Button>
                      <Button variant="outline" className="w-full">
                        Liên Hệ Ngân Hàng
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Current Market Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-green-600" />
                  Lãi Suất Hiện Tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">Thấp nhất:</span>
                    <span className="text-green-600 font-bold">7.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Trung bình:</span>
                    <span className="text-blue-600 font-bold">8.1%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Cao nhất:</span>
                    <span className="text-orange-600 font-bold">9.2%</span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  * Cập nhật lần cuối: Hôm nay
                </div>
              </CardContent>
            </Card>

            {/* Quick Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Tính Nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">💡 Mẹo tiết kiệm</p>
                    <p className="text-blue-700">
                      Tăng vốn tự có từ 20% lên 30% có thể tiết kiệm được ~0.2% lãi suất
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">📊 Quy tắc 3-30-40</p>
                    <p className="text-green-700">
                      Vốn tự có 30%, vay 30 năm, DTI dưới 40%
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-900 mb-1">🏦 So sánh nhiều ngân hàng</p>
                    <p className="text-orange-700">
                      Mỗi ngân hàng có chính sách khác nhau, nên so sánh kỹ
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