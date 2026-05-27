import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login']

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
  
  // Check for technician auth token
  const token = request.cookies.get('meddynet_tech_token')?.value
  
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
}
