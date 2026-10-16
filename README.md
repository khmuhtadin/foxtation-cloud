# foxtation-cloud

Live at `https://foxtation.khaisa.studio` (Cloudflare custom domain; workers.dev is off).

Private backend for Foxtation Cloud: checks the Polar license key, then asks Claude Haiku 5.5 to clean up the transcript.

## API

All requests are `POST` with `Authorization: Bearer <license key>`. Every endpoint except `/v1/activate` also needs `X-Foxtation-Activation: <activation id>`. Errors are `{"error": "<code>"}`.

| Path | Body | Reply |
|---|---|---|
| `/v1/activate` | `{"label"}` | `{"activation_id"}` |
| `/v1/cleanup` | see below | `{"text", "changes", "usage"}` |
| `/v1/usage` | — | `{"used", "limit", "resets_at"}` |
| `/v1/license` | — | see below |
| `/v1/deactivate` | — | `204`, no body |

### `/v1/cleanup`

Request. Only `text` is required; old app builds send `{text, language, app}` and read only `text`, which keeps working.

| Field | Type | Limits |
|---|---|---|
| `text` | string | 1–20,000 chars after trim |
| `language` | string | ≤ 16 chars |
| `app` | string | ≤ 100 chars. The target app's name, used to infer a style |
| `vocabulary` | string[] | ≤ 300 terms, each 1–64 chars, no line breaks. Duplicates (case-insensitive) are dropped |
| `snippet_cues` | string[] | ≤ 100 cues, same per-term limits |
| `style` | `"casual"` \| `"neutral"` \| `"formal"` \| `"literal"` | Wins over the app inference. Absent = infer from `app` |
| `options` | `{ "spoken_emoji"?: boolean }` | `true` turns "emoji ketawa" into 😂 |

```json
{
  "text": "eh jadi besok kirim ke jack mall, my email, emoji ketawa",
  "language": "id",
  "app": "WhatsApp",
  "vocabulary": ["Jakmall", "n8n"],
  "snippet_cues": ["my email"],
  "style": "casual",
  "options": { "spoken_emoji": true }
}
```

Reply:

```json
{
  "text": "besok kirim ke Jakmall, my email 😂",
  "changes": { "fillers_removed": 2, "self_corrections": 0, "formatting_fixes": 1 },
  "usage": { "used": 187, "limit": 500, "resets_at": "2026-10-17T00:00:00.000Z" }
}
```

`changes` are the model's own counts, for display only (Insights). A `429 daily_limit` reply also carries `usage`. A cleanup that fails on Claude's side (`busy`, `upstream_error`, `refused`, `empty_result`) is refunded, so it doesn't count against the day.

### `/v1/license`

Always asks Polar (not the 10-minute cache).

```json
{
  "status": "granted",
  "display_key": "****-E56FDA79A59C",
  "expires_at": null,
  "activations": { "used": null, "limit": 3 },
  "this_device": { "activation_id": "b85b…", "label": "MacBook Pro", "created_at": "2026-10-16T16:30:00Z" },
  "portal_url": "https://polar.sh/khaisa-studios/portal"
}
```

What a license key alone can't get from Polar:
- **`activations.used` is always `null`.** Polar's customer-portal license-key endpoints (validate / activate / deactivate) don't report how many activations exist. The list is only available with a customer session or an organization token.
- **`status` is always `"granted"` when you get a reply.** Polar's validate answers 404 for a revoked, disabled or expired key, so those come back as `401 invalid_license`, not as a status.
- There's no subscription renewal date. Send people to `portal_url` for that.

### `/v1/deactivate`

Frees this Mac's activation in Polar and drops the cached license check. `404 not_found` when Polar doesn't know the activation (or it isn't this key's). It doesn't run the usual license check first, because Polar's deactivate checks the key and activation itself.

### Errors

| Status | Code | When |
|---|---|---|
| 400 | `empty_text`, `text_too_long` | `text` missing, empty, or over 20,000 chars |
| 400 | `invalid_vocabulary` | `vocabulary` isn't an array of 1–64 char strings without line breaks |
| 400 | `vocabulary_too_long` | more than 300 vocabulary terms |
| 400 | `invalid_snippet_cues` | `snippet_cues` malformed or more than 100 |
| 400 | `invalid_style` | `style` isn't one of the four |
| 400 | `invalid_options` | `options` isn't an object or `spoken_emoji` isn't a boolean |
| 400 | `invalid_app`, `invalid_language` | not a string, or over 100 / 16 chars |
| 401 | `invalid_license` | key or activation missing, wrong, revoked or expired |
| 403 | `activation_limit` | `/v1/activate`: the key is on its maximum number of Macs |
| 404 | `not_found` | unknown path, or `/v1/deactivate` for an unknown activation |
| 429 | `daily_limit` | the key used `DAILY_LIMIT` cleanups today (UTC); reply includes `usage` |
| 502 | `upstream_error`, `refused`, `empty_result` | Claude failed, declined, or returned no text |
| 503 | `busy` | Claude rate limit |

## What the app must do itself

- **Deterministic replacements** (`btw → by the way`, scoped per app): applied in the app after cleanup. The backend never sees them.
- **Snippet expansion**: the backend only keeps cues verbatim; the app swaps each cue for its saved text after cleanup.
- **History and audio**: stay on the Mac. The backend stores nothing but a per-key daily counter.
- **Fallback**: on any error (limit, license, network, 5xx), paste the raw on-device transcript.

## Limits

Each Mac activates once and counts against the benefit's **activation limit** in Polar. Each key gets `DAILY_LIMIT` cleanups per UTC day, counted in a Durable Object. A granted license check is cached for 10 minutes, so most dictations skip the Polar round trip.

## Setup

1. Polar: create the product with a **License key** benefit with an activation limit set (activation fails without one). Copy the Organization ID into `wrangler.toml`.
2. Anthropic: put the workspace ID in `wrangler.toml`, then `npx wrangler secret put ANTHROPIC_API_KEY`
3. Deploy: `npm run deploy`
4. Put the deployed URL into `CloudCleanup.server` in the app (`Sources/Foxtation/CloudCleanup.swift`).

Local: copy `.dev.vars.example` to `.dev.vars`, then `npm run dev`.

Tests: `npm test` (Vitest in the Workers runtime via `@cloudflare/vitest-plugin`; Polar and Anthropic are faked by stubbing `fetch`). Types: `npm run check`. After changing `wrangler.toml`, rerun `npx wrangler types --include-runtime=false`.

Sell it as a subscription: Polar revokes the license key when a subscription ends, and the next validation fails.
