// src/components/expenses/CategoryForm.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconPicker } from '@/components/ui/icon-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DynamicIcon } from '@/lib/utils/icon-utils';

const categorySchema = z.object({
  icon: z.string(),
  color: z.string(),
  category_type: z.enum(['expense', 'income']),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name_vi: string;
  name_en: string;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

interface CategoryFormProps {
  category: Category;
  categoryType: 'expense' | 'income';
  onSuccess?: (category: Category) => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, categoryType, onSuccess, onCancel }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Categories');

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      icon: category.icon || 'circle',
      color: category.color || '#3B82F6',
      category_type: categoryType,
    },
  });

  const watchedColor = form.watch('color');
  const watchedIcon = form.watch('icon');

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/expenses/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      const result = await response.json();
      const updatedCategory = { ...category, ...result.category };

      toast.success(t('messages.updateSuccess'));
      onSuccess?.(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t('messages.updateError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormChanged = () => {
    const currentIcon = form.watch('icon');
    const currentColor = form.watch('color');
    return currentIcon !== category.icon || currentColor !== category.color;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: category.color + '20' }}
          >
            <DynamicIcon name={category.icon || 'circle'} className="w-5 h-5" style={{ color: category.color }} />
          </div>
          {t('form.customizeCategory')}
        </CardTitle>
        <div className="space-y-1">
          <p className="font-medium">{category.name_vi}</p>
          <Badge variant={categoryType === 'expense' ? 'destructive' : 'default'} className="text-xs">
            {categoryType === 'expense' ? t('expense') : t('income')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Color Picker */}
          <ColorPicker
            value={watchedColor}
            onSelect={(color) => form.setValue('color', color)}
            label={t('form.color')}
          />

          {/* Icon Picker */}
          <IconPicker
            value={watchedIcon}
            onSelect={(icon) => form.setValue('icon', icon)}
            color={watchedColor}
          />

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t('form.preview')}</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: watchedColor + '20' }}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ color: watchedColor }}
                >
                  {/* We would need to render the actual icon here based on the icon name */}
                  <DynamicIcon name={watchedIcon} className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="font-medium">{category.name_vi}</p>
                <p className="text-sm text-muted-foreground">
                  {categoryType === 'expense' ? t('expenseCategory') : t('incomeCategory')}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('form.cancel')}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || !isFormChanged()}
            >
              {isSubmitting 
                ? t('form.updating')
                : t('form.update')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Category Management Modal Component
interface CategoryManagementDialogProps {
  categories: Category[];
  categoryType: 'expense' | 'income';
  onCategoriesUpdate?: (categories: Category[]) => void;
}

export function CategoryManagementDialog({ 
  categories, 
  categoryType, 
  onCategoriesUpdate 
}: CategoryManagementDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const t = useTranslations('Categories');

  const handleCategoryUpdate = (updatedCategory: Category) => {
    const updatedCategories = categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    onCategoriesUpdate?.(updatedCategories);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">
          {categoryType === 'expense' ? t('expenseCategories') : t('incomeCategories')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('managementDescription')}
        </p>
      </div>

      {selectedCategory ? (
        <CategoryForm
          category={selectedCategory}
          categoryType={categoryType}
          onSuccess={handleCategoryUpdate}
          onCancel={() => setSelectedCategory(null)}
        />
      ) : (
        <div className="grid gap-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className="justify-start h-auto p-3"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <DynamicIcon name={category.icon || 'circle'} className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <div className="text-left">
                  <p className="font-medium">{category.name_vi}</p>
                  <p className="text-sm text-muted-foreground">{category.name_en}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}