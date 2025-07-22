// src/app/[locale]/(dashboard)/wallets/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WalletsPageContent } from '@/components/wallets/WalletsPageContent'

export default async function WalletsPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch personal wallets data
  const { data: personalWallets } = await supabase
    .from('expense_wallets')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch shared wallets data
  const { data: sharedWallets } = await supabase
    .from('shared_expense_wallets')
    .select(`
      *,
      members:shared_wallet_members!inner(
        role,
        can_add_transactions,
        can_edit_transactions,
        can_delete_transactions,
        can_manage_budget
      )
    `)
    .eq('shared_wallet_members.user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<WalletsSkeleton />}>
        <WalletsPageContent
          initialPersonalWallets={personalWallets || []}
          initialSharedWallets={sharedWallets || []}
        />
      </Suspense>
    </div>
  )
}

function WalletsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Overview Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
      
      {/* Wallets Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-lg animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-8 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}