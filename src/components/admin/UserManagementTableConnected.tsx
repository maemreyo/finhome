// src/components/admin/UserManagementTableConnected.tsx
// User management table connected to real Supabase data

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserProfile } from '@/src/types/supabase'

interface UserManagementTableConnectedProps {
  initialData: UserProfile[]
  locale: string
}

export const UserManagementTableConnected: React.FC<UserManagementTableConnectedProps> = ({
  initialData,
  locale
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>User management table will be implemented here.</p>
          <p className="text-sm">Data count: {initialData.length}</p>
          <p className="text-sm">Locale: {locale}</p>
        </div>
      </CardContent>
    </Card>
  )
}