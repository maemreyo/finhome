// Dashboard help page with locale support - UPDATED: 2024-01-18 - Integrated with real database

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageSquare, 
  Mail, 
  Phone,
  FileText,
  Video,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { DashboardService } from '@/lib/services/dashboardService'
import { toast } from 'sonner'

export default function HelpPage() {
  const t = useTranslations('Dashboard.Help')
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'general'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbFaqItems, setDbFaqItems] = useState<any[]>([])
  const [dbSupportTickets, setDbSupportTickets] = useState<any[]>([])

  // Load FAQ and support tickets from database
  useEffect(() => {
    const loadHelpData = async () => {
      try {
        setIsLoading(true)
        const [faqData, supportData] = await Promise.all([
          DashboardService.getFaqItems(),
          isAuthenticated && user ? DashboardService.getSupportTickets(user.id) : Promise.resolve([])
        ])
        
        setDbFaqItems(faqData)
        setDbSupportTickets(supportData)
      } catch (error) {
        console.error('Error loading help data:', error)
        toast.error('Failed to load help data')
      } finally {
        setIsLoading(false)
      }
    }

    loadHelpData()
  }, [isAuthenticated, user])

  const faqItems = [
    {
      question: 'How to create your first financial plan?',
      answer: 'To create a new financial plan, go to "Financial Plans" in the left menu and click "Create New Plan". You will be guided through each step to enter information about your investment goals, financial resources and timeline.',
      category: 'planning'
    },
    {
      question: 'How to compare multiple investment scenarios?',
      answer: 'Use the "Scenario Comparison" feature to analyze different investment options. You can adjust parameters like interest rates, loan terms, and tax rates to see the impact on expected returns.',
      category: 'scenarios'
    },
    {
      question: 'How does the Laboratory feature work?',
      answer: 'The Laboratory allows you to experiment with investment parameters in a safe environment. You can change variable values and see immediate impact on financial results without affecting your main plans.',
      category: 'laboratory'
    },
    {
      question: 'How to update personal information?',
      answer: 'Go to "Profile" in the sidebar menu to update personal information like name, email, phone number and other details. Remember to click "Save Changes" after editing.',
      category: 'profile'
    },
    {
      question: 'Is my data secure?',
      answer: 'We use leading security measures to protect your data. All information is encrypted during transmission and storage. You can view details about our security policy in the Settings section.',
      category: 'security'
    },
    {
      question: 'Can I export financial plan data?',
      answer: 'Yes, you can export financial plan data as Excel or PDF files. Go to plan details and click the "Export Data" button to download.',
      category: 'export'
    }
  ]

  const quickLinks = [
    {
      title: 'Hướng Dẫn Sử Dụng',
      description: 'Tài liệu chi tiết về các tính năng',
      icon: Book,
      href: '/docs/user-guide'
    },
    {
      title: 'Video Hướng Dẫn',
      description: 'Xem video học cách sử dụng',
      icon: Video,
      href: '/docs/videos'
    },
    {
      title: 'Cộng Đồng',
      description: 'Thảo luận với người dùng khác',
      icon: MessageSquare,
      href: '/community'
    },
    {
      title: 'Cập Nhật',
      description: 'Thông tin về phiên bản mới',
      icon: FileText,
      href: '/docs/changelog'
    }
  ]

  const supportTickets = [
    {
      id: 'TK-001',
      subject: 'Lỗi tính toán lãi suất',
      status: 'resolved',
      created: '2024-01-15',
      category: 'technical'
    },
    {
      id: 'TK-002',
      subject: 'Cần hỗ trợ tạo kế hoạch',
      status: 'pending',
      created: '2024-01-18',
      category: 'guidance'
    },
    {
      id: 'TK-003',
      subject: 'Câu hỏi về tính năng xuất dữ liệu',
      status: 'in_progress',
      created: '2024-01-20',
      category: 'feature'
    }
  ]

  const statusIcons = {
    resolved: CheckCircle,
    pending: Clock,
    in_progress: AlertCircle
  }

  const statusColors = {
    resolved: 'text-green-600',
    pending: 'text-yellow-600',
    in_progress: 'text-blue-600'
  }

  // Submit contact form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      toast.error('Please login to submit support tickets')
      return
    }

    try {
      setIsSubmitting(true)
      await DashboardService.createSupportTicket(user.id, {
        subject: contactForm.subject,
        description: contactForm.message,
        category: contactForm.category
      })
      
      toast.success('Support ticket submitted successfully!')
      setContactForm({ subject: '', message: '', category: 'general' })
      
      // Reload support tickets
      const supportData = await DashboardService.getSupportTickets(user.id)
      setDbSupportTickets(supportData)
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('Failed to submit support ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use database FAQ items or fallback to mock data
  const displayFaqItems = dbFaqItems.length > 0 ? dbFaqItems : faqItems
  const displaySupportTickets = dbSupportTickets.length > 0 ? dbSupportTickets : supportTickets

  const filteredFAQ = displayFaqItems.filter(item => {
    const question = item.question || item.question_vi || ''
    const answer = item.answer || item.answer_vi || ''
    return question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           answer.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <DashboardShell 
      title={t('title')} 
      description={t('description')}
    >
      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('search.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">{t('tabs.faq')}</TabsTrigger>
            <TabsTrigger value="guides">{t('tabs.guides')}</TabsTrigger>
            <TabsTrigger value="contact">{t('tabs.contact')}</TabsTrigger>
            <TabsTrigger value="tickets">{t('tabs.tickets')}</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('faq.title')}</CardTitle>
                <CardDescription>
                  {t('faq.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQ.map((item, index) => (
                      <AccordionItem key={item.id || index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question || item.question_vi || 'Question'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">
                            {item.answer || item.answer_vi || 'Answer'}
                          </p>
                          {item.category && (
                            <Badge variant="secondary" className="mt-2">
                              {item.category}
                            </Badge>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <link.icon className="h-5 w-5" />
                      {link.title}
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('quickStart.title')}</CardTitle>
                <CardDescription>
                  {t('quickStart.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">{t('quickStart.step1.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('quickStart.step1.description')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">{t('quickStart.step2.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('quickStart.step2.description')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">{t('quickStart.step3.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('quickStart.step3.description')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">{t('quickStart.step4.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('quickStart.step4.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t('contact.email.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('contact.email.description')}
                  </p>
                  <p className="font-medium">support@finhome.vn</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('contact.email.response')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {t('contact.phone.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('contact.phone.description')}
                  </p>
                  <p className="font-medium">1900 1234</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('contact.phone.hours')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t('contact.chat.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('contact.chat.description')}
                  </p>
                  <Button className="w-full">
                    {t('contact.chat.button')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('contact.chat.availability')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('supportForm.title')}</CardTitle>
                <CardDescription>
                  {t('supportForm.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('supportForm.subject')}</Label>
                    <Input
                      id="subject"
                      placeholder={t('supportForm.subjectPlaceholder')}
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('supportForm.message')}</Label>
                    <Textarea
                      id="message"
                      placeholder={t('supportForm.messagePlaceholder')}
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : t('supportForm.submit')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('tickets.title')}</CardTitle>
                <CardDescription>
                  {t('tickets.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : displaySupportTickets.length > 0 ? (
                  <div className="space-y-4">
                    {displaySupportTickets.map((ticket) => {
                      const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons]
                      return (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`h-4 w-4 ${statusColors[ticket.status as keyof typeof statusColors]}`} />
                            <div>
                              <p className="font-medium">{ticket.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {ticket.ticket_number || ticket.id} • {new Date(ticket.created_at || ticket.created).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {t(`tickets.status.${ticket.status}`) || ticket.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              {t('tickets.details')}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No support tickets yet. Submit a support request to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}