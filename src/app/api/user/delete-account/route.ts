// src/app/api/user/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(request: NextRequest) {
  try {
    const { userId, confirmation } = await request.json()

    // Validate confirmation text
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Invalid confirmation text' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure the user can only delete their own account
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - can only delete own account' },
        { status: 403 }
      )
    }

    // Delete user data in the correct order (due to foreign key constraints)
    // Note: In a production environment, you might want to implement soft deletion
    // or anonymization instead of hard deletion for audit purposes

    const deleteTables = [
      'user_activities',
      'user_achievements', 
      'notifications',
      'post_comments',
      'community_posts',
      'loan_calculations',
      'financial_plans',
      'user_properties',
      'property_favorites',
      'feature_usage',
      'billing_history',
      'subscriptions',
      'user_preferences',
      'user_profiles'
    ]

    // Delete user data from all tables
    for (const table of deleteTables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error)
        // Continue with other tables even if one fails
      }
    }

    // Delete user from auth.users (this will cascade delete related data)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      return NextResponse.json(
        { error: 'Failed to delete account from authentication system' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}