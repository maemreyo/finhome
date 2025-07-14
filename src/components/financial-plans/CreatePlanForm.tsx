// src/components/financial-plans/CreatePlanForm.tsx
// Form component for creating new financial plans

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Home,
  Building,
  TrendingUp,
  DollarSign,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { calculateFinancialMetrics, LoanParameters } from '@/lib/financial/calculations'

// Form validation schema
const createPlanSchema = z.object({
  // Basic Info
  planName: z.string().min(1, 'Plan name is required'),
  planDescription: z.string().optional(),
  planType: z.enum(['home_purchase', 'investment', 'upgrade', 'refinance']),
  
  // Property Details
  purchasePrice: z.number().min(100000000, 'Minimum 100M VND'),
  downPayment: z.number().min(10000000, 'Minimum 10M VND'),
  additionalCosts: z.number().min(0).default(0),
  
  // Personal Finances
  monthlyIncome: z.number().min(5000000, 'Minimum 5M VND'),
  monthlyExpenses: z.number().min(1000000, 'Minimum 1M VND'),
  currentSavings: z.number().min(0),
  otherDebts: z.number().min(0).default(0),
  
  // Investment Specific (optional)
  expectedRentalIncome: z.number().optional(),
  expectedAppreciationRate: z.number().min(0).max(30).optional(),
  investmentHorizonYears: z.number().min(1).max(30).optional(),
  
  // Plan Settings
  isPublic: z.boolean().default(false)
})

type CreatePlanFormData = z.infer<typeof createPlanSchema>

