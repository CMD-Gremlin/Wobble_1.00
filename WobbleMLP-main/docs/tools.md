# Tool Documentation

This project contains a mini framework for AI-powered browser tools. Tools are stored in Supabase and can be embedded on any site via signed URLs. Below is a reference for all scripts and API routes.

## Export Script

```
bun scripts/export-tool.ts <toolId>
```

Bundles the directory `app/tools/<toolId>/` with esbuild and uploads `index.html` to the `tools` storage bucket. The script increments `current_version` in the `tools` table and prints a signed iframe URL:

```
/embed/<toolId>?v=<ver>&sig=<hmac>
```

Use the printed URL inside a sandboxed `<iframe>`.

## Embed Endpoint

```
GET /api/embed/[toolId]?v=<ver>&sig=<hmac>
```

Verifies the HMAC signature and looks up the requested version in Supabase Storage. If verification fails or the file does not exist, `403` is returned. On success the handler redirects to a short‑lived signed storage URL. The response adds a strict Content‑Security‑Policy header:

```
default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'
```

## Tool Management APIs

### `GET /api/tools`
Returns all rows from the `tools` table (id, html, script). Useful for listing tools in the UI.

### `POST /api/generate`
Request body `{ prompt: string }`. Uses the LLM to create a new tool and stores it. Responds with `{ tool_name, html, script }`.

### `POST /api/update`
Body `{ toolId, userRequest }`. Fetches the current tool, asks the LLM to patch it and updates the stored HTML and JS. Responds with `{ patched }` containing the combined blob.

### `POST /api/delete`
Body `{ toolId }`. Removes the tool and associated vectors from the store. Responds `{ success: true }`.

## Tool Proxy API

```
POST /api/tool-proxy
```

Body fields:

```json
{
  "provider": "openai",
  "model": "gpt-4",
  "messages": [...],
  "toolId": "my-tool"
}
```

Returns the LLM result and usage metrics. Headers include `X-Wobble-Plan` with the current plan tier and remaining quota. If remaining tokens drop below 20% a `X-Wobble-Quota: low` header is present. Requests exceeding quota result in HTTP `429`.

## Built‑in Echo Tool

Visiting `/tools/echo` returns a small demo that echoes input via `postMessage` when no stored code exists.

```html
<input id="msg"><button onclick="send()">Echo</button>
<pre id="out"></pre>
<script>
function send() {
  const v = document.getElementById('msg').value;
  document.getElementById('out').textContent = v;
  window.parent.postMessage({ type: 'echo', value: v }, '*');
}
</script>
```

## Rate Limits

- **Per‑IP**: 10 requests per minute checked in `checkQuota`.
- **Plan quotas**: token limits per plan (free, pro, tiny). When remaining <20% the response includes `X-Wobble-Quota: low`. Exceeding quota throws a 429 error.

## Environment Variables

- `SUPABASE_URL` / `SUPABASE_ANON_KEY` – Supabase credentials used server side.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` – exposed to the browser.
- `EMBED_SECRET` – secret used to generate signed embed links.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` – for metered billing.

