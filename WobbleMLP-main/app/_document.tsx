import { Html, Head, Main, NextScript } from 'next/document';
import * as Sentry from '@sentry/nextjs';

export default function Document() {
  // Initialize Sentry for error tracking
  if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
  }

  return (
    <Html lang="en">
      <Head>
        {/* Performance Monitoring */}
        {process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  window.performance.mark('pageViewStart');
                }
              `,
            }}
          />
        )}

        {/* Error Boundary Styles */}
        <style jsx global>{`
          .error-boundary {
            padding: 2rem;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              'Helvetica Neue', Arial, sans-serif;
          }
          .error-boundary h1 {
            color: #e53e3e;
            margin-bottom: 1rem;
          }
          .error-boundary p {
            color: #4a5568;
            margin-bottom: 0.5rem;
          }
          .error-boundary pre {
            background: #f7fafc;
            padding: 1rem;
            border-radius: 0.375rem;
            margin-top: 1rem;
            overflow-x: auto;
            font-size: 0.875rem;
            color: #4a5568;
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Performance Monitoring Script */}
        {process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  window.performance.mark('pageViewEnd');
                  window.performance.measure('pageView', 'pageViewStart', 'pageViewEnd');
                  
                  // Report to analytics or monitoring service
                  const measure = window.performance.getEntriesByName('pageView')[0];
                  if (measure) {
                    console.log('Page load time:', measure.duration + 'ms');
                    
                    // Example: Report to your analytics service
                    // fetch('/api/analytics/page-load', {
                    //   method: 'POST',
                    //   body: JSON.stringify({
                    //     duration: measure.duration,
                    //     path: window.location.pathname,
                    //   }),
                    //   headers: {
                    //     'Content-Type': 'application/json',
                    //   },
                    // });
                  }
                }
              `,
            }}
          />
        )}
      </body>
    </Html>
  );
}
