// src/components/ui/skeleton-transaction-loader.tsx
// Skeleton loader that mimics the transaction dialog structure for better UX
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Brain, Sparkles, Zap, CheckCircle, AlertCircle, AlertTriangle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SkeletonTransactionLoaderProps {
  status?: string
  progress?: { current: number; estimated: number }
  streamingTransactions?: any[]
  className?: string
}

export function SkeletonTransactionLoader({ 
  status = 'Analyzing your text...', 
  progress,
  streamingTransactions = [],
  className 
}: SkeletonTransactionLoaderProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="h-6 w-6 text-purple-500" />
            <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">AI Transaction Analysis</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="h-3 w-3 text-blue-500 animate-pulse" />
                <span className="animate-pulse">{status}</span>
              </div>
              {progress && (
                <Badge variant="secondary" className="text-xs">
                  {progress.current}/{progress.estimated} found
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        {progress && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse" 
                style={{ width: `${Math.min((progress.current / progress.estimated) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Show completed streaming transactions */}
        {streamingTransactions.map((transaction, index) => (
          <div key={index} className="animate-fade-in">
            <TransactionSkeleton 
              transaction={transaction}
              isComplete={true}
            />
            {index < streamingTransactions.length - 1 && <Separator className="my-3" />}
          </div>
        ))}
        
        {/* Show skeleton for transactions being processed */}
        {Array.from({ length: Math.max(1, (progress?.estimated || 1) - streamingTransactions.length) }).map((_, index) => (
          <div key={`skeleton-${index}`}>
            {(streamingTransactions.length > 0 || index > 0) && <Separator className="my-3" />}
            <TransactionSkeleton isComplete={false} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Compact Confidence Score Display Component
interface ConfidenceScoreProps {
  score: number;
  isUnusual?: boolean;
  unusualReasons?: string[];
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceScore({ 
  score, 
  isUnusual = false, 
  unusualReasons = [], 
  showTooltip = true,
  size = 'md' 
}: ConfidenceScoreProps) {
  const percentage = Math.round(score * 100);
  
  // Determine color based on confidence level
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const confidenceClass = getConfidenceColor(percentage);
  const sizeClass = sizeClasses[size];

  const badge = (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full border font-medium',
      confidenceClass,
      sizeClass,
      isUnusual && 'ring-2 ring-amber-200 ring-offset-1'
    )}>
      {/* Confidence indicator icon */}
      {percentage >= 80 ? (
        <CheckCircle className="h-3 w-3" />
      ) : percentage >= 60 ? (
        <AlertCircle className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      
      <span>{percentage}%</span>
      
      {/* Human review flag */}
      {isUnusual && (
        <Eye className="h-3 w-3 text-amber-600" title="Needs human review" />
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">
              AI Confidence: {percentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              {percentage >= 80 && "High confidence - AI is very sure about this categorization"}
              {percentage >= 60 && percentage < 80 && "Medium confidence - AI has some uncertainty"}
              {percentage < 60 && "Low confidence - Review recommended"}
            </div>
            {isUnusual && unusualReasons.length > 0 && (
              <div className="border-t pt-2">
                <div className="font-medium text-amber-600 mb-1">Review needed:</div>
                <ul className="text-sm space-y-1">
                  {unusualReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Human-in-the-Loop Review Flag Component
interface ReviewFlagProps {
  isRequired: boolean;
  reasons: string[];
  onReviewComplete?: () => void;
  className?: string;
}

export function ReviewFlag({ 
  isRequired, 
  reasons, 
  onReviewComplete,
  className 
}: ReviewFlagProps) {
  if (!isRequired) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-2 py-1 rounded-md',
      'bg-amber-50 border border-amber-200 text-amber-800',
      className
    )}>
      <Eye className="h-4 w-4" />
      <span className="text-sm font-medium">Review Needed</span>
      {onReviewComplete && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onReviewComplete}
          className="h-6 px-2 text-xs hover:bg-amber-100"
        >
          Mark Reviewed
        </Button>
      )}
    </div>
  );
}

interface TransactionSkeletonProps {
  transaction?: any
  isComplete: boolean
}

function TransactionSkeleton({ transaction, isComplete }: TransactionSkeletonProps) {
  if (isComplete && transaction) {
    // Show actual transaction data
    return (
      <div className="space-y-3 p-4 border border-green-200 bg-green-50/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="font-medium text-green-800">
              {transaction.transaction_type === 'expense' ? 'Expense' : 
               transaction.transaction_type === 'income' ? 'Income' : 'Transfer'}
            </span>
            {transaction.confidence_score && (
              <ConfidenceScore 
                score={transaction.confidence_score}
                isUnusual={transaction.is_unusual}
                unusualReasons={transaction.unusual_reasons}
                size="sm"
              />
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg text-green-800">
              {transaction.amount?.toLocaleString('vi-VN')} VND
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Description: </span>
            <span className="font-medium">{transaction.description}</span>
          </div>
          
          {transaction.suggested_category_name && (
            <div>
              <span className="text-muted-foreground">Category: </span>
              <Badge variant="secondary" className="text-xs">
                {transaction.suggested_category_name}
              </Badge>
            </div>
          )}
          
          {transaction.suggested_tags?.length > 0 && (
            <div>
              <span className="text-muted-foreground">Tags: </span>
              <div className="inline-flex gap-1 flex-wrap">
                {transaction.suggested_tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {transaction.extracted_merchant && (
            <div>
              <span className="text-muted-foreground">Merchant: </span>
              <span className="font-medium">{transaction.extracted_merchant}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show skeleton loader
  return (
    <div className="space-y-3 p-4 border border-gray-200 bg-gray-50/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="text-right">
          <div className="h-6 w-24 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-300 rounded animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-300 rounded animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-1">
            <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}