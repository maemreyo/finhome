// Temporary debug endpoint to check authentication
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Get user profile if authenticated
    let profile = null;
    if (user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, is_admin')
        .eq('id', user.id)
        .single();
      profile = profileData;
    }
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role
      } : null,
      profile,
      authError: authError?.message,
      cookiesPresent: !!request.headers.get('cookie'),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}