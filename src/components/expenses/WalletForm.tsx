// src/components/expenses/WalletForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconPicker } from '@/components/ui/icon-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { DynamicIcon } from '@/lib/utils/icon-utils';
import { toast } from 'sonner';

const walletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
  wallet_type: z.enum(['cash', 'bank_account', 'credit_card', 'e_wallet', 'savings']),
  description: z.string().optional(),
  balance: z.number().min(0, 'Balance must be non-negative').optional(),
  currency: z.string().default('VND'),
  icon: z.string().default('wallet'),
  color: z.string().default('#3B82F6'),
  is_default: z.boolean().default(false),
  include_in_budget: z.boolean().default(true),
});

type WalletFormData = z.infer<typeof walletSchema>;

interface Wallet extends WalletFormData {
  id: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WalletFormProps {
  wallet?: Wallet;
  onSuccess?: (wallet: Wallet) => void;
  onCancel?: () => void;
}

export function WalletForm({ wallet, onSuccess, onCancel }: WalletFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Wallets');

  const form = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: wallet?.name || '',
      wallet_type: wallet?.wallet_type || 'cash',
      description: wallet?.description || '',
      balance: wallet?.balance || 0,
      currency: wallet?.currency || 'VND',
      icon: wallet?.icon || 'wallet',
      color: wallet?.color || '#3B82F6',
      is_default: wallet?.is_default || false,
      include_in_budget: wallet?.include_in_budget || true,
    },
  });

  const watchedColor = form.watch('color');
  const watchedIcon = form.watch('icon');

  const onSubmit = async (data: WalletFormData) => {
    setIsSubmitting(true);

    try {
      const url = wallet ? `/api/expenses/wallets/${wallet.id}` : '/api/expenses/wallets';
      const method = wallet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save wallet');
      }

      const result = await response.json();
      const savedWallet = result.wallet;

      toast.success(
        wallet 
          ? t('messages.updateSuccess') 
          : t('messages.createSuccess')
      );

      onSuccess?.(savedWallet);
    } catch (error) {
      console.error('Error saving wallet:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : wallet 
            ? t('messages.updateError') 
            : t('messages.createError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const walletTypeOptions = [
    { value: 'cash', label: t('types.cash') },
    { value: 'bank_account', label: t('types.bank_account') },
    { value: 'credit_card', label: t('types.credit_card') },
    { value: 'e_wallet', label: t('types.e_wallet') },
    { value: 'savings', label: t('types.savings') },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('form.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('form.walletName')} *</Label>
              <Input
                id="name"
                placeholder={t('form.walletNamePlaceholder')}
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet_type">{t('form.walletType')} *</Label>
              <Select
                value={form.watch('wallet_type')}
                onValueChange={(value: any) => form.setValue('wallet_type', value)}
              >
                <SelectTrigger id="wallet_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {walletTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('form.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('form.descriptionPlaceholder')}
                rows={3}
                {...form.register('description')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="balance">{t('form.initialBalance')}</Label>
                <Input
                  id="balance"
                  type="number"
                  step="10000"
                  min="0"
                  placeholder="0"
                  {...form.register('balance', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t('form.currency')}</Label>
                <Select
                  value={form.watch('currency')}
                  onValueChange={(value) => form.setValue('currency', value)}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND (₫)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Customization */}
        <Card>
          <CardHeader>
            <CardTitle>{t('form.customization')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: watchedColor + '20' }}
                >
                  <DynamicIcon 
                    name={watchedIcon}
                    className="w-6 h-6"
                    style={{ color: watchedColor }}
                  />
                </div>
                <div>
                  <p className="font-medium">
                    {form.watch('name') || t('form.walletNamePlaceholder')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {walletTypeOptions.find(opt => opt.value === form.watch('wallet_type'))?.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_default">{t('form.defaultWallet')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('form.defaultWalletDescription')}
                  </p>
                </div>
                <Switch
                  id="is_default"
                  checked={form.watch('is_default')}
                  onCheckedChange={(checked) => form.setValue('is_default', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="include_in_budget">{t('form.includeInBudget')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('form.includeInBudgetDescription')}
                  </p>
                </div>
                <Switch
                  id="include_in_budget"
                  checked={form.watch('include_in_budget')}
                  onCheckedChange={(checked) => form.setValue('include_in_budget', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('form.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (wallet ? t('form.updating') : t('form.creating'))
            : (wallet ? t('form.update') : t('form.create'))
          }
        </Button>
      </div>
    </form>
  );
}