# Wobble Stack

Wobble Stack is a Next.js + Supabase demo for generating and embedding AI powered tools.
It includes email magic link auth, rate limited LLM proxying and a small export / embed
pipeline.

## Development

1. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
2. Copy `.env.local` and fill in your Supabase URL / anon key and Stripe secrets.

## Exporting Tools

Tools live under `app/tools/<toolId>/`. To build and upload a new version run:

```bash
bun scripts/export-tool.ts <toolId>
```

The script bundles the HTML/JS, stores it in the `tools` bucket and prints an iframe
URL like `/embed/<toolId>?v=1&sig=...`.

## Embedding

Load the printed URL inside a sandboxed `<iframe>` or request via
`GET /api/embed/[toolId]?v=<ver>&sig=<hmac>`.

## Billing & Quotas

Usage is tracked in the `usage` table and compared against plan limits defined in
`lib/policy.ts`. A nightly cron job resets quota counters. Stripe webhook events
update the `plans` table when invoices succeed.

## Authentication

Email magic links are handled by Supabase Auth. `AuthGuard` ensures all pages are
protected and the middleware attaches a user to each request.

## Migrations

SQL migrations live in `supabase/migrations/`. Apply them using the Supabase CLI.

