// src/components/admin/AchievementManagementTableConnected.tsx
// Achievement management table connected to real Supabase data

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Achievement } from '@/src/types/supabase'

interface AchievementManagementTableConnectedProps {
  initialData: Achievement[]
  locale: string
}

export const AchievementManagementTableConnected: React.FC<AchievementManagementTableConnectedProps> = ({
  initialData,
  locale
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Achievement management table will be implemented here.</p>
          <p className="text-sm">Data count: {initialData.length}</p>
          <p className="text-sm">Locale: {locale}</p>
        </div>
      </CardContent>
    </Card>
  )
}