interface CreatePlanFormProps {
  onSubmit: (data: CreatePlanFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

const planTypeOptions = [
  {
    value: 'home_purchase',
    label: 'Mua nhà ở',
    description: 'Mua nhà để ở',
    icon: Home,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    value: 'investment',
    label: 'Đầu tư',
    description: 'Mua để cho thuê hoặc đầu tư',
    icon: Building,
    color: 'bg-green-100 text-green-600'
  },
  {
    value: 'upgrade',
    label: 'Nâng cấp',
    description: 'Bán nhà cũ để mua nhà mới',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    value: 'refinance',
    label: 'Đảo nợ',
    description: 'Chuyển đổi khoản vay hiện tại',
    icon: DollarSign,
    color: 'bg-amber-100 text-amber-600'
  }
]

const FormStep: React.FC<{
  title: string
  description: string
  children: React.ReactNode
  isActive: boolean
}> = ({ title, description, children, isActive }) => (
  <AnimatePresence mode="wait">
    {isActive && (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

const PlanTypeSelector: React.FC<{
  value: string
  onChange: (value: string) => void
}> = ({ value, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {planTypeOptions.map((option) => {
      const IconComponent = option.icon
      const isSelected = value === option.value
      
      return (
        <motion.div
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              isSelected 
                ? "ring-2 ring-blue-500 border-blue-500" 
                : "hover:border-gray-400"
            )}
            onClick={() => onChange(option.value)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={cn("p-3 rounded-lg", option.color)}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
                
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    })}
  </div>
)

const FinancialPreview: React.FC<{
  formData: Partial<CreatePlanFormData>
}> = ({ formData }) => {
  const [metrics, setMetrics] = useState<any>(null)
  
  useEffect(() => {
    if (formData.purchasePrice && formData.downPayment && formData.monthlyIncome && formData.monthlyExpenses) {
      const loanAmount = formData.purchasePrice - formData.downPayment
      const loanParams: LoanParameters = {
        principal: loanAmount,
        annualRate: 10.5, // Default rate
        termMonths: 240, // 20 years default
        promotionalRate: 7.5,
        promotionalPeriodMonths: 24
      }
      
      const personalFinances = {
        monthlyIncome: formData.monthlyIncome,
        monthlyExpenses: formData.monthlyExpenses
      }
      
      const investmentParams = formData.planType === 'investment' && formData.expectedRentalIncome ? {
        expectedRentalIncome: formData.expectedRentalIncome,
        propertyExpenses: formData.expectedRentalIncome * 0.1, // 10% of rental income
        appreciationRate: formData.expectedAppreciationRate || 8,
        initialPropertyValue: formData.purchasePrice
      } : undefined
      
      const calculatedMetrics = calculateFinancialMetrics(
        loanParams,
        personalFinances,
        investmentParams
      )
      
      setMetrics(calculatedMetrics)
    }
  }, [formData])
  
  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            Fill in the required fields to see financial preview
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Financial Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monthly Payment</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(metrics.monthlyPayment)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Debt-to-Income</p>
            <p className="text-lg font-semibold">
              {metrics.debtToIncomeRatio.toFixed(1)}%
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Affordability Score</p>
            <div className="flex items-center space-x-2">
              <Progress value={metrics.affordabilityScore * 10} className="flex-1" />
              <span className="text-sm font-medium">
                {metrics.affordabilityScore}/10
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Total Interest</p>
            <p className="text-lg font-semibold">
              {formatCurrency(metrics.totalInterest)}
            </p>
          </div>
        </div>
        
        {metrics.roi && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Expected ROI
              </span>
              <span className="text-lg font-bold text-green-600">
                {metrics.roi.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Risk Assessment */}
        <div className="flex items-center space-x-2">
          {metrics.affordabilityScore >= 7 ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Good affordability</span>
            </>
          ) : metrics.affordabilityScore >= 5 ? (
            <>
              <Info className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-600">Moderate risk</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">High risk - consider adjustments</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const CreatePlanForm: React.FC<CreatePlanFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<CreatePlanFormData>>({})
  
  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      planType: 'home_purchase',
      additionalCosts: 0,
      otherDebts: 0,
      isPublic: false
    }
  })
  
  const steps = [
    {
      title: 'Plan Type & Basic Info',
      description: 'Choose your plan type and provide basic information'
    },
    {
      title: 'Property Details',
      description: 'Enter property price and down payment information'
    },
    {
      title: 'Personal Finances',
      description: 'Your monthly income, expenses, and current savings'
    },
    {
      title: 'Investment Details',
      description: 'Additional details for investment properties (optional)'
    },
    {
      title: 'Review & Create',
      description: 'Review your information and create the plan'
    }
  ]
  
  const watchedValues = form.watch()
  
  useEffect(() => {
    setFormData(watchedValues)
  }, [watchedValues])
  
  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate)
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }
  
  const handleSubmit = async (data: CreatePlanFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error creating plan:', error)
    }
  }
  
  const getFieldsForStep = (step: number): (keyof CreatePlanFormData)[] => {
    switch (step) {
      case 0:
        return ['planName', 'planType']
      case 1:
        return ['purchasePrice', 'downPayment']
      case 2:
        return ['monthlyIncome', 'monthlyExpenses', 'currentSavings']
      case 3:
        return watchedValues.planType === 'investment' 
          ? ['expectedRentalIncome'] 
          : []
      default:
        return []
    }
  }
  
  const isStepValid = (step: number): boolean => {
    const fields = getFieldsForStep(step)
    return fields.every(field => !form.formState.errors[field])
  }
  
  const progressPercentage = ((currentStep + 1) / steps.length) * 100
  
  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Financial Plan</CardTitle>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              
              {/* Step 0: Plan Type & Basic Info */}
              <FormStep
                title={steps[0].title}
                description={steps[0].description}
                isActive={currentStep === 0}
              >
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="planName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., My First Home Purchase" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="planDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your plan..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Type *</FormLabel>
                        <FormControl>
                          <PlanTypeSelector
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormStep>
              
              {/* Step 1: Property Details */}
              <FormStep
                title={steps[1].title}
                description={steps[1].description}
                isActive={currentStep === 1}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price (VND) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="3000000000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 100M VND
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="downPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Down Payment (VND) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="600000000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {watchedValues.purchasePrice && watchedValues.downPayment &&
                            `${((watchedValues.downPayment / watchedValues.purchasePrice) * 100).toFixed(1)}% of purchase price`
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalCosts"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Additional Costs (VND)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Legal fees, taxes, renovation costs, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormStep>
              
              {/* Step 2: Personal Finances */}
              <FormStep
                title={steps[2].title}
                description={steps[2].description}
                isActive={currentStep === 2}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (VND) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Your gross monthly income
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monthlyExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Expenses (VND) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25000000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Your regular monthly expenses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currentSavings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Savings (VND) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="200000000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Available cash and savings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="otherDebts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Debts (VND)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Credit cards, personal loans, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormStep>
              
              {/* Step 3: Investment Details */}
              <FormStep
                title={steps[3].title}
                description={steps[3].description}
                isActive={currentStep === 3}
              >
                {watchedValues.planType === 'investment' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="expectedRentalIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Monthly Rental (VND)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="18000000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Expected monthly rental income
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expectedAppreciationRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Appreciation (%/year)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="8"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Annual property appreciation rate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="investmentHorizonYears"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Investment Horizon (Years)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            How long do you plan to hold this investment?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Investment details are only required for investment properties.
                    </p>
                  </div>
                )}
              </FormStep>
              
              {/* Step 4: Review & Create */}
              <FormStep
                title={steps[4].title}
                description={steps[4].description}
                isActive={currentStep === 4}
              >
                <div className="space-y-6">
                  <FinancialPreview formData={formData} />
                  
                  <FormField
                    control={form.control}
                    name="isPublic"
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
                            Make this plan public
                          </FormLabel>
                          <FormDescription>
                            Allow other users to view this plan in the community
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </FormStep>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 0 ? onCancel : handlePrevious}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 0 ? 'Cancel' : 'Previous'}
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep) || isLoading}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Plan'}
                  </Button>
                )}
              </div>
              
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreatePlanForm