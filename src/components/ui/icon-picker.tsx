// src/components/ui/icon-picker.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  // Financial Icons
  Wallet,
  CreditCard,
  PiggyBank,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Calculator,
  Receipt,
  Coins,
  // Category Icons
  ShoppingBag,
  Car,
  Home,
  Utensils,
  Coffee,
  Gamepad,
  Heart,
  Plane,
  Book,
  Music,
  Shirt,
  Fuel,
  // General Icons
  Circle,
  Square,
  Triangle,
  Star,
  Hexagon,
  Diamond,
  Zap,
  Sun,
  Moon,
  Cloud,
} from 'lucide-react';

const iconOptions = [
  // Financial
  { name: 'wallet', Icon: Wallet, category: 'Financial' },
  { name: 'credit-card', Icon: CreditCard, category: 'Financial' },
  { name: 'piggy-bank', Icon: PiggyBank, category: 'Financial' },
  { name: 'dollar-sign', Icon: DollarSign, category: 'Financial' },
  { name: 'trending-up', Icon: TrendingUp, category: 'Financial' },
  { name: 'trending-down', Icon: TrendingDown, category: 'Financial' },
  { name: 'target', Icon: Target, category: 'Financial' },
  { name: 'calculator', Icon: Calculator, category: 'Financial' },
  { name: 'receipt', Icon: Receipt, category: 'Financial' },
  { name: 'coins', Icon: Coins, category: 'Financial' },

  // Categories
  { name: 'shopping-bag', Icon: ShoppingBag, category: 'Categories' },
  { name: 'car', Icon: Car, category: 'Categories' },
  { name: 'home', Icon: Home, category: 'Categories' },
  { name: 'utensils', Icon: Utensils, category: 'Categories' },
  { name: 'coffee', Icon: Coffee, category: 'Categories' },
  { name: 'gamepad', Icon: Gamepad, category: 'Categories' },
  { name: 'heart', Icon: Heart, category: 'Categories' },
  { name: 'plane', Icon: Plane, category: 'Categories' },
  { name: 'book', Icon: Book, category: 'Categories' },
  { name: 'music', Icon: Music, category: 'Categories' },
  { name: 'shirt', Icon: Shirt, category: 'Categories' },
  { name: 'fuel', Icon: Fuel, category: 'Categories' },

  // General
  { name: 'circle', Icon: Circle, category: 'General' },
  { name: 'square', Icon: Square, category: 'General' },
  { name: 'triangle', Icon: Triangle, category: 'General' },
  { name: 'star', Icon: Star, category: 'General' },
  { name: 'hexagon', Icon: Hexagon, category: 'General' },
  { name: 'diamond', Icon: Diamond, category: 'General' },
  { name: 'zap', Icon: Zap, category: 'General' },
  { name: 'sun', Icon: Sun, category: 'General' },
  { name: 'moon', Icon: Moon, category: 'General' },
  { name: 'cloud', Icon: Cloud, category: 'General' },
];

const categories = ['All', 'Financial', 'Categories', 'General'];

interface IconPickerProps {
  value?: string;
  onSelect: (iconName: string) => void;
  color?: string;
}

export function IconPicker({ value = 'circle', onSelect, color = '#3B82F6' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIcons = iconOptions.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedIcon = iconOptions.find(icon => icon.name === value) || iconOptions[0];
  const SelectedIconComponent = selectedIcon.Icon;

  return (
    <div className="space-y-2">
      <Label htmlFor="icon">Icon</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            id="icon"
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: color + '20' }}
            >
              <SelectedIconComponent className="w-4 h-4" style={{ color }} />
            </div>
            <span className="capitalize">{selectedIcon.name.replace('-', ' ')}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <Input
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
            
            <div className="flex gap-1 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
              {filteredIcons.map((icon) => {
                const IconComponent = icon.Icon;
                return (
                  <Button
                    key={icon.name}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-8 h-8 p-0 hover:bg-muted",
                      value === icon.name && "bg-accent"
                    )}
                    onClick={() => {
                      onSelect(icon.name);
                      setOpen(false);
                    }}
                    title={icon.name.replace('-', ' ')}
                  >
                    <div
                      className="w-full h-full rounded flex items-center justify-center"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <IconComponent className="w-4 h-4" style={{ color }} />
                    </div>
                  </Button>
                );
              })}
            </div>
            
            {filteredIcons.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No icons found for &quot;{searchTerm}&quot;
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}