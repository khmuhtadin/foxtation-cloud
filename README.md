# foxtation-cloud

Live at `https://foxtation.khaisa.studio` (Cloudflare custom domain; workers.dev is off).

Private backend for Foxtation Cloud: checks the Polar license key, then asks Claude Haiku 5.5 to clean up the transcript.

## API

All requests are `POST` with `Authorization: Bearer <license key>`.

| Path | Body | Reply |
|---|---|---|
| `/v1/license` | — | `{"ok": true}` |
| `/v1/cleanup` | `{"text", "language", "app"}` | `{"text": "<cleaned>"}` |

Errors: `401 invalid_license`, `400 empty_text / text_too_long`, `502 upstream_error / refused / empty_result`, `503 busy`.

## Setup

1. Polar: create the product with a **License key** benefit. Copy the Organization ID into `wrangler.toml`.
2. Secret: `npx wrangler secret put ANTHROPIC_API_KEY`
3. Deploy: `npm run deploy`
4. Put the deployed URL into `CloudCleanup.server` in the app (`Sources/Foxtation/CloudCleanup.swift`).

Local: copy `.dev.vars.example` to `.dev.vars`, then `npm run dev`.

Sell it as a subscription: Polar revokes the license key when a subscription ends, and the next validation fails.
A granted license check is cached for 10 minutes, so most dictations skip the Polar round trip.
