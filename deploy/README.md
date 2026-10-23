# Deploy

| Path | Contents |
| --- | --- |
| `fly/` | Fly.io app configs per service and environment (`api`, `worker`, `web`) |
| `manifests/` | GitHub App manifests per environment (`dev`, `staging`, `production`) |

Each environment has its own GitHub App, database, secrets and payment configuration, so test
traffic can never touch production wallets. Production configs are added in Phase 7 (P7-08).

`installation` events are delivered to every GitHub App automatically, so they are not listed
in `default_events`.
