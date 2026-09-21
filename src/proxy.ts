import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { generateCorrelationId } from '@/lib/correlation';

export async function proxy(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId();
  
  // Clone response and set correlation ID header
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });
  response.headers.set('x-correlation-id', correlationId);

  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes, excluding /admin/login and static assets
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (!isAdminRoute) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If Supabase credentials are not yet configured in local dev, allow login page
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If visiting a protected admin route without an active session, redirect to login
  if (!user && !isLoginPage) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /admin/login, redirect to /admin dashboard
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
