// src/components/help/HelpPopover.tsx
// Popover component for detailed help content

'use client'

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, HelpCircle, ExternalLink, BookOpen, Lightbulb } from 'lucide-react'
import { HelpPopoverProps } from '@/types/help'
import { cn } from '@/lib/utils'

export const HelpPopover: React.FC<HelpPopoverProps> = ({
  children,
  title,
  content,
  position = 'bottom',
  trigger = 'click',
  open,
  onOpenChange,
  maxWidth = 400,
  showArrow = true,
  dismissible = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : isOpen

  const popoverContent = (
    <Card className={cn("border-0 shadow-lg", className)} style={{ maxWidth }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-50 rounded-md">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Hướng dẫn chi tiết
              </CardDescription>
            </div>
          </div>
          
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => handleOpenChange(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4 pb-4">
        <div className="space-y-3">
          {typeof content === 'string' ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content}
            </p>
          ) : (
            content
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (trigger === 'manual') {
    return (
      <Popover open={currentOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent
          side={position}
          className="p-0 w-auto"
          sideOffset={8}
          align="start"
        >
          {popoverContent}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover open={currentOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side={position}
        className="p-0 w-auto"
        sideOffset={8}
        align="start"
      >
        {popoverContent}
      </PopoverContent>
    </Popover>
  )
}

// Specialized popover for feature explanations
interface FeatureHelpPopoverProps {
  children: React.ReactNode
  title: string
  description: string
  steps?: string[]
  tips?: string[]
  relatedFeatures?: string[]
  videoUrl?: string
  docsUrl?: string
  className?: string
}

export const FeatureHelpPopover: React.FC<FeatureHelpPopoverProps> = ({
  children,
  title,
  description,
  steps = [],
  tips = [],
  relatedFeatures = [],
  videoUrl,
  docsUrl,
  className
}) => {
  const content = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {steps.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Các bước thực hiện:
          </h4>
          <ol className="space-y-1">
            {steps.map((step, index) => (
              <li key={index} className="text-xs text-muted-foreground flex gap-2">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tips.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Mẹo hữu ích:
          </h4>
          <ul className="space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="text-xs text-muted-foreground flex gap-2">
                <span className="w-1 h-1 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedFeatures.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2">
            Tính năng liên quan:
          </h4>
          <div className="flex flex-wrap gap-1">
            {relatedFeatures.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-[10px] px-2 py-0.5">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {(videoUrl || docsUrl) && (
        <div className="flex items-center gap-2 pt-2">
          {videoUrl && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => window.open(videoUrl, '_blank')}
            >
              📹 Video hướng dẫn
            </Button>
          )}
          {docsUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => window.open(docsUrl, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Tài liệu
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <HelpPopover
      title={title}
      content={content}
      maxWidth={450}
      className={className}
    >
      {children}
    </HelpPopover>
  )
}

// Quick help popover for financial terms
interface QuickHelpPopoverProps {
  children: React.ReactNode
  term: string
  definition: string
  formula?: string
  example?: {
    scenario: string
    calculation: string
    result: string
  }
  className?: string
}

export const QuickHelpPopover: React.FC<QuickHelpPopoverProps> = ({
  children,
  term,
  definition,
  formula,
  example,
  className
}) => {
  const content = (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {definition}
      </p>

      {formula && (
        <div className="p-2 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-xs font-medium text-blue-900 mb-1">Công thức:</p>
          <code className="text-xs text-blue-800 font-mono">
            {formula}
          </code>
        </div>
      )}

      {example && (
        <div className="p-2 bg-green-50 rounded-md border border-green-100">
          <p className="text-xs font-medium text-green-900 mb-1">Ví dụ:</p>
          <p className="text-xs text-green-800 mb-1">{example.scenario}</p>
          <p className="text-xs text-green-700 font-mono mb-1">{example.calculation}</p>
          <p className="text-xs font-semibold text-green-900">→ {example.result}</p>
        </div>
      )}
    </div>
  )

  return (
    <HelpPopover
      title={term}
      content={content}
      maxWidth={380}
      className={className}
    >
      <span className="border-b border-dotted border-blue-500 text-blue-700 cursor-help hover:border-solid transition-all">
        {children}
      </span>
    </HelpPopover>
  )
}

export default HelpPopover