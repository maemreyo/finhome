// src/components/ui/enhanced-currency-input.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatVietnameseCurrency, parseVietnameseCurrency } from "@/lib/financial-utils";
import { Calculator, Info, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedCurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  showCalculator?: boolean;
  showShortForm?: boolean;
  validationState?: 'neutral' | 'warning' | 'error' | 'success';
  validationMessage?: string;
  marketInfo?: {
    average?: number;
    range?: { min: number; max: number };
    trend?: 'up' | 'down' | 'stable';
  };
  disabled?: boolean;
}

export function EnhancedCurrencyInput({
  value,
  onChange,
  placeholder,
  className,
  suggestions = [],
  showCalculator = false,
  showShortForm = true,
  validationState = 'neutral',
  validationMessage,
  marketInfo,
  disabled = false,
}: EnhancedCurrencyInputProps) {
  const t = useTranslations('CreatePlanForm.enhancedInput');
  const [displayValue, setDisplayValue] = useState('');
  const [inputMode, setInputMode] = useState<'short' | 'full'>('short');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update display value when value prop changes
  useEffect(() => {
    if (value && !isFocused) {
      setDisplayValue(formatVietnameseCurrency(value, showShortForm && inputMode === 'short'));
    }
  }, [value, inputMode, isFocused, showShortForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);
    
    // Parse the input and update value
    const numericValue = parseVietnameseCurrency(input);
    onChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showShortForm) {
      // Switch to full number for easier editing
      setDisplayValue(value.toString());
      setInputMode('full');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setShowSuggestions(false);
    
    if (value) {
      setDisplayValue(formatVietnameseCurrency(value, showShortForm));
      setInputMode('short');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Extract numeric value from suggestion
    const match = suggestion.match(/([\d.,]+(?:\s*(?:tỷ|triệu|nghìn))?)/);
    if (match) {
      const numericValue = parseVietnameseCurrency(match[1]);
      onChange(numericValue);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickAmount = (multiplier: number) => {
    const baseAmount = value || 1_000_000_000; // Default 1 billion if no value
    const newAmount = Math.round(baseAmount * multiplier);
    onChange(newAmount);
  };

  const getValidationColor = () => {
    switch (validationState) {
      case 'error': return 'border-red-500 focus:border-red-500';
      case 'warning': return 'border-yellow-500 focus:border-yellow-500';
      case 'success': return 'border-green-500 focus:border-green-500';
      default: return '';
    }
  };

  const getValidationIcon = () => {
    switch (validationState) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-20",
            getValidationColor(),
            className
          )}
        />
        
        {/* Validation indicator */}
        {getValidationIcon() && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <span className="text-sm">{getValidationIcon()}</span>
          </div>
        )}
        
        {/* Currency symbol */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <span className="text-sm text-gray-500">₫</span>
        </div>
        
        {/* Toggle button for input mode */}
        {showShortForm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setInputMode(inputMode === 'short' ? 'full' : 'short');
              if (value) {
                setDisplayValue(formatVietnameseCurrency(value, inputMode === 'full'));
              }
            }}
          >
            <Calculator className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick amount buttons */}
      {isFocused && value > 0 && (
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickAmount(0.5)}
            className="text-xs h-6"
          >
            {t('quickAdjustments.half')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickAmount(0.8)}
            className="text-xs h-6"
          >
            {t('quickAdjustments.decrease20')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickAmount(1.2)}
            className="text-xs h-6"
          >
            {t('quickAdjustments.increase20')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickAmount(2)}
            className="text-xs h-6"
          >
            {t('quickAdjustments.double')}
          </Button>
        </div>
      )}

      {/* Validation message */}
      {validationMessage && (
        <div className={cn(
          "text-xs",
          validationState === 'error' && "text-red-600",
          validationState === 'warning' && "text-yellow-600",
          validationState === 'success' && "text-green-600",
          validationState === 'neutral' && "text-gray-600"
        )}>
          {validationMessage}
        </div>
      )}

      {/* Market information */}
      {marketInfo && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Info className="h-3 w-3" />
          {marketInfo.average && (
            <span>{t('marketInfo.average', { amount: formatVietnameseCurrency(marketInfo.average, true) })}</span>
          )}
          {marketInfo.range && (
            <span>
              {t('marketInfo.range', { 
                min: formatVietnameseCurrency(marketInfo.range.min, true),
                max: formatVietnameseCurrency(marketInfo.range.max, true)
              })}
            </span>
          )}
          {marketInfo.trend && (
            <div className="flex items-center gap-1">
              <TrendingUp className={cn(
                "h-3 w-3",
                marketInfo.trend === 'up' && "text-green-500",
                marketInfo.trend === 'down' && "text-red-500 rotate-180",
                marketInfo.trend === 'stable' && "text-gray-500"
              )} />
              <span>{t(`marketInfo.trend.${marketInfo.trend}`)}</span>
            </div>
          )}
        </div>
      )}

      {/* Smart suggestions */}
      {suggestions.length > 0 && isFocused && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600 font-medium">{t('suggestions')}</div>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200 text-xs"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Slider input for percentages
interface PercentageSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suggestions?: number[];
  className?: string;
}

export function PercentageSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  label,
  suggestions = [],
  className
}: PercentageSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            className="w-20 h-8 text-sm"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        
        {/* Suggestion markers */}
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="absolute top-0 w-1 h-2 bg-blue-500 rounded cursor-pointer"
            style={{ left: `${(suggestion - min) / (max - min) * 100}%` }}
            onClick={() => onChange(suggestion)}
            title={`${suggestion}%`}
          />
        ))}
      </div>
      
      {/* Quick preset buttons */}
      {suggestions.length > 0 && (
        <div className="flex gap-1">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(suggestion)}
              className="text-xs h-6"
            >
              {suggestion}%
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Auto-complete input with suggestions
interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export function SmartInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className
}: SmartInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value && showSuggestions) {
      const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions, showSuggestions]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      
      {filteredSuggestions.length > 0 && showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => {
                onChange(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}