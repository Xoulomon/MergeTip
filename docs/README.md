# Docs

## Using and running MergeTip

- [`user-guide.md`](user-guide.md) — using MergeTip: wallets, receiving, sending, `/tip`, the extension.
- [`running-locally.md`](running-locally.md) — running the whole product, wallets, multi-device testing.
- [`deploying.md`](deploying.md) — a public deployment on Render, Neon and Vercel.

## How it is built

- [`backend/`](backend/README.md) — Rust services, with [`PROGRESS.md`](backend/PROGRESS.md),
  [`BLOCKERS.md`](backend/BLOCKERS.md), [`critical-tests.md`](backend/critical-tests.md) and a
  [`handover/`](backend/handover) note per milestone.
- [`frontend/`](frontend/README.md) — web app, browser extension and shared packages.

## The API between them

- [`api-contract.md`](api-contract.md) — the contract the frontend builds against.
- [`api-contract-changes.md`](api-contract-changes.md) — dated log of every change to it.
- [`frontend-contract-requests.md`](frontend-contract-requests.md) — what the frontend has asked the backend for.

## Decisions and operations

- [`adr/`](adr) — Architecture Decision Records (one decision per file, numbered).
- [`rfcs/`](rfcs) — one-page design notes required for any change touching payments, auth or the data model.
- [`runbooks/`](runbooks/README.md) — on-call procedures.
