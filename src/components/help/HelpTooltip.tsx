// src/components/help/HelpTooltip.tsx
// Contextual help tooltip component

'use client'

import React, { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, HelpCircle, ExternalLink } from 'lucide-react'
import { HelpTooltipProps } from '@/types/help'
import { cn } from '@/lib/utils'

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  children,
  content,
  title,
  position = 'top',
  trigger = 'hover',
  maxWidth = 300,
  delay = 0,
  offset = 4,
  arrow = true,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (disabled || !content) {
    return <>{children}</>
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  const tooltipContent = (
    <div className={cn("space-y-2", className)} style={{ maxWidth }}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          <Badge variant="secondary" className="text-xs">
            <HelpCircle className="w-3 h-3 mr-1" />
            Tip
          </Badge>
        </div>
      )}
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {content}
      </p>
      
      {trigger === 'click' && (
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-muted-foreground">
            Click outside to close
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )

  if (trigger === 'click') {
    return (
      <TooltipProvider delayDuration={delay}>
        <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent
            side={position}
            sideOffset={offset}
            className="max-w-none"
          >
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={position}
          sideOffset={offset}
          className="max-w-none"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Wrapper component for financial terms
interface FinancialTermTooltipProps {
  children: React.ReactNode
  term: string
  definition: string
  example?: string
  moreInfoUrl?: string
  className?: string
}

export const FinancialTermTooltip: React.FC<FinancialTermTooltipProps> = ({
  children,
  term,
  definition,
  example,
  moreInfoUrl,
  className
}) => {
  const content = (
    <div className="space-y-3 max-w-80">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-foreground">{term}</h4>
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
          Thuật ngữ
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {definition}
      </p>
      
      {example && (
        <div className="p-2 bg-muted rounded-md">
          <p className="text-xs font-medium text-muted-foreground mb-1">Ví dụ:</p>
          <p className="text-xs text-foreground">{example}</p>
        </div>
      )}
      
      {moreInfoUrl && (
        <div className="flex items-center gap-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs p-1"
            onClick={() => window.open(moreInfoUrl, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Tìm hiểu thêm
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("border-b border-dotted border-muted-foreground cursor-help", className)}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-none">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Help icon tooltip for buttons and form fields
interface HelpIconTooltipProps {
  content: string
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const HelpIconTooltip: React.FC<HelpIconTooltipProps> = ({
  content,
  title,
  position = 'top',
  size = 'sm',
  className
}) => {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <HelpTooltip
      content={content}
      title={title}
      position={position}
      trigger="hover"
      maxWidth={280}
      delay={200}
      className={className}
    >
      <HelpCircle className={cn(
        iconSizes[size], 
        "text-muted-foreground hover:text-foreground transition-colors cursor-help",
        className
      )} />
    </HelpTooltip>
  )
}

export default HelpTooltip