# Frontend

The web app (`frontend/apps/web`) and browser extension (`frontend/apps/extension`), sharing a
typed API client (`packages/api-client`) and design system (`packages/ui`). Both talk only to the
API in [`openapi/openapi.json`](../../openapi/openapi.json); nothing is mocked in the shipped app.

## Run

The complete guide, including the GitHub App, wallets and multi-device testing, is
[`running-locally.md`](../running-locally.md). The short version:

```sh
make up && make migrate            # backend dependencies (see the root README)
cd backend && cargo run -p mergetip-api   # and mergetip-worker, in another terminal
cd frontend && pnpm install
pnpm dev                           # web app on http://localhost:5173
pnpm dev:ext                       # extension in a fresh Chrome profile (pnpm --filter @mergetip/extension dev:firefox for Firefox)
```

The web app reads `PUBLIC_*` variables from the repository-root `.env` (see `.env.example`). The
extension reads `WXT_API_URL` and `WXT_WEB_URL` at build time.

## Check

| Command (in `frontend/`) | What |
| --- | --- |
| `pnpm lint` | ESLint and Prettier |
| `pnpm check` | `svelte-check` and `tsc`, strict |
| `pnpm test` | Vitest unit tests (api-client, ui, web logic, extension selectors and token store) |
| `pnpm --filter @mergetip/web test:e2e` | Playwright against the production build with a mocked API, including axe (WCAG 2.1 AA) in both themes and a 360 px claim flow. Uses the installed Chrome; `PW_CHANNEL=chromium` uses Playwright's |
| `pnpm build` | Web app (adapter-node) and Chrome extension |
| `pnpm --filter @mergetip/extension zip` / `zip:firefox` | Store-ready zips |

CI runs all of these, plus a check that `packages/api-client/src/schema.d.ts` matches
`openapi.json` (`pnpm gen:api`).

## How it fits together

- **API client.** `MergeTipApi` wraps `openapi-fetch`: typed methods that resolve with data or throw
  `ApiError` (stable `code`, human `message`, never a raw code in the UI). Every request times out
  after 15 s. `schemas` holds the zod rules for everything people type, mirroring the backend's
  limits.
- **Design system.** `tokens.css` defines Primer-style colours with `light-dark()`, so the OS
  setting and the theme toggle both work, and maps them to Tailwind utilities (`bg-canvas`,
  `text-fg-muted`, …). Components are small and typed.
- **Web app.** Pages under `routes/(app)` need a session. The session cookie belongs to the API
  origin, so those pages render in the browser (`ssr = false`) and send signed-out visitors to
  GitHub sign-in, returning them to the same page. Imports use `#lib/…` subpath imports
  (SvelteKit 3 replaced `$lib`).
- **Instant wallet.** "Create a wallet" lazy-loads the Breez SDK (Spark) WASM (12 MB, never in the
  main bundle). The 12-word phrase is generated in the browser, checked back (3 random words),
  encrypted with a PIN (PBKDF2 → AES-GCM) into IndexedDB, and never sent anywhere. If the SDK fails,
  the page falls back to pasting a Lightning address.
- **Extension.** The background worker alone holds the API token (`storage.session`) and makes API
  calls. `github.content` adds ⚡ buttons (selectors live in `lib/github.ts`) and opens the tip form
  in a closed shadow root. `connect.content` runs only on the web app's `/extension/connect` and
  receives the token over a `postMessage` handshake, which works in Chrome and Firefox.
- **CSP.** Set in `vite.config.ts`: scripts by nonce only (plus `wasm-unsafe-eval` for the
  wallet), connections to the API and the Breez hosts, images from GitHub avatars.

## Known risks

- **GitHub markup.** Buttons depend on GitHub's DOM. The selectors fail closed (no buttons, page
  untouched) and are covered by fixture tests; update `lib/github.ts` and its fixtures together.
- **Breez.** Wallet creation registers a real Lightning address with Breez on the configured network.
  The steps up to the SDK call are covered by unit and end-to-end tests, and creation was verified
  live on mainnet (October 2026). The SDK talks to several Breez and Spark hosts, some on
  non-default ports: after upgrading `@breeztech/breez-sdk-spark`, re-check `BREEZ_HOSTS` in
  `vite.config.ts` and create a wallet by hand.
- **Inline styles.** `style-src` allows `'unsafe-inline'` because SvelteKit sets inline styles;
  scripts stay strict.
- See [`frontend-contract-requests.md`](../frontend-contract-requests.md) for API gaps (dashboard
  totals over loaded tips only; confirmation is web-only).
