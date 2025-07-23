// src/components/expenses/UnifiedTransactionForm.tsx
// CREATED: Unified transaction form that merges features from QuickTransactionForm, EnhancedQuickTransactionForm, and IntelligentTransactionForm
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getHours, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { ReceiptImageUpload, ReceiptImage } from '@/components/ui/receipt-image-upload'
import { useIntelligentSuggestions } from '@/hooks/useIntelligentSuggestions'
import { useTagSuggestions } from '@/hooks/useTagSuggestions'
import { useRecentTransactions } from '@/hooks/useRecentTransactions'
import { ConversationalTransactionDialog } from './ConversationalTransactionDialog'
import { SkeletonTransactionLoader } from '@/components/ui/skeleton-transaction-loader'
import { OnboardingHelper } from './OnboardingHelper'
import { 
  Calculator, 
  Camera, 
  MapPin, 
  Plus, 
  Minus, 
  ArrowRightLeft,
  Wallet,
  Tag,
  Clock,
  Check,
  X,
  ChevronDown,
  Zap,
  Hash,
  Brain,
  Sparkles,
  Eye,
  TrendingUp,
  Target,
  History,
  Lightbulb,
  Settings,
  MessageCircle,
  Send,
  Loader2,
  Coffee,
  Utensils,
  Sun,
  Moon,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

const unifiedTransactionSchema = z.object({
  wallet_id: z.string().min(1, 'Please select a wallet'),
  transaction_type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  notes: z.string().optional(),
  expense_category_id: z.string().optional(),
  income_category_id: z.string().optional(),
  transfer_to_wallet_id: z.string().optional(),
  transfer_fee: z.number().min(0).optional(),
  transaction_date: z.string().optional(),
  merchant_name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  receipt_images: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof unifiedTransactionSchema>

interface Category {
  id: string
  name_en: string
  name_vi: string
  icon: string
  color: string
  category_key: string
}

interface Wallet {
  id: string
  name: string
  balance: number
  currency: string
  icon: string
  color: string
  wallet_type: string
}

interface UnifiedTransactionFormProps {
  wallets: Wallet[]
  expenseCategories: Category[]
  incomeCategories: Category[]
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  userId?: string
  defaultQuickMode?: boolean
  defaultAiMode?: boolean
  defaultConversationalMode?: boolean
}

export function UnifiedTransactionForm({
  wallets,
  expenseCategories,
  incomeCategories,
  onSuccess,
  onCancel,
  className,
  userId = 'current-user-id',
  defaultQuickMode = false,
  defaultAiMode = false,
  defaultConversationalMode = false
}: UnifiedTransactionFormProps) {
  const t = useTranslations('UnifiedTransactionForm')
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense')
  
  // UI state
  const [quickMode, setQuickMode] = useState(defaultQuickMode)
  const [aiMode, setAiMode] = useState(defaultAiMode)
  const [conversationalMode, setConversationalMode] = useState(defaultConversationalMode)
  const [showSettings, setShowSettings] = useState(false)
  const [tagInputOpen, setTagInputOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionType, setSuggestionType] = useState<'description' | 'merchant' | null>(null)
  
  // Conversational mode state
  const [conversationalText, setConversationalText] = useState('')
  const [isParsingText, setIsParsingText] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [corrections, setCorrections] = useState<any[]>([])
  
  // Streaming state
  const [streamingTransactions, setStreamingTransactions] = useState<any[]>([])
  const [streamingStatus, setStreamingStatus] = useState('')
  const [streamingProgress, setStreamingProgress] = useState<{ current: number; estimated: number } | null>(null)
  
  // Error handling state
  const [parsingError, setParsingError] = useState<{
    type: 'parsing_failed' | 'network_error' | 'no_transactions' | 'ai_unavailable'
    message: string
    suggestions: string[]
    canRetry: boolean
  } | null>(null)
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  
  // Receipt and OCR state
  const [receiptImages, setReceiptImages] = useState<ReceiptImage[]>([])
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProcessedImages, setOcrProcessedImages] = useState<Set<string>>(new Set())
  
  // Refs for form inputs
  const tagInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLInputElement>(null)
  const merchantInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(unifiedTransactionSchema),
    defaultValues: {
      transaction_type: 'expense',
      amount: 0,
      transaction_date: new Date().toISOString().split('T')[0],
      tags: [],
      receipt_images: [],
    }
  })

  const { watch, setValue, getValues } = form
  const currentTransactionType = watch('transaction_type')
  const currentDescription = watch('description') || ''
  const currentMerchant = watch('merchant_name') || ''
  const selectedWalletId = watch('wallet_id')

  // Hooks for AI features
  const {
    suggestions,
    loading: suggestionsLoading,
    getDescriptionSuggestions,
    getMerchantSuggestions,
    getAmountSuggestions,
    predictCategory,
    predictAmount,
    getRelatedTags,
    applySuggestion,
    clearSuggestions
  } = useIntelligentSuggestions({ 
    transactionType: currentTransactionType,
    enabled: aiMode 
  })
  
  const { 
    suggestions: tagSuggestions, 
    loading: tagSuggestionsLoading,
    addTagToSuggestions, 
    getFilteredSuggestions 
  } = useTagSuggestions({ userId })

  // Hook for recent transactions and personalized suggestions
  const {
    recentTransactions,
    loading: recentTransactionsLoading,
    getPersonalizedSuggestions,
    getSmartDefaults,
    isSimilarToRecent,
    hasRecentTransactions
  } = useRecentTransactions({ 
    userId, 
    enabled: conversationalMode 
  })

  // Update transaction type state when form changes
  useEffect(() => {
    setTransactionType(currentTransactionType)
    if (aiMode) {
      clearSuggestions()
    }
  }, [currentTransactionType, aiMode, clearSuggestions])

  // Auto-suggest category based on description/merchant (AI mode only)
  const handleAutoSuggestCategory = useCallback((input: string, type: 'description' | 'merchant') => {
    if (!aiMode || !input.trim()) return
    
    const categoryPrediction = predictCategory(input)
    if (categoryPrediction && categoryPrediction.confidence > 0.5) {
      const categoryField = currentTransactionType === 'expense' ? 'expense_category_id' : 'income_category_id'
      setValue(categoryField, categoryPrediction.predicted_category?.id)
      
      // Also suggest amount if available
      if (categoryPrediction.predicted_amount) {
        setValue('amount', categoryPrediction.predicted_amount)
      }
      
      // Suggest related tags
      if (categoryPrediction.related_tags && categoryPrediction.related_tags.length > 0) {
        const newTags = [...selectedTags, ...categoryPrediction.related_tags.slice(0, 3)]
        const uniqueTags = [...new Set(newTags)]
        setSelectedTags(uniqueTags)
        setValue('tags', uniqueTags)
      }
    }
  }, [aiMode, predictCategory, currentTransactionType, setValue, selectedTags])

  // Handle description input changes
  const handleDescriptionChange = useCallback((value: string) => {
    setValue('description', value)
    if (aiMode && value.length >= 2) {
      getDescriptionSuggestions(value)
      handleAutoSuggestCategory(value, 'description')
    } else if (aiMode) {
      clearSuggestions()
    }
  }, [setValue, aiMode, getDescriptionSuggestions, handleAutoSuggestCategory, clearSuggestions])

  // Handle merchant input changes
  const handleMerchantChange = useCallback((value: string) => {
    setValue('merchant_name', value)
    if (aiMode && value.length >= 2) {
      getMerchantSuggestions(value)
      handleAutoSuggestCategory(value, 'merchant')
    } else if (aiMode) {
      clearSuggestions()
    }
  }, [setValue, aiMode, getMerchantSuggestions, handleAutoSuggestCategory, clearSuggestions])

  // Apply AI suggestion to form
  const handleApplySuggestion = useCallback((suggestion: any) => {
    const updates = applySuggestion(suggestion)
    
    Object.entries(updates).forEach(([field, value]) => {
      if (field === 'suggested_tags') {
        const newTags = [...selectedTags, ...(value as string[])]
        const uniqueTags = [...new Set(newTags)]
        setSelectedTags(uniqueTags)
        setValue('tags', uniqueTags)
      } else {
        setValue(field as any, value)
      }
    })
    
    setShowSuggestions(false)
  }, [applySuggestion, selectedTags, setValue])

  // Load AI amount suggestions on mount
  useEffect(() => {
    if (aiMode && currentTransactionType !== 'transfer') {
      getAmountSuggestions()
    }
  }, [currentTransactionType, aiMode, getAmountSuggestions])

  // Check if user should see onboarding
  useEffect(() => {
    // Show onboarding if:
    // 1. Conversational mode is enabled for the first time
    // 2. User has no recent transactions (first-time user)
    // 3. User hasn't seen onboarding before (stored in localStorage)
    
    const hasSeenOnboardingKey = `finhome_onboarding_seen_${userId}`
    const hasSeenBefore = localStorage.getItem(hasSeenOnboardingKey) === 'true'
    
    setHasSeenOnboarding(hasSeenBefore)
    
    if (conversationalMode && !hasSeenBefore && !hasRecentTransactions && !recentTransactionsLoading) {
      // Small delay to let the UI settle
      setTimeout(() => setShowOnboarding(true), 500)
    }
  }, [conversationalMode, hasRecentTransactions, recentTransactionsLoading, userId])

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    const hasSeenOnboardingKey = `finhome_onboarding_seen_${userId}`
    localStorage.setItem(hasSeenOnboardingKey, 'true')
    setHasSeenOnboarding(true)
  }

  // Handle onboarding example click
  const handleOnboardingExampleClick = (example: string) => {
    setConversationalText(example)
    // Don't auto-submit, let user trigger it manually for better control
  }

  const handleQuickAmount = (amount: number) => {
    const currentAmount = getValues('amount') || 0
    setValue('amount', currentAmount + amount)
  }

  const addTag = (tagToAdd?: string) => {
    const tagValue = tagToAdd || customTag.trim()
    if (tagValue && !selectedTags.includes(tagValue)) {
      const newTags = [...selectedTags, tagValue]
      setSelectedTags(newTags)
      setValue('tags', newTags)
      setCustomTag('')
      setTagInputOpen(false)
      
      // Add to suggestions
      addTagToSuggestions(tagValue)
    }
  }

  const handleTagInputChange = (value: string) => {
    setCustomTag(value)
  }

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag)
    setSelectedTags(newTags)
    setValue('tags', newTags)
  }

  // Handle conversational text parsing with streaming support
  const handleConversationalSubmit = async () => {
    if (!conversationalText.trim()) {
      setParsingError({
        type: 'no_transactions',
        message: 'Hãy nhập nội dung để AI phân tích.',
        suggestions: [
          'Mô tả giao dịch của bạn bằng tiếng Việt',
          'Ví dụ: "ăn trưa 50k" hoặc "nhận lương 15tr"',
          'Bao gồm số tiền và hoạt động'
        ],
        canRetry: false
      })
      return
    }

    setIsParsingText(true)
    setStreamingTransactions([])
    setStreamingStatus('Starting AI analysis...')
    setParsingError(null) // Clear previous errors
    
    try {
      const response = await fetch('/api/expenses/parse-from-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: conversationalText,
          user_preferences: {
            default_wallet_id: wallets[0]?.id,
            currency: 'VND',
          },
          stream: true, // Enable streaming
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to parse text'
        throw new Error(errorMessage)
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        await handleStreamingResponse(response)
      } else {
        // Fallback to non-streaming
        const result = await response.json()
        if (result.success && result.data) {
          setParsedData(result.data)
          setShowConfirmationDialog(true)
          await logParsingSession(result.data, conversationalText)
        } else {
          throw new Error('No transactions found in the text')
        }
      }
    } catch (error) {
      console.error('Error parsing conversational text:', error)
      const errorFeedback = createErrorFeedback(error, conversationalText)
      setParsingError(errorFeedback)
      
      // Still show toast for immediate feedback, but Alert provides more guidance
      toast.error('AI parsing failed - see guidance below')
    } finally {
      setIsParsingText(false)
    }
  }

  // Handle streaming response from the API
  const handleStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              // Stream completed
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              
              switch (parsed.type) {
                case 'status':
                  setStreamingStatus(parsed.message)
                  break
                  
                case 'progress':
                  setStreamingStatus(parsed.message)
                  if (parsed.chunk) {
                    // Show that the AI is actively processing
                    setStreamingStatus(`Processing: "${parsed.chunk}"`)
                  }
                  break
                  
                case 'transaction':
                  // Add new transaction as it's completed
                  setStreamingTransactions(prev => {
                    const exists = prev.some(t => 
                      t.description === parsed.data.description && 
                      t.amount === parsed.data.amount
                    )
                    if (exists) return prev
                    return [...prev, parsed.data]
                  })
                  
                  if (parsed.progress) {
                    setStreamingProgress(parsed.progress)
                  }
                  
                  // Show immediate feedback
                  toast.success(`Found transaction: ${parsed.data.description} (${parsed.data.amount.toLocaleString()} VND)`)
                  break
                  
                case 'final':
                  // Final result received
                  setParsedData(parsed.data)
                  setShowConfirmationDialog(true)
                  
                  // Log parsing session
                  await logParsingSession(parsed.data, conversationalText)
                  
                  // Clear streaming state
                  setTimeout(() => {
                    setStreamingTransactions([])
                    setStreamingStatus('')
                    setStreamingProgress(null)
                  }, 1000)
                  break
                  
                case 'error':
                  throw new Error(parsed.error || 'Streaming error occurred')
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // Log parsing session for analytics
  const logParsingSession = async (data: any, inputText: string) => {
    try {
      await fetch('/api/expenses/parsing-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: inputText,
          transactions_parsed: data.transactions.length,
          avg_confidence: data.transactions.reduce((acc: number, t: any) => acc + t.confidence_score, 0) / data.transactions.length,
          parsed_transactions: data.transactions,
          ai_model_used: data.metadata?.ai_model || 'gemini-1.5-flash',
        }),
      })
    } catch (error) {
      console.error('Error logging parsing session:', error)
      // Don't show error to user - this is just for analytics
    }
  }

  // Handle correction logging
  const handleCorrection = async (correction: any) => {
    setCorrections(prev => [...prev, correction])
    
    try {
      await fetch('/api/expenses/log-correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(correction),
      })
    } catch (error) {
      console.error('Error logging correction:', error)
      // Don't show error to user - this is just for learning
    }
  }

  // Handle confirmed transactions from dialog
  const handleConfirmedTransactions = async (transactions: any[]) => {
    setIsSubmitting(true)
    
    try {
      const results = []
      
      for (const transaction of transactions) {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create transaction')
        }

        const result = await response.json()
        results.push(result)
      }
      
      toast.success(`Successfully created ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}!`)
      
      // Reset conversational state
      setConversationalText('')
      setParsedData(null)
      setCorrections([])
      
      onSuccess?.()
      
    } catch (error) {
      console.error('Error creating transactions:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create some transactions')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Process receipt image with OCR
  const processReceiptOCR = async (imageUrl: string, imageId: string) => {
    if (ocrProcessedImages.has(imageId)) return

    setIsProcessingOCR(true)
    try {
      const response = await fetch('/api/expenses/receipt-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('OCR processing failed')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const { amount, merchant_name, transaction_date, description, category_suggestion } = result.data

        // Auto-fill form fields with OCR data (only if fields are empty)
        if (amount && !getValues('amount')) {
          setValue('amount', amount)
        }
        if (merchant_name && !getValues('merchant_name')) {
          setValue('merchant_name', merchant_name)
        }
        if (transaction_date && !getValues('transaction_date')) {
          setValue('transaction_date', transaction_date)
        }
        if (description && !getValues('description')) {
          setValue('description', description)
        }

        // Suggest category if available
        if (category_suggestion) {
          const categories = transactionType === 'expense' ? expenseCategories : incomeCategories
          const suggestedCategory = categories.find(cat => cat.category_key === category_suggestion)
          if (suggestedCategory && !getValues(getCategoryFieldName())) {
            setValue(getCategoryFieldName(), suggestedCategory.id)
          }
        }

        // Mark this image as processed
        setOcrProcessedImages(prev => new Set([...prev, imageId]))

        // Show success message
        toast.success('Receipt data extracted and filled automatically!')
      } else {
        toast.error('Could not extract data from receipt image')
      }
    } catch (error) {
      console.error('OCR processing error:', error)
      toast.error('Failed to process receipt image')
    } finally {
      setIsProcessingOCR(false)
    }
  }

  // Handle receipt images change with OCR processing
  const handleReceiptImagesChange = (images: ReceiptImage[]) => {
    setReceiptImages(images)

    // Process newly uploaded images with OCR
    images.forEach(image => {
      if (image.uploaded && image.url && !ocrProcessedImages.has(image.id)) {
        processReceiptOCR(image.url, image.id)
      }
    })
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Validate required fields based on transaction type
      if (data.transaction_type === 'expense' && !data.expense_category_id) {
        toast.error('Please select an expense category')
        setIsSubmitting(false)
        return
      }
      if (data.transaction_type === 'income' && !data.income_category_id) {
        toast.error('Please select an income category')
        setIsSubmitting(false)
        return
      }
      if (data.transaction_type === 'transfer' && !data.transfer_to_wallet_id) {
        toast.error('Please select a destination wallet for transfer')
        setIsSubmitting(false)
        return
      }

      // Get receipt image URLs from uploaded images
      const receiptImageUrls = receiptImages
        .filter(img => img.uploaded && img.url)
        .map(img => img.url!)

      // Prepare transaction data
      const transactionData = {
        wallet_id: data.wallet_id,
        transaction_type: data.transaction_type,
        amount: data.amount,
        description: data.description || '',
        notes: data.notes || '',
        expense_category_id: data.expense_category_id || null,
        income_category_id: data.income_category_id || null,
        transfer_to_wallet_id: data.transfer_to_wallet_id || null,
        transfer_fee: data.transfer_fee || 0,
        transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
        merchant_name: data.merchant_name || '',
        tags: selectedTags,
        receipt_images: receiptImageUrls,
      }

      // Remove null/undefined fields to avoid API validation issues
      Object.keys(transactionData).forEach(key => {
        if (transactionData[key as keyof typeof transactionData] === null || 
            transactionData[key as keyof typeof transactionData] === undefined) {
          delete transactionData[key as keyof typeof transactionData]
        }
      })

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }

      await response.json()

      toast.success(
        transactionType === 'expense' 
          ? t('expenseRecorded') 
          : transactionType === 'income'
          ? t('incomeRecorded')
          : t('transferRecorded')
      )

      form.reset()
      setSelectedTags([])
      setReceiptImages([])
      setOcrProcessedImages(new Set())
      if (aiMode) {
        clearSuggestions()
      }
      onSuccess?.()

    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error(error instanceof Error ? error.message : t('errorRecording'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get filtered suggestions for current context
  const getContextualSuggestions = () => {
    if (suggestionType === 'description') {
      return suggestions.filter(s => s.type === 'description')
    } else if (suggestionType === 'merchant') {
      return suggestions.filter(s => s.type === 'merchant')
    }
    return []
  }

  const getCurrentCategories = () => {
    return transactionType === 'expense' ? expenseCategories : incomeCategories
  }

  const getCategoryFieldName = () => {
    return transactionType === 'expense' ? 'expense_category_id' : 'income_category_id'
  }

  const getFilteredTagSuggestions = () => {
    return tagSuggestions.filter(tag => 
      tag.toLowerCase().includes(customTag.toLowerCase()) &&
      !selectedTags.includes(tag)
    )
  }

  // Generate dynamic conversational examples based on time of day and user patterns
  const getDynamicConversationalExamples = () => {
    const currentHour = getHours(new Date())
    const personalizedSuggestions = hasRecentTransactions ? getPersonalizedSuggestions() : []
    
    // Start with time-based suggestions
    let timeBasedSuggestions = []
    
    // Morning (6AM - 11AM)
    if (currentHour >= 6 && currentHour < 11) {
      timeBasedSuggestions = [
        {
          text: "cà phê sáng 25k",
          icon: Coffee,
          color: "text-amber-600",
          type: "time_based"
        },
        {
          text: "ăn sáng phở 45k",
          icon: Utensils,
          color: "text-orange-600",
          type: "time_based"
        },
        {
          text: "đổ xăng đi làm 200k",
          icon: Target,
          color: "text-blue-600",
          type: "time_based"
        }
      ]
    }
    // Lunch time (11AM - 2PM)
    else if (currentHour >= 11 && currentHour < 14) {
      timeBasedSuggestions = [
        {
          text: "cơm trưa văn phòng 50k",
          icon: Utensils,
          color: "text-green-600",
          type: "time_based"
        },
        {
          text: "gọi món trà sữa 35k",
          icon: Coffee,
          color: "text-pink-600",
          type: "time_based"
        },
        {
          text: "taxi về nhà 80k",
          icon: Target,
          color: "text-blue-600",
          type: "time_based"
        }
      ]
    }
    // Afternoon (2PM - 6PM)
    else if (currentHour >= 14 && currentHour < 18) {
      timeBasedSuggestions = [
        {
          text: "mua sắm tạp hóa 150k",
          icon: Target,
          color: "text-purple-600",
          type: "time_based"
        },
        {
          text: "cà phê chiều với đồng nghiệp 40k",
          icon: Coffee,
          color: "text-amber-600",
          type: "time_based"
        },
        {
          text: "nhận thưởng dự án 2 triệu",
          icon: TrendingUp,
          color: "text-green-600",
          type: "time_based"
        }
      ]
    }
    // Evening/Night (6PM - 12AM)
    else {
      timeBasedSuggestions = [
        {
          text: "ăn tối gia đình 200k",
          icon: Moon,
          color: "text-indigo-600",
          type: "time_based"
        },
        {
          text: "xem phim rạp 120k",
          icon: Target,
          color: "text-red-600",
          type: "time_based"
        },
        {
          text: "nhận lương tháng 15 triệu",
          icon: TrendingUp,
          color: "text-green-600",
          type: "time_based"
        }
      ]
    }

    // Convert personalized suggestions to the same format
    const personalizedConverted = personalizedSuggestions.slice(0, 2).map(suggestion => ({
      text: suggestion.text,
      icon: suggestion.icon === '🔄' ? History : 
            suggestion.icon === '🏪' ? Target : 
            suggestion.icon === '💰' ? TrendingUp : History,
      color: "text-purple-600",
      type: "personalized",
      frequency: suggestion.frequency,
      confidence: suggestion.confidence
    }))

    // Merge suggestions: prioritize personalized if available, then time-based
    const allSuggestions = []
    
    // Add personalized suggestions first (highest priority)
    if (personalizedConverted.length > 0) {
      allSuggestions.push(...personalizedConverted)
    }
    
    // Add time-based suggestions to fill remaining slots
    const remainingSlots = 3 - allSuggestions.length
    allSuggestions.push(...timeBasedSuggestions.slice(0, remainingSlots))

    return allSuggestions
  }

  // Helper function to create constructive error messages
  const createErrorFeedback = (error: any, inputText: string) => {
    const baseExamples = [
      "ăn phở 50k",
      "mua sách 150k", 
      "nhận lương 15 triệu",
      "taxi 80k"
    ]

    // Network or server errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        type: 'network_error' as const,
        message: 'Không thể kết nối đến AI. Hãy kiểm tra kết nối mạng.',
        suggestions: [
          'Kiểm tra kết nối internet của bạn',
          'Thử lại sau vài giây',
          'Hoặc sử dụng form thủ công bên dưới'
        ],
        canRetry: true
      }
    }

    // AI service unavailable
    if (error.message?.includes('AI service') || error.message?.includes('500')) {
      return {
        type: 'ai_unavailable' as const,
        message: 'Dịch vụ AI tạm thời không khả dụng.',
        suggestions: [
          'Hệ thống AI đang được bảo trì',
          'Hãy thử lại sau vài phút',
          'Hoặc nhập giao dịch thủ công'
        ],
        canRetry: true
      }
    }

    // No transactions found
    if (error.message?.includes('No transactions found') || error.message?.includes('not found')) {
      const dynamicExamples = getDynamicConversationalExamples()
      return {
        type: 'no_transactions' as const,
        message: 'AI không tìm thấy giao dịch nào trong văn bản của bạn.',
        suggestions: [
          `Thử diễn đạt rõ ràng hơn: "${dynamicExamples[0]?.text}"`,
          'Bao gồm số tiền và mô tả hoạt động',
          'Ví dụ tốt: "ăn trưa 50k" hoặc "nhận lương 15tr"',
          'Tránh từ ngữ mơ hồ như "chi tiêu vặt"'
        ],
        canRetry: true
      }
    }

    // Generic parsing failure
    return {
      type: 'parsing_failed' as const,
      message: 'AI gặp khó khăn hiểu ý bạn.',
      suggestions: [
        'Thử viết đơn giản hơn: "ăn phở 45k"',
        'Bao gồm số tiền rõ ràng: "25k", "150 nghìn", "2tr"',
        'Mô tả hoạt động cụ thể: "mua sắm", "ăn uống", "đi lại"',
        'Hoặc chuyển sang nhập thủ công'
      ],
      canRetry: true
    }
  }

  // Retry parsing with the same text
  const retryParsing = () => {
    setParsingError(null)
    handleConversationalSubmit()
  }

  // Switch to manual entry mode
  const switchToManualEntry = () => {
    setParsingError(null)
    setConversationalMode(false)
    toast.info('Đã chuyển sang chế độ nhập thủ công')
  }

  // Get time-based greeting and context
  const getTimeBasedContext = () => {
    const currentHour = getHours(new Date())
    const timeOfDay = format(new Date(), 'HH:mm')
    
    if (currentHour >= 6 && currentHour < 11) {
      return {
        greeting: "Good morning!",
        context: "Start your day by tracking morning expenses",
        icon: Sun,
        color: "text-amber-500"
      }
    } else if (currentHour >= 11 && currentHour < 14) {
      return {
        greeting: "Lunch time!",
        context: "Don't forget to log your lunch expenses",
        icon: Utensils,
        color: "text-green-500"
      }
    } else if (currentHour >= 14 && currentHour < 18) {
      return {
        greeting: "Good afternoon!",
        context: "Track your afternoon activities",
        icon: Sun,
        color: "text-orange-500"
      }
    } else {
      return {
        greeting: "Good evening!",
        context: "Wind down by recording today's transactions",
        icon: Moon,
        color: "text-indigo-500"
      }
    }
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", quickMode && "shadow-sm", className)}>
      <CardHeader className={cn("pb-3", quickMode && "pb-2 pt-4")}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("flex items-center gap-2", quickMode ? "text-base" : "text-lg")}>
            {aiMode ? (
              <>
                <Brain className={cn("text-purple-500", quickMode ? "h-4 w-4" : "h-5 w-5")} />
                <span>Smart Entry</span>
              </>
            ) : (
              <>
                <Zap className={cn("text-amber-500", quickMode ? "h-4 w-4" : "h-5 w-5")} />
                <span>Quick Entry</span>
              </>
            )}
            {!quickMode && (
              <>
                {transactionType === 'expense' && <Minus className="h-5 w-5 text-red-500" />}
                {transactionType === 'income' && <Plus className="h-5 w-5 text-green-500" />}
                {transactionType === 'transfer' && <ArrowRightLeft className="h-5 w-5 text-blue-500" />}
              </>
            )}
            {suggestionsLoading && (
              <div className="w-3 h-3 border border-purple-200 border-t-purple-500 rounded-full animate-spin" />
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-6 w-6 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="pt-3 border-t space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="quick-mode"
                    checked={quickMode}
                    onCheckedChange={setQuickMode}
                  />
                  <Label htmlFor="quick-mode" className="text-sm">Quick Mode</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="ai-mode"
                    checked={aiMode}
                    onCheckedChange={setAiMode}
                  />
                  <Label htmlFor="ai-mode" className="text-sm flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    AI Mode
                  </Label>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="conversational-mode"
                  checked={conversationalMode}
                  onCheckedChange={setConversationalMode}
                />
                <Label htmlFor="conversational-mode" className="text-sm flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  Conversational Mode
                </Label>
                <Badge variant="secondary" className="text-xs">
                  NEW
                </Badge>
                {conversationalMode && !hasSeenOnboarding && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOnboarding(true)}
                    className="text-xs h-5 px-2 ml-2"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Help
                  </Button>
                )}
              </div>
            </div>
            
            {aiMode && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md text-xs">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">
                  AI suggestions enabled - Start typing for smart recommendations
                </span>
              </div>
            )}

            {conversationalMode && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs">
                <MessageCircle className="h-3 w-3 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-300">
                  Conversational mode enabled - Just describe your transactions naturally!
                </span>
              </div>
            )}

            {tagSuggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Your Most Used Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {tagSuggestions.slice(0, 8).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Hash className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Keyboard Shortcuts:</strong></p>
              <ul className="space-y-0.5 pl-2">
                <li>• ⌘/Ctrl + Enter: Save transaction</li>
                <li>• ⌘/Ctrl + 1/2/3: Switch transaction type</li>
                <li>• ↓ in tag field: Show suggestions</li>
              </ul>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn(quickMode && "px-4 pb-4")}>
        {/* Conversational Mode Interface */}
        {conversationalMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                Tell me about your transactions
                {(() => {
                  const timeContext = getTimeBasedContext()
                  const IconComponent = timeContext.icon
                  return (
                    <div className="flex items-center gap-1 ml-auto">
                      <IconComponent className={cn("h-3 w-3", timeContext.color)} />
                      <span className={cn("text-xs", timeContext.color)}>
                        {timeContext.greeting}
                      </span>
                    </div>
                  )
                })()}
              </Label>
              <div className="relative">
                <Textarea
                  placeholder={(() => {
                    const examples = getDynamicConversationalExamples()
                    return `Try: "${examples[0].text}" or describe multiple transactions naturally`
                  })()}
                  value={conversationalText}
                  onChange={(e) => setConversationalText(e.target.value)}
                  className="min-h-[100px] pr-12 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleConversationalSubmit()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleConversationalSubmit}
                  disabled={isParsingText || !conversationalText.trim()}
                  className="absolute bottom-2 right-2 h-8 w-8 p-0"
                >
                  {isParsingText ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="h-3 w-3" />
              <span>AI will analyze your text and suggest transactions for confirmation</span>
              <kbd className="ml-auto px-1 py-0.5 text-xs bg-muted rounded border">
                ⌘↵ to parse
              </kbd>
            </div>

            {/* Enhanced Error Feedback */}
            {parsingError && (
              <Alert variant={parsingError.type === 'network_error' ? 'destructive' : 'default'} className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-orange-800 mb-2">{parsingError.message}</p>
                      <div className="text-sm text-orange-700">
                        <p className="mb-2 font-medium">Hãy thử:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          {parsingError.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-orange-200">
                      {parsingError.canRetry && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={retryParsing}
                          disabled={isParsingText}
                          className="text-orange-700 border-orange-300 hover:bg-orange-100"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Thử lại
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={switchToManualEntry}
                        className="text-orange-700 border-orange-300 hover:bg-orange-100"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Nhập thủ công
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setParsingError(null)}
                        className="text-orange-600 hover:bg-orange-100 ml-auto"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Show streaming progress when parsing */}
            {isParsingText && (
              <div className="mt-4">
                <SkeletonTransactionLoader
                  status={streamingStatus || 'Starting AI analysis...'}
                  progress={streamingProgress}
                  streamingTransactions={streamingTransactions}
                />
              </div>
            )}

            {/* Dynamic personalized and time-based example suggestions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {hasRecentTransactions ? 'Personalized for you:' : 'Perfect for now:'}
                </p>
                {hasRecentTransactions ? (
                  <Brain className="h-3 w-3 text-purple-500" />
                ) : (
                  <>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(), 'HH:mm')}
                    </span>
                  </>
                )}
                {recentTransactionsLoading && (
                  <div className="w-3 h-3 border border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {getDynamicConversationalExamples().map((example, index) => {
                  const IconComponent = example.icon
                  const isPersonalized = example.type === 'personalized'
                  
                  return (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConversationalText(example.text)}
                      className={cn(
                        "justify-start text-left h-auto py-2 px-3 text-xs whitespace-normal transition-all duration-200",
                        isPersonalized 
                          ? "border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300" 
                          : "border-dashed hover:border-solid"
                      )}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <IconComponent className={cn("h-3 w-3 flex-shrink-0", example.color)} />
                        <div className="flex-1">
                          <span className="text-muted-foreground">"</span>
                          <span>{example.text}</span>
                          <span className="text-muted-foreground">"</span>
                        </div>
                        {isPersonalized && (
                          <div className="flex items-center gap-1 ml-2">
                            <Badge variant="secondary" className="text-xs px-1 h-4">
                              <History className="h-2 w-2 mr-0.5" />
                              {example.frequency}x
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>
              <div className="text-xs text-muted-foreground text-center pt-1 border-t border-dashed">
                <p className="flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {hasRecentTransactions 
                    ? 'AI learns from your patterns and suggests based on time of day'
                    : 'Examples change based on time of day for better relevance'
                  }
                </p>
              </div>
            </div>

            <Separator />
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConversationalMode(false)}
                className="text-xs"
              >
                Switch to traditional form
              </Button>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className={cn(quickMode ? "space-y-2" : "space-y-4")}
            onKeyDown={(e) => {
              // Keyboard shortcuts for power users
              if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                  case 'Enter':
                    e.preventDefault()
                    form.handleSubmit(onSubmit)()
                    break
                  case '1':
                    e.preventDefault()
                    setValue('transaction_type', 'expense')
                    break
                  case '2':
                    e.preventDefault()
                    setValue('transaction_type', 'income')
                    break
                  case '3':
                    e.preventDefault()
                    setValue('transaction_type', 'transfer')
                    break
                }
              }
            }}
          >
          {/* Transaction Type Toggle */}
          <div className={cn("flex rounded-lg bg-muted p-1", quickMode && "p-0.5")}>
            {(['expense', 'income', 'transfer'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setValue('transaction_type', type)
                  // Reset category when switching types
                  setValue('expense_category_id', undefined)
                  setValue('income_category_id', undefined)
                  setValue('transfer_to_wallet_id', undefined)
                }}
                className={cn(
                  "flex-1 rounded-md font-medium transition-all",
                  "flex items-center justify-center gap-1",
                  quickMode ? "py-1.5 px-2 text-xs" : "py-2 px-3 text-sm",
                  transactionType === type
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === 'expense' && <Minus className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />}
                {type === 'income' && <Plus className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />}
                {type === 'transfer' && <ArrowRightLeft className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />}
                {!quickMode && (
                  <>
                    {type === 'expense' && t('expense')}
                    {type === 'income' && t('income')}
                    {type === 'transfer' && t('transfer')}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Amount Input with Quick Buttons */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-2", quickMode && "text-sm")}>
              <Calculator className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {t('amount')}
              {aiMode && suggestions.some(s => s.type === 'amount') && (
                <Badge variant="secondary" className="text-xs h-4">
                  <TrendingUp className="h-2.5 w-2.5 mr-1" />
                  Smart amounts
                </Badge>
              )}
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="1000"
                min="0"
                placeholder="0"
                {...form.register('amount', { valueAsNumber: true })}
                className={cn(
                  "font-semibold pr-16",
                  quickMode ? "text-lg h-10" : "text-xl"
                )}
                autoFocus={quickMode}
              />
              <div className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                quickMode ? "text-xs" : "text-sm"
              )}>
                VND
              </div>
            </div>
            
            {/* Quick Amount Buttons with AI suggestions */}
            <div className="flex gap-1 flex-wrap">
              {/* Regular quick amounts */}
              {(quickMode 
                ? [10000, 25000, 50000, 100000, 200000]
                : [10000, 20000, 50000, 100000, 200000, 500000]
              ).map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className={cn(
                    "text-xs px-2 py-1 h-6 min-w-0",
                    quickMode && "h-5"
                  )}
                >
                  +{amount >= 1000000 ? (amount / 1000000) + 'M' : (amount / 1000) + 'k'}
                </Button>
              ))}
              
              {/* AI suggested amounts */}
              {aiMode && suggestions
                .filter(s => s.type === 'amount')
                .slice(0, 3)
                .map((suggestion) => (
                  <Button
                    key={suggestion.value}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setValue('amount', suggestion.value as number)}
                    className={cn(
                      "text-xs px-2 py-1 h-6 min-w-0 border-purple-200 bg-purple-50 hover:bg-purple-100",
                      quickMode && "h-5"
                    )}
                  >
                    <Brain className="h-2.5 w-2.5 mr-1" />
                    {(suggestion.value as number).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                  </Button>
                ))
              }
            </div>
          </div>

          {/* Wallet Selection */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-1", quickMode && "text-sm")}>
              <Wallet className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {quickMode 
                ? (transactionType === 'transfer' ? 'From' : 'Wallet')
                : (transactionType === 'transfer' ? t('fromWallet') : t('wallet'))
              }
            </Label>
            <Select onValueChange={(value) => setValue('wallet_id', value)}>
              <SelectTrigger className={cn(quickMode && "h-8")}>
                <SelectValue placeholder={quickMode ? "Select wallet" : t('wallet')} />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: wallet.color }}
                      />
                      <span className="truncate">{wallet.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {wallet.balance.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transfer Destination Wallet */}
          {transactionType === 'transfer' && (
            <div className="space-y-2">
              <Label>{t('toWallet')}</Label>
              <Select onValueChange={(value) => setValue('transfer_to_wallet_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectDestinationWallet')} />
                </SelectTrigger>
                <SelectContent>
                  {wallets
                    .filter(w => w.id !== selectedWalletId)
                    .map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: wallet.color }}
                        />
                        <span>{wallet.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Selection */}
          {transactionType !== 'transfer' && (
            <div className={cn("space-y-2", quickMode && "space-y-1")}>
              <Label className={cn(quickMode && "text-sm")}>
                {quickMode ? 'Category' : t('category')}
              </Label>
              <Select onValueChange={(value) => setValue(getCategoryFieldName(), value)}>
                <SelectTrigger className={cn(quickMode && "h-8")}>
                  <SelectValue placeholder={quickMode ? "Select category" : t('category')} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {getCurrentCategories()
                    .sort((a, b) => a.name_vi.localeCompare(b.name_vi))
                    .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name_vi}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Smart Description Input */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-2", quickMode && "text-sm")}>
              {aiMode ? (
                <Lightbulb className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              ) : (
                <Tag className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
              )}
              {quickMode ? 'Description' : t('description')}
              {aiMode && suggestions.some(s => s.type === 'description' && s.confidence > 0.5) && (
                <Badge variant="secondary" className="text-xs h-4">
                  <Brain className="h-2.5 w-2.5 mr-1" />
                  {suggestions.filter(s => s.type === 'description').length} suggestions
                </Badge>
              )}
            </Label>
            
            {aiMode ? (
              <Popover open={showSuggestions && suggestionType === 'description'} onOpenChange={(open) => {
                if (!open) {
                  setShowSuggestions(false)
                  setSuggestionType(null)
                }
              }}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      ref={descriptionInputRef}
                      placeholder={quickMode ? "Coffee, groceries..." : t('descriptionPlaceholder')}
                      value={currentDescription}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      onFocus={() => {
                        if (suggestions.some(s => s.type === 'description')) {
                          setSuggestionType('description')
                          setShowSuggestions(true)
                        }
                      }}
                      className={cn(quickMode && "h-8 text-sm")}
                    />
                    {suggestions.some(s => s.type === 'description') && (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </PopoverTrigger>
                
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search descriptions..." />
                    <CommandList>
                      <CommandEmpty>No suggestions found.</CommandEmpty>
                      <CommandGroup heading="Smart suggestions">
                        <ScrollArea className="max-h-32">
                          {getContextualSuggestions().map((suggestion) => (
                            <CommandItem
                              key={`${suggestion.type}-${suggestion.value}`}
                              onSelect={() => handleApplySuggestion(suggestion)}
                              className="text-sm"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <Brain className="h-3 w-3 text-purple-500" />
                                  <span>{suggestion.value}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {suggestion.predicted_category && (
                                    <Badge variant="outline" className="text-xs px-1 h-4">
                                      {suggestion.predicted_category.name_vi}
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <History className="h-2.5 w-2.5" />
                                    {suggestion.frequency}x
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                placeholder={quickMode ? "Description (optional)" : t('descriptionPlaceholder')}
                {...form.register('description')}
                className={cn(quickMode && "h-8 text-sm")}
              />
            )}
          </div>

          {/* Receipt Images */}
          {!quickMode && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Camera className="h-4 w-4 text-muted-foreground" />
                Receipt Images
                {isProcessingOCR && (
                  <div className="flex items-center gap-1 ml-2">
                    <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
                    <span className="text-xs text-blue-600">Processing OCR...</span>
                  </div>
                )}
              </Label>
              <ReceiptImageUpload
                images={receiptImages}
                onImagesChange={handleReceiptImagesChange}
                userId={userId}
                maxImages={3}
                autoUpload={false}
                className=""
              />
              {receiptImages.length > 0 && ocrProcessedImages.size > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Eye className="h-3 w-3" />
                  <span>
                    OCR processed {ocrProcessedImages.size} of {receiptImages.length} images
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Tags with AI suggestions */}
          <div className={cn("space-y-2", quickMode && "space-y-1")}>
            <Label className={cn("flex items-center gap-1", quickMode && "text-sm")}>
              <Hash className={cn("text-muted-foreground", quickMode ? "h-3 w-3" : "h-4 w-4")} />
              {quickMode ? 'Tags' : t('tags')}
            </Label>
            
            {/* Tag Input with Suggestions */}
            <Popover open={tagInputOpen} onOpenChange={setTagInputOpen}>
              <div className="flex gap-1">
                <PopoverTrigger asChild>
                  <div className="flex-1 relative">
                    <Input
                      ref={tagInputRef}
                      placeholder={quickMode ? "Add tag..." : t('addTagPlaceholder')}
                      value={customTag}
                      onChange={(e) => handleTagInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        } else if (e.key === 'ArrowDown' && getFilteredTagSuggestions().length > 0) {
                          e.preventDefault()
                          setTagInputOpen(true)
                        }
                      }}
                      onFocus={() => customTag && setTagInputOpen(true)}
                      className={cn(quickMode && "h-8 text-sm")}
                    />
                    {(getFilteredTagSuggestions().length > 0 || customTag) && (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </PopoverTrigger>
                <Button 
                  type="button" 
                  onClick={() => addTag()} 
                  size={quickMode ? "sm" : "sm"}
                  className={cn(quickMode && "h-8 px-2")}
                  disabled={!customTag.trim()}
                >
                  <Plus className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
                </Button>
              </div>
              
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or create tag..." 
                    value={customTag}
                    onValueChange={handleTagInputChange}
                  />
                  <CommandEmpty>
                    {customTag && (
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => addTag()}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Create &quot;{customTag}&quot;
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                  {getFilteredTagSuggestions().length > 0 && (
                    <CommandGroup heading="Suggested tags">
                      <ScrollArea className="max-h-32">
                        {getFilteredTagSuggestions().slice(0, 8).map((tag) => (
                          <CommandItem
                            key={tag}
                            onSelect={() => addTag(tag)}
                            className="text-sm"
                          >
                            <Hash className="h-3 w-3 mr-2 text-muted-foreground" />
                            {tag}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className={cn(
                      "flex items-center gap-1 pr-1",
                      quickMode ? "text-xs py-0" : "text-xs"
                    )}
                  >
                    <Hash className="h-2.5 w-2.5" />
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Quick Tag Suggestions */}
            {selectedTags.length === 0 && tagSuggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Quick add:</p>
                <div className="flex flex-wrap gap-1">
                  {tagSuggestions.slice(0, 5).map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      className={cn(
                        "h-6 px-2 text-xs border-dashed hover:border-solid",
                        quickMode && "h-5"
                      )}
                    >
                      <Hash className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* AI suggested tags */}
            {aiMode && getRelatedTags(currentDescription || currentMerchant).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">AI suggested tags:</p>
                <div className="flex flex-wrap gap-1">
                  {getRelatedTags(currentDescription || currentMerchant).map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      className={cn(
                        "h-6 px-2 text-xs border-dashed hover:border-solid border-purple-200 bg-purple-50 hover:bg-purple-100",
                        quickMode && "h-5"
                      )}
                    >
                      <Brain className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={cn("flex gap-2", quickMode ? "pt-2" : "pt-4")}>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className={cn("flex-1", quickMode && "h-8 text-sm")}
              >
                {quickMode ? 'Cancel' : t('cancel')}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                !watch('wallet_id') || 
                !watch('amount') || 
                (transactionType === 'expense' && !watch('expense_category_id')) ||
                (transactionType === 'income' && !watch('income_category_id')) ||
                (transactionType === 'transfer' && !watch('transfer_to_wallet_id'))
              } 
              className={cn("flex-1 font-medium", quickMode && "h-8 text-sm")}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "border-2 border-white border-t-transparent rounded-full animate-spin",
                    quickMode ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  {quickMode ? 'Saving...' : t('saving')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className={cn(quickMode ? "h-3 w-3" : "h-4 w-4")} />
                  {quickMode ? 'Save' : t('saveTransaction')}
                  {quickMode && (
                    <kbd className="ml-1 px-1 py-0.5 text-xs bg-black/10 rounded border">
                      ⌘↵
                    </kbd>
                  )}
                  {aiMode && (
                    <Brain className="h-3 w-3 text-purple-200" />
                  )}
                </div>
              )}
            </Button>
          </div>
          
          {/* Tips */}
          {quickMode && (
            <div className="text-xs text-muted-foreground text-center pt-1 border-t">
              <p>Tips: ⌘+1/2/3 to switch type • ⌘+Enter to save • ↓ for tag suggestions</p>
              {aiMode && (
                <p className="mt-1">💡 AI learns from your patterns - The more you use it, the smarter it gets!</p>
              )}
            </div>
          )}
        </form>
        )}

        {/* Conversational Transaction Confirmation Dialog */}
        <ConversationalTransactionDialog
          isOpen={showConfirmationDialog}
          onClose={() => setShowConfirmationDialog(false)}
          parsedData={parsedData}
          wallets={wallets}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          onConfirm={handleConfirmedTransactions}
          onCorrection={handleCorrection}
          originalText={conversationalText}
        />

        {/* First-Time User Onboarding Helper */}
        <OnboardingHelper
          isVisible={showOnboarding}
          onClose={handleOnboardingComplete}
          onExampleClick={handleOnboardingExampleClick}
          userHasTransactions={hasRecentTransactions}
          currentMode={conversationalMode ? 'conversational' : 'traditional'}
        />
      </CardContent>
    </Card>
  )
}