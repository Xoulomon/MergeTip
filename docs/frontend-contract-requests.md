# Frontend contract requests

Gaps the web app and extension work around today. None blocks a PRD requirement; each would make
a screen more accurate or simpler. The backend owns the decision; record outcomes in
[`api-contract-changes.md`](api-contract-changes.md).

| # | Request | Why | Workaround today |
| --- | --- | --- | --- |
| 1 | `GET /v1/me/tips/summary` → `{ sent_sats, received_sats, pending_sats }` over all time | FR-6.6 dashboard totals. `GET /me/tips` pages 50 at a time, so totals from it cover only loaded tips | The dashboard sums the tips it has loaded and says "Totals cover your N most recent tips" when more pages exist |
| 2 | Let `GET /v1/me/tips?state=` take a group (`pending`) or several values | The Pending tab spans seven states | The tab requests `direction=all` and filters in the browser, so a page can show fewer than 50 rows |
| 3 | Decide whether the extension may confirm large tips. FR-12.3 and FR-12.4 allow the popup, but `/v1/confirmations/*` is session-only (RFC 0002) | Inline confirmation in the extension | The popup warns before sending and, after sending, links to the web app's dashboard to confirm. We recommend keeping confirmation web-only: a stolen extension token then cannot move large amounts |
| 4 | `POST /v1/tips/comment` could return whether the tip will need confirmation | The popup works this out from `confirm_threshold_sats`, which can drift if settings change in another tab | Client-side comparison with the threshold from `GET /me` |
