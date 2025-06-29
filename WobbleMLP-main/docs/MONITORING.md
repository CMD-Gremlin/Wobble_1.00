# Monitoring & Error Tracking

This document outlines the monitoring and error tracking setup for the Wobble Stack application.

## Features

- **Error Tracking**: Captures and reports client and server-side errors
- **Performance Monitoring**: Tracks page load times and API response times
- **Real-time Alerts**: Configured for critical errors and performance issues
- **Session Replay**: Records user sessions to help debug issues

## Setup

### Prerequisites

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project in Sentry
3. Get your DSN (Data Source Name) from the project settings

### Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=development

# Toggle Features
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true

# Release Information
NEXT_PUBLIC_SENTRY_RELEASE=$npm_package_version
```

## Usage

### Error Boundaries

Use the `ErrorBoundary` component to catch and report React errors:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      {/* Your component code */}
    </ErrorBoundary>
  );
}
```

### Manual Error Reporting

Report errors manually using Sentry's API:

```typescript
import * as Sentry from '@sentry/nextjs';

// Report an error
Sentry.captureException(new Error('Something went wrong'));

// Report a message
Sentry.captureMessage('Something important happened');

// Add context
Sentry.setContext('user', {
  id: '123',
  email: 'user@example.com'
});
```

### Performance Monitoring

Performance monitoring is automatically enabled when `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING` is set to `true`.

Custom performance monitoring:

```typescript
// Start a custom transaction
const transaction = Sentry.startTransaction({ name: 'My Transaction' });

// Create a span
const span = transaction.startChild({ op: 'functionX' });

// Your code here

// End the span when done
span.finish();

// End the transaction
transaction.finish();
```

## Viewing Data

1. Log in to your Sentry dashboard
2. Select your project
3. Navigate to the relevant section:
   - **Issues**: View and manage errors
   - **Performance**: View performance metrics
   - **Replays**: View session replays

## Best Practices

1. **Tagging**: Add relevant tags to errors for better filtering
2. **Context**: Add context to errors when reporting them
3. **Filtering**: Configure error filtering to ignore expected errors
4. **Sampling**: Adjust sampling rates in production to control volume

## Troubleshooting

### Errors not appearing in Sentry
- Verify your DSN is correct
- Check network requests in browser dev tools
- Ensure the Sentry client is properly initialized

### Performance data missing
- Verify performance monitoring is enabled
- Check for console errors
- Ensure you're not using an ad blocker that might block Sentry

## Local Development

In development, errors will be logged to the console. To test error reporting:

1. Set `NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true`
2. Trigger an error in your code
3. Check the Sentry dashboard for the error
