// src/components/admin/NotificationManagementTableConnected.tsx
// Notification management table connected to real Supabase data

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Notification } from '@/src/types/supabase'

interface NotificationManagementTableConnectedProps {
  initialData: Notification[]
  locale: string
}

export const NotificationManagementTableConnected: React.FC<NotificationManagementTableConnectedProps> = ({
  initialData,
  locale
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Notification management table will be implemented here.</p>
          <p className="text-sm">Data count: {initialData.length}</p>
          <p className="text-sm">Locale: {locale}</p>
        </div>
      </CardContent>
    </Card>
  )
}