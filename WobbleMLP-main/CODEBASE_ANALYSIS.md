# Wobble Stack - Comprehensive Codebase Analysis

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Tool Management System](#tool-management-system)
5. [Embedding & Execution Model](#embedding--execution-model)
6. [Billing & Subscription System](#billing--subscription-system)
7. [API Reference](#api-reference)
8. [Frontend Architecture](#frontend-architecture)
9. [Security Considerations](#security-considerations)
10. [Testing Strategy](#testing-strategy)
11. [Deployment & DevOps](#deployment--devops)
12. [Areas for Improvement](#areas-for-improvement)
13. [Database Schema](#database-schema)
14. [API Endpoints](#api-endpoints)
15. [Environment Variables](#environment-variables)
16. [Error Handling](#error-handling)
17. [Performance Optimization](#performance-optimization)
18. [Monitoring & Logging](#monitoring--logging)
19. [Contributing Guidelines](#contributing-guidelines)
20. [License](#license)

## Executive Summary

Wobble Stack is a sophisticated platform for creating, managing, and embedding AI-powered web tools. Built on Next.js 14 with TypeScript, it provides a comprehensive solution for developers to build, version, and deploy interactive web applications with built-in authentication, billing, and embedding capabilities.

### Key Features:
- **Tool Creation & Management**: Build and version web tools with HTML/JavaScript
- **Secure Embedding**: Safely embed tools via iframes with content security policies
- **Authentication**: Email-based magic link authentication via Supabase Auth
- **Billing Integration**: Subscription management with Stripe
- **Usage Quotas**: Track and enforce usage limits based on subscription tiers
- **AI Integration**: Built-in support for AI-powered tool generation and modification

## System Architecture

### Technology Stack

| Component           | Technology           |
|---------------------|----------------------|
| Frontend Framework  | Next.js 14 (App Router) |
| Language           | TypeScript 5.3+      |
| Styling            | Tailwind CSS         |
| Backend Services   | Supabase (Auth, Database, Storage) |
| AI Integration     | OpenAI, LangChain    |
| Payment Processing | Stripe               |
| Testing            | Vitest, Playwright  |

### High-Level Architecture

The application follows a modern JAMstack architecture with the following key components:

1. **Frontend Layer**:
   - Next.js application with React 18
   - Server Components and Server Actions for data fetching
   - Client-side state management with React hooks

2. **Backend Layer**:
   - API routes for server-side functionality
   - Supabase for database, authentication, and storage
   - Edge functions for high-performance endpoints

3. **Database Layer**:
   - PostgreSQL database managed by Supabase
   - Row Level Security (RLS) for data access control
   - Real-time subscriptions for live updates

4. **External Integrations**:
   - Stripe for payment processing
   - OpenAI for AI-powered features
   - Email delivery for authentication

## Authentication & Authorization

### Authentication Flow

1. **User Initiation**:
   - User clicks "Sign In" and enters their email
   - System sends a magic link to the provided email via Supabase Auth

2. **Session Management**:
   - JWT-based session tokens stored in HTTP-only cookies
   - Automatic token refresh handled by Supabase client
   - Session validation on protected routes

3. **Authorization**:
   - Role-based access control (RBAC) using Supabase RLS
   - Custom claims in JWT for fine-grained permissions
   - Middleware for route protection

### Key Components

- **Login Flow**: `app/auth/login/page.tsx`
- **Auth Middleware**: `middleware.ts`
- **Supabase Client**: `lib/supabaseClient.ts`

## Tool Management System

### Database Schema

### Tables

#### 1. `public.tools`
Stores all tools created by users with their metadata.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | uuid | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| user_id | uuid | NOT NULL, FOREIGN KEY | - | Reference to auth.users.id |
| name | text | NOT NULL | - | Tool name |
| html | text | NOT NULL | - | Tool HTML content |
| script | text | NOT NULL | - | Tool JavaScript code |
| visibility | text | NOT NULL, CHECK | 'private' | One of: 'private', 'unlisted', 'public' |
| price | numeric | NOT NULL | 0 | Price in USD |
| paid_only | boolean | NOT NULL | false | Whether tool requires payment |
| created_at | timestamptz | - | now() | Creation timestamp |
| updated_at | timestamptz | - | now() | Last update timestamp |

#### 2. `public.tool_versions`
Maintains version history for each tool.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | uuid | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| tool_id | uuid | NOT NULL, FOREIGN KEY | - | Reference to tools.id |
| html | text | NOT NULL | - | Tool HTML content |
| script | text | NOT NULL | - | Tool JavaScript code |
| created_at | timestamptz | - | now() | Version creation timestamp |

#### 3. `public.usage`
Tracks API and resource usage for billing and quotas.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | uuid | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| user_id | uuid | NOT NULL, FOREIGN KEY | - | Reference to auth.users.id |
| tool_id | uuid | FOREIGN KEY | - | Reference to tools.id |
| endpoint | text | NOT NULL | - | API endpoint accessed |
| method | text | NOT NULL | - | HTTP method used |
| status_code | integer | NOT NULL | - | HTTP status code |
| response_size_bytes | integer | - | - | Response size in bytes |
| duration_ms | integer | - | - | Request duration in ms |
| created_at | timestamptz | - | now() | Request timestamp |

### Indexes

1. `idx_tool_versions_tool_id` - Index on `tool_versions(tool_id)` for faster lookups
2. `idx_tools_user_id` - Index on `tools(user_id)` for user-specific queries
3. `idx_usage_user_id` - Index on `usage(user_id)` for user-specific usage tracking
4. `idx_usage_created_at` - Index on `usage(created_at)` for time-based queries

### Row Level Security (RLS) Policies

#### Tools Table
- Users can only view their own tools
- Users can only insert/update/delete their own tools
- Public tools are viewable by everyone

#### Tool Versions Table
- Users can view versions of their own tools
- Users can insert new versions for their tools

### Database Functions

1. `update_updated_at_column()`
   - Automatically updates the `updated_at` timestamp on tool updates
   - Trigger: `update_tools_updated_at`

2. `record_usage(p_tool_id, p_endpoint, p_method, p_status_code, p_response_size_bytes, p_duration_ms)`
   - Records API usage for billing and quotas
   - Called after successful API operations

3. `get_my_tools()`
   - Returns all tools belonging to the current user
   - Used in the dashboard and tool management UI

#### Tables

1. **tools**
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to auth.users)
   - `name`: Text
   - `html`: Text
   - `script`: Text
   - `visibility`: Enum('private', 'unlisted', 'public')
   - `price`: Numeric
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

2. **tool_versions**
   - `id`: UUID (Primary Key)
   - `tool_id`: UUID (Foreign Key to tools)
   - `html`: Text
   - `script`: Text
   - `created_at`: Timestamp

3. **usage**
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to auth.users)
   - `tool_id`: UUID (Nullable, Foreign Key to tools)
   - `endpoint`: Text
   - `method`: Text
   - `status_code`: Integer
   - `response_size_bytes`: Integer
   - `duration_ms`: Integer
   - `created_at`: Timestamp

### Tool Lifecycle

1. **Creation**:
   - User provides HTML/JavaScript via the UI
   - System validates and stores the tool
   - Initial version is created in `tool_versions`

2. **Versioning**:
   - Each update creates a new version
   - Previous versions remain accessible for rollback
   - Version history is maintained with timestamps

3. **Publishing**:
   - Tools can be marked as private/unlisted/public
   - Public tools are accessible to all users
   - Unlisted tools are accessible via direct link

## Embedding & Execution Model

### Embedding Flow

1. **Tool Export**:
   - Tools are bundled using esbuild
   - HTML and JavaScript are combined into a single file
   - Bundled files are stored in Supabase Storage

2. **Secure URL Generation**:
   - Each tool version gets a unique, signed URL
   - HMAC signatures prevent URL tampering
   - Short-lived access tokens for security

3. **Iframe Sandboxing**:
   - Tools run in a sandboxed iframe
   - Strict Content Security Policy (CSP) enforced
   - Limited access to parent window

### Security Measures

- **Content Security Policy**:
  ```http
  default-src 'none';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  connect-src 'self'
  ```
- **Sandbox Attributes**:
  - `allow-scripts`
  - `allow-same-origin`
  - `allow-forms`

## Billing & Subscription System

### Subscription Management

1. **Plans**:
   - Free Tier: 100,000 tokens/month
   - Pro Tier: 1,000,000 tokens/month
   - Custom/Enterprise: Custom limits

2. **Payment Processing**:
   - Stripe integration for payment processing
   - Webhook handlers for subscription events
   - Automatic invoice generation

3. **Usage Tracking**:
   - Token-based quota system
   - Monthly reset cycle
   - Real-time usage metrics

### Key Components

- **Stripe Webhook Handler**: `pages/api/stripe-webhook.ts`
- **Usage Tracking**: `lib/billing/recordUsage.ts`
- **Quota Management**: `lib/policy.ts`

## API Reference

### Authentication
All API endpoints (except public embeds) require authentication via:
- Session cookie (web interface)
- Bearer token (API clients)

### Base URL
```
https://api.yourdomain.com/api
```

### Response Format
All API responses follow the same format:
```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per minute per authenticated user
- Rate limit headers:
  - `X-RateLimit-Limit`: Request limit per time window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Seconds until window resets

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Endpoints

#### Tool Management

##### List Tools
```
GET /api/tools
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Example Tool",
      "visibility": "private",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

##### Get Tool by ID
```
GET /api/tools/:id
```

**Parameters**
- `id` (path, required): Tool ID

**Response**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Example Tool",
    "html": "<div>Tool HTML</div>",
    "script": "console.log('Tool script')",
    "visibility": "private",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

##### Create Tool
```
POST /api/tools
```

**Request Body**
```json
{
  "name": "New Tool",
  "html": "<div>Tool HTML</div>",
  "script": "console.log('Tool script')",
  "visibility": "private"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

##### Update Tool
```
PUT /api/tools/:id
```

**Parameters**
- `id` (path, required): Tool ID

**Request Body**
```json
{
  "name": "Updated Tool",
  "html": "<div>Updated HTML</div>",
  "script": "console.log('Updated script')",
  "visibility": "public"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

##### Delete Tool
```
DELETE /api/tools/:id
```

**Parameters**
- `id` (path, required): Tool ID

**Response**
```json
{
  "success": true
}
```

#### Embedding

##### Get Embed Code
```
GET /api/embed/:toolId
```

**Parameters**
- `toolId` (path, required): Tool ID
- `v` (query, optional): Version number
- `sig` (query, required): HMAC signature

**Response**
302 Redirect to the signed URL for the embedded tool

#### Billing

##### Get Subscription Status
```
GET /api/billing/subscription
```

**Response**
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "status": "active",
    "current_period_end": "2023-12-31T23:59:59Z",
    "usage": {
      "current": 45000,
      "limit": 100000,
      "reset_date": "2023-02-01T00:00:00Z"
    }
  }
}
```

##### Create Checkout Session
```
POST /api/billing/checkout
```

**Request Body**
```json
{
  "priceId": "price_1234567890",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_1234567890"
  }
}
```

#### AI Integration

##### Generate Tool
```
POST /api/ai/generate
```

**Request Body**
```json
{
  "prompt": "A tool that generates random quotes",
  "framework": "react"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "toolId": "550e8400-e29b-41d4-a716-446655440000",
    "html": "<div class='quote-generator'>...</div>",
    "script": "function generateQuote() { ... }"
  }
}
```

##### Improve Tool
```
POST /api/ai/improve
```

**Request Body**
```json
{
  "toolId": "550e8400-e29b-41d4-a716-446655440000",
  "instructions": "Make it more responsive"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "toolId": "550e8400-e29b-41d4-a716-446655440000",
    "html": "<div class='quote-generator responsive'>...</div>"
  }
}
```

### Endpoints

#### Tool Management

- `GET /api/tools` - List all tools
- `POST /api/generate` - Generate a new tool using AI
- `POST /api/update` - Update an existing tool
- `DELETE /api/delete` - Delete a tool

#### Embedding

- `GET /api/embed/[toolId]` - Get embeddable tool version

#### Billing

- `POST /api/stripe-webhook` - Handle Stripe webhook events

### Authentication

All API endpoints (except public embeds) require authentication via:
- Session cookie (web interface)
- Bearer token (API clients)

## Frontend Architecture

### Key Components

1. **Layout System**
   - Root layout with authentication guard
   - Responsive design with Tailwind CSS
   - Dark/light theme support

2. **State Management**
   - React Context for global state
   - Server components for data fetching
   - Optimistic UI updates

3. **UI Components**
   - Reusable, accessible components
   - Loading and error states
   - Form validation

## Performance Optimization

### Frontend Optimizations

#### Code Splitting & Lazy Loading
- **Dynamic Imports**: Components and routes are dynamically imported to reduce initial bundle size
- **Route-based Code Splitting**: Automatic code splitting at the page level in Next.js
- **Lazy Loading**: Non-critical components and assets are loaded on-demand

#### Asset Optimization
- **Image Optimization**: Automatic image optimization with Next.js Image component
- **Font Optimization**: System fonts used by default with fallbacks
- **Asset Compression**: Gzip/Brotli compression for static assets

#### Rendering Performance
- **Static Site Generation (SSG)**: Used for marketing pages and documentation
- **Incremental Static Regeneration (ISR)**: For pages that need periodic updates
- **Client-side Navigation**: Smooth page transitions with Next.js Link component

### Backend Optimizations

#### Database Performance
- **Indexing**: Strategic indexing on frequently queried columns
- **Query Optimization**: Efficient queries with proper joins and filters
- **Connection Pooling**: Managed by Supabase for optimal database connections

#### API Performance
- **Rate Limiting**: Implemented via `utils/limiter.ts` (10 requests per minute per IP)
- **Response Caching**: API responses cached where appropriate
- **Batch Processing**: Multiple operations batched to reduce round trips

#### Edge Caching
- **CDN Caching**: Static assets and API responses cached at the edge
- **Cache-Control Headers**: Proper cache headers for different resource types
- **Stale-While-Revalidate**: Used for dynamic content that can be slightly stale

### Monitoring & Observability

#### Real-time Monitoring
- **Error Tracking**: Client and server-side error monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **API Analytics**: Endpoint performance and error rates

#### Logging Strategy
- **Structured Logging**: JSON-formatted logs for machine processing
- **Log Levels**: DEBUG, INFO, WARN, ERROR for appropriate filtering
- **Request Tracing**: Unique request IDs for end-to-end tracing

#### Alerting
- **Error Alerts**: Immediate notifications for critical errors
- **Performance Alerts**: Notifications for degraded performance
- **Usage Alerts**: Notifications for abnormal usage patterns

### Optimization Opportunities

1. **Implement Redis Caching**
   - Cache frequently accessed data
   - Session storage for improved scalability
   - Rate limit state management

2. **Database Query Optimization**
   - Add missing indexes
   - Optimize complex queries
   - Implement read replicas for reporting

3. **Frontend Performance**
   - Implement service worker for offline support
   - Optimize critical CSS loading
   - Defer non-critical JavaScript

## Security Considerations

### Authentication Security
- Magic links with one-time use tokens
- Secure cookie attributes (HttpOnly, Secure, SameSite)
- Rate limiting on authentication endpoints

### Data Protection
- Row-level security in Supabase
- Input validation and sanitization
- Output encoding to prevent XSS

### API Security
- CSRF protection
- Rate limiting
- Request validation

## Testing Strategy

### Unit Testing
- Vitest for component and utility testing
- Mocked API responses
- Snapshot testing

### Integration Testing
- API route testing
- Database interaction tests
- Authentication flow tests

### End-to-End Testing
- Playwright for browser automation
- Cross-browser testing
- Visual regression testing

## Deployment & DevOps

### Build Process
- Next.js static export
- TypeScript type checking
- ESLint and Prettier for code quality

### Deployment
- Vercel or similar platform
- Environment variable management
- CI/CD pipeline

### Monitoring
- Error tracking
- Performance monitoring
- Usage analytics

## Areas for Improvement

### Technical Debt
- TypeScript strict mode
- Test coverage
- Documentation

### Performance
- Bundle size optimization
- Image optimization
- Database query optimization

### Features
- Team collaboration
- Analytics dashboard
- Template library
- Plugin system expansion

### Security
- Rate limiting
- Input validation
- Security headers

## Conclusion

Wobble Stack provides a robust foundation for building and deploying AI-powered web tools. Its modular architecture, comprehensive feature set, and focus on security make it well-suited for both small projects and enterprise applications. With continued development and community contributions, it has the potential to become a leading platform in the low-code/no-code tooling space.
