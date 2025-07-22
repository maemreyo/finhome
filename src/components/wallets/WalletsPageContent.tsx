// src/components/wallets/WalletsPageContent.tsx
"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Wallet, Users } from 'lucide-react'
import { WalletManager } from '@/components/expenses/WalletManager'
import { SharedWalletManager } from '@/components/shared-wallets/SharedWalletManager'

interface PersonalWallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  wallet_type: "cash" | "bank_account" | "e_wallet" | "credit_card" | "savings" | "investment" | "other";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SharedWallet {
  id: string;
  name: string;
  description?: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  wallet_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members: Array<{
    role: string;
    can_add_transactions: boolean;
    can_edit_transactions: boolean;
    can_delete_transactions: boolean;
    can_manage_budget: boolean;
  }>;
}

interface WalletsPageContentProps {
  initialPersonalWallets: any[];
  initialSharedWallets: any[];
}

export function WalletsPageContent({ 
  initialPersonalWallets, 
  initialSharedWallets 
}: WalletsPageContentProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const t = useTranslations('Wallets')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {t('tabs.personal')}
            <Badge variant="secondary" className="ml-1">
              {initialPersonalWallets.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('tabs.shared')}
            <Badge variant="secondary" className="ml-1">
              {initialSharedWallets.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <WalletManager initialWallets={initialPersonalWallets} />
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <SharedWalletManager initialWallets={initialSharedWallets} />
        </TabsContent>
      </Tabs>
    </div>
  )
}