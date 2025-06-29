import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Match all paths except static files and Next.js internals
export const config = { 
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/about',
  '/pricing',
  '/auth',
  '/auth/callback',
  '/dashboard',
  '/api/auth',
  '/favicon.ico',
  '/images',
  '/_next',
  '/_vercel',
  '/site.webmanifest',
  '/sitemap.xml',
  '/robots.txt'
]

// Paths that should be accessible without authentication
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  )
}

export default async function middleware(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const path = requestUrl.pathname
  
  // Skip middleware for public paths
  if (isPublicPath(path)) {
    // For public paths, just continue without modifying the response
    return NextResponse.next({
      request: {
        headers: req.headers,
      },
    })
  }

  // Create a response object without using next()
  const response = new NextResponse()
  const supabase = createMiddlewareClient({ req, res: response })
  
  try {
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      // If there's an error, redirect to login with the current path as a redirect
      const loginUrl = new URL('/auth', requestUrl.origin)
      loginUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(loginUrl)
    }
    
    // If no session and not on a public path, redirect to login
    if (!session) {
      console.log('No session found, redirecting to login')
      const redirectUrl = new URL('/auth', req.url)
      // Store the original URL for redirecting back after login
      if (path !== '/') {
        redirectUrl.searchParams.set('redirectedFrom', path)
      }
      return NextResponse.redirect(redirectUrl)
    }
    
    // If session exists and user is on auth page, redirect to home or intended URL
    if (path === '/auth') {
      const redirectTo = requestUrl.searchParams.get('redirectedFrom') || '/'
      console.log('Session exists, redirecting to:', redirectTo)
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }
    
    // Add security headers for tools
    if (path.startsWith('/tools/')) {
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'"
      )
    }
    
    return response
    
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, continue but log it
    return response
  }
}
