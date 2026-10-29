# Running MergeTip locally

How to run the whole product on your machine (API, worker, web app, browser extension), connect
real or mock wallets, and test from other devices. For using the product, see the
[user guide](user-guide.md); for how the code is organised, see the [backend](backend/README.md)
and [frontend](frontend/README.md) guides.

Run commands from the repository root unless a step says otherwise.

## 1. Once per machine

Prerequisites: Rust (stable), Node 22+, pnpm, Docker.

```sh
make bootstrap                 # toolchains, sqlx-cli, frontend dependencies
cp .env.example .env           # every variable is documented in the file
openssl rand -hex 32           # paste as MASTER_KEY in .env
```

### Your GitHub App

MergeTip runs as a GitHub App. Create a personal one for local development:

1. Create a webhook channel at https://smee.io/new and set `SMEE_URL` in `.env`.
2. `make dev-app`, approve the App on GitHub. This writes the App's IDs and secrets into `.env`
   and its private key into `.secrets/`.
3. In the App's settings (`https://github.com/settings/apps/<your-app>`), do what the manifest
   can't:
   - **Permissions & events → Account permissions → Email addresses: Read-only**, then accept
     the change on your installation (`https://github.com/settings/installations`). Without it,
     MergeTip has no emails for pledge notices or confirmation codes.
   - **Advanced → Make public**, if any account other than yours will sign in, claim or be
     tipped. A private App answers 404 to everyone but its owner.
   - **Callback URL**: `http://localhost:8080/v1/auth/github/callback` is set for you. Add one
     per extra public URL you use (see [section 6](#6-testing-from-other-devices)).
4. Install the App on a test repository.

### Web app settings

These live in the same `.env` (all are public: never put secrets in `PUBLIC_*`):

| Variable | Purpose |
| --- | --- |
| `PUBLIC_API_URL` | Where the web app reaches the API (`http://localhost:8080`) |
| `PUBLIC_GITHUB_APP_SLUG` | Your App's slug, for the **Install GitHub App** links |
| `PUBLIC_BREEZ_API_KEY` | Enables **Create a wallet** (in-browser Breez wallet). Request a free key from Breez (see https://sdk-doc-spark.breez.technology). Empty hides the feature |
| `PUBLIC_BREEZ_NETWORK` | `mainnet` or `regtest` |
| `PUBLIC_ALBY_HUB_URL` | Hub opened by **Connect with Alby** (default `https://my.albyhub.com`) |

The extension reads `WXT_API_URL` and `WXT_WEB_URL` when it is built.

## 2. Every session

```sh
make up                        # Postgres, Nostr relay, mock wallet, mock Lightning addresses, Mailpit
make migrate
```

Then, each in its own terminal (or `make dev` for the first three together, with hot reload):

```sh
make dev-api                   # API on http://localhost:8080
make dev-worker                # payments, retries, expiry, emails
make dev-web                   # web app on http://localhost:5173
make smee                      # forwards GitHub webhooks to the API; needed for /tip comments
```

Open http://localhost:5173 and sign in with GitHub.

**Production build of the web app** (lighter, and what the end-to-end tests use). Rebuild after
changing `.env`, since URLs and the Content-Security-Policy are built in:

```sh
cd frontend/apps/web && pnpm build && pnpm preview --port 5173 --strictPort
```

## 3. The browser extension

```sh
cd frontend
pnpm dev:ext                                      # Chrome with the extension, hot reload
pnpm --filter @mergetip/extension dev:firefox     # Firefox
```

To load a build into your everyday browser:

```sh
cd frontend/apps/extension
pnpm build                     # Chrome/Brave/Edge build in .output/chrome-mv3
pnpm zip && pnpm zip:firefox   # zips in .output/, for other machines or the stores
```

- **Chrome, Brave, Edge:** `chrome://extensions` (or `brave://extensions`) → **Developer mode** →
  **Load unpacked** → the `chrome-mv3` folder. File pickers hide `.output`; copy the folder
  somewhere visible or show hidden files (Ctrl+H on Linux).
- **Firefox:** `about:debugging` → **This Firefox** → **Load Temporary Add-on** → the Firefox zip.

Then click a ⚡ Tip button on a GitHub pull request → **Connect MergeTip**. After rebuilding,
reload the extension from the extensions page.

## 4. Wallets

### Mock wallets (no real sats)

With `LIGHTNING_NETWORK=regtest` (the default in `.env.example`):

- **Sending:** paste the mock wallet's connection string from
  `docker compose logs mock-nwc | grep uri` into **Settings → Sending wallet**.
- **Receiving:** any `name@localhost:8090` is a working Lightning address. `wrongamount@`,
  `expired@`, `badhash@` and `down@localhost:8090` misbehave on purpose (they pass the check made
  when linking, then misbehave on real tips).

### Real wallets (mainnet, real sats)

Set `LIGHTNING_NETWORK=bitcoin` and restart the API and worker. Mock addresses and the mock wallet
stop working; use real wallets as described in the [user guide](user-guide.md#wallets): a
Lightning address for receiving (e.g. Cake Wallet, Coinos, or **Create a wallet**), and an NWC
wallet for sending (e.g. Coinos, Primal, Alby Hub). Keep budgets small while testing.

**Alby Hub in Docker** (self-custodial; on port 8029 because the API uses 8080):

```sh
docker run -d --name albyhub -v ~/.local/share/albyhub:/data -e WORK_DIR=/data \
  -p 127.0.0.1:8029:8080 ghcr.io/getalby/hub:v1.24.4
npx -y @getalby/hub-cli@0.6.0 -u http://localhost:8029 setup --password 'YOUR_PASSWORD'
npx -y @getalby/hub-cli@0.6.0 -u http://localhost:8029 start --password 'YOUR_PASSWORD' --save
npx -y @getalby/hub-cli@0.6.0 -u http://localhost:8029 backup-mnemonic --password 'YOUR_PASSWORD'
```

Copy the 12 words from `~/.hub-cli/albyhub.recovery` onto paper in a plain terminal, then delete
the file; never open it in an editor that shares context. The hub needs a channel before it can
pay (a just-in-time channel opens on the first payment into it, with the fee deducted). Set
`PUBLIC_ALBY_HUB_URL=http://localhost:8029` to point **Connect with Alby** at it.

### Check a wallet connection

`tools/nwc-probe.mjs` sends one harmless `get_info` request over a connection string and reports
whether the wallet answers. Run it before connecting a wallet, and when tips stay "pending":

```sh
cd tools && npm install
npm run nwc-probe              # paste the connection string at the hidden prompt
```

Both `nip44_v2` and `nip04` should say `answered`. If neither does, the connection is dead: create
a new one in the wallet.

## 5. Checks

```sh
make check-backend             # fmt, clippy, tests, sqlx offline data
cd frontend
pnpm lint && pnpm check && pnpm test
pnpm --filter @mergetip/web test:e2e   # Playwright on the production build, mocked API, axe (WCAG 2.1 AA)
pnpm build
pnpm gen:api                   # after the backend's openapi/openapi.json changes
```

The end-to-end tests use the installed Google Chrome; set `PW_CHANNEL=chromium` to use
Playwright's own browser instead (`npx playwright install chromium` first).

## 6. Testing from other devices

The session cookie is `SameSite=Lax`, so the web app and the API must be served from **one**
public origin. `tools/tunnel-proxy.mjs` serves both on port 8000 (`/v1/*` and `/healthz` to the
API, everything else to the web app); put any HTTPS tunnel in front of it:

```sh
node tools/tunnel-proxy.mjs
ngrok http 8000                # prints e.g. https://example.ngrok-free.app
```

Then:

1. In `.env`, set `PUBLIC_BASE_URL`, `API_PUBLIC_URL` and `PUBLIC_API_URL` to the tunnel URL;
   restart the API and worker and rebuild the web app.
2. Add `<tunnel URL>/v1/auth/github/callback` to the App's callback URLs.
3. Build the extension for it:
   `cd frontend/apps/extension && WXT_API_URL=<tunnel URL> WXT_WEB_URL=<tunnel URL> pnpm zip`.
4. On each device, open the tunnel URL first. ngrok's free plan shows a warning page once per
   browser; click **Visit Site** (the extension relies on the same cookie). In Brave, lower
   Shields for the tunnel site if sign-in doesn't stick.

Use the tunnel URL on your own machine too while it's configured. The instance is public: stop the
tunnel when you're done, and put the localhost URLs back.

## 7. URLs

| What | URL |
| --- | --- |
| Web app | http://localhost:5173 |
| API health | http://localhost:8080/v1/health |
| Mailpit (local emails, confirmation codes) | http://localhost:8025 |
| Mock Lightning addresses | http://localhost:8090 |
| Nostr relay | `ws://localhost:7000` |
| Alby Hub (if running) | http://localhost:8029 |

## 8. Stop and reset

```sh
make down                      # stop Docker services, keep data
docker compose down -v         # also wipe the database; run make migrate again after
docker stop albyhub            # if running
```

## 9. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| The API or worker exits at startup | The message names the missing or invalid variable; see `.env.example` |
| Port 5432 in use | Set `POSTGRES_PORT=5435` in `.env` and in `DATABASE_URL`, then `make up` |
| `make up` fails on port 1025 | Another mail server holds Mailpit's SMTP port. The rest is up; emails go through Resend if configured, or stop the other server |
| `/tip` comments get no reaction | `make smee` isn't running, or the App isn't installed on that repository |
| `make smee` exits with `ETIMEDOUT` or `ENETUNREACH 64:ff9b::…` | The network's IPv6 route is broken; `NODE_OPTIONS=--dns-result-order=ipv4first make smee` |
| Sign-in or **Install GitHub App** gives a GitHub 404 for other accounts | The App is private: make it public |
| GitHub says the `redirect_uri` is not associated with the application | Add the callback URL for the address you're using (section 1) |
| No pledge emails; tips record `email_status = none` | The App lacks **Email addresses: Read-only**, or nobody has signed in since it was granted |
| **Install GitHub App** opens the wrong App | Set `PUBLIC_GITHUB_APP_SLUG` and rebuild the web app |
| **Create a wallet** is missing | `PUBLIC_BREEZ_API_KEY` is empty |
| "We couldn't create a wallet in this browser" | Check the browser console for a Content-Security-Policy error and add the host to `BREEZ_HOSTS` in `frontend/apps/web/vite.config.ts` |
| "We could not reach your wallet" | Run the [probe](#check-a-wallet-connection); if the wallet doesn't answer, create a new connection |
| Tips stay "pending" | The sending wallet didn't answer the payment. Check its history; MergeTip never pays twice and resolves the tip when the wallet confirms |
| The web app shows old code | The production build doesn't reload: rebuild, restart `pnpm preview`, hard-refresh |
| `backend/target` fills the disk | `cd backend && cargo clean` |
