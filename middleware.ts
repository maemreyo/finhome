import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const locales = ['en', 'vi']; // Assuming these are the locales based on messages/en.json and messages/vi.json
const defaultLocale = 'en'; // Assuming 'en' is the default

const i18nMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Or 'as-needed' if you prefer
});

export async function middleware(request: NextRequest) {
  // Run next-intl middleware first
  const response = i18nMiddleware(request);

  // Now, apply your existing authentication and route protection logic
  const { pathname } = request.nextUrl;

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value });
            response.cookies.set({ name, value, ...options }); // Use the response from i18nMiddleware
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { user }, error } = await supabase.auth.getUser();

  // Define protected and public routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/billing',
    '/api/protected'
  ];

  const authRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];

  // Adjust paths for locale prefix
  const protectedRoutesWithLocale = locales.flatMap(locale =>
    protectedRoutes.map(route => `/${locale}${route}`)
  );
  const authRoutesWithLocale = locales.flatMap(locale =>
    authRoutes.map(route => `/${locale}${route}`)
  );

  const isProtectedRoute = protectedRoutesWithLocale.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutesWithLocale.some(route =>
    pathname.startsWith(route)
  );

  // Handle protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(`/${defaultLocale}/auth/login`, request.url); // Use defaultLocale
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle auth routes (redirect authenticated users away)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard`, request.url)); // Use defaultLocale
  }

  // Special handling for API routes
  if (pathname.startsWith('/api/protected') && !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Handle auth callback
  if (pathname.includes('/auth/callback')) { // Use includes for robustness with locale prefix
    return response;
  }

  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next (Next.js internals)
    // - api (API routes)
    // - public files (public folder)
    // - All other files in the root (e.g. favicon.ico)
    '/((?!_next|api|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}