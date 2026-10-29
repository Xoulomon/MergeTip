# Tools

Local helpers, not part of the product. Install once with `cd tools && npm install`.

| Script | Run with | What it does |
| --- | --- | --- |
| `nwc-probe.mjs` | `npm run nwc-probe` | Sends one harmless NIP-47 `get_info` request over a Nostr Wallet Connect string and reports whether the wallet answers in NIP-44 or NIP-04. The string is read from a hidden prompt. |
| `tunnel-proxy.mjs` | `npm run tunnel-proxy` | Serves the api (`/v1/*`, `/healthz`) and the web app from one origin on port 8000, so a single tunnel works for multi-device testing. |

Both are covered step by step in [`docs/running-locally.md`](../docs/running-locally.md).
