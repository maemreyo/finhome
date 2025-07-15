// src/components/help/HelpSystem.tsx
// Comprehensive help system with search, categories, and interactive guides

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  Mail,
  Phone,
  ChevronRight,
  ChevronDown,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Zap,
  Calculator,
  Home,
  TrendingUp,
  Settings
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { cn } from '@/lib/utils'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readTime: number
  rating: number
  views: number
  lastUpdated: Date
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
}

interface HelpSystemProps {
  className?: string
}

export const HelpSystem: React.FC<HelpSystemProps> = ({ className }) => {
  const { showToast } = useToast()
  const { addNotification, addExperience } = useGlobalState()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  // Mock help content
  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Bắt đầu với FinHome: Hướng dẫn toàn diện',
      content: 'Khám phá cách sử dụng FinHome để quản lý tài chính bất động sản hiệu quả...',
      category: 'getting-started',
      tags: ['cơ bản', 'hướng dẫn', 'khởi đầu'],
      difficulty: 'beginner',
      readTime: 5,
      rating: 4.8,
      views: 1250,
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Cách tính toán ROI bất động sản chính xác',
      content: 'Hướng dẫn chi tiết về cách tính toán tỷ suất sinh lời từ đầu tư bất động sản...',
      category: 'calculations',
      tags: ['ROI', 'tính toán', 'đầu tư'],
      difficulty: 'intermediate',
      readTime: 8,
      rating: 4.9,
      views: 980,
      lastUpdated: new Date('2024-01-10')
    },
    {
      id: '3',
      title: 'So sánh lãi suất ngân hàng hiệu quả',
      content: 'Mẹo và thủ thuật để tìm lãi suất vay mua nhà tốt nhất từ các ngân hàng...',
      category: 'banking',
      tags: ['lãi suất', 'ngân hàng', 'vay mua nhà'],
      difficulty: 'intermediate',
      readTime: 6,
      rating: 4.7,
      views: 756,
      lastUpdated: new Date('2024-01-08')
    },
    {
      id: '4',
      title: 'Quản lý danh mục đầu tư bất động sản',
      content: 'Chiến lược phân bổ và quản lý rủi ro trong đầu tư bất động sản...',
      category: 'portfolio',
      tags: ['danh mục', 'quản lý', 'rủi ro'],
      difficulty: 'advanced',
      readTime: 12,
      rating: 4.6,
      views: 542,
      lastUpdated: new Date('2024-01-05')
    },
    {
      id: '5',
      title: 'Tùy chỉnh cài đặt và thông báo',
      content: 'Hướng dẫn cá nhân hóa trải nghiệm sử dụng FinHome theo nhu cầu...',
      category: 'settings',
      tags: ['cài đặt', 'tùy chỉnh', 'thông báo'],
      difficulty: 'beginner',
      readTime: 4,
      rating: 4.5,
      views: 423,
      lastUpdated: new Date('2024-01-03')
    }
  ]

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'FinHome có miễn phí sử dụng không?',
      answer: 'FinHome cung cấp nhiều tính năng miễn phí bao gồm tính toán ROI, so sánh lãi suất, và quản lý danh mục cơ bản. Các tính năng nâng cao như phân tích chuyên sâu và báo cáo chi tiết có thể yêu cầu đăng ký gói premium.',
      category: 'general',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '2',
      question: 'Làm thế nào để tính toán chi phí vay mua nhà?',
      answer: 'Sử dụng máy tính vay trong FinHome, nhập giá bất động sản, tỷ lệ vốn tự có, thời gian vay và lãi suất. Hệ thống sẽ tự động tính toán khoản thanh toán hàng tháng, tổng lãi suất và các chỉ số tài chính quan trọng.',
      category: 'calculations',
      helpful: 67,
      notHelpful: 2
    },
    {
      id: '3',
      question: 'Dữ liệu lãi suất ngân hàng có được cập nhật thường xuyên không?',
      answer: 'Dữ liệu lãi suất được cập nhật hàng tuần từ các ngân hàng lớn tại Việt Nam. Tuy nhiên, bạn nên kiểm tra trực tiếp với ngân hàng để có thông tin chính xác nhất trước khi đưa ra quyết định vay.',
      category: 'banking',
      helpful: 38,
      notHelpful: 5
    },
    {
      id: '4',
      question: 'Có thể xuất dữ liệu để sử dụng ở ứng dụng khác không?',
      answer: 'Có, FinHome hỗ trợ xuất dữ liệu dưới định dạng JSON, CSV và PDF. Bạn có thể xuất báo cáo danh mục, lịch sử tính toán và các kế hoạch tài chính từ trang cài đặt.',
      category: 'settings',
      helpful: 29,
      notHelpful: 1
    },
    {
      id: '5',
      question: 'Làm thế nào để theo dõi hiệu suất đầu tư?',
      answer: 'Thêm các bất động sản vào danh mục đầu tư với thông tin mua bán, chi phí và thu nhập. FinHome sẽ tự động tính toán ROI, dòng tiền và các chỉ số hiệu suất theo thời gian thực.',
      category: 'portfolio',
      helpful: 52,
      notHelpful: 4
    }
  ]

  const categories = [
    { id: 'all', name: 'Tất cả', icon: Book, color: 'bg-gray-500' },
    { id: 'getting-started', name: 'Bắt đầu', icon: Zap, color: 'bg-green-500' },
    { id: 'calculations', name: 'Tính toán', icon: Calculator, color: 'bg-blue-500' },
    { id: 'banking', name: 'Ngân hàng', icon: Home, color: 'bg-purple-500' },
    { id: 'portfolio', name: 'Danh mục', icon: TrendingUp, color: 'bg-orange-500' },
    { id: 'settings', name: 'Cài đặt', icon: Settings, color: 'bg-gray-600' }
  ]

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    return helpArticles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  // Filter FAQs
  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const handleArticleClick = (article: HelpArticle) => {
    showToast(ToastHelpers.info('Đang mở bài viết', `"${article.title}"`))
    addExperience(5)
    
    addNotification({
      type: 'info',
      title: 'Bài viết trợ giúp',
      message: `Đã xem: ${article.title}`,
      isRead: false
    })
  }

  const handleFAQVote = (faqId: string, helpful: boolean) => {
    showToast(ToastHelpers.success(
      helpful ? 'Cảm ơn phản hồi' : 'Cảm ơn góp ý', 
      'Phản hồi của bạn giúp chúng tôi cải thiện nội dung'
    ))
    addExperience(2)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Cơ bản'
      case 'intermediate': return 'Trung bình'
      case 'advanced': return 'Nâng cao'
      default: return 'Không xác định'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Trung Tâm Trợ Giúp</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tìm câu trả lời cho các câu hỏi thường gặp và hướng dẫn sử dụng FinHome hiệu quả
          </p>
        </motion.div>
      </div>

      {/* Search and Categories */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm hướng dẫn, FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const IconComponent = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Hướng dẫn ({filteredArticles.length})
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            FAQ ({filteredFAQs.length})
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Liên hệ hỗ trợ
          </TabsTrigger>
        </TabsList>

        {/* Help Articles */}
        <TabsContent value="articles" className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy bài viết
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              onClick={() => handleArticleClick(article)}
                            >
                              {article.title}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getDifficultyColor(article.difficulty))}
                            >
                              {getDifficultyLabel(article.difficulty)}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {article.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {article.readTime} phút đọc
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              {article.rating}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {article.views} lượt xem
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {article.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* FAQ Section */}
        <TabsContent value="faq" className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy câu hỏi
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi từ khóa tìm kiếm hoặc liên hệ hỗ trợ để được giúp đỡ
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Collapsible>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-left text-base font-medium">
                              {faq.question}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {faq.helpful} hữu ích
                              </Badge>
                              {expandedFAQ === faq.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 mb-4">{faq.answer}</p>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              Câu trả lời này có hữu ích không?
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFAQVote(faq.id, true)}
                              className="flex items-center gap-1"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              Có
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFAQVote(faq.id, false)}
                              className="flex items-center gap-1"
                            >
                              <ThumbsDown className="w-3 h-3" />
                              Không
                            </Button>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contact Support */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Hỗ Trợ Qua Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Gửi câu hỏi chi tiết và nhận phản hồi trong vòng 24 giờ
                </p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Email:</strong> support@finhome.vn</p>
                  <p className="text-sm"><strong>Thời gian:</strong> Thứ 2 - Thứ 6, 8:00 - 17:00</p>
                </div>
                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi Email Hỗ Trợ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Hotline Hỗ Trợ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Gọi trực tiếp để được hỗ trợ ngay lập tức
                </p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Hotline:</strong> 1900 123 456</p>
                  <p className="text-sm"><strong>Thời gian:</strong> 24/7</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Gọi Ngay
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Chat Trực Tuyến
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Chat với đội ngũ hỗ trợ để được giải đáp nhanh chóng
                </p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Trạng thái:</strong> <span className="text-green-600">Đang hoạt động</span></p>
                  <p className="text-sm"><strong>Thời gian phản hồi:</strong> ~2 phút</p>
                </div>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Bắt Đầu Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Hướng Dẫn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Xem các video hướng dẫn chi tiết về cách sử dụng FinHome
                </p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Số video:</strong> 25+ hướng dẫn</p>
                  <p className="text-sm"><strong>Ngôn ngữ:</strong> Tiếng Việt</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Video className="w-4 h-4 mr-2" />
                  Xem Video
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Mẹo Sử Dụng Hiệu Quả</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900">🎯 Mẹo tìm kiếm:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Sử dụng từ khóa cụ thể như "ROI", "lãi suất"</li>
                    <li>• Tìm theo danh mục để thu hẹp kết quả</li>
                    <li>• Đọc FAQ trước khi liên hệ hỗ trợ</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900">💡 Mẹo học tập:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Bắt đầu với bài viết "Cơ bản"</li>
                    <li>• Thực hành với dữ liệu thật</li>
                    <li>• Tham gia cộng đồng để chia sẻ kinh nghiệm</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HelpSystem