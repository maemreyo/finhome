// src/components/admin/InterestRateManagementTableConnected.tsx
// Interest rate management table connected to real Supabase data

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BankInterestRate } from '@/src/types/supabase'

interface InterestRateManagementTableConnectedProps {
  initialData: BankInterestRate[]
  locale: string
}

export const InterestRateManagementTableConnected: React.FC<InterestRateManagementTableConnectedProps> = ({
  initialData,
  locale
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest Rate Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Interest rate management table will be implemented here.</p>
          <p className="text-sm">Data count: {initialData.length}</p>
          <p className="text-sm">Locale: {locale}</p>
        </div>
      </CardContent>
    </Card>
  )
}