# foxtation-cloud

Live at `https://foxtation.khaisa.studio` (Cloudflare custom domain; workers.dev is off).

Private backend for Foxtation Cloud: checks the Polar license key, then asks Claude Haiku 5.5 to clean up the transcript.

## API

All requests are `POST` with `Authorization: Bearer <license key>`.

| Path | Body | Reply |
|---|---|---|
| `/v1/activate` | `{"label"}` | `{"activation_id"}` |
| `/v1/cleanup` | `{"text", "language", "app"}` + header `X-Foxtation-Activation` | `{"text": "<cleaned>"}` |

Errors: `401 invalid_license`, `403 activation_limit`, `429 daily_limit`, `400 empty_text / text_too_long`, `502 upstream_error / refused / empty_result`, `503 busy`.

Limits: each Mac activates once and counts against the benefit's **activation limit** in Polar. Each key gets `DAILY_LIMIT` cleanups per UTC day, counted in a Durable Object.

## Setup

1. Polar: create the product with a **License key** benefit with an activation limit set (activation fails without one). Copy the Organization ID into `wrangler.toml`.
2. Anthropic: put the workspace ID in `wrangler.toml`, then `npx wrangler secret put ANTHROPIC_API_KEY`
3. Deploy: `npm run deploy`
4. Put the deployed URL into `CloudCleanup.server` in the app (`Sources/Foxtation/CloudCleanup.swift`).

Local: copy `.dev.vars.example` to `.dev.vars`, then `npm run dev`.

Sell it as a subscription: Polar revokes the license key when a subscription ends, and the next validation fails.
A granted license check is cached for 10 minutes, so most dictations skip the Polar round trip.
