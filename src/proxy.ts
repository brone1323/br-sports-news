import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const subdomain = host.split('.')[0]

  // Skip non-team subdomains and bare domains
  if (
    ['www', 'bragging-rights', 'localhost'].includes(subdomain) ||
    subdomain.startsWith('localhost:') ||
    !host.includes('.')
  ) {
    return NextResponse.next()
  }

  // Rewrite to team page
  const url = request.nextUrl.clone()
  if (!url.pathname.startsWith('/team/') && !url.pathname.startsWith('/api/')) {
    url.pathname = `/team/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
