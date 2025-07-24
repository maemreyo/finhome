// src/app/api/admin/status/route.ts
// API route for admin status and dashboard statistics

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';

// Check if user is admin
async function checkAdminAccess(supabase: any, userId: string): Promise<boolean> {
  try {
    console.log('Checking admin access for user:', userId);
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)  // Fixed: using 'id' instead of 'user_id'
      .single();
    
    console.log('Admin check result:', { profile, error });
    return profile?.is_admin === true;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// GET - Admin status and statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Debug authentication
    console.log('Auth check:', { user: user?.id, authError });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json({ 
        error: 'Unauthorized', 
        debug: { hasUser: !!user, authError: authError?.message }
      }, { status: 401 });
    }

    // Check admin access
    const isAdmin = await checkAdminAccess(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Gather system statistics
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalApiKeys: 0,
      activeApiKeys: 0,
      systemHealth: 'healthy' as const,
    };

    try {
      // Get user statistics
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });
      
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      stats.totalUsers = totalUsers || 0;
      stats.activeUsers = activeUsers || 0;

      // Get API key statistics (if table exists)
      try {
        const { count: totalApiKeys } = await supabase
          .from('gemini_api_keys')
          .select('*', { count: 'exact' });
        
        const { count: activeApiKeys } = await supabase
          .from('gemini_api_keys')
          .select('*', { count: 'exact' })
          .eq('is_active', true);

        stats.totalApiKeys = totalApiKeys || 0;
        stats.activeApiKeys = activeApiKeys || 0;
      } catch (error) {
        // Table might not exist yet, ignore error
        console.log('Gemini API keys table not found, skipping statistics');
      }

      // Determine system health based on various factors
      if (stats.activeApiKeys === 0 && stats.totalApiKeys > 0) {
        stats.systemHealth = 'warning';
      } else if (stats.totalUsers > 0 && stats.activeUsers === 0) {
        stats.systemHealth = 'warning';
      }

    } catch (error) {
      console.error('Error gathering statistics:', error);
      stats.systemHealth = 'error';
    }

    return NextResponse.json({
      isAdmin: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in GET /api/admin/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}