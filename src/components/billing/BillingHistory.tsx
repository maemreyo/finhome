// src/components/billing/BillingHistory.tsx
// Billing history component with i18n support

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslations, useLocale } from 'next-intl'
import { formatCurrency } from '@/lib/utils/currency'

interface BillingRecord {
  id: string
  amount_paid: number
  currency: string
  status: string
  invoice_url: string | null
  invoice_pdf: string | null
  billing_reason: string | null
  created_at: string
}

export function BillingHistory() {
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations('BillingPage.billingHistory')
  const locale = useLocale()

  useEffect(() => {
    const fetchBillingHistory = async () => {
      try {
        const response = await fetch('/api/billing/history')
        if (response.ok) {
          const data = await response.json()
          setBillingHistory(data)
        }
      } catch (error) {
        console.error('Error fetching billing history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBillingHistory()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      paid: 'default',
      open: 'secondary',
      void: 'destructive',
      uncollectible: 'destructive',
    }

    const statusText = t(`statuses.${status}` as any) || status.charAt(0).toUpperCase() + status.slice(1)

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {statusText}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {billingHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('noHistory')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tableHeaders.date')}</TableHead>
                <TableHead>{t('tableHeaders.amount')}</TableHead>
                <TableHead>{t('tableHeaders.status')}</TableHead>
                <TableHead>{t('tableHeaders.reason')}</TableHead>
                <TableHead>{t('tableHeaders.invoice')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(record.amount_paid / 100, {
                      currency: record.currency.toUpperCase() as 'VND' | 'USD',
                      locale,
                      showSymbol: true
                    })}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.status)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {record.billing_reason || t('defaultReason')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {record.invoice_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(record.invoice_url!, '_blank')}
                          title={t('viewInvoice')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {record.invoice_pdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(record.invoice_pdf!, '_blank')}
                          title={t('downloadInvoice')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}