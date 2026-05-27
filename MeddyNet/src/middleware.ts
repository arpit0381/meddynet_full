import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/verify',
  '/search',
  '/map',
  '/labs',
  '/help-center',
  '/faq',
  '/contact',
  '/about',
  '/blog',
  '/privacy',
  '/terms',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths, static files, and API routes
  if (
    publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }
  
  // Check for auth token
  const token = request.cookies.get('meddynet_access_token')?.value
  
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
