# API contract

`openapi.json` is the single contract between `backend/` and `frontend/`.

- **Producer:** `backend/crates/api` generates it with `utoipa` (`make openapi`).
- **Consumer:** `frontend/packages/api-client` turns it into TypeScript types (`pnpm gen:api`).

CI regenerates both and fails if the committed files drift.
