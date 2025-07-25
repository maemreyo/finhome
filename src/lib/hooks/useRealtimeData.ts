// src/lib/hooks/useRealtimeData.ts
// Real-time data subscription hooks using Supabase

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/src/types/supabase'

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']

// Generic real-time data hook
export function useRealtimeData<T extends TableName>(
  table: T,
  initialData: TableRow<T>[] = []
) {
  const [data, setData] = useState<TableRow<T>[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // Fetch initial data if not provided
    if (initialData.length === 0) {
      setIsLoading(true)
      supabase
        .from(table)
        .select('*')
        .then(({ data: fetchedData, error: fetchError }) => {
          if (isMounted) {
            if (fetchError) {
              setError(fetchError.message)
            } else {
              setData((fetchedData as any) || [])
            }
            setIsLoading(false)
          }
        })
    }

    // Set up real-time subscription
    const subscription = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table as string
        },
        (payload) => {
          if (!isMounted) return

          switch (payload.eventType) {
            case 'INSERT':
              setData(prev => [payload.new as TableRow<T>, ...prev])
              break
            case 'UPDATE':
              setData(prev => 
                prev.map(item => 
                  (item as any).id === (payload.new as any).id 
                    ? payload.new as TableRow<T>
                    : item
                )
              )
              break
            case 'DELETE':
              setData(prev => 
                prev.filter(item => (item as any).id !== (payload.old as any).id)
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [table, initialData.length])

  return { data, isLoading, error, setData }
}

// Specific hooks for admin tables
export function useRealtimeBanks(initialData?: any[]) {
  return useRealtimeData('banks', initialData)
}

export function useRealtimeInterestRates(initialData?: any[]) {
  return useRealtimeData('bank_interest_rates', initialData)
}

export function useRealtimeAchievements(initialData?: any[]) {
  return useRealtimeData('achievements', initialData)
}

export function useRealtimeNotifications(initialData?: any[]) {
  return useRealtimeData('notifications', initialData)
}

export function useRealtimeUsers(initialData?: any[]) {
  return useRealtimeData('user_profiles', initialData)
}

// Custom hook for admin dashboard stats
export function useAdminStats() {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, premium: 0, inactive: 0 },
    banks: { total: 0, active: 0 },
    rates: { total: 0, active: 0 },
    achievements: { total: 0, active: 0 }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchStats = async () => {
      try {
        // Fetch all counts in parallel
        const [usersResult, banksResult, ratesResult, achievementsResult] = await Promise.all([
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('banks').select('*', { count: 'exact', head: true }),
          supabase.from('bank_interest_rates').select('*', { count: 'exact', head: true }),
          supabase.from('achievements').select('*', { count: 'exact', head: true })
        ])

        // Fetch active counts
        const [activeUsersResult, activeBanksResult, activeRatesResult, activeAchievementsResult] = await Promise.all([
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('banks').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('bank_interest_rates').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('is_active', true)
        ])

        // Fetch premium users
        const { count: premiumUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .in('subscription_tier', ['premium', 'professional'])

        if (isMounted) {
          setStats({
            users: {
              total: usersResult.count || 0,
              active: activeUsersResult.count || 0,
              premium: premiumUsers || 0,
              inactive: (usersResult.count || 0) - (activeUsersResult.count || 0)
            },
            banks: {
              total: banksResult.count || 0,
              active: activeBanksResult.count || 0
            },
            rates: {
              total: ratesResult.count || 0,
              active: activeRatesResult.count || 0
            },
            achievements: {
              total: achievementsResult.count || 0,
              active: activeAchievementsResult.count || 0
            }
          })
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchStats()

    // Set up real-time updates for stats
    const subscription = supabase
      .channel('admin-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles'
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banks'
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bank_interest_rates'
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'achievements'
        },
        () => fetchStats()
      )
      .subscribe()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { stats, isLoading }
}

// Hook for real-time admin activity feed
export function useAdminActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('event_type', 'admin_action')
          .order('created_at', { ascending: false })
          .limit(20)

        if (isMounted && !error) {
          setActivities(data || [])
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching admin activities:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchActivities()

    // Set up real-time subscription for new admin actions
    const subscription = supabase
      .channel('admin-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
          filter: 'event_type=eq.admin_action'
        },
        (payload) => {
          if (isMounted) {
            setActivities(prev => [payload.new, ...prev.slice(0, 19)])
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { activities, isLoading }
}