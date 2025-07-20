// Authentication hooks and utilities for client-side usage

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { toast } from 'sonner'

// supabase is already imported from client

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  isAuthenticated: boolean
}

// Main auth hook
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error,
          isAuthenticated: !!session?.user,
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as AuthError,
          isAuthenticated: false,
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null,
          isAuthenticated: !!session?.user,
        }))

        // Handle auth events
        switch (event) {
          case 'SIGNED_IN':
            toast.success('Successfully signed in!')
            break
          case 'SIGNED_OUT':
            toast.success('Successfully signed out!')
            break
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            break
          case 'USER_UPDATED':
            console.log('User updated')
            break
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return state
}

// Auth actions hook
export function useAuthActions() {
  const router = useRouter()

  const signUp = async (email: string, password: string, options?: {
    fullName?: string
    redirectTo?: string
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
          data: {
            full_name: options?.fullName || '',
          },
        },
      })

      if (error) throw error

      toast.success('Check your email for verification link!')
      
      if (options?.redirectTo) {
        router.push(options.redirectTo)
      }

      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { data: null, error: authError }
    }
  }

  const signIn = async (email: string, password: string, redirectTo?: string) => {
    try {
      console.log('Attempting sign in with:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      console.log('Sign in successful, redirecting...')
      
      // Use router push instead of window.location for better Next.js integration
      router.push(redirectTo || '/en/dashboard')

      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      console.error('Sign in failed:', authError)
      toast.error(authError.message)
      return { data: null, error: authError }
    }
  }

  const signInWithProvider = async (
    provider: 'google' | 'github',
    redirectTo?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo || '/dashboard')}` : '/auth/callback',
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { data: null, error: authError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      router.push('/')
      
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { error: authError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/en/auth/reset-password` : '/en/auth/reset-password',
      })

      if (error) throw error

      toast.success('Check your email for reset instructions!')
      
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { data: null, error: authError }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { data: null, error: authError }
    }
  }

  const updateProfile = async (updates: {
    full_name?: string
    avatar_url?: string
    website?: string
  }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) throw error

      toast.success('Profile updated successfully!')
      
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      return { data: null, error: authError }
    }
  }

  return {
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}

// Profile hook for user profile data
export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const updateProfile = async (updates: Partial<{
    full_name: string
    avatar_url: string | null
    website: string
    bio: string
    company: string
    location: string
  }>) => {
    if (!user) return { error: 'No user found' }

    try {
      // First try to update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const newProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            ...updates
          }
          
          const { data: createdData, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single()

          if (createError) throw createError
          
          setProfile(createdData)
          toast.success('Profile created successfully!')
          return { data: createdData, error: null }
        }
        throw error
      }

      setProfile(data)
      toast.success('Profile updated successfully!')
      
      return { data, error: null }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      return { data: null, error }
    }
  }

  return {
    profile,
    loading,
    updateProfile,
  }
}

// Subscription hook
import { Database } from '@/lib/supabase/types'

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        setSubscription(data)
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()

    // Listen for subscription changes
    const subscription_changes = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSubscription(payload.new as Subscription)
          }
        }
      )
      .subscribe()

    return () => {
      subscription_changes.unsubscribe()
    }
  }, [user])

  return {
    subscription,
    loading,
    isActive: subscription?.status === 'active',
    isPro: subscription?.status === 'active',
    hasActiveTrial: subscription?.status === 'trialing',
  }
}

// Route protection hook
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(`${redirectTo}?redirectTo=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}