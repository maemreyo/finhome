// src/app/[locale]/plans/shared/[token]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PlanDetailView } from '@/components/plans/PlanDetailView'
import { Badge } from '@/components/ui/badge'
import { Lock, Share2, Eye } from 'lucide-react'

interface SharedPlanPageProps {
  params: Promise<{
    locale: string
    token: string
  }>
}

function decodeShareToken(token: string): { planId: string; timestamp: number } | null {
  try {
    const decoded = atob(token)
    const [planId, timestampStr] = decoded.split('_')
    const timestamp = parseInt(timestampStr, 10)
    
    if (!planId || isNaN(timestamp)) {
      return null
    }

    // Check if token is not older than 30 days
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    if (Date.now() - timestamp > maxAge) {
      return null
    }

    return { planId, timestamp }
  } catch (error) {
    return null
  }
}

export default async function SharedPlanPage({ params }: SharedPlanPageProps) {
  const { locale, token } = await params
  const supabase = await createClient()

  // Decode the share token
  const tokenData = decodeShareToken(token)
  if (!tokenData) {
    notFound()
  }

  // Get plan details (private plans can be accessed via share token)
  const { data: plan, error } = await supabase
    .from('financial_plans')
    .select(`
      *,
      user_profiles!inner(
        full_name,
        avatar_url
      )
    `)
    .eq('id', tokenData.planId)
    .single()

  if (error || !plan) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('financial_plans')
    .update({ 
      view_count: (plan.view_count || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', tokenData.planId)

  return (
    <div className="container mx-auto py-6">
      {/* Shared Plan Header */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="w-4 h-4 text-amber-600" />
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Lock className="w-3 h-3 mr-1" />
            Shared Plan
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-700">
            This plan was privately shared with you by {plan.user_profiles?.full_name || 'Anonymous'}
          </span>
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <Eye className="w-3 h-3" />
            <span>{plan.view_count || 0} views</span>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <PlanDetailView plan={plan} />
    </div>
  )
}

export async function generateMetadata({ params }: SharedPlanPageProps) {
  const { token } = await params
  const tokenData = decodeShareToken(token)
  
  if (!tokenData) {
    return {
      title: 'Invalid Share Link - FinHome',
      description: 'The share link is invalid or has expired.'
    }
  }

  const supabase = await createClient()
  const { data: plan } = await supabase
    .from('financial_plans')
    .select('plan_name, description, user_profiles!inner(full_name)')
    .eq('id', tokenData.planId)
    .single()

  if (!plan) {
    return {
      title: 'Plan Not Found - FinHome',
      description: 'The requested financial plan could not be found.'
    }
  }

  return {
    title: `${plan.plan_name} - Shared on FinHome`,
    description: plan.description || `Financial plan shared by ${plan.user_profiles?.full_name || 'a FinHome user'}`,
    openGraph: {
      title: `${plan.plan_name} - Financial Plan`,
      description: plan.description || `Check out this financial plan shared by ${plan.user_profiles?.full_name || 'a FinHome user'}`,
      type: 'website',
      siteName: 'FinHome',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${plan.plan_name} - Financial Plan`,
      description: plan.description || `Check out this financial plan shared by ${plan.user_profiles?.full_name || 'a FinHome user'}`,
    }
  }
}