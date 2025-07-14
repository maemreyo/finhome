// src/types/help.ts
// Type definitions for contextual help system

export interface HelpContent {
  id: string
  title: string
  description: string
  content: string
  type: 'tooltip' | 'popover' | 'modal' | 'inline'
  category: 'navigation' | 'form' | 'feature' | 'calculation' | 'troubleshooting'
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  relatedTopics?: string[]
  lastUpdated: Date
}

export interface ContextualHelpItem {
  id: string
  elementId: string // CSS selector or data-help-id
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  trigger: 'hover' | 'click' | 'focus' | 'manual'
  type: 'tooltip' | 'popover' | 'callout'
  showCondition?: {
    userType?: ('first_time_buyer' | 'investor' | 'upgrader')[]
    subscriptionTier?: ('free' | 'premium' | 'professional')[]
    completedOnboarding?: boolean
    hasPlans?: boolean
    featureFlag?: string
  }
  dismissible: boolean
  maxWidth?: number
  delay?: number
  offset?: number
  arrow?: boolean
  animation?: 'fade' | 'slide' | 'scale' | 'none'
}

export interface HelpTooltipProps {
  children: React.ReactNode
  content: string
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  maxWidth?: number
  delay?: number
  offset?: number
  arrow?: boolean
  disabled?: boolean
  className?: string
}

export interface HelpPopoverProps {
  children: React.ReactNode
  title: string
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'click' | 'focus' | 'manual'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  maxWidth?: number
  showArrow?: boolean
  dismissible?: boolean
  className?: string
}

export interface HelpCalloutProps {
  id: string
  title: string
  content: React.ReactNode
  type?: 'info' | 'tip' | 'warning' | 'success'
  position?: 'top' | 'bottom' | 'overlay'
  dismissible?: boolean
  onDismiss?: () => void
  actions?: {
    label: string
    action: () => void
    variant?: 'primary' | 'secondary'
  }[]
  className?: string
}

export interface UserHelpState {
  userId: string
  showContextualHelp: boolean
  helpLevel: 'minimal' | 'guided' | 'comprehensive'
  dismissedHelp: string[]
  seenTooltips: string[]
  preferredHelpType: 'tooltip' | 'popover' | 'modal'
  lastHelpInteraction: Date
  helpSessionId: string
}

export interface HelpContextValue {
  helpState: UserHelpState | null
  helpContent: Map<string, ContextualHelpItem>
  showHelp: (elementId: string) => void
  hideHelp: (elementId: string) => void
  dismissHelp: (elementId: string) => void
  toggleGlobalHelp: () => void
  isHelpVisible: (elementId: string) => boolean
  shouldShowHelp: (elementId: string) => boolean
  updateHelpPreference: (key: keyof UserHelpState, value: any) => void
  registerHelpItem: (item: ContextualHelpItem) => void
  unregisterHelpItem: (elementId: string) => void
}

// Predefined help content for common financial terms
export const FINANCIAL_HELP_CONTENT: Record<string, HelpContent> = {
  downPayment: {
    id: 'down-payment',
    title: 'Vốn Tự Có',
    description: 'Số tiền bạn trả trước khi vay',
    content: 'Vốn tự có là số tiền bạn thanh toán ngay khi mua nhà, trước khi vay ngân hàng. Thông thường chiếm 20-30% giá trị căn nhà. Vốn tự có càng nhiều, số tiền vay càng ít và lãi suất có thể thấp hơn.',
    type: 'tooltip',
    category: 'calculation',
    priority: 'high',
    tags: ['vay', 'ngân hàng', 'tài chính'],
    lastUpdated: new Date()
  },
  interestRate: {
    id: 'interest-rate',
    title: 'Lãi Suất',
    description: 'Tỷ lệ phần trăm bạn phải trả hàng năm',
    content: 'Lãi suất là chi phí vay tiền, tính theo % trên năm. Ví dụ lãi suất 8%/năm nghĩa là bạn phải trả thêm 8% số tiền vay mỗi năm. Lãi suất càng thấp, tổng chi phí vay càng ít.',
    type: 'tooltip',
    category: 'calculation',
    priority: 'high',
    tags: ['lãi suất', 'ngân hàng', 'chi phí'],
    lastUpdated: new Date()
  },
  roi: {
    id: 'roi',
    title: 'ROI (Return on Investment)',
    description: 'Tỷ suất sinh lời từ đầu tư',
    content: 'ROI là tỷ lệ lợi nhuận so với số tiền đầu tư ban đầu, tính theo %. ROI dương nghĩa là có lời, ROI âm nghĩa là lỗ. Công thức: ROI = (Lợi nhuận / Vốn đầu tư) x 100%',
    type: 'popover',
    category: 'calculation',
    priority: 'medium',
    tags: ['đầu tư', 'lợi nhuận', 'phân tích'],
    lastUpdated: new Date()
  },
  dti: {
    id: 'debt-to-income',
    title: 'Tỷ Lệ Nợ/Thu Nhập (DTI)',
    description: 'Tỷ lệ khoản vay so với thu nhập',
    content: 'DTI là tỷ lệ giữa khoản trả nợ hàng tháng và thu nhập hàng tháng. Ngân hàng thường yêu cầu DTI dưới 40-50%. DTI thấp = khả năng vay cao hơn và rủi ro thấp hơn.',
    type: 'popover',
    category: 'calculation',
    priority: 'high',
    tags: ['ngân hàng', 'đánh giá', 'rủi ro'],
    lastUpdated: new Date()
  },
  cashFlow: {
    id: 'cash-flow',
    title: 'Dòng Tiền',
    description: 'Thu nhập trừ đi chi phí hàng tháng',
    content: 'Dòng tiền = Thu nhập - Chi phí cố định (bao gồm trả nợ). Dòng tiền dương nghĩa là bạn còn dư tiền sau khi trả hết các khoản. Dòng tiền âm nghĩa là chi nhiều hơn thu.',
    type: 'popover',
    category: 'calculation',
    priority: 'medium',
    tags: ['dòng tiền', 'quản lý', 'tài chính'],
    lastUpdated: new Date()
  }
}

