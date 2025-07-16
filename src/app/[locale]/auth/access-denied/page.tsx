// src/app/[locale]/auth/access-denied/page.tsx
// Localized access denied page for non-admin users

'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldX, Home, Mail } from 'lucide-react'

export default function AccessDeniedPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access the admin panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">
              Administrator Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              The admin panel is restricted to authorized administrators only. 
              If you believe you should have access, please contact the system administrator.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/${locale}`)}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to FinHome
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = 'mailto:admin@finhome.com?subject=Admin Access Request'}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Request Access
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                For security reasons, all access attempts are logged.
                <br />
                Contact: admin@finhome.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}