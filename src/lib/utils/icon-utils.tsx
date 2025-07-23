// src/lib/utils/icon-utils.tsx
import React from 'react';
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

const iconMap = {
  // Financial
  'wallet': Wallet,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'target': Target,
  'calculator': Calculator,
  'receipt': Receipt,
  'coins': Coins,

  // Categories
  'shopping-bag': ShoppingBag,
  'car': Car,
  'home': Home,
  'utensils': Utensils,
  'coffee': Coffee,
  'gamepad': Gamepad,
  'heart': Heart,
  'plane': Plane,
  'book': Book,
  'music': Music,
  'shirt': Shirt,
  'fuel': Fuel,

  // General
  'circle': Circle,
  'square': Square,
  'triangle': Triangle,
  'star': Star,
  'hexagon': Hexagon,
  'diamond': Diamond,
  'zap': Zap,
  'sun': Sun,
  'moon': Moon,
  'cloud': Cloud,
};

export function getIconComponent(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap] || Circle;
}

interface DynamicIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DynamicIcon({ name, className, style }: DynamicIconProps) {
  const IconComponent = getIconComponent(name);
  return <IconComponent className={className} style={style} />;
}