# Deploying MergeTip (Render + Neon + Vercel)

A low-cost public deployment: the API and payment worker run together as one **Render** web
service, Postgres is **Neon**, and the web app is on **Vercel**. The web app relays `/v1/*` to the
API, so browsers only ever talk to the Vercel URL and the session cookie works without a custom
domain. Free tiers change: check each provider's current terms.

```
browser ──▶ Vercel (web app) ──/v1/*──▶ Render (API + worker) ──▶ Neon (Postgres)
GitHub webhooks ─────────────────────────▶ Render
```

## Limits of the free plans

- **Render free web services sleep after 15 minutes without traffic** and take about a minute to
  wake. A GitHub webhook that arrives while it sleeps times out and is lost (redeliver it from the
  App's *Advanced* settings). Keep it awake with an uptime monitor (step 5).
- **Neon:** the worker keeps a connection open and checks for jobs every second, so the database
  never suspends and uses its free compute hours continuously. Fine for a demo; check Neon's
  current allowance for longer use.
- Render's free plan blocks outbound SMTP; MergeTip sends email through Resend's HTTPS API, which
  is unaffected.

## 1. Neon (database)

1. Sign up at https://neon.tech and create a project (region: **AWS Europe Central (Frankfurt)**,
   to sit next to the Render service).
2. Copy the **direct** connection string (turn **Connection pooling off** in the connect dialog).
   The pooled endpoint breaks prepared statements and the worker's `LISTEN`. It looks like
   `postgresql://user:password@ep-…​.eu-central-1.aws.neon.tech/neondb?sslmode=require`.

The worker creates the tables on its first start; nothing to run by hand.

## 2. Render (API + worker)

1. Sign up at https://render.com and connect your GitHub account.
2. **New → Blueprint** (https://dashboard.render.com/blueprints), pick this repository. Render reads
   `render.yaml` and creates the `mergetip-api` service from `deploy/render/Dockerfile`.
3. Fill in the values it asks for:

   | Variable | Value |
   | --- | --- |
   | `PUBLIC_BASE_URL`, `API_PUBLIC_URL` | Your Vercel URL, e.g. `https://mergetip.vercel.app` (fill in after step 3; any placeholder for now) |
   | `DATABASE_URL` | Neon's direct connection string |
   | `MASTER_KEY` | A new key: `openssl rand -hex 32`. Keep it safe: it decrypts stored wallet connections |
   | `GITHUB_APP_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_WEBHOOK_SECRET` | From your GitHub App (your local `.env` has them) |
   | `GITHUB_APP_PRIVATE_KEY` | The whole contents of the App's `.pem` file (`.secrets/github-app.pem`), including the `BEGIN`/`END` lines |
   | `RESEND_API_KEY`, `EMAIL_FROM` | Optional. Leave empty to run without email |

4. The first build compiles the Rust workspace (expect 10–20 minutes). Watch it under the service's
   **Events / Logs**. When it's live, `https://mergetip-api.onrender.com/healthz` answers `ok`. If
   Render gave the service another name, use that URL everywhere below.

Pushing to `dev` redeploys automatically.

## 3. Vercel (web app)

1. https://vercel.com/new → import this repository.
2. **Root Directory:** `frontend/apps/web` (framework: SvelteKit, detected automatically).
3. **Environment Variables:**

   | Variable | Value |
   | --- | --- |
   | `API_ORIGIN` | `https://mergetip-api.onrender.com` (the Render URL; server only) |
   | `PUBLIC_API_URL` | The Vercel URL itself, e.g. `https://mergetip.vercel.app` |
   | `PUBLIC_GITHUB_APP_SLUG` | Your App's slug, e.g. `mergetip-devfest` |
   | `PUBLIC_BREEZ_API_KEY` | Your Breez key (enables **Create a wallet**) |
   | `PUBLIC_BREEZ_NETWORK` | `mainnet` |
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1` (uses the pnpm version pinned in `frontend/package.json`) |

4. Deploy. The first deploy gives the project its URL; if it differs from what you put in
   `PUBLIC_API_URL`, update that variable and redeploy.
5. Put the Vercel URL into Render's `PUBLIC_BASE_URL` and `API_PUBLIC_URL` (Render redeploys).

Check: `https://<your-vercel-url>/healthz` answers `ok` (through the relay to Render).

## 4. GitHub App

In the App's settings (`https://github.com/settings/apps/<your-app>`):

- **Webhook URL:** `https://mergetip-api.onrender.com/v1/webhooks/github` (straight to Render).
- **Callback URL:** add `https://<your-vercel-url>/v1/auth/github/callback`.
- **Account permissions → Email addresses: Read-only**, and **Make public** under *Advanced* if
  other people will use it (see [running-locally.md](running-locally.md#your-github-app)).

While the webhook points at Render, your local `make smee` setup no longer receives events.

## 5. Keep the API awake

Create a free monitor (e.g. https://uptimerobot.com or https://cron-job.org) that requests
`https://mergetip-api.onrender.com/healthz` every 5 minutes.

## 6. Browser extension

Build it for the deployed URL and share the zips (e.g. as a GitHub Release):

```sh
cd frontend/apps/extension
WXT_API_URL=https://<your-vercel-url> WXT_WEB_URL=https://<your-vercel-url> pnpm zip
WXT_API_URL=https://<your-vercel-url> WXT_WEB_URL=https://<your-vercel-url> pnpm zip:firefox
```

Installing: see the [user guide](user-guide.md#the-browser-extension). Publishing to the Firefox
Add-ons site is free; the Chrome Web Store charges a one-time developer fee.

## How the pieces fit

- `deploy/render/Dockerfile` builds both binaries; `deploy/render/start.sh` runs them side by side
  on Render's `PORT` and exits if either stops, so Render restarts the pair.
- The web app's `src/routes/v1/[...path]` and `src/routes/healthz` relay to `API_ORIGIN` and pass
  the caller's IP in `x-vercel-forwarded-for`, which the API trusts for per-IP rate limits
  (`TRUSTED_CLIENT_IP_HEADER` in `render.yaml`). Someone calling Render directly can set that
  header themselves; signed-in requests are also limited per user.
- The GitHub App key comes from `GITHUB_APP_PRIVATE_KEY` (the PEM itself) instead of a file.
