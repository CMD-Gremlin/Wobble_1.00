import { Inter } from 'next/font/google'
import './globals.css'
import AuthGuard from './auth/AuthGuard'
import AuthWrapper from '@/components/AuthWrapper'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Suspense } from 'react'
import * as Sentry from '@sentry/nextjs'

// Configure Sentry for server-side
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
})

export const metadata = {
  title: 'Wobble MLP',
  description: 'A modern web application',
}

const inter = Inter({ subsets: ['latin'] })

// List of public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/callback', '/auth/error', '/test']

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // We'll use a client component wrapper to handle the auth logic
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full`}>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  )
}


