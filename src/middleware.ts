// src/middleware.ts
// Next.js middleware for admin authentication

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Check if this is an admin route (both old /admin and new /[locale]/admin)
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || 
                      request.nextUrl.pathname.match(/^\/[a-z]{2}\/admin/)

  if (isAdminRoute) {
    try {
      // Get the current user
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        // Extract locale from path or default to 'en'
        const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})\//)
        const locale = localeMatch ? localeMatch[1] : 'en'
        
        // Redirect to localized login if not authenticated
        const redirectUrl = new URL(`/${locale}/auth/login`, request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        redirectUrl.searchParams.set('error', 'authentication_required')
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_uuid: user.id })

      if (adminError || !isAdmin) {
        // Extract locale from path or default to 'en'
        const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})\//)
        const locale = localeMatch ? localeMatch[1] : 'en'
        
        // Redirect to localized access denied page
        const accessDeniedUrl = new URL(`/${locale}/auth/access-denied`, request.url)
        return NextResponse.redirect(accessDeniedUrl)
      }

      // User is authenticated and is admin, continue
      return response
    } catch (error) {
      console.error('Middleware error:', error)
      // Extract locale from path or default to 'en'
      const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})\//)
      const locale = localeMatch ? localeMatch[1] : 'en'
      
      // Redirect to localized login on any error
      const redirectUrl = new URL(`/${locale}/auth/login`, request.url)
      redirectUrl.searchParams.set('error', 'authentication_error')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // For non-admin routes, just refresh the session
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.error('Session refresh error:', error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}