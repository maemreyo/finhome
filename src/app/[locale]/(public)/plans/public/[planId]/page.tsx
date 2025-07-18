// src/app/[locale]/plans/public/[planId]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PlanDetailView } from '@/components/plans/PlanDetailView'
import { Badge } from '@/components/ui/badge'
import { Eye, Users } from 'lucide-react'

interface PublicPlanPageProps {
  params: Promise<{
    locale: string
    planId: string
  }>
}

export default async function PublicPlanPage({ params }: PublicPlanPageProps) {
  const { locale, planId } = await params
  const supabase = await createClient()

  // Get public plan details
  const { data: plan, error } = await supabase
    .from('financial_plans')
    .select(`
      *,
      user_profiles!inner(
        full_name,
        avatar_url
      )
    `)
    .eq('id', planId)
    .eq('is_public', true)
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
    .eq('id', planId)

  return (
    <div className="container mx-auto py-6">
      {/* Public Plan Header */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Public Plan
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Shared by {plan.user_profiles?.full_name || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-600">
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

export async function generateMetadata({ params }: PublicPlanPageProps) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('financial_plans')
    .select('plan_name, description, user_profiles!inner(full_name)')
    .eq('id', planId)
    .eq('is_public', true)
    .single()

  if (!plan) {
    return {
      title: 'Plan Not Found - FinHome',
      description: 'The requested financial plan could not be found or is not public.'
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