// Predefined contextual help items for UI elements
export const UI_HELP_ITEMS: ContextualHelpItem[] = [
  {
    id: 'create-plan-button',
    elementId: '[data-help="create-plan"]',
    title: 'Tạo Kế Hoạch Tài Chính',
    content: 'Nhấn để bắt đầu tạo kế hoạch mua nhà hoặc đầu tư bất động sản. Bạn có thể chọn chế độ đơn giản (5 phút) hoặc chi tiết (15 phút).',
    position: 'bottom',
    trigger: 'hover',
    type: 'tooltip',
    dismissible: true,
    maxWidth: 300,
    delay: 500,
    arrow: true,
    animation: 'fade'
  },
  {
    id: 'scenario-comparison',
    elementId: '[data-help="scenario-comparison"]',
    title: 'So Sánh Kịch Bản',
    content: 'Công cụ mạnh mẽ để so sánh nhiều phương án vay khác nhau. Bạn có thể thay đổi lãi suất, thời gian vay, vốn tự có để tìm phương án tối ưu nhất.',
    position: 'right',
    trigger: 'click',
    type: 'popover',
    showCondition: {
      hasPlans: true
    },
    dismissible: true,
    maxWidth: 400,
    arrow: true,
    animation: 'slide'
  },
  {
    id: 'financial-lab',
    elementId: '[data-help="financial-lab"]',
    title: 'Phòng Thí Nghiệm Tài Chính',
    content: 'Mô phỏng các tình huống "Điều gì sẽ xảy ra nếu?" như trả nợ sớm, tái cơ cấu khoản vay, hoặc thay đổi lãi suất. Giúp bạn chuẩn bị cho mọi tình huống.',
    position: 'bottom',
    trigger: 'hover',
    type: 'tooltip',
    showCondition: {
      userType: ['investor', 'upgrader'],
      hasPlans: true
    },
    dismissible: true,
    maxWidth: 350,
    delay: 300,
    arrow: true,
    animation: 'scale'
  },
  {
    id: 'export-report',
    elementId: '[data-help="export-report"]',
    title: 'Xuất Báo Cáo',
    content: 'Tải về báo cáo tài chính chuyên nghiệp dưới dạng PDF hoặc Excel. Báo cáo bao gồm biểu đồ, phân tích chi tiết và khuyến nghị.',
    position: 'top',
    trigger: 'hover',
    type: 'tooltip',
    dismissible: true,
    maxWidth: 280,
    delay: 400,
    arrow: true,
    animation: 'fade'
  },
  {
    id: 'achievement-system',
    elementId: '[data-help="achievements"]',
    title: 'Hệ Thống Thành Tích',
    content: 'Theo dõi tiến độ học tập và mở khóa thành tích trong hành trình tài chính. Mỗi thành tích đạt được sẽ tăng điểm kinh nghiệm và cấp độ của bạn.',
    position: 'left',
    trigger: 'hover',
    type: 'tooltip',
    dismissible: true,
    maxWidth: 320,
    delay: 200,
    arrow: true,
    animation: 'slide'
  }
]