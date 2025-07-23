// src/components/ui/color-picker.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const defaultColors = [
  // Blue shades
  '#3B82F6', '#1D4ED8', '#2563EB', '#1E40AF', '#1E3A8A',
  // Green shades
  '#10B981', '#059669', '#047857', '#065F46', '#064E3B',
  // Red shades
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D',
  // Yellow shades
  '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F',
  // Purple shades
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95',
  // Pink shades
  '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843',
  // Indigo shades
  '#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81',
  // Teal shades
  '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A',
  // Orange shades
  '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12',
  // Gray shades
  '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
];

interface ColorPickerProps {
  value?: string;
  onSelect: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value = '#3B82F6', onSelect, label = 'Color' }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onSelect(color);
  };

  const handlePresetSelect = (color: string) => {
    setCustomColor(color);
    onSelect(color);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="color">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            id="color"
          >
            <div
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: value }}
            />
            <span className="uppercase font-mono text-sm">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-color" className="text-sm font-medium">
                Custom Color
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-color"
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-12 h-8 p-0 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 h-8 font-mono text-sm uppercase"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Preset Colors</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {defaultColors.map((color) => (
                  <Button
                    key={color}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-12 h-8 p-0 border-2 hover:scale-110 transition-transform",
                      value === color ? "border-gray-400" : "border-gray-200"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onSelect(customColor);
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}