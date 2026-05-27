import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths and static assets
  if (
    publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Check for admin auth token
  const token = request.cookies.get('meddynet_admin_token')?.value
  
  if (!token && pathname.startsWith('/admin')) